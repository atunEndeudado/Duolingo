from urllib.parse import quote
from urllib.request import urlopen
import json
import re


def traducir(texto: str, src: str, dest: str) -> str:
    """Traduce usando explícitamente el idioma de origen y de destino."""
    origen = src.strip().lower().replace("_", "-")
    destino = dest.strip().lower().replace("_", "-")
    if not origen or not destino:
        raise ValueError("Los códigos de idioma de origen y destino son obligatorios")
    if origen == destino:
        return texto

    url = (
        "https://translate.googleapis.com/translate_a/single"
        f"?client=gtx&sl={quote(origen)}&tl={quote(destino)}&dt=t&q={quote(texto)}"
    )
    with urlopen(url, timeout=10) as response:
        data = json.loads(response.read().decode("utf-8"))

    traduccion = "".join(segment[0] for segment in data[0] if segment[0])
    if not traduccion:
        raise ValueError("Google Translator no devolvió una traducción")
    return traduccion


def traducir_a_es(texto: str, idioma_origen: str) -> str:
    return traducir(texto, idioma_origen, "es")


def traducir_terminos(texto: str, src: str, dest: str) -> str:
    """Traduce cada término conservando los separadores de ejercicios de pares."""
    partes = re.split(r"([,;|\n]+)", texto)
    return "".join(
        traducir(parte.strip(), src=src, dest=dest) if parte.strip() else parte
        for parte in partes
    )
