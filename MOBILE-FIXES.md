# Mobile (iPhone 7 / iOS 15) — fix checklist

Reported 2026-09-20, tested on an **iPhone 7, iOS 15.8** (Safari and Chrome — both
use the same WebKit engine on iOS, so "Chrome on iPhone" is Safari).

---

## Root cause

All seven symptoms are one bug: **the JavaScript bundle never runs on that phone.**

Next.js 16's own client runtime ships a **class static block** (`class X { static { … } }`).
That syntax needs **Safari 16.4+**. Safari on iOS 15.8 is ~15.6, so it throws a
`SyntaxError` while *parsing* the chunk — before a single line executes. The
server-rendered HTML and the CSS still arrive, so the page looks almost normal,
but nothing is interactive and nothing that JavaScript was supposed to reveal
ever appears.

That is exactly the symptom list:

| Symptom | Why no-JS causes it |
|---|---|
| Big name in the hero never loads | The SVG is server-rendered `visibility: hidden` and only made visible by an effect |
| Menu icon invisible + not clickable | Motion renders the icon at `opacity: 0` initially; the click handler is never attached |
| Approach / About text stays empty | The text ships with `opacity-0`; GSAP is what sets it to 1 |
| Big gap above the email line in Contact | Same — the heading and intro are `opacity-0`, so they take up space but show nothing |
| 404 is a white page | React re-renders the root on the client; with the bundle dead there is nothing to render |
| Cookie policy shows only title + intro | Cookiebot's `cd.js` is injected by an effect that never runs |
| Footer nav links reload the page and jump to top | They are plain `<a href="/en">`; the JS `onClick` that turns them into a smooth scroll never attaches |

The CSS is fine on iOS 15 — Tailwind v4 already emits hex fallbacks ahead of every
`color-mix()` rule and an `@supports` block for `@property`.

---

## The fix

- [ ] **1. Lower the build target so the bundle parses on iOS 15**
      `browserslist` added to `package.json` (`safari >= 15`, `ios_saf >= 15`).
      Next/SWC now transpiles its own runtime down, so no `static {}` blocks reach
      the browser.
      *Verify:* the deployed chunks contain no `static{` and no `.toSorted(`.

- [ ] **2. Deploy and hard-reload the phone**
      Safari on iOS caches aggressively. After the deploy, on the iPhone:
      Settings → Safari → Clear History and Website Data (or use a Private tab)
      before testing, otherwise it may replay the old broken bundle.

---

## Check on the phone after deploy

Tick these off on the iPhone 7 once the new build is live.

- [ ] **Hero** — the big "FEMI" draws itself in and loops
- [ ] **Menu button** — the ☰ icon is visible, tapping it fans the items out
- [ ] **Menu items** — language switch works, section items scroll to the section
- [ ] **Approach section** — heading, intro and the numbered cards appear on scroll
- [ ] **About section** — all paragraphs appear on scroll
- [ ] **Contact** — no empty gap; "Let's build something." and the intro are visible
      above the email / location / response-time rows
- [ ] **Contact form** — fields render, submitting shows the success message
- [ ] **404** — visit e.g. `/en/does-not-exist`: dark page, glitching "404", both buttons
- [ ] **Cookie policy** — the full Cookiebot cookie table renders under the intro,
      with the "change your consent" controls
- [ ] **Footer links** (Projects / Approach / About me / Back to top) — smooth scroll,
      **no** full page reload, URL stays `/en`
- [ ] **Footer legal links** (Sitemap / Privacy / Cookie / Terms) — navigate normally
- [ ] **Case section** — cards stack vertically and are readable (this one already
      worked, because it shows itself with CSS instead of JS on mobile)

---

## Known leftovers (not part of this fix)

- [ ] **Cookie banner is see-through on small screens** — the hero text shows through
      the banner card. The banner is a GTM/Cookiebot template, so the fix is in the
      Cookiebot/GTM styling, not in this repo.
- [ ] **Duplicate `id="contact"`** — both the contact section
      (`src/components/ui/contact-section.tsx`) and the footer
      (`src/components/ui/portfolio-footer.tsx`) use it. `getElementById` only ever
      finds the first, so the footer's own anchor is unreachable. Worth renaming one.
- [ ] **iPhone 7 is below the supported floor** of both Next.js 16 (Safari 16.4) and
      Tailwind v4 (Safari 16.4). Item 1 buys iOS 15 back, but a future Next or
      Tailwind upgrade can break it again — re-test on this phone after any bump.
