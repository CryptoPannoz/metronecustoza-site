#!/usr/bin/env python3
"""Genera le versioni WebP responsive delle foto in photos/ dentro src/assets/img/.

Uso: python3 tools/images.py
Per ogni foto crea <nome>-<larghezza>.webp per le larghezze in WIDTHS
(mai oltre la larghezza originale) e stampa le dimensioni, da riportare
in src/photos.mjs se si aggiungono foto nuove.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "photos"
OUT = ROOT / "src" / "assets" / "img"
WIDTHS = [480, 800, 1200, 1600]
QUALITY = 78

OUT.mkdir(parents=True, exist_ok=True)

for photo in sorted(SRC.glob("*.jpg")):
    im = Image.open(photo).convert("RGB")
    w, h = im.size
    sizes = [x for x in WIDTHS if x < w] + [w]
    for width in sizes:
        height = round(h * width / w)
        out = OUT / f"{photo.stem}-{width}.webp"
        im.resize((width, height), Image.LANCZOS).save(out, "WEBP", quality=QUALITY, method=6)
    print(f"{photo.stem}: {w}x{h} -> {sizes}")

# Immagine di anteprima per i social (Open Graph vuole JPEG/PNG)
og = Image.open(SRC / "facciata.jpg").convert("RGB")
og.save(OUT / "og-facciata.jpg", "JPEG", quality=85, optimize=True, progressive=True)
