#!/usr/bin/env python3
"""
crawler_pipeline.py — ieltstrainingonline.com READING crawler (Cambridge + Practice)

- Splits pages by "READING PASSAGE 1/2/3" and appends "Answers" if present.
- Saves JSON to out/reading/{cambridge|practice}/<slug>.json

Source layout verified on:
  - Cambridge example: Practice Cam 17 Reading Test 01 (shows READING PASSAGE 1, 2, 3). 
  - Practice example: Reading Practice Test 104 (READING PASSAGE 1–3 + "Answer Reading Test 104").
"""

from __future__ import annotations
import argparse, json, os, re, time
from dataclasses import dataclass
from typing import List, Tuple, Dict, Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup, Tag
import bleach
from tqdm import tqdm

# ---------- HTTP ----------
UA = "IELTSReaderBot/1.0 (+for education; polite crawling)"
HEADERS = {"User-Agent": UA}
TIMEOUT = 30
SLEEP = 0.35  # polite delay between requests

def get_soup(url: str) -> BeautifulSoup:
    r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    if r.status_code == 404:
        raise FileNotFoundError(url)
    r.raise_for_status()
    return BeautifulSoup(r.content, "lxml")

def abs_url(base: str, maybe: str) -> str:
    return urljoin(base, maybe or "")

# ---------- Sanitizer (no inline CSS) ----------
ALLOWED_TAGS = list(bleach.sanitizer.ALLOWED_TAGS) + [
    "p","ul","ol","li","strong","em","b","i","u","br","hr",
    "h1","h2","h3","h4","h5","h6","blockquote","code","pre","span",
    "table","thead","tbody","tr","th","td","img"
]
ALLOWED_ATTRS = {
    "*": ["class"],
    "a": ["href","title","name"],
    "img": ["src","alt","title","width","height","loading"],
    "td": ["colspan","rowspan"],
    "th": ["colspan","rowspan"],
}
def sanitize(html: str) -> str:
    return bleach.clean(html, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS, strip=True)

# ---------- Model ----------
@dataclass
class Passage:
    title: str
    orderIndex: int
    content: str

def collect_between_headings(soup: BeautifulSoup, match_rx: re.Pattern) -> List[Tuple[str,str]]:
    """Collect (title, html) chunks starting at headings matching match_rx, up to the next matching heading."""
    results: List[Tuple[str,str]] = []
    heads = [h for h in soup.find_all(re.compile(r"^h[1-6]$")) if match_rx.search(h.get_text(strip=True))]
    for idx, h in enumerate(heads):
        title = h.get_text(strip=True)
        parts: List[str] = []
        for sib in h.next_siblings:
            if isinstance(sib, Tag) and sib.name and re.match(r"^h[1-6]$", sib.name):
                if match_rx.search(sib.get_text(strip=True)):
                    break
            if isinstance(sib, Tag):
                parts.append(str(sib))
        html_chunk = sanitize("".join(parts))
        if html_chunk.strip():
            results.append((title, html_chunk))
    return results

def parse_reading_page(url: str) -> List[Passage]:
    """Extract READING PASSAGE 1..3 + Answers (if present)."""
    soup = get_soup(url)

    # Primary: READING PASSAGE 1..3
    rx = re.compile(r"\bREADING\s+PASSAGE\s+[1-3]\b", re.I)
    blocks = collect_between_headings(soup, rx)
    passages: List[Passage] = [Passage(title=t, orderIndex=i+1, content=b) for i,(t,b) in enumerate(blocks)]

    # Answers (varies: "Answer", or "Answer Reading Test 104", etc.)
    answers_head = None
    for h in soup.find_all(re.compile(r"^h[1-6]$")):
        t = h.get_text(strip=True)
        if re.match(r"^Answer", t, re.I) or re.match(r"^Answer\s+Reading\s+Test", t, re.I):
            answers_head = h
            break
    if answers_head:
        parts: List[str] = []
        for sib in answers_head.next_siblings:
            if isinstance(sib, Tag) and sib.name and re.match(r"^h[1-6]$", sib.name):
                break
            if isinstance(sib, Tag):
                parts.append(str(sib))
        if parts:
            passages.append(Passage(title="Answers", orderIndex=len(passages)+1, content=sanitize("".join(parts))))

    # Fallback: whole article
    if not passages:
        main = soup.find("article") or soup.find("main") or soup.find("body")
        passages = [Passage(title="Reading — Full Page", orderIndex=1, content=sanitize(str(main) if main else str(soup)))]

    return passages

