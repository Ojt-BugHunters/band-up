#!/usr/bin/env python3
"""
Agentic IELTS crawler & uploader

- Reading: IELTS Leader (free general reading practice test)
  Example structure with "Section 1/2/3" headings:
  https://ieltsleader.com/free-ielts-general-reading-practice-test
- Listening: IELTS Training Online (audioscripts)
  Listing links labeled "Transcripts":
  https://ieltstrainingonline.com/ielts-listening-practice-test/
- Writing: IELTS-Writing.info (Task 1 General samples)
  Example sample page with prompt + model answer:
  https://www.ielts-writing.info/EXAM/general_writing_samples_task_1/1228/

IMPORTANT
- Check each site's robots.txt and terms before running at scale.
- This is educational code; you own compliance and usage scope.
"""

from __future__ import annotations
import argparse
import html
import logging
import os
import re
import sys
import time
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Tuple

import bleach
import httpx
import requests
from bs4 import BeautifulSoup, Tag
from tqdm import tqdm

# ---------- Config ----------

ALLOWED_TAGS = list(bleach.sanitizer.ALLOWED_TAGS) + [
    "p", "ul", "ol", "li", "strong", "em", "b", "i", "u", "br", "hr",
    "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre",
    "table", "thead", "tbody", "tr", "th", "td", "span"
]
ALLOWED_ATTRS = {"*": ["class", "style"], "a": ["href", "title", "name"], "img": ["src", "alt"]}
BLEACH_KW = dict(tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS, strip=True)

log = logging.getLogger("ielts-crawler")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")


@dataclass
class Passage:
    title: str
    orderIndex: int
    content_html: str  # already sanitized HTML
    image_bytes: Optional[bytes] = None
    image_filename: Optional[str] = None
    image_mime: str = "image/png"

    def to_form(self) -> Tuple[Dict[str, str], Dict[str, Tuple[str, bytes, str]]]:
        data = {
            "title": self.title,
            "orderIndex": str(self.orderIndex),
            "content": self.content_html,
        }
        files: Dict[str, Tuple[str, bytes, str]] = {}
        if self.image_bytes:
            files["image"] = (
                self.image_filename or f"passage_{self.orderIndex}.png",
                self.image_bytes,
                self.image_mime,
            )
        return data, files


# ---------- Helpers ----------

def get_soup(url: str, session: Optional[requests.Session] = None) -> BeautifulSoup:
    s = session or requests.Session()
    resp = s.get(url, timeout=30, headers={"User-Agent": "IELTSBot/1.0 (+education)"})
    resp.raise_for_status()
    return BeautifulSoup(resp.content, "lxml")


def sanitize(html_text: str) -> str:
    return bleach.clean(html_text, **BLEACH_KW)


def collect_between_sections(
    soup: BeautifulSoup, heading_regex: re.Pattern
) -> List[Tuple[str, str]]:
    """
    Find headings that match `heading_regex`, collect the HTML
    until the next matching heading (inclusive start, exclusive end).
    Returns list of (title_text, sanitized_html).
    """
    results: List[Tuple[str, str]] = []

    headings: List[Tag] = [
        h for h in soup.find_all(re.compile("^h[1-6]$"))
        if heading_regex.search(h.get_text(strip=True))
    ]
    for i, h in enumerate(headings):
        title = h.get_text(strip=True)
        parts: List[str] = []
        for sib in h.next_siblings:
            if isinstance(sib, Tag) and sib.name and re.match(r"^h[1-6]$", sib.name):
                # stop at next matching heading
                if heading_regex.search(sib.get_text(strip=True)):
                    break
            if isinstance(sib, Tag):
                parts.append(str(sib))
        html_chunk = sanitize("".join(parts))
        if html_chunk.strip():
            results.append((title, html_chunk))
    return results


# ---------- Crawlers ----------

class IELTSLeaderReadingCrawler:
    """
    Crawls a full reading practice test and extracts Section 1..3 as passages.
    Example test explains it's a full General Reading practice and shows "Section 1":
    :contentReference[oaicite:6]{index=6}
    We capture the passage text plus questions under each section.
    """
    URL = "https://ieltsleader.com/free-ielts-general-reading-practice-test"

    def crawl(self, limit: int = 1) -> List[Passage]:
        soup = get_soup(self.URL)
        sections = collect_between_sections(soup, re.compile(r"section\s+\d+", re.I))
        passages: List[Passage] = []
        for idx, (title, body) in enumerate(sections[:limit], start=1):
            passages.append(Passage(title=title, orderIndex=idx, content_html=body))
        return passages


