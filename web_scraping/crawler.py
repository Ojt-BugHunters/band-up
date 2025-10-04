#!/usr/bin/env python3
"""
crawler_pipeline.py — ieltstrainingonline.com 4-skill crawler

- LISTENING:
  * Test page has SECTION 1..4 + MP3 links + question blocks.
    Example: https://ieltstrainingonline.com/ielts-listening-practice-test-01/
    (SECTION headings + mp3 + questions)  [site structure confirmed]
- READING:
  * Test page has READING PASSAGE 1..3 followed by questions; answers often inline
    Example: https://ieltstrainingonline.com/ielts-reading-practice-test-104-with-answers/
- WRITING:
  * Page has WRITING TASK 1 (often with an <img>) and WRITING TASK 2; sample answers below
    Example: https://ieltstrainingonline.com/ielts-writing-practice-test-22/
- SPEAKING:
  * Speaking Practice Test NN page has Part 1 (and frequently Part 2/3) sections
    Example: https://ieltstrainingonline.com/ielts-speaking-practice-test-01/

Politeness: throttle requests, respect robots/ToS, and cache when possible.
"""

from __future__ import annotations
import argparse, re, time, io
from dataclasses import dataclass
from typing import List, Tuple, Dict, Optional

import requests
from bs4 import BeautifulSoup, Tag
import bleach
from tqdm import tqdm
import json
from urllib.parse import urljoin, urlparse

# ---- HTML sanitization ----
ALLOWED_TAGS = list(bleach.sanitizer.ALLOWED_TAGS) + [
    # text
    "p","ul","ol","li","strong","em","b","i","u","br","hr",
    "h1","h2","h3","h4","h5","h6","blockquote","code","pre","span",
    # media
    "img","audio","source",
    # tables (some reading tests use tables/diagrams)
    "table","thead","tbody","tr","th","td"
]
ALLOWED_ATTRS = {
    "*": ["class"],
    "a": ["href", "title", "name"],
    "img": ["src", "alt", "title", "width", "height", "loading"],
    "audio": ["controls", "src"],
    "source": ["src", "type"],
    "td": ["colspan", "rowspan"],
    "th": ["colspan", "rowspan"],
}
def sanitize(html_text: str) -> str:
    return bleach.clean(html_text, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS, strip=True)

# ---- HTTP helpers ----
HEADERS = {"User-Agent":"IELTSBot/1.0 (+education; contact admin if issues)"}

def get_soup(url:str) -> BeautifulSoup:
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    return BeautifulSoup(resp.content, "lxml")

def abs_url(base: str, maybe: str) -> str:
    if not maybe: return ""
    return urljoin(base, maybe)

# ---- Model ----
@dataclass
class Passage:
    title: str
    orderIndex: int
    content_html: str
    image_bytes: Optional[bytes] = None
    image_filename: Optional[str] = None
    image_mime: str = "image/png"

    def as_json(self) -> Dict:
        return {
            "title": self.title,
            "orderIndex": self.orderIndex,
            "content": self.content_html
        }

    def to_form(self) -> Tuple[Dict[str,str], Dict[str,Tuple[str,bytes,str]]]:
        data = {"title": self.title, "orderIndex": str(self.orderIndex), "content": self.content_html}
        files = {}
        if self.image_bytes:
            files["image"] = (self.image_filename or "image.png", self.image_bytes, self.image_mime)
        return data, files

# ---- Generic block splitter ----
def collect_between_headings(
    soup: BeautifulSoup,
    heading_regex: re.Pattern
) -> List[Tuple[str,str]]:
    """
    Find headings matching `heading_regex` and gather subsequent HTML up to the next heading
    that also matches the regex. Returns (title_text, sanitized_html).
    """
    blocks: List[Tuple[str,str]] = []
    heads = [h for h in soup.find_all(re.compile("^h[1-6]$")) if heading_regex.search(h.get_text(strip=True))]
    for i, h in enumerate(heads):
        title = h.get_text(strip=True)
        chunk = []
        for sib in h.next_siblings:
            if isinstance(sib, Tag) and sib.name and re.match(r"^h[1-6]$", sib.name):
                if heading_regex.search(sib.get_text(strip=True)):
                    break
            if isinstance(sib, Tag):
                chunk.append(str(sib))
        html_chunk = sanitize("".join(chunk))
        if html_chunk.strip():
            blocks.append((title, html_chunk))
    return blocks

