#!/usr/bin/env python3
"""Validate the release source image without changing the running event."""
import json
import pathlib
import subprocess
import tempfile
import time
import urllib.error
import urllib.request

image = 'wlabby-lottery:verify'
name = 'wlabby-lottery-package-check'
base = 'http://127.0.0.1:18999'

def api(path, data=None, origin=None):
    headers = {'Content-Type': 'application/json'}
    if origin:
        headers['Origin'] = origin
    request = urllib.request.Request(base + path, data=json.dumps(data).encode() if data is not None else None, headers=headers)
    with urllib.request.urlopen(request, timeout=5) as response:
        return json.load(response)

def ready():
    for _ in range(80):
        try:
            return api('/health')
        except (urllib.error.URLError, ConnectionError):
            time.sleep(.2)
    raise RuntimeError('Container did not become ready')

with tempfile.TemporaryDirectory(prefix='lottery-lpk-check-') as data_dir:
    try:
        subprocess.run(['docker', 'run', '-d', '--name', name, '--user', '1000:1000',
                        '-p', '127.0.0.1:18999:8888', '-v', data_dir + ':/lzcapp/var',
                        '-e', 'LOTTERY_DATA_DIR=/lzcapp/var/lottery', '-e', 'LOTTERY_TRUST_PROXY=1',
                        '-e', 'LOTTERY_PUBLIC_ORIGIN=https://lottery-test.example',
                        '--entrypoint', '/app/run.sh', image], check=True, stdout=subprocess.DEVNULL)
        assert ready()['users'] == 132
        with urllib.request.urlopen(base + '/admin.html') as response:
            assert '星际控制台' in response.read().decode()
        assert api('/theme', {'theme': 'violet'}, 'https://lottery-test.example')['theme'] == 'violet'
        try:
            api('/theme', {'theme': 'solar'}, 'https://evil.example')
            raise AssertionError('Cross-origin write was accepted')
        except urllib.error.HTTPError as error:
            assert error.code == 403
        result = api('/draw', {'type': 7}, 'https://lottery-test.example')
        assert len(result['users']) == 10
        assert len(result['luckyData']['7']) == 10
        subprocess.run(['docker', 'restart', name], check=True, stdout=subprocess.DEVNULL)
        ready()
        restored = api('/getTempData', {})
        assert restored['cfgData']['theme'] == 'violet'
        assert len(restored['luckyData']['7']) == 10
        assert pathlib.Path(data_dir, 'lottery/state.json').exists()
        print('PASS: non-root startup, static UI, HTTPS proxy origin, foreign origin rejection, draw and restart persistence')
    finally:
        subprocess.run(['docker', 'rm', '-f', name], check=False, stdout=subprocess.DEVNULL)