# ---------- URL builders ----------
def cambridge_urls(edition_start=10, edition_end=20, tests=("01","02","03","04")) -> List[str]:
    urls = []
    for ed in range(edition_start, edition_end+1):
        for tt in tests:
            urls.append(f"https://ieltstrainingonline.com/practice-cam-{ed}-reading-test-{tt}-with-answer/")
    return urls

def practice_urls(num_start=1, num_end=111) -> List[str]:
    urls = []
    for n in range(num_start, num_end+1):
        slug = f"{n:02d}" if n < 100 else f"{n}"  # site uses 01..99, then 100..111
        urls.append(f"https://ieltstrainingonline.com/ielts-reading-practice-test-{slug}-with-answers/")
    return urls

# ---------- Persistence ----------
def ensure_dir(p: str) -> None:
    os.makedirs(p, exist_ok=True)

def write_json(path: str, payload: Dict) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

def slugify(url: str) -> str:
    return url.strip("/").split("/")[-1]

def save_bundle(out_dir: str, url: str, passages: List[Passage], tab: str) -> str:
    ensure_dir(out_dir)
    bundle = {
        "source": url,
        "tab": tab,  # "cambridge" or "practice"
        "passages": [p.__dict__ for p in passages],
    }
    name = slugify(url) + ".json"
    path = os.path.join(out_dir, name)
    write_json(path, bundle)
    return path

# ---------- Runner ----------
def crawl_set(tab: str, urls: List[str], out_root="out/reading", skip_missing=True) -> None:
    out_dir = os.path.join(out_root, "cambridge" if tab=="cambridge" else "practice")
    ensure_dir(out_dir)

    for url in tqdm(urls, desc=f"Crawling {tab} ({len(urls)} urls)"):
        try:
            passages = parse_reading_page(url)
            save_path = save_bundle(out_dir, url, passages, tab)
            print("saved:", save_path)
            time.sleep(SLEEP)
        except FileNotFoundError:
            if skip_missing:
                print("missing (404):", url)
                continue
            else:
                raise
        except Exception as e:
            print("error:", url, "|", e)

def main():
    ap = argparse.ArgumentParser(description="IELTS Reading crawler for ieltstrainingonline.com")
    sub = ap.add_subparsers(dest="mode", required=True)

    cam = sub.add_parser("cambridge", help="Crawl Cambridge Reading tests")
    cam.add_argument("--from-ed", type=int, default=10)
    cam.add_argument("--to-ed", type=int, default=20)
    cam.add_argument("--tests", default="01,02,03,04", help="comma list of test numbers (two-digit), e.g., 01,02,03,04")
    cam.add_argument("--out", default="out/reading")
    cam.add_argument("--no-skip-missing", action="store_true")

    prac = sub.add_parser("practice", help="Crawl Practice Reading tests")
    prac.add_argument("--from", dest="from_num", type=int, default=1)
    prac.add_argument("--to", dest="to_num", type=int, default=111)
    prac.add_argument("--out", default="out/reading")
    prac.add_argument("--no-skip-missing", action="store_true")

    args = ap.parse_args()

    if args.mode == "cambridge":
        tests = [t.strip() for t in args.tests.split(",") if t.strip()]
        urls = cambridge_urls(args.from_ed, args.to_ed, tests)
        crawl_set("cambridge", urls, out_root=args.out, skip_missing=not args.no_skip_missing)
    else:
        urls = practice_urls(args.from_num, args.to_num)
        crawl_set("practice", urls, out_root=args.out, skip_missing=not args.no_skip_missing)

if __name__ == "__main__":
    main()
