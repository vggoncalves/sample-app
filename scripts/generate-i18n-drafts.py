#!/usr/bin/env python3
"""Gera rascunhos XLIFF pt-BR com Argos Translate executado localmente."""

from __future__ import annotations

import argparse
import copy
import re
import sys
import xml.etree.ElementTree as element_tree

import argostranslate.package
import argostranslate.translate

XLIFF_NAMESPACE = "urn:oasis:names:tc:xliff:document:1.2"
TARGETS = {"en": "en", "es": "es", "fr": "fr", "ar": "ar", "hi": "hi", "zh-Hans": "zh"}

element_tree.register_namespace("", XLIFF_NAMESPACE)


def install_models() -> None:
    argostranslate.package.update_package_index()
    packages = argostranslate.package.get_available_packages()
    installed_pairs = {(package.from_code, package.to_code) for package in argostranslate.package.get_installed_packages()}

    def install(source: str, target: str) -> None:
        package = next((item for item in packages if item.from_code == source and item.to_code == target), None)
        if package is None:
            raise RuntimeError(f"Modelo Argos {source} -> {target} não encontrado.")
        if (source, target) not in installed_pairs:
            argostranslate.package.install_from_path(package.download())
            installed_pairs.add((source, target))

    install("pt", "en")
    for target in TARGETS.values():
        if target == "en":
            continue
        direct = next((item for item in packages if item.from_code == "pt" and item.to_code == target), None)
        if direct is not None:
            install("pt", target)
            continue
        install("en", target)


def translators() -> dict[str, object]:
    installed = argostranslate.translate.get_installed_languages()
    source = next((language for language in installed if language.code in {"pt", "pt_BR"}), None)
    if source is None:
        raise RuntimeError("Modelo Argos de português não instalado. Execute com --install-models uma única vez.")
    result: dict[str, object] = {}
    for locale, target_code in TARGETS.items():
        target = next((language for language in installed if language.code == target_code), None)
        if target is None:
            raise RuntimeError(f"Modelo Argos pt -> {target_code} não instalado. Execute com --install-models.")
        result[locale] = source.get_translation(target)
    return result


def translate_text(text: str | None, translation: object) -> str | None:
    if text is None or not text.strip():
        return text
    match = re.fullmatch(r"(\s*)(.*?)(\s*)", text, flags=re.DOTALL)
    assert match is not None
    return f"{match.group(1)}{translation.translate(match.group(2))}{match.group(3)}"


def draft(source_path: str, output_path: str, translation: object) -> None:
    tree = element_tree.parse(source_path)
    root = tree.getroot()
    namespace = {"x": XLIFF_NAMESPACE}
    for unit in root.findall(".//x:trans-unit", namespace):
        source = unit.find("x:source", namespace)
        if source is None:
            continue
        target = copy.deepcopy(source)
        target.tag = f"{{{XLIFF_NAMESPACE}}}target"
        target.set("state", "needs-review-translation")
        for node in target.iter():
            node.text = translate_text(node.text, translation)
            node.tail = translate_text(node.tail, translation)
        existing = unit.find("x:target", namespace)
        if existing is not None:
            unit.remove(existing)
        unit.insert(list(unit).index(source) + 1, target)
    tree.write(output_path, encoding="UTF-8", xml_declaration=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source")
    parser.add_argument("output_directory")
    parser.add_argument("--install-models", action="store_true")
    arguments = parser.parse_args()
    if arguments.install_models:
        install_models()
    available = translators()
    for locale, translation in available.items():
        draft(arguments.source, f"{arguments.output_directory}/messages.{locale}.xlf", translation)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as error:
        print(error, file=sys.stderr)
        raise SystemExit(1)
