#!/usr/bin/env python3
import json
import os
import queue
import subprocess
import threading
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from tkinter import BOTH, END, LEFT, RIGHT, StringVar, Tk, Text, ttk, messagebox

from receipt import build_receipt, escpos, unwrap

CONFIG_FILE = Path.home() / ".config" / "versa-print-connector" / "config.json"
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

    def start(self, api_url, email, password, printer):
        self.api_url, self.printer = api_url.rstrip("/"), printer
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
    def __init__(self):
        self.root = Tk(); self.root.title("Conector VersaDelivery"); self.root.geometry("620x520")
        self.events, self.connector = queue.Queue(), Connector(queue.Queue())
        self.connector.events = self.events
        saved = self.load_config()
        self.api = StringVar(value=saved.get("api", "https://web-production-9043c.up.railway.app"))
        self.email, self.password = StringVar(), StringVar()
        self.printer = StringVar(value=saved.get("printer", "")); self.status = StringVar(value="Desconectado")
        self.build(); self.refresh_printers(); self.root.after(250, self.process_events)

    @staticmethod
    def load_config():
        try: return json.loads(CONFIG_FILE.read_text())
        except Exception: return {}

    def build(self):
        frame = ttk.Frame(self.root, padding=24); frame.pack(fill=BOTH, expand=True)
        ttk.Label(frame, text="Conector VersaDelivery", font=("TkDefaultFont", 18, "bold")).pack(anchor="w")
        ttk.Label(frame, text="Impressão térmica automática de pedidos", foreground="#666").pack(anchor="w", pady=(2, 18))
        form = ttk.Frame(frame); form.pack(fill="x")
        for row, (label, variable, secret) in enumerate([("API", self.api, False), ("E-mail", self.email, False), ("Senha", self.password, True)]):
            ttk.Label(form, text=label).grid(row=row, column=0, sticky="w", pady=5)
            ttk.Entry(form, textvariable=variable, show="•" if secret else "").grid(row=row, column=1, sticky="ew", padx=(12, 0), pady=5)
        ttk.Label(form, text="Impressora").grid(row=3, column=0, sticky="w", pady=5)
        self.printers = ttk.Combobox(form, textvariable=self.printer, state="readonly")
        self.printers.grid(row=3, column=1, sticky="ew", padx=(12, 0), pady=5); form.columnconfigure(1, weight=1)
        actions = ttk.Frame(frame); actions.pack(fill="x", pady=16)
        self.connect_button = ttk.Button(actions, text="Conectar", command=self.connect); self.connect_button.pack(side=LEFT)
        ttk.Button(actions, text="Atualizar impressoras", command=self.refresh_printers).pack(side=LEFT, padx=8)
        ttk.Button(actions, text="Teste de impressão", command=self.test).pack(side=RIGHT)
        ttk.Separator(frame).pack(fill="x", pady=(0, 12)); ttk.Label(frame, textvariable=self.status, foreground="#008044").pack(anchor="w")
        self.log = Text(frame, height=12, state="disabled", font=("monospace", 10)); self.log.pack(fill=BOTH, expand=True, pady=(10, 0))

    def refresh_printers(self):
        names = list_printers()
        self.printers["values"] = names
        if names and self.printer.get() not in names: self.printer.set(names[0])

    def connect(self):
        if not all([self.api.get(), self.email.get(), self.password.get(), self.printer.get()]):
            messagebox.showwarning("Campos obrigatórios", "Preencha a conta e escolha uma impressora."); return
        try:
            self.connector.start(self.api.get(), self.email.get(), self.password.get(), self.printer.get())
            CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
            CONFIG_FILE.write_text(json.dumps({"api": self.api.get(), "printer": self.printer.get()}))
            self.connect_button.config(text="Desconectar", command=self.disconnect)
        except Exception as error: messagebox.showerror("Falha ao conectar", str(error))

    def disconnect(self):
        self.connector.stop(); self.status.set("Desconectado"); self.connect_button.config(text="Conectar", command=self.connect)

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
            if kind == "status": self.status.set(value)
            else:
                self.log.config(state="normal"); self.log.insert(END, f'[{datetime.now():%H:%M:%S}] {value}\n'); self.log.see(END); self.log.config(state="disabled")
        self.root.after(250, self.process_events)

    def run(self): self.root.mainloop()


if __name__ == "__main__": App().run()
