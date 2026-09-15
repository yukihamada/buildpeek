"""Real browser smoke test against an already-running local preview."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts'
OUT.mkdir(exist_ok=True)
BASE = 'http://127.0.0.1:8942/'
checks = []

with sync_playwright() as p:
    for engine in ['chromium', 'webkit']:
        browser = getattr(p, engine).launch()
        page = browser.new_page(viewport={'width': 1440, 'height': 1100}, device_scale_factor=1)
        errors, unexpected = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('request', lambda request: unexpected.append(request.url) if not request.url.startswith(BASE) else None)
        page.goto(BASE, wait_until='networkidle')
        assert page.title().startswith('BuildPeek')
        if engine == 'chromium':
            page.screenshot(path=str(OUT / 'desktop.png'), full_page=True)
        page.locator('#demo').click()
        page.locator('#download').wait_for()
        assert page.locator('.finding').count() == 6
        assert page.locator('.stat b').all_text_contents() == ['5', '1', '8', '0']
        if engine == 'chromium':
            page.screenshot(path=str(OUT / 'demo-results.png'), full_page=True)
        page.locator('#language').click()
        assert page.locator('html').get_attribute('lang') == 'ja'
        assert '優先して確認' in page.locator('#result').inner_text()
        page.locator('#clean-demo').click()
        page.locator('#download').wait_for()
        assert page.locator('.finding').count() == 0
        assert page.locator('.stat b').all_text_contents() == ['0', '0', '2', '1']
        assert '安全の証明' in page.locator('#result').inner_text()
        page.locator('#input').fill('ARG PASSWORD')
        assert page.locator('#download').count() == 0  # stale report cannot be shared
        page.locator('#scan').click()
        page.locator('#download').wait_for()
        with page.expect_download() as download:
            page.locator('#download').click()
        report = Path(download.value.path()).read_text()
        assert 'BP001' in report and 'ARG PASSWORD' not in report
        with page.expect_download() as download:
            page.locator('#card').click()
        assert Path(download.value.path()).read_bytes().startswith(b'\x89PNG')
        page.locator('#input').fill('<script>window.evil=1</script>\nARG PASSWORD')
        page.locator('#scan').click()
        page.locator('#download').wait_for()
        assert page.evaluate('window.evil') is None
        assert '<script>' not in page.locator('#result').inner_text()
        page.locator('#mode').select_option('json')
        page.locator('#input').fill('{broken')
        page.locator('#scan').click()
        expect(page.locator('#status')).to_contain_text('JSON')
        assert page.locator('#download').count() == 0
        config = json.dumps({'history': [{'created_by': 'ARG GITHUB_TOKEN'}]})
        page.locator('#file').set_input_files({'name': 'private-do-not-export.json', 'mimeType': 'application/json', 'buffer': config.encode()})
        page.locator('#download').wait_for()
        assert page.locator('.finding').count() == 1
        assert 'private-do-not-export' not in page.locator('#result').inner_text()
        page.locator('#clear').click()
        assert page.locator('#input').input_value() == ''
        assert page.locator('#download').count() == 0
        assert page.evaluate('localStorage.length') == 0
        assert page.evaluate('sessionStorage.length') == 0
        assert page.context.cookies() == []
        for lang in ['en', 'ja']:
            for width in [375, 768, 1440]:
                page.set_viewport_size({'width': width, 'height': 1000})
                page.goto(BASE + '?lang=' + lang, wait_until='networkidle')
                page.locator('#demo').click()
                page.locator('#download').wait_for()
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (lang, width)
                if engine == 'chromium' and width == 375:
                    page.screenshot(path=str(OUT / f'mobile-{lang}.png'), full_page=True)
        assert not unexpected, unexpected
        assert not errors, errors
        checks.append({'engine': engine, 'flows': 'PASS', 'viewports': [375, 768, 1440], 'languages': ['en', 'ja'], 'external_requests': len(unexpected), 'page_errors': len(errors)})
        browser.close()
    # Product Hunt gallery captures: genuine live UI, fixed recommended dimensions.
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1270, 'height': 760}, device_scale_factor=1)
    page.goto(BASE, wait_until='networkidle')
    page.screenshot(path=str(OUT / 'ph-gallery-1.png'))
    page.locator('#demo').click()
    page.locator('#download').wait_for()
    page.screenshot(path=str(OUT / 'ph-gallery-2.png'))
    page.goto(BASE + 'icon.svg')
    page.locator('svg').screenshot(path=str(OUT / 'ph-thumbnail.png'))
    browser.close()

(OUT / 'browser-results.json').write_text(json.dumps(checks, indent=2) + '\n')
print(json.dumps(checks, indent=2))
