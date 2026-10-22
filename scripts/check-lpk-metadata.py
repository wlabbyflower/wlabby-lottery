#!/usr/bin/env python3
"""Check package locale types accepted by the micro-server's Go YAML parser.

Usage: python3 scripts/check-lpk-metadata.py [package.yml|app.lpk]
Requires PyYAML. Use dotted locale keys, never nested translation objects.
"""
import pathlib
import sys
import tarfile
import yaml

source = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'package.yml')
if source.suffix == '.lpk':
    with tarfile.open(source) as package:
        data = yaml.safe_load(package.extractfile('package.yml'))
else:
    data = yaml.safe_load(source.read_text())
errors = []
for language, translations in data.get('locales', {}).items():
    if not isinstance(translations, dict):
        errors.append(f'locales.{language} must be a mapping of string keys to string values')
        continue
    for key, value in translations.items():
        if not isinstance(key, str) or not isinstance(value, str):
            errors.append(f'locales.{language}.{key} must be a string; use dotted keys such as entries.settings.title')
if errors:
    sys.exit('\n'.join(errors))
print(f'PASS: {source} locale values are flat strings')
