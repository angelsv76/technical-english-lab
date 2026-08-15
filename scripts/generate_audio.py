"""
Genera audios mp3 con kokoro-tts a partir de un manifest JSON.
El manifest es una lista de {folder, file, text}: produce audio-upload/<folder>/<file>

Uso (desde technical-english-lab-main):
  ../kokoro-tts/.venv/Scripts/python.exe scripts/generate_audio.py scripts/audio-manifest.json

Es idempotente: salta archivos que ya existen. Voz af_heart (inglés US), mp3 96k mono.
"""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from kokoro import KPipeline

if len(sys.argv) < 2:
    raise SystemExit("Uso: generate_audio.py <ruta-al-manifest.json>")

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(BASE, sys.argv[1]) if not os.path.isabs(sys.argv[1]) else sys.argv[1]
OUT_DIR = os.path.join(BASE, "audio-upload")

VOICE = "af_heart"   # inglés US, voz femenina de mayor calidad de kokoro
LANG = "a"           # 'a' = American English
BITRATE = "96k"      # mp3 mono: suficiente para voz, liviano para datos móviles

with open(MANIFEST, encoding="utf-8") as f:
    items = json.load(f)

pipeline = KPipeline(lang_code=LANG)

total = len(items)
done = 0
skipped = 0
for item in items:
    folder = os.path.join(OUT_DIR, item["folder"])
    os.makedirs(folder, exist_ok=True)
    out_mp3 = os.path.join(folder, item["file"])

    if os.path.exists(out_mp3):
        skipped += 1
        continue

    chunks = [audio for _, _, audio in pipeline(item["text"], voice=VOICE)]
    audio = np.concatenate(chunks)

    wav_tmp = out_mp3[:-4] + ".tmp.wav"
    sf.write(wav_tmp, audio, 24000)
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", wav_tmp,
         "-codec:a", "libmp3lame", "-b:a", BITRATE, "-ac", "1", out_mp3],
        check=True,
    )
    os.remove(wav_tmp)

    done += 1
    print(f"[{done + skipped}/{total}] {item['folder']}/{item['file']}  «{item['text']}»", flush=True)

print(f"\nListo: {done} generados, {skipped} ya existían. Carpeta: {OUT_DIR}")