# ---- Skill crawlers (site-specific) ----
class ListeningCrawler:
    """
    Crawl a Listening Practice Test page:
      - Extract SECTION 1..4
      - Near each section, capture MP3 URL(s) and inject <audio> tag at the top
      - Include ‘Questions …’ HTML under the section
    Structure verified on: /ielts-listening-practice-test-01/ (SECTION headings + mp3 + questions)
    """

    MP3_RX = re.compile(r"\.mp3$", re.I)

    def crawl(self, url: str) -> List[Passage]:
        soup = get_soup(url)

        # Build a map section_index -> mp3 absolute URL (closest mp3 after the heading)
        # Strategy: collect all <a> tags whose href ends with mp3 and keep document order:
        mp3s = [abs_url(url, a.get("href","")) for a in soup.find_all("a") if self.MP3_RX.search(a.get("href","") or "")]
        # Split by SECTION headings:
        sections = collect_between_headings(soup, re.compile(r"\bSECTION\s+[1-4]\b", re.I))
        passages: List[Passage] = []
        for idx, (title, html_chunk) in enumerate(sections, start=1):
            # pick an mp3 for this section if the nth exists
            audio_tag = ""
            if idx-1 < len(mp3s):
                audio_tag = f'<p><audio controls src="{mp3s[idx-1]}"></audio></p>'
            content = sanitize(audio_tag + html_chunk)
            passages.append(Passage(title=f"{title} — Questions", orderIndex=idx, content_html=content))
        if not passages:
            # Fallback: entire page
            body = soup.find("article") or soup.find("main") or soup.find("body")
            content = sanitize(str(body)) if body else sanitize(str(soup))
            passages = [Passage(title="Listening — Full Page", orderIndex=1, content_html=content)]
        return passages

class ReadingCrawler:
    """
    Crawl a Reading Practice Test page:
      - Split by READING PASSAGE 1..3 headings
      - Keep passage texts + questions that follow each passage
      - If an Answers block exists, add a final passage "Answers"
    """

    def crawl(self, url: str) -> List[Passage]:
        soup = get_soup(url)
        blocks = collect_between_headings(soup, re.compile(r"\bREADING\s+PASSAGE\s+[1-3]\b", re.I))
        passages: List[Passage] = []
        for i, (title, body) in enumerate(blocks, start=1):
            passages.append(Passage(title=title, orderIndex=i, content_html=body))

        # Look for inline answers near bottom (heading starts with 'Answer' or 'Answer Reading Test')
        answers_head = None
        for h in soup.find_all(re.compile("^h[1-6]$")):
            t = h.get_text(strip=True)
            if re.search(r"^Answer", t, re.I):
                answers_head = h; break
        if answers_head:
            parts = []
            for sib in answers_head.next_siblings:
                if isinstance(sib, Tag) and sib.name and re.match(r"^h[1-6]$", sib.name):
                    break
                if isinstance(sib, Tag):
                    parts.append(str(sib))
            if parts:
                passages.append(Passage(
                    title="Answers",
                    orderIndex=len(passages)+1,
                    content_html=sanitize("".join(parts))
                ))
        if not passages:
            body = soup.find("article") or soup.find("main") or soup.find("body")
            passages = [Passage(title="Reading — Full Page", orderIndex=1,
                                content_html=sanitize(str(body) if body else str(soup)))]
        return passages

class WritingCrawler:
    """
    Crawl a Writing Practice Test page:
      - Extract WRITING TASK 1 (prompt) — include any chart image (embed <img src="...">)
      - Extract WRITING TASK 2 (prompt)
      - Extract SAMPLE ANSWER sections below (Task 1 and Task 2), if present
      - Also attach the Task 1 image as `image` when uploading
    """

    def crawl(self, url: str) -> List[Passage]:
        soup = get_soup(url)
        tasks = collect_between_headings(soup, re.compile(r"\bWRITING\s+TASK\s+[12]\b", re.I))
        passages: List[Passage] = []

        # Track one image for Task 1, if exist
        task1_img_bytes = None
        task1_img_fn = None
        task1_img_mime = "image/png"

        for i, (title, body) in enumerate(tasks, start=1):
            # If Task 1, try to find first img in that block in the original soup segment
            # We need to re-parse the sanitized body to pick <img src>
            tmp = BeautifulSoup(body, "lxml")
            img = tmp.find("img")
            img_bytes = None; img_fn = None
            if img and img.get("src"):
                img_url = abs_url(url, img["src"])
                try:
                    r = requests.get(img_url, headers=HEADERS, timeout=30)
                    if r.ok and r.content:
                        img_bytes = r.content
                        # mime guess by extension
                        if img_url.lower().endswith(".jpg") or img_url.lower().endswith(".jpeg"):
                            task1_img_mime = "image/jpeg"
                        img_fn = img_url.split("/")[-1]
                except Exception:
                    pass
            p = Passage(title=title, orderIndex=i, content_html=body,
                        image_bytes=img_bytes, image_filename=img_fn, image_mime=task1_img_mime if img_bytes else "image/png")
            passages.append(p)

        # SAMPLE ANSWER blocks
        sample_head = None
        for h in soup.find_all(re.compile("^h[1-6]$")):
            if re.search(r"\bSAMPLE\s+ANSWER", h.get_text(strip=True), re.I):
                sample_head = h; break
        if sample_head:
            # Split inside sample answers for Task 1 and Task 2
            sample_blocks = collect_between_headings(sample_head.parent or soup, re.compile(r"\bWRITING\s+TASK\s+[12]\b", re.I))
            for (stitle, sbody) in sample_blocks:
                passages.append(Passage(
                    title=stitle + " — Sample Answer",
                    orderIndex=len(passages)+1,
                    content_html=sanitize(sbody)
                ))

        if not passages:
            body = soup.find("article") or soup.find("main") or soup.find("body")
            passages = [Passage(title="Writing — Full Page", orderIndex=1,
                                content_html=sanitize(str(body) if body else str(soup)))]
        return passages