class IELTSTrainingListeningCrawler:
    """
    Discovers 'Transcripts' links from the listing page, then extracts SECTION 1..4
    from a transcript page. Each SECTION becomes one passage.
    Listing shows many 'Transcripts' links: :contentReference[oaicite:7]{index=7}:contentReference[oaicite:8]{index=8}
    Transcript sample shows an intro and dialogue content: :contentReference[oaicite:9]{index=9}:contentReference[oaicite:10]{index=10}
    """
    LISTING = "https://ieltstrainingonline.com/ielts-listening-practice-test/"

    def _discover_transcripts(self, max_links: int = 1) -> List[str]:
        soup = get_soup(self.LISTING)
        links = []
        for a in soup.find_all("a", string=re.compile("Transcripts", re.I)):
            href = a.get("href")
            if href and href.startswith("http"):
                links.append(href)
            if len(links) >= max_links:
                break
        return links

    def crawl(self, limit: int = 1) -> List[Passage]:
        transcript_urls = self._discover_transcripts(max_links=limit)
        all_passages: List[Passage] = []
        for url in transcript_urls:
            soup = get_soup(url)
            sections = collect_between_sections(soup, re.compile(r"section\s+\d+", re.I))
            start_index = len(all_passages) + 1
            for j, (title, body) in enumerate(sections, start=start_index):
                all_passages.append(Passage(title=title, orderIndex=j, content_html=body))
        return all_passages


class IELTSWritingTaskCrawler:
    """
    Extracts Task 1 General prompts (we store the prompt + bullets as passage content).
    A sample page shows the structure and model answer we can include or trim:
    :contentReference[oaicite:11]{index=11}:contentReference[oaicite:12]{index=12}
    """
    # One entry to start from (you can add pagination later)
    SAMPLE = "https://www.ielts-writing.info/EXAM/general_writing_samples_task_1/1228/"

    def crawl(self, limit: int = 1) -> List[Passage]:
        targets = [self.SAMPLE]
        passages: List[Passage] = []
        for k, url in enumerate(targets[:limit], start=1):
            soup = get_soup(url)
            # Build a snippet: heading + task bullets; keep model answer optional.
            title = "Writing Task 1 — Sample"
            prompt_h2 = soup.find(re.compile("^h[12]$"), string=re.compile("General Writing Sample", re.I))
            prompt_block = []
            if prompt_h2:
                for sib in prompt_h2.next_siblings:
                    if isinstance(sib, Tag) and sib.name and sib.name.startswith("h") and sib.get_text(strip=True).startswith("IELTS"):
                        # stop if we hit another major section title
                        break
                    if isinstance(sib, Tag):
                        prompt_block.append(str(sib))
            content = sanitize("".join(prompt_block)) or sanitize(str(soup))
            passages.append(Passage(title=title, orderIndex=k, content_html=content))
        return passages


# ---------- Uploader ----------

class Uploader:
    """
    Posts passages to POST {api_base}/test/{testId}
    matching your Spring signature:
      title: String, orderIndex: int, content: String, image: MultipartFile?
    """
    def __init__(self, api_base: str, timeout: int = 30):
        self.api_base = api_base.rstrip("/")
        self.timeout = timeout
        self.sess = requests.Session()
        self.sess.headers.update({"User-Agent": "IELTSBot/1.0 (+education)"})

    def upload_passage(self, test_id: int, p: Passage) -> dict:
        url = f"{self.api_base}/test/{test_id}"
        data, files = p.to_form()
        resp = self.sess.post(url, data=data, files=files, timeout=self.timeout)
        try:
            resp.raise_for_status()
        except Exception:
            log.error("Upload failed: %s -> %s", p.title, resp.text[:800])
            raise
        return resp.json() if "application/json" in resp.headers.get("Content-Type", "") else {"status": resp.status_code}

    def upload_many(self, test_id: int, passages: List[Passage]) -> List[dict]:
        results = []
        for p in tqdm(passages, desc=f"Uploading to test {test_id}"):
            results.append(self.upload_passage(test_id, p))
            time.sleep(0.5)  # polite pacing; tune as needed
        return results


# ---------- Orchestrator ----------

def run(api_base: str, test_id: int, include: List[str], limit: int) -> None:
    crawlers: List[Tuple[str, Iterable[Passage]]] = []

    if "reading" in include:
        reading = IELTSLeaderReadingCrawler().crawl(limit=limit)
        crawlers.append(("reading", reading))
    if "listening" in include:
        listening = IELTSTrainingListeningCrawler().crawl(limit=limit)
        crawlers.append(("listening", listening))
    if "writing" in include:
        writing = IELTSWritingTaskCrawler().crawl(limit=limit)
        crawlers.append(("writing", writing))

    # Normalize order indices across combined set (if you want each skill to start from 1, remove this block)
    flat: List[Passage] = []
    for _, parts in crawlers:
        flat.extend(parts)
    for i, p in enumerate(flat, start=1):
        p.orderIndex = i

    uploader = Uploader(api_base=api_base)
    responses = uploader.upload_many(test_id=test_id, passages=flat)
    log.info("Done. Uploaded %d passages.", len(responses))


# ---------- CLI ----------

def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    ap = argparse.ArgumentParser(description="IELTS Agentic Crawler & Uploader")
    ap.add_argument("--api-base", required=True, help="Base URL that prefixes /test/{testId}")
    ap.add_argument("--test-id", type=int, required=True, help="Backend test ID")
    ap.add_argument("--include", default="reading,listening,writing",
                    help="Comma list from: reading,listening,writing")
    ap.add_argument("--limit", type=int, default=1, help="Max pages per crawler")
    return ap.parse_args(argv)


def main() -> None:
    args = parse_args()
    include = [s.strip() for s in args.include.split(",") if s.strip()]
    run(api_base=args.api_base, test_id=args.test_id, include=include, limit=args.limit)


if __name__ == "__main__":
    main()
