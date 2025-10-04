#!/usr/bin/env python3
from __future__ import annotations
import asyncio, re, time, json, os
from dataclasses import dataclass
from typing import List, Tuple, Optional, Dict

import bleach, requests
from bs4 import BeautifulSoup, Tag
from playwright.async_api import async_playwright
from tqdm import tqdm

KANAN_HUB = "https://www.kanan.co/ielts/academic/reading/practice-test/"

ALLOWED_TAGS = list(bleach.sanitizer.ALLOWED_TAGS) + [
    "p","ul","ol","li","strong","em","b","i","u","br","hr",
    "h1","h2","h3","h4","h5","h6","blockquote","code","pre",
    "table","thead","tbody","tr","th","td","span","a"
]
ALLOWED_ATTRS = {"*":["class","style"], "a":["href","title","name"]}
BLEACH = dict(tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS, strip=True)

@dataclass
class Passage:
    title: str
    orderIndex: int
    content_html: str

    def to_form(self) -> Tuple[Dict[str,str], Dict]:
        return (
            {"title": self.title, "orderIndex": str(self.orderIndex), "content": self.content_html},
            {},
        )

def sanitize(html_text: str) -> str:
    return bleach.clean(html_text, **BLEACH)

def split_by_headings(soup: BeautifulSoup) -> List[Tuple[str, str]]:
    """
    Kanan pages vary a bit, but almost always have H2/H3 blocks like:
    'Passage 1', 'Section 1', 'Questions 1-13'. We collect each H* block
    until the next H* and keep HTML intact.
    """
    results: List[Tuple[str, str]] = []
    heads = [h for h in soup.find_all(re.compile("^h[1-6]$"))]
    for i, h in enumerate(heads):
        title = h.get_text(strip=True)
        # prefer section/passages/questions titles; otherwise still keep h*
        if not re.search(r"(section|passage|question)", title, re.I):
            # allow generic headings as well
            pass
        fragments = []
        for sib in h.next_siblings:
            if isinstance(sib, Tag) and sib.name and re.match(r"^h[1-6]$", sib.name):
                break
            if isinstance(sib, Tag):
                fragments.append(str(sib))
        html_chunk = sanitize("".join(fragments))
        if html_chunk.strip():
            results.append((title, html_chunk))
    if not results:
        # Fallback: whole main/article as one block
        results = [("Reading — Content", sanitize(str(soup)))]
    return results

async def _create_context(pw, cookies_path: Optional[str] = None):
    browser = await pw.chromium.launch(headless=True)
    ctx = await browser.new_context(
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        locale="en-US",
        timezone_id="Asia/Ho_Chi_Minh",
        java_script_enabled=True,
    )
    if cookies_path and os.path.exists(cookies_path):
        with open(cookies_path, "r") as f:
            cookies = json.load(f)
        await ctx.add_cookies(cookies)
    return ctx

async def _solve_cloudflare(page):
    """
    If a Cloudflare Turnstile appears, attempt to click the checkbox.
    Otherwise just wait for navigation to complete.
    """
    try:
        # common frame title used by CF Turnstile
        frame = page.frame_locator('iframe[title*="widget containing checkbox"]')
        if await frame.locator('input[type="checkbox"]').is_visible(timeout=3000):
            await frame.locator('input[type="checkbox"]').click()
            await page.wait_for_load_state("networkidle", timeout=15000)
    except Exception:
        pass

async def _extract_main_html(page) -> str:
    # Try typical containers first
    selectors = [
        "main", "article", "div.entry-content", "div.single-content",
        "div[class*='post-content']", "div[data-elementor-type='single']",
        "div.td-post-content", "div.blog-content"
    ]
    for sel in selectors:
        try:
            el = page.locator(sel)
            if await el.count() > 0:
                try:
                    await el.nth(0).wait_for(state="visible", timeout=8000)
                except Exception:
                    pass
                html_text = await el.nth(0).inner_html()
                if html_text and len(html_text) > 200:
                    return html_text
        except Exception:
            continue
    # Fallback: whole body
    return await page.locator("body").inner_html()

async def discover_links(limit: int = 10, cookies: Optional[str] = None) -> List[str]:
    async with async_playwright() as pw:
        ctx = await _create_context(pw, cookies)
        page = await ctx.new_page()
        await page.goto(KANAN_HUB, wait_until="domcontentloaded")
        await _solve_cloudflare(page)
        await page.wait_for_timeout(1500)
        anchors = page.locator("a[href*='/practice-test-'][href*='section']")
        hrefs = await anchors.evaluate_all("els => [...new Set(els.map(a => a.href))]")
        await ctx.close()
    # keep only kanan.co and normalize
    out = [h for h in hrefs if "kanan.co" in h][:limit]
    return out

async def parse_page(url: str, cookies: Optional[str] = None) -> List[Passage]:
    async with async_playwright() as pw:
        ctx = await _create_context(pw, cookies)
        page = await ctx.new_page()
        await page.goto(url, wait_until="domcontentloaded")
        await _solve_cloudflare(page)
        await page.wait_for_timeout(1000)
        raw_html = await _extract_main_html(page)
        await ctx.close()
    soup = BeautifulSoup(raw_html, "lxml")
    blocks = split_by_headings(soup)
    passages = [Passage(title=t, orderIndex=i+1, content_html=b) for i, (t, b) in enumerate(blocks)]
    return passages

class Uploader:
    def __init__(self, api_base: str):
        self.api_base = api_base.rstrip("/")
        self.sess = requests.Session()

    def upload_passages(self, test_id: int, passages: List[Passage]):
        for p in tqdm(passages, desc=f"Uploading to test {test_id}"):
            data, files = p.to_form()
            resp = self.sess.post(f"{self.api_base}/test/{test_id}", data=data, files=files, timeout=30)
            resp.raise_for_status()

async def crawl_and_upload(api_base: str, test_id: int, limit_pages: int = 3, cookies_json: Optional[str] = None):
    links = await discover_links(limit=limit_pages, cookies=cookies_json)
    all_passages: List[Passage] = []
    for link in links:
        psgs = await parse_page(link, cookies=cookies_json)
        # shift orderIndex so they continue across pages
        base = len(all_passages)
        for k, p in enumerate(psgs, start=1):
            p.orderIndex = base + k
        all_passages.extend(psgs)
        time.sleep(0.5)  # polite
    if not all_passages:
        print("No passages extracted.")
        return
    Uploader(api_base).upload_passages(test_id, all_passages)

if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--api-base", required=True)
    ap.add_argument("--test-id", required=True, type=int)
    ap.add_argument("--limit", default=3, type=int, help="pages to crawl from the hub")
    ap.add_argument("--cookies", default=None, help="optional path to cookies.json exported from your browser")
    args = ap.parse_args()
    asyncio.run(crawl_and_upload(args.api_base, args.test_id, args.limit, args.cookies))
