#!/usr/bin/env python3
import json
import os
import queue
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from tkinter import BOTH, END, LEFT, RIGHT, X, PhotoImage, StringVar, Tk, Text, ttk, messagebox
try:
    import keyring
except ImportError:
    keyring = None

from receipt import build_receipt, escpos, unwrap

CONFIG_FILE = Path.home() / ".config" / "versa-print-connector" / "config.json"
API_URL = "https://web-production-9043c.up.railway.app"
GREEN = "#008F4C"
GREEN_DARK = "#006B39"
INK = "#18221D"
MUTED = "#65716B"
SURFACE = "#F4F7F5"
if os.name == "nt":
    CONFIG_FILE = Path(os.environ["LOCALAPPDATA"]) / "VersaPrintConnector" / "config.json"


def http(method, url, token=None, body=None, timeout=30):
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token: headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            raw = response.read()
            return response.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as error:
        detail = error.read().decode(errors="replace")
        raise RuntimeError(f"API respondeu {error.code}: {detail}") from error


def list_printers():
    if os.name == "nt":
        result = subprocess.run(
            ["powershell.exe", "-NoProfile", "-Command", "Get-Printer | Select-Object -ExpandProperty Name"],
            capture_output=True, text=True, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        return [line.strip() for line in result.stdout.splitlines() if line.strip()]
    result = subprocess.run(["lpstat", "-a"], capture_output=True, text=True)
    return [line.split()[0] for line in result.stdout.splitlines() if line.strip()]


def print_raw(printer, data, title="VersaDelivery"):
    if os.name != "nt":
        result = subprocess.run(["lp", "-d", printer, "-o", "raw", "-t", title], input=data, capture_output=True)
        if result.returncode: raise RuntimeError(result.stderr.decode(errors="replace"))
        return

    import ctypes
    from ctypes import wintypes

    class DOC_INFO_1(ctypes.Structure):
        _fields_ = [("pDocName", wintypes.LPWSTR), ("pOutputFile", wintypes.LPWSTR), ("pDatatype", wintypes.LPWSTR)]

    spooler, handle = ctypes.WinDLL("winspool.drv"), wintypes.HANDLE()
    spooler.OpenPrinterW.argtypes = [wintypes.LPCWSTR, ctypes.POINTER(wintypes.HANDLE), wintypes.LPVOID]
    spooler.OpenPrinterW.restype = wintypes.BOOL
    spooler.StartDocPrinterW.argtypes = [wintypes.HANDLE, wintypes.DWORD, wintypes.LPBYTE]
    spooler.StartDocPrinterW.restype = wintypes.DWORD
    spooler.StartPagePrinter.argtypes = [wintypes.HANDLE]
    spooler.WritePrinter.argtypes = [wintypes.HANDLE, wintypes.LPVOID, wintypes.DWORD, ctypes.POINTER(wintypes.DWORD)]
    spooler.EndPagePrinter.argtypes = [wintypes.HANDLE]
    spooler.EndDocPrinter.argtypes = [wintypes.HANDLE]
    spooler.ClosePrinter.argtypes = [wintypes.HANDLE]
    if not spooler.OpenPrinterW(printer, ctypes.byref(handle), None):
        raise ctypes.WinError()
    try:
        document = DOC_INFO_1(title, None, "RAW")
        if not spooler.StartDocPrinterW(handle, 1, ctypes.cast(ctypes.byref(document), wintypes.LPBYTE)): raise ctypes.WinError()
        try:
            spooler.StartPagePrinter(handle)
            written, buffer = wintypes.DWORD(), ctypes.create_string_buffer(data)
            if not spooler.WritePrinter(handle, buffer, len(data), ctypes.byref(written)): raise ctypes.WinError()
            if written.value != len(data): raise RuntimeError("O spooler não recebeu todos os dados")
            spooler.EndPagePrinter(handle)
        finally: spooler.EndDocPrinter(handle)
    finally: spooler.ClosePrinter(handle)


class Connector:
    def __init__(self, events):
        self.events, self.stop_event, self.token = events, threading.Event(), None

    def start(self, email, password, printer):
        self.api_url, self.printer = API_URL, printer
        _, payload = http("POST", f"{self.api_url}/login", body={"email": email.strip().lower(), "password": password}, timeout=15)
        self.token = payload["token"]
        self.stop_event.clear()
        threading.Thread(target=self.loop, daemon=True).start()

    def stop(self):
        self.stop_event.set()

    def request(self, method, path, **kwargs):
        return http(method, f"{self.api_url}{path}", token=self.token, body=kwargs.get("json"))

    def loop(self):
        self.events.put(("status", "Conectado e aguardando pedidos"))
        while not self.stop_event.wait(3):
            job = None
            try:
                status, job = self.request("GET", "/print_jobs/next")
                if status == 204:
                    continue
                order_id = unwrap(job["order"]).get("id")
                self.events.put(("log", f'Imprimindo pedido #{order_id} ({job["receipt_mode"]})'))
                print_raw(self.printer, escpos(build_receipt(job)), f'Versa-{job["id"]}')
                self.request("PATCH", f'/print_jobs/{job["id"]}/complete')
                self.events.put(("log", "Impressão enviada com sucesso"))
            except Exception as error:
                if job and job.get("id"):
                    try: self.request("PATCH", f'/print_jobs/{job["id"]}/fail', json={"error": str(error)})
                    except Exception: pass
                self.events.put(("log", f"Erro: {error}")); time.sleep(5)


class App:
    def __init__(self, start_in_background=False):
        self.root = Tk(); self.root.title("VersaDelivery · Impressão")
        self.root.geometry("700x650"); self.root.minsize(620, 580); self.root.configure(bg=SURFACE)
        self.root.protocol("WM_DELETE_WINDOW", self.close_window)
        self.events, self.connector = queue.Queue(), Connector(queue.Queue())
        self.connector.events = self.events
        saved = self.load_config()
        self.email, self.password = StringVar(), StringVar()
        self.printer = StringVar(value=saved.get("printer", "")); self.status = StringVar(value="Desconectado")
        self.connected = False
        self.start_in_background = start_in_background
        self.build(); self.refresh_printers(); self.root.after(250, self.process_events)
        saved_email = saved.get("email", "")
        try:
            saved_password = keyring.get_password("VersaPrintConnector", saved_email) if saved_email and keyring else None
        except Exception:
            saved_password = None
        if start_in_background and saved_email and saved_password and self.printer.get():
            self.email.set(saved_email)
            self.password.set(saved_password)
            self.root.after_idle(self.root.iconify)
            self.root.after(150, lambda: self.connect(automatic=True))

    @staticmethod
    def load_config():
        try: return json.loads(CONFIG_FILE.read_text())
        except Exception: return {}

    def build(self):
        style = ttk.Style(self.root); style.theme_use("clam")
        style.configure("TFrame", background=SURFACE)
        style.configure("Card.TFrame", background="white")
        style.configure("TLabel", background=SURFACE, foreground=INK, font=("TkDefaultFont", 10))
        style.configure("Muted.TLabel", background=SURFACE, foreground=MUTED, font=("TkDefaultFont", 10))
        style.configure("Card.TLabel", background="white", foreground=INK, font=("TkDefaultFont", 10))
        style.configure("Section.TLabel", background="white", foreground=INK, font=("TkDefaultFont", 11, "bold"))
        style.configure("TEntry", padding=(10, 9), fieldbackground="white", bordercolor="#DDE5E0")
        style.configure("TCombobox", padding=(10, 8), fieldbackground="white", bordercolor="#DDE5E0")
        style.configure("Primary.TButton", background=GREEN, foreground="white", padding=(16, 10), borderwidth=0, font=("TkDefaultFont", 10, "bold"))
        style.map("Primary.TButton", background=[("active", GREEN_DARK), ("disabled", "#A7C7B5")])
        style.configure("Secondary.TButton", background="white", foreground=INK, padding=(12, 9), bordercolor="#DDE5E0")

        shell = ttk.Frame(self.root, padding=24); shell.pack(fill=BOTH, expand=True)
        header = ttk.Frame(shell); header.pack(fill=X, pady=(0, 20))
        logo_path = Path(__file__).parent / "assets" / "logo-connector.png"
        try:
            self.logo_image = PhotoImage(file=logo_path)
            ttk.Label(header, image=self.logo_image).pack(side=LEFT, anchor="center")
        except Exception:
            ttk.Label(header, text="VersaDelivery", font=("TkDefaultFont", 20, "bold")).pack(side=LEFT)
        ttk.Label(header, text="IMPRESSÃO", foreground=GREEN, background=SURFACE, font=("TkDefaultFont", 9, "bold")).pack(side=RIGHT, anchor="center")

        ttk.Label(shell, text="Impressora de pedidos", font=("TkDefaultFont", 20, "bold")).pack(anchor="w")
        ttk.Label(shell, text="Conecte sua loja e deixe os pedidos seguirem direto para a impressora.", style="Muted.TLabel", wraplength=620).pack(anchor="w", pady=(5, 18))

        card = ttk.Frame(shell, style="Card.TFrame", padding=20); card.pack(fill=X)
        ttk.Label(card, text="CONEXÃO", style="Section.TLabel").pack(anchor="w", pady=(0, 14))
        form = ttk.Frame(card, style="Card.TFrame"); form.pack(fill=X)
        ttk.Label(form, text="E-mail da loja", style="Card.TLabel").grid(row=0, column=0, sticky="w", pady=6)
        ttk.Entry(form, textvariable=self.email).grid(row=1, column=0, sticky="ew", pady=(4, 12))
        ttk.Label(form, text="Senha", style="Card.TLabel").grid(row=2, column=0, sticky="w", pady=6)
        ttk.Entry(form, textvariable=self.password, show="•").grid(row=3, column=0, sticky="ew", pady=(4, 12))
        ttk.Label(form, text="Impressora", style="Card.TLabel").grid(row=4, column=0, sticky="w", pady=6)
        self.printers = ttk.Combobox(form, textvariable=self.printer, state="readonly")
        self.printers.grid(row=5, column=0, sticky="ew", pady=(4, 4)); form.columnconfigure(0, weight=1)

        actions = ttk.Frame(card, style="Card.TFrame"); actions.pack(fill=X, pady=(15, 0))
        self.connect_button = ttk.Button(actions, text="Conectar à loja", style="Primary.TButton", command=self.connect); self.connect_button.pack(side=LEFT)
        ttk.Button(actions, text="Atualizar lista", style="Secondary.TButton", command=self.refresh_printers).pack(side=LEFT, padx=8)
        ttk.Button(actions, text="Imprimir teste", style="Secondary.TButton", command=self.test).pack(side=RIGHT)

        state = ttk.Frame(shell); state.pack(fill=X, pady=(17, 8))
        self.status_dot = ttk.Label(state, text="●", foreground="#8A9690", font=("TkDefaultFont", 12))
        self.status_dot.pack(side=LEFT, padx=(0, 7))
        ttk.Label(state, textvariable=self.status, font=("TkDefaultFont", 10, "bold")).pack(side=LEFT)
        ttk.Label(state, text="Ao minimizar, a impressão continua ativa.", style="Muted.TLabel").pack(side=RIGHT)

        ttk.Label(shell, text="ATIVIDADE RECENTE", foreground=MUTED, background=SURFACE, font=("TkDefaultFont", 9, "bold")).pack(anchor="w", pady=(8, 7))
        log_frame = ttk.Frame(shell, style="Card.TFrame", padding=2); log_frame.pack(fill=BOTH, expand=True)
        self.log = Text(log_frame, height=9, state="disabled", font=("TkFixedFont", 9), bg="white", fg=INK, relief="flat", padx=12, pady=10, wrap="word", insertbackground=GREEN)
        self.log.pack(fill=BOTH, expand=True)
        bottom = ttk.Frame(shell); bottom.pack(fill=X, pady=(12, 0))
        ttk.Label(bottom, text="VersaDelivery · Conector de impressão", style="Muted.TLabel").pack(side=LEFT)
        ttk.Button(bottom, text="Minimizar para segundo plano", style="Secondary.TButton", command=self.minimize).pack(side=RIGHT, padx=(8, 0))
        ttk.Button(bottom, text="Desconectar e sair", style="Secondary.TButton", command=self.quit).pack(side=RIGHT)

    def refresh_printers(self):
        names = list_printers()
        self.printers["values"] = names
        if names and self.printer.get() not in names: self.printer.set(names[0])

    def connect(self, automatic=False):
        if not all([self.email.get(), self.password.get(), self.printer.get()]):
            if not automatic: messagebox.showwarning("Campos obrigatórios", "Preencha a conta e escolha uma impressora.")
            return
        self.connect_button.config(text="Conectando...", state="disabled")
        self.status.set("Conectando à loja...")

        email, password, printer = self.email.get().strip().lower(), self.password.get(), self.printer.get()

        def connect_in_background():
            try:
                if not keyring:
                    raise RuntimeError("O armazenamento seguro do sistema não está instalado. Reinstale o conector para habilitar a conexão automática.")
                keyring.set_password("VersaPrintConnector", email, password)
                self.connector.start(email, password, printer)
                CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
                CONFIG_FILE.write_text(json.dumps({"email": email, "printer": printer}))
                self.events.put(("connected", automatic))
            except Exception as error:
                try:
                    if keyring: keyring.delete_password("VersaPrintConnector", email)
                except Exception: pass
                self.events.put(("connect_error", (str(error), automatic)))
        threading.Thread(target=connect_in_background, daemon=True).start()

    def disconnect(self):
        self.connector.stop(); self.connected = False; self.status.set("Desconectado"); self.status_dot.configure(foreground="#8A9690"); self.connect_button.config(text="Conectar à loja", state="normal")

    def close_window(self):
        if self.connected:
            self.minimize()
        else:
            self.root.destroy()

    def minimize(self):
        if self.connected:
            self.events.put(("log", "Janela minimizada; impressão continua ativa"))
        # Defer the window-manager request so the click handler returns immediately.
        self.root.after_idle(self.root.iconify)

    def quit(self):
        self.disconnect()
        self.root.destroy()

    def test(self):
        if not self.printer.get(): return
        item = {"attributes": {
            "name": "ITEM DE TESTE", "quantity": 1,
            "selected_prepare_methods": [{"name": "Bem passado"}],
            "selected_steps": [], "selected_extras": [], "complements": [],
            "observation": "Conector funcionando",
        }}
        attributes = {
            "created_at": datetime.now().isoformat(), "withdrawal": False,
            "customer": {"data": {"attributes": {"name": "Teste da impressora"}}},
            "items": {"data": [item]},
        }
        sample = {"receipt_mode": "summary", "font_size": "large", "order": {"data": {"id": "TESTE", "attributes": attributes}}}
        try: print_raw(self.printer.get(), escpos(build_receipt(sample)), "Teste VersaDelivery")
        except Exception as error: messagebox.showerror("Erro", f"Não foi possível imprimir o teste: {error}")

    def process_events(self):
        while not self.events.empty():
            kind, value = self.events.get()
            if kind == "status":
                self.status.set(value); self.status_dot.configure(foreground=GREEN)
            elif kind == "connected":
                self.connected = True
                self.connect_button.config(text="Conectado à loja", state="disabled")
                if value: self.minimize()
            elif kind == "connect_error":
                error, automatic = value
                self.connected = False
                self.connect_button.config(text="Conectar à loja", state="normal")
                self.status.set("Não foi possível conectar")
                if automatic: self.root.deiconify()
                else: messagebox.showerror("Falha ao conectar", error)
                self.log.config(state="normal"); self.log.insert(END, f'[{datetime.now():%H:%M:%S}] Falha ao conectar: {error}\n'); self.log.see(END); self.log.config(state="disabled")
            else:
                self.log.config(state="normal"); self.log.insert(END, f'[{datetime.now():%H:%M:%S}] {value}\n'); self.log.see(END); self.log.config(state="disabled")
        self.root.after(250, self.process_events)

    def run(self): self.root.mainloop()


if __name__ == "__main__":
    App(start_in_background="--background" in sys.argv).run()
