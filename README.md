# Codekeeper

An unofficial, kid-friendly catalog of **official, publicly shareable** game codes, how-to-redeem guidance, membership perks, and current official store prices.

This is a fan resource for Tyler’s Business Project Number Four. It is **not affiliated with** Roblox, Nintendo, Epic Games, Microsoft, Mojang, The Pokémon Company, Supercell, Niantic, Uplift Games, or any other game publisher.

## Please read this first

- Codes can expire or be cancelled without notice. Always confirm on the official redeem page linked from each entry before typing a code.
- Never share your password. Never enter a code on a page that is not official.
- Ask a grown-up before buying anything or entering a payment method.
- Unique gift-card, TCG pack, and prepaid code numbers are never republished here — only how to redeem a code you already have.
- This site has no accounts, comments, or trackers. Search runs in your browser.
- Fortnite and the Roblox *platform* are labeled **13+** (ESRB Teen). Parents should use official parental controls.

Search engines: these pages currently include a `noindex, nofollow` robots meta tag. That is temporary and should be removed at public launch.

## What’s in this repository

This repo holds **only the public static site**: verified, active (or new) catalog rows. The working database, internal exports, unverified leads, and expired internal records stay off GitHub.

| File | Purpose |
| --- | --- |
| `index.html` | Search-by-game catalog (loads `data.json`) |
| `codekeeper-search.html` | The same catalog as a **single file** you can open without a web server |
| `data.json` | Public snapshot (verified active items only) |
| `privacy.html` | Privacy notice for this static catalog |

## How to open it locally

- Easiest: open `codekeeper-search.html` in a web browser (no server needed).
- Or open `index.html` from a local static server so `data.json` can load.

## How the data is updated

1. Official publisher and developer channels are checked (sites, support/news pages, and official social accounts). Unofficial “working codes” lists are leads only, never proof.
2. Updates are recorded in a private SQLite database on the maintainer’s computer, with a source link and the date checked.
3. A code is published here only when it is verified at an official source, is meant to be shared, and is still marked active. Unique prepaid strings are never stored for publication.
4. The static files in this repo are regenerated from that public snapshot and committed. A daily review looks for new and expired official items.

If a source is down, existing verified rows are not wiped. Roblox and Epic terms are respected: official channels are watched lightly; there is no scraping at scale and no auto-redeem.

## Hosting

This site is meant to be served with **GitHub Pages** from this repository after an explicit launch. Until then the repo, if created, should stay private, and Pages should stay off (Pages on a private repo also needs a paid GitHub plan).
