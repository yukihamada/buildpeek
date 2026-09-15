"""Record real local UI interaction; synthetic data only, no voiceover."""
from pathlib import Path
from playwright.sync_api import sync_playwright

out = Path(__file__).resolve().parents[1] / 'artifacts'
out.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(viewport={'width': 1270, 'height': 760}, record_video_dir=str(out), record_video_size={'width': 1270, 'height': 760})
    page = context.new_page()
    page.goto('http://127.0.0.1:8942/', wait_until='networkidle')
    page.wait_for_timeout(3000)
    page.locator('#demo').click()
    page.locator('#download').wait_for()
    page.wait_for_timeout(4500)
    page.locator('.findings').evaluate('(el) => { el.scrollTop = el.scrollHeight; }')
    page.wait_for_timeout(3500)
    page.locator('#clean-demo').click()
    page.locator('#download').wait_for()
    page.wait_for_timeout(4000)
    page.locator('#language').click()
    page.wait_for_timeout(3000)
    page.locator('#demo').click()
    page.locator('#download').wait_for()
    page.wait_for_timeout(3000)
    video = page.video
    context.close()
    video.save_as(str(out / 'demo.webm'))
    browser.close()
print(out / 'demo.webm')
