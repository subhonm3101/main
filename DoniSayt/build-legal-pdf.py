import pathlib
import re
import shutil
import tempfile
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).parent
pages = ['privacy-policy', 'personal-data-consent', 'terms-of-use', 'cookie-policy']

with tempfile.TemporaryDirectory() as tmp:
    tmp_path = pathlib.Path(tmp)
    for css in root.glob('*.css'):
        shutil.copy(css, tmp_path / css.name)
    for name in pages:
        html = (root / f'{name}.html').read_text(encoding='utf-8')
        html = re.sub(r'href="(%s)\.html"' % '|'.join(pages), r'href="\1.pdf"', html)
        (tmp_path / f'{name}.html').write_text(html, encoding='utf-8')

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome')
        for name in pages:
            page = browser.new_page()
            page.goto((tmp_path / f'{name}.html').as_uri())
            page.pdf(path=str(root / f'{name}.pdf'), format='A4', print_background=True,
                     margin={'top': '18mm', 'bottom': '18mm', 'left': '16mm', 'right': '16mm'})
            page.close()
        browser.close()
