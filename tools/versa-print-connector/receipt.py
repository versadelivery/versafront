import html
import os
import subprocess
import textwrap
from datetime import datetime

WIDTH, MARGIN = 576, 24
if os.name == "nt":
    REGULAR_FONT = "C:/Windows/Fonts/consola.ttf"
    BOLD_FONT = "C:/Windows/Fonts/consolab.ttf"
else:
    REGULAR_FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
    BOLD_FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"


def unwrap(value):
    if isinstance(value, dict) and "data" in value:
        return unwrap(value["data"])
    if isinstance(value, dict) and "attributes" in value:
        result = dict(value["attributes"])
        result.setdefault("id", value.get("id"))
        return result
    return value or {}


def money(value):
    return f"R$ {float(value or 0):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


class Receipt:
    def __init__(self):
        self.y, self.parts = 100, []

    def text(self, value, size=25, bold=False, align="left", gap=8):
        width = max(12, int((WIDTH - 2 * MARGIN) / (size * 0.62)))
        lines = textwrap.wrap(str(value), width=width, break_long_words=True) or [""]
        for line in lines:
            self.parts.append(("text", self.y, line, size, bold, align))
            self.y += size + 4
        self.y += gap - 4

    def pair(self, label, value, size=25, bold=False, gap=8):
        width = max(10, int((WIDTH - 190 - MARGIN) / (size * 0.62)))
        lines = textwrap.wrap(str(value), width=width, break_long_words=True) or [""]
        for index, line in enumerate(lines):
            self.parts.append(("pair", self.y, str(label) if index == 0 else "", line, size, bold))
            self.y += size + 4
        self.y += gap - 4

    def amount(self, label, value, bold=False):
        self.parts.append(("amount", self.y, label, value, 25, bold))
        self.y += 35

    def rule(self, thick=True):
        self.parts.append(("rule", self.y, thick)); self.y += 38

    def space(self, pixels):
        self.y += pixels

    def render(self):
        height = self.y + 110
        svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{height}">', '<rect width="100%" height="100%" fill="white"/>']
        for kind, y, *args in self.parts:
            if kind == "rule":
                svg.append(f'<line x1="{MARGIN}" y1="{y}" x2="{WIDTH-MARGIN}" y2="{y}" stroke="black" stroke-width="{4 if args[0] else 2}"/>')
            elif kind == "text":
                value, size, bold, align = args
                x, anchor = (MARGIN, "start") if align == "left" else (WIDTH // 2, "middle")
                svg.append(f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="Noto Sans Mono" font-size="{size}" font-weight="{700 if bold else 400}">{html.escape(value)}</text>')
            elif kind == "pair":
                label, value, size, bold = args
                svg.append(f'<text x="{MARGIN}" y="{y}" font-family="Noto Sans Mono" font-size="{size}">{html.escape(label)}</text>')
                svg.append(f'<text x="190" y="{y}" font-family="Noto Sans Mono" font-size="{size}" font-weight="{700 if bold else 400}">{html.escape(value)}</text>')
            else:
                label, value, size, bold = args
                weight = 700 if bold else 400
                svg.append(f'<text x="{MARGIN}" y="{y}" font-family="Noto Sans Mono" font-size="{size}" font-weight="{weight}">{html.escape(label)}</text>')
                svg.append(f'<text x="{WIDTH-MARGIN}" y="{y}" text-anchor="end" font-family="Noto Sans Mono" font-size="{size}" font-weight="{weight}">{html.escape(value)}</text>')
        svg.append('</svg>')
        return ''.join(svg), height, self.parts


def item_values(raw):
    item = unwrap(raw); catalog = unwrap(item.get("catalog_item"))
    methods = ", ".join(x.get("name", "") for x in item.get("selected_prepare_methods", []))
    steps = ", ".join(f'{x.get("step_name")}: {x.get("option_name")}' for x in item.get("selected_steps", []))
    extras = ", ".join(x.get("name", "") for x in item.get("selected_extras", []) + item.get("complements", []))
    weight = item.get("weight")
    quantity = f'{float(weight):g} kg'.replace(".", ",") if weight else str(item.get("quantity", 1))
    return item, catalog.get("name") or item.get("name") or "ITEM", quantity, methods, steps, extras


def build_receipt(job):
    order, mode = unwrap(job["order"]), job["receipt_mode"]
    large = job.get("font_size") == "large"
    size, gap = (31 if large else 27), (40 if mode == "summary" else 7)
    customer, shop, address = unwrap(order.get("customer")), unwrap(order.get("shop")), unwrap(order.get("address"))
    created = datetime.fromisoformat(str(order.get("created_at", "")).replace("Z", "+00:00")) if order.get("created_at") else datetime.now()
    kind, r = ("RETIRADA" if order.get("withdrawal") else "DELIVERY"), Receipt()
    r.rule()
    if mode == "summary":
        r.text(f'PEDIDO #{order.get("id")}', 31, True, "center")
        r.text(f'[ {kind} ]  {created:%d/%m - %H:%M}', 26, align="center")
        r.text(f'Cliente: {customer.get("name", "Cliente")}', 25, align="center")
        r.rule(); r.text("ITENS PARA SEPARAÇÃO:", 28, True); r.space(24)
    else:
        r.text(shop.get("name", "Loja"), 27, True, "center")
        if shop.get("address"): r.text(shop["address"], 23, align="center")
        if shop.get("document"): r.text(f'CNPJ: {shop["document"]}', 23, align="center")
        r.rule(); r.text(f'PEDIDO #{order.get("id")}', 29, True)
        r.pair("Data/Hora:", created.strftime("%d/%m/%Y %H:%M"), 23)
        if order.get("delivery_person"): r.pair("Entregador:", order["delivery_person"], 23)
        r.rule(False); r.text("CLIENTE:", 27, True); r.text(customer.get("name", "Cliente"), 24)
        if not order.get("withdrawal") and address.get("address"):
            r.text(f'{address["address"]}, {address.get("number", "")}', 23)
            if address.get("neighborhood"): r.pair("Bairro:", address["neighborhood"], 23)
        else: r.text("Retirada na loja", 23)
        if customer.get("cellphone"): r.pair("Fone:", customer["cellphone"], 23)
        r.rule(); r.text("DETALHAMENTO DO PEDIDO:", 27, True); r.space(18)

    items = order.get("items", {}).get("data", []) if isinstance(order.get("items"), dict) else order.get("items", [])
    for raw in items:
        item, name, quantity, methods, steps, extras = item_values(raw)
        r.text(name.upper(), size, True, gap=gap)
        r.pair("Peso:" if item.get("weight") else "Quantidade:", quantity, size, mode == "summary", gap)
        if methods: r.pair("Preparo:", methods, size, mode == "summary", gap)
        if steps: r.pair("Montagem:", steps, size, mode == "summary", gap)
        if extras: r.pair("Adicionais:", extras, size, mode == "summary", gap)
        if item.get("observation"): r.pair("Obs:", item["observation"], size, mode == "summary", gap)
        if mode == "complete": r.amount("Subtotal:", money(item.get("total_price")))
        r.space(28 if mode == "summary" else 18)

    if mode == "complete":
        r.rule(); r.text("RESUMO FINANCEIRO:", 27, True)
        r.amount("Produtos:", money(order.get("total_items_price"))); r.amount("Taxa de entrega:", money(order.get("delivery_fee")))
        if float(order.get("discount_amount") or 0): r.amount("Desconto:", f'-{money(order["discount_amount"])}')
        r.rule(False); r.amount("TOTAL A PAGAR:", money(order.get("total_price")), True); r.rule()
        labels = {"cash":"DINHEIRO", "credit":"CARTÃO DE CRÉDITO", "debit":"CARTÃO DE DÉBITO", "manual_pix":"PIX DIRETO", "asaas_pix":"PIX AUTOMÁTICO", "food_voucher":"VALE ALIMENTAÇÃO / REFEIÇÃO", "store_credit":"FIADO"}
        r.text("FORMA DE PAGAMENTO:", 27, True); r.pair("Pagamento:", labels.get(order.get("payment_method"), str(order.get("payment_method", ""))), 23)
    r.rule(); r.text("--- VIA RESUMIDA ---" if mode == "summary" else "--- VIA DO CLIENTE ---", 26, True, "center")
    if mode == "complete":
        r.text("Obrigado pela preferência!", 23, align="center"); r.text("www.versadelivery.com.br", 22, align="center")
    return r.render()


def escpos(rendered):
    svg, height, parts = rendered
    try:
        pixels = pillow_pixels(parts, height)
    except ImportError:
        result = subprocess.run(
            ["magick", "svg:-", "-background", "white", "-alpha", "remove", "-colorspace", "Gray", "-threshold", "65%", "-depth", "8", "gray:-"],
            input=svg.encode(), check=True, capture_output=True,
        )
        pixels = result.stdout
    output = bytearray(b"\x1b@\x1b\x33\x18")
    if len(pixels) != WIDTH * height:
        raise RuntimeError("Falha ao gerar a imagem térmica")
    for top in range(0, height, 24):
        output.extend(b"\x1b\x2a\x21" + bytes([WIDTH & 255, WIDTH >> 8]))
        for x in range(WIDTH):
            for group in range(3):
                value = 0
                for bit in range(8):
                    y = top + group * 8 + bit
                    if y < height and pixels[y * WIDTH + x] < 128: value |= 1 << (7 - bit)
                output.append(value)
        output.append(10)
    return bytes(output) + b"\x1b\x32\n\n\n\n\n\n\x1dV\x42\x04"


def pillow_pixels(parts, height):
    from PIL import Image, ImageDraw, ImageFont

    image = Image.new("L", (WIDTH, height), 255)
    draw = ImageDraw.Draw(image)
    font = lambda size, bold=False: ImageFont.truetype(BOLD_FONT if bold else REGULAR_FONT, size)
    for kind, y, *args in parts:
        if kind == "rule":
            draw.line((MARGIN, y, WIDTH - MARGIN, y), fill=0, width=4 if args[0] else 2)
        elif kind == "text":
            value, size, bold, align = args; selected = font(size, bold)
            width = draw.textbbox((0, 0), value, font=selected)[2]
            x = MARGIN if align == "left" else (WIDTH - width) // 2
            draw.text((x, y - size), value, font=selected, fill=0)
        elif kind == "pair":
            label, value, size, bold = args
            draw.text((MARGIN, y - size), label, font=font(size), fill=0)
            draw.text((190, y - size), value, font=font(size, bold), fill=0)
        else:
            label, value, size, bold = args; selected = font(size, bold)
            draw.text((MARGIN, y - size), label, font=selected, fill=0)
            width = draw.textbbox((0, 0), value, font=selected)[2]
            draw.text((WIDTH - MARGIN - width, y - size), value, font=selected, fill=0)
    return image.point(lambda pixel: 0 if pixel < 166 else 255).tobytes()