class SpeakingCrawler:
    """
    Crawl a Speaking Practice Test page:
      - Extract 'Part 1', 'Part 2', 'Part 3' blocks, each as a passage
      - Keep Q/A or cue-card content in HTML
    """

    def crawl(self, url: str) -> List[Passage]:
        soup = get_soup(url)
        parts = collect_between_headings(soup, re.compile(r"\bPart\s*[123]\b", re.I))
        passages: List[Passage] = []
        for i, (title, body) in enumerate(parts, start=1):
            passages.append(Passage(title=title, orderIndex=i, content_html=body))
        if not passages:
            body = soup.find("article") or soup.find("main") or soup.find("body")
            passages = [Passage(title="Speaking — Full Page", orderIndex=1,
                                content_html=sanitize(str(body) if body else str(soup)))]
        return passages

# ---- Uploader ----
class Uploader:
    def __init__(self, api_base: str, timeout: int = 30):
        self.api_base = api_base.rstrip("/")
        self.sess = requests.Session()
        self.sess.headers.update(HEADERS)
        self.timeout = timeout

    def upload_passage(self, test_id: int, p: Passage) -> Dict:
        url = f"{self.api_base}/test/{test_id}"
        data, files = p.to_form()
        r = self.sess.post(url, data=data, files=files, timeout=self.timeout)
        r.raise_for_status()
        ctype = r.headers.get("Content-Type","")
        return r.json() if "application/json" in ctype else {"status": r.status_code}

# ---- Orchestrator ----
def crawl_one(skill: str, test_url: str) -> Tuple[str, List[Passage]]:
    if skill == "listening":
        return (skill, ListeningCrawler().crawl(test_url))
    if skill == "reading":
        return (skill, ReadingCrawler().crawl(test_url))
    if skill == "writing":
        return (skill, WritingCrawler().crawl(test_url))
    if skill == "speaking":
        return (skill, SpeakingCrawler().crawl(test_url))
    raise SystemExit(f"Unknown skill: {skill}")

def run(skill: str, test_url: str, emit_json: Optional[str], api_base: Optional[str], test_id: Optional[int], do_upload: bool):
    skill, passages = crawl_one(skill, test_url)

    # Reindex to be safe and deterministic
    for idx, p in enumerate(passages, start=1):
        p.orderIndex = idx

    # Emit JSON bundle (for backend preview or ingestion pipeline)
    bundle = {
        "source": test_url,
        "skill": skill,
        "test_id_hint": test_url.rstrip("/").split("/")[-1].replace("-", " ").title(),
        "passages": [p.as_json() for p in passages],
    }
    if emit_json:
        with open(emit_json, "w", encoding="utf-8") as f:
            json.dump(bundle, f, ensure_ascii=False, indent=2)

    # Upload passages one by one, if requested
    if do_upload:
        if not api_base or not test_id:
            raise SystemExit("--upload requires --api-base and --test-id")
        up = Uploader(api_base)
        for p in tqdm(passages, desc=f"Uploading to test {test_id}"):
            up.upload_passage(test_id, p)
            time.sleep(0.4)  # politeness

# ---- CLI ----
def parse_args() -> argparse.Namespace:
    ap = argparse.ArgumentParser(description="ieltsTrainingOnline 4-skill crawler")
    ap.add_argument("--skill", required=True, choices=["listening","reading","writing","speaking"])
    ap.add_argument("--test-url", required=True, help="URL of a specific test page")
    ap.add_argument("--emit-json", default=None, help="Write bundle JSON to this path")
    ap.add_argument("--api-base", default=None, help="Spring API base, e.g. http://localhost:8080/api")
    ap.add_argument("--test-id", type=int, default=None)
    ap.add_argument("--upload", action="store_true")
    return ap.parse_args()

if __name__ == "__main__":
    args = parse_args()
    run(args.skill, args.test_url, args.emit_json, args.api_base, args.test_id, args.upload)
