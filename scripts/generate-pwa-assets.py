"""Génération facultative des ressources livrées : Pillow et qrcode requis.

L’application utilise directement les PNG/SVG du dépôt, sans exécuter ce script.
"""
from pathlib import Path
import re
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw
import qrcode
import qrcode.image.svg

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
INSTALL_URL = "https://leelee-heg.github.io/code-secret/?installer=1"
svg = ET.parse(ASSETS / "icon.svg").getroot()
scale = 4
image = Image.new("RGB", (512 * scale, 512 * scale), "#285c45")
draw = ImageDraw.Draw(image)
for element in svg:
    if element.tag.endswith("path") and "stroke" in element.attrib:
        values = list(map(float, re.findall(r"[\d.]+", element.attrib["d"])))
        points = [(values[i] * scale, values[i + 1] * scale) for i in range(0, len(values), 2)]
        draw.line(points + points[:2], fill=element.attrib["stroke"], width=14 * scale, joint="curve")
    elif element.tag.endswith("circle"):
        x, y, r = (float(element.attrib[k]) * scale for k in ("cx", "cy", "r"))
        draw.ellipse((x-r, y-r, x+r, y+r), fill=element.attrib["fill"])
for name, size in [("icon-192.png",192), ("icon-512.png",512),
                   ("icon-maskable-512.png",512), ("apple-touch-icon.png",180)]:
    image.resize((size,size), Image.Resampling.LANCZOS).save(ASSETS / name, optimize=True)

qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=12, border=4)
qr.add_data(INSTALL_URL)
qr.make(fit=True)
qr.make_image(fill_color="black",back_color="white").save(ASSETS / "qr-code-secret.png")
qr.make_image(image_factory=qrcode.image.svg.SvgPathFillImage).save(ASSETS / "qr-code-secret.svg")
print("Icônes générées. QR code : " + INSTALL_URL)
