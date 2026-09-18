# botta.in

Manish Botta’s personal engineering portfolio, built with Next.js, React and TypeScript and exported as a static website.

The full public website is implemented: home, about, ten project case studies, three engineering articles, public GitHub activity, contact, and one comprehensive master engineering resume. Hosting, DNS and deployment are owner-managed.

Content is maintained in local JSON and MDX files. There is no admin dashboard, database, authentication system or publish button. The public website does not require a Python server. Python remains available for generating the résumé and for the original content validation tools.

## Contents

- [Features and pages](#features-and-pages)
- [Technology](#technology)
- [Repository structure](#repository-structure)
- [Local setup](#local-setup)
- [Editing profile and experience](#editing-profile-and-experience)
- [Editing the résumé](#editing-the-résumé)
- [Editing projects](#editing-projects)
- [Writing articles](#writing-articles)
- [Changing design and site copy](#changing-design-and-site-copy)
- [Configuration](#configuration)
- [Checks](#checks)
- [Build and hosting handoff](#build-and-hosting-handoff)
- [Optional Python tools](#optional-python-tools)
- [Troubleshooting](#troubleshooting)

## Features and pages

| Route | What it contains |
| --- | --- |
| `/` | Introduction, system illustration, featured projects, experience timeline and recent writing |
| `/about/` | Biography, four role interests, full experience, skills, education and working principles |
| `/experience/<id>/` | Four company case studies with ownership, system diagrams, implementation decisions and outcomes |
| `/projects/` | Searchable project collection with category filters and shareable query parameters |
| `/projects/<slug>/` | Project problem, approach, system flow, outcome, tradeoff, source links and related work |
| `/posts/` | Published engineering articles |
| `/posts/<slug>/` | Article, reading time, tags, desktop table of contents, code copying and adjacent articles |
| `/posts/tags/<tag>/` | Articles matching a tag |
| `/activity/` | Contribution calendar, public profile counts and a date-grouped event timeline with filters and pagination |
| `/contact/` | Email and social links, email-draft form and copy-message fallback |
| `/resume/` | PDF preview, download and expandable HTML experience/education text |
| `/resume.pdf` | Downloadable general engineering résumé |
| `/post/` | Legacy writing entry point; host redirect rules are also provided |
| `/404.html` | Custom exported not-found page |

Shared features include responsive layouts, light/dark themes, keyboard navigation, a mobile navigation dialog, reduced-motion support, local fonts, social preview images, metadata and structured data.

The export also includes `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` and `/llms.txt`.

### Runtime behavior

- **Contact:** opens the visitor’s email application with a composed draft. The visitor sends it there. The website does not send, store or deliver form submissions.
- **Contributions:** an interactive past-year calendar appears at the bottom of the homepage and on Activity. It reads the public profile through the token-free [GitHub Contributions API](https://github.com/grubersjoe/github-contributions-api). Results are cached for up to an hour, with an in-memory cache while navigating the site. Hover, tap or use arrow keys on the grid to explore daily counts; the calendar opens on the latest months on small screens with a swipe hint. The homepage waits until this section is near the viewport before requesting the calendar. This third-party service is independent of the recent-events API and has its own retry/fallback state.
- **Activity:** reads GitHub’s public API directly from the visitor’s browser. Events are grouped by UTC date, filterable by type, and revealed ten at a time. Links open the relevant comparison, commit, branch, pull request, review, comment, release or fork when the API supplies sufficient information; otherwise they fall back to the repository. Counts and events are live when available; private contributions are not included, and rate limits can temporarily prevent loading.
- **Analytics:** disabled by default. An optional Plausible-compatible script can be configured separately.
- **Publishing:** edit files, rebuild, inspect the output and upload it to your host.

## Technology

| Area | Implementation |
| --- | --- |
| Application | Next.js App Router with static export |
| UI | React and TypeScript |
| Styling | Custom CSS with responsive rules and theme tokens |
| Themes and mobile navigation | next-themes and Radix Dialog |
| Icons and fonts | Lucide; locally bundled Inter, Space Grotesk and JetBrains Mono |
| Content | JSON, MDX, gray-matter and Zod validation |
| Social image generation | Sharp |
| Résumé generation | Python and ReportLab |
| Checks | TypeScript, Node test runner, Playwright and axe-core |
| Optional legacy tools | Python/FastAPI résumé extraction and seed validation |

Exact package versions are recorded in `frontend/package-lock.json`. Use `npm ci` for a reproducible install.

## Repository structure

```text
botta.in/
├── frontend/
│   ├── content/
│   │   ├── profile.json          # Identity, biography, jobs, skills, education
│   │   ├── projects.json         # Project cards and case studies
│   │   └── posts/*.mdx           # Engineering articles and publication status
│   ├── src/
│   │   ├── app/                 # Routes, page copy, metadata and global CSS
│   │   ├── components/          # Navigation, cards, forms and interactive UI
│   │   └── lib/                 # Content loading, validation and metadata helpers
│   ├── public/                  # PDF, icons, social images and redirect rules
│   ├── scripts/                 # PDF/image generation and checks
│   ├── .env.example             # Optional public build configuration
│   ├── package.json
│   └── out/                     # Generated deployable website; ignored by Git
├── backend/                     # Optional original Python content tooling
├── seed/content-seed.json        # Historical approved source baseline
├── resume/                      # Original source PDFs; ignored by Git
├── .preference/                 # Questions, answers and preferences; ignored by Git
└── readme.md
```

`frontend/content/` is the source for the current website. Editing the historical seed or original PDFs does not automatically update the website.

## Local setup

### Requirements

- Node.js 22 or newer, with npm.
- Python 3 for the local static preview command.
- Python with ReportLab only when regenerating the PDF.
- Google Chrome only when running the browser checks.

### Development server

From the repository root:

```sh
cd frontend
npm ci
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The development server picks up source edits. Stop it with `Ctrl+C`.

### Production preview

From `frontend/`:

```sh
npm run build
npm run preview
```

This serves the exported files at the same local address. Stop the development server first because both commands use port 3000. Unlike the development server, the production preview only changes after another build.

## Editing profile and experience

Edit `frontend/content/profile.json` as valid JSON: double quotes, no comments and no trailing commas.

| Field | Purpose |
| --- | --- |
| `name`, `location`, `email` | Identity and contact content |
| `github`, `githubUsername`, `linkedin` | Profile links and GitHub API account |
| `intro` | Homepage introduction |
| `hiringIntro` | Homepage hiring message and role focus |
| `bio` | About-page paragraphs |
| `roleInterests` | About-page role interests |
| `experience` | Jobs and accomplishment bullets, in display order |
| `skillGroups` | Named skill groups and their item lists |
| `education` | Qualifications, institutions and dates |
| `principles` | Working-principle titles and descriptions |

An experience entry uses fields like these:

```json
{
  "id": "example-company",
  "company": "Example Company",
  "role": "Software Engineer",
  "startDate": "2026-04",
  "endDate": null,
  "current": true,
  "bullets": [
    "Describe the system you built, the problem it solved and a supported outcome."
  ],
  "skills": ["Python", "FastAPI", "PostgreSQL"]
}
```

Use `YYYY-MM` for experience dates. An `endDate` of `null` displays the role as current; keep `current` consistent. Keep each `id` unique and stable. Education uses `start_date` and `end_date`, plus `qualification`, `field` and `institution`; follow an existing entry when adding one.

The order of entries controls the displayed order. The master resume uses a separate full bullet list; see the next section before changing job IDs or factual claims.

Some display copy is deliberately written in page components. For example, the homepage heading, greeting, location label and company strip are in `frontend/src/app/page.tsx`. The current `profile.headline` field does not drive that heading. See [Changing design and site copy](#changing-design-and-site-copy).

## Editing the résumé

The downloadable file is now a **comprehensive master engineering resume** covering software engineering, AI engineering, forward-deployed engineering and forward-deployed AI. It replaces the previous two-page selection. It currently spans four pages, includes all reviewed experience bullets, and omits the phone number.

### Content sources

| File | What to edit |
| --- | --- |
| `frontend/content/master-resume.json` | Master summary, full experience bullets, ownership scopes, role technologies, prototype notes and selected project slugs |
| `frontend/content/profile.json` | Shared identity, contact details, job titles/dates, concise About bullets and education |
| `frontend/content/projects.json` | Selected project titles, repository links and outcomes |
| `frontend/content/experience.json` | Company case-study copy, diagram titles/captions, tradeoffs and related projects |
| `frontend/scripts/generate_resume.py` | PDF typography, spacing and pagination |
| `frontend/public/resume.pdf` | Generated downloadable PDF; overwritten by the generator |

Each master experience entry matches a job in `profile.json` by `id`. Its `bullets` array is the full master content. `scope` explains the ownership or project context. `prototype` is either a separate prototype paragraph or `null`. `skills` supplies that role's technology list. `projectSlugs` selects the supporting projects.

There is no longer a hard-coded dictionary of bullet indices. Reordering or adding master bullets works directly. When adding a job, add matching entries to the profile, master resume and company case-study files. Use a stable, unique `id` throughout. Update the concise profile bullets separately when changing a factual claim so the About page and master remain consistent.

The `/resume/` page renders the full master experience as HTML as well as the PDF. The HTML rebuilds with the site, but **the PDF must be regenerated separately after content edits**.

### Generate the PDF

From the repository root, create a Python environment and install ReportLab once:

```sh
python3 -m venv /tmp/botta-resume-venv
/tmp/botta-resume-venv/bin/python -m pip install reportlab
```

Generate after changing the content:

```sh
/tmp/botta-resume-venv/bin/python frontend/scripts/generate_resume.py
```

This overwrites `frontend/public/resume.pdf` and preserves the original source PDFs under `resume/`. Open the new PDF and check wrapping, dates, links, page breaks and prototype labels. Substantial roles start on new pages; additional content can increase the page count. Adjust the generator's styles or spacing if needed, rather than silently removing experience.

Then rebuild and preview:

```sh
cd frontend
npm run build
npm run preview
```

The public path remains `/resume.pdf`; the downloaded filename is `Manish-Botta-Master-Resume.pdf`. Normal website builds use the existing PDF and do not need ReportLab installed.

### Company case studies

About and the homepage link company names to `/experience/<id>/`. The four current IDs are `microsoft`, `yellow-ai`, `tradeliv` and `cognizant`.

Edit `experience.json` for each case study's `title`, `description`, `context`, `ownership`, article `sections`, `tradeoff`, `diagramTitle`, `caption` and related project slugs. Each section has a title and an array of paragraphs.

Edit `frontend/src/lib/architecture.ts` for company-specific system diagrams. Each architecture defines layer groups, service/data/control/person nodes, routed SVG edges, and supporting notes on a 1200-unit canvas. Node coordinates and widths control placement; edge paths control connections. Keep claims grounded in the approved experience and separate prototypes from production. The shared renderer in `frontend/src/components/experience-diagram.tsx` provides a legend, horizontal scrolling on mobile, an expandable dialog with zoom controls, and a text outline. Run `npm run test:architecture --prefix frontend` against the preview server to check the interactions, accessibility, and mobile overflow.

Case studies have static HTML, canonical metadata, social preview images, Article/BreadcrumbList structured data, sitemap entries and links in `llms.txt`. Their diagrams have text alternatives and captions. These features support discoverability; indexing and search placement are not guaranteed.

Keep production and prototype status accurate. TradeLiv's retrieval experiment is labeled as a prototype; Cognizant is an internal proof of concept. Do not copy team-wide scope into a personal achievement without preserving the attribution.

## Editing projects

Edit `frontend/content/projects.json`. Copy an existing entry when adding a project and supply all its fields.

| Field | Purpose |
| --- | --- |
| `slug` | Unique lowercase URL segment using letters, numbers and hyphens |
| `title`, `category` | Name and filter category |
| `tagline`, `description` | Short project copy |
| `problem` | Problem statement |
| `approach` | Ordered implementation points |
| `flow` | Labels shown in the system-flow diagram |
| `outcome`, `tradeoff` | Result and engineering tradeoff |
| `featured` | Whether the project appears on the homepage |
| `tags` | Technologies and search terms |
| `repoUrl` | HTTPS source repository URL |
| `liveUrl`, `contributionUrl` | Optional HTTPS links; use `null` when absent |
| `sources` | Array of HTTPS evidence/source links |

New categories automatically become filters. Search matches the title, description and tags. Array order controls the project collection and featured-project order. Three featured projects suit the current homepage layout.

All project entries are public; there is no project draft flag. Keep an unfinished project out of this file until ready. Changing a slug changes its URL, so update internal links, any PDF selection using it and host redirects if preserving old URLs.

Artwork is generated in `frontend/src/components/project-art.tsx`; adjust it for a custom illustration. Social cards regenerate during the build.

## Writing articles

Add a file such as `frontend/content/posts/my-engineering-note.mdx`:

```mdx
---
title: "My engineering note"
description: "A concise explanation of what the reader will learn."
date: "2026-09-17"
tags: ["Backend engineering", "Systems"]
published: true
---
Start with the problem and context.

## The approach

Explain the implementation and its tradeoffs.

## What changed

Describe supported results and link to relevant work.
```

- The filename becomes `/posts/my-engineering-note/`.
- Use a quoted `YYYY-MM-DD` date.
- `published: false` excludes the article from public pages and feeds on the next build.
- Publication is controlled by that flag, not by scheduling the date: future-dated posts marked `true` are still published.
- Published articles sort newest first; matching dates sort by title.
- Second- and third-level headings populate the desktop table of contents. Use distinct, simple headings for predictable anchors.
- Fenced code blocks receive copy controls.
- Tags generate their own listing pages; use consistent spelling.
- MDX is trusted executable content. This workflow assumes only the owner edits these files.

The build generates the article routes, RSS summaries, sitemap entries and social cards. It does not automatically clean previously generated, unused social images from `public/`; remove an obsolete image there if you want it removed from the next export.

## Changing design and site copy

| Change | File |
| --- | --- |
| Colors, spacing, typography, breakpoints and responsive rules | `frontend/src/app/globals.css` |
| Homepage hero text, company strip and section headings | `frontend/src/app/page.tsx` |
| Header links and mobile navigation | `frontend/src/components/header.tsx` |
| Footer text and links | `frontend/src/components/footer.tsx` |
| Homepage system illustration | `frontend/src/components/hero-system.tsx` |
| Project illustrations | `frontend/src/components/project-art.tsx` |
| Contribution calendar, data source and interaction | `frontend/src/components/contribution-graph.tsx` |
| Recent-event parsing, filtering and timeline | `frontend/src/components/activity-feed.tsx` |
| Contact form wording and behavior | `frontend/src/components/contact-form.tsx` |
| Shared title, identity metadata and structured data | `frontend/src/app/layout.tsx` |
| Canonical URL and shared metadata helper | `frontend/src/lib/metadata.ts` |
| Social image style and image labels | `frontend/scripts/generate-assets.mjs` |
| Site icon | `frontend/public/favicon.svg` |

CSS variables at the start of `globals.css` define the default dark palette and the light-theme override. Fonts are bundled locally through npm packages and loaded with `next/font/local`. The Latin Inter and Space Grotesk variable fonts are preloaded; JetBrains Mono loads when needed. The font variables belong on the root HTML element so global CSS tokens can resolve them.

Run `node scripts/generate-assets.mjs` from `frontend/` to regenerate social images and PNG icons independently. `npm run build` runs it automatically through `prebuild`. Manual edits to generated images are overwritten; change the generator instead.

## Configuration

No environment file is required for the default domain and tracking-disabled configuration. To override defaults, from `frontend/`:

```sh
cp .env.example .env.local
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://botta.in` | Canonical site origin used in generated URLs |
| `NEXT_PUBLIC_ANALYTICS_SCRIPT` | Empty | Optional HTTPS Plausible-compatible script URL |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN` | `botta.in` | Analytics domain identifier |

These values are public, build-time configuration. Do not place secrets in them. Rebuild after changing them. An analytics service must be configured separately; the website does not include an analytics dashboard or guarantee that an external service is free.

Changing the canonical domain does not rewrite literal branding strings in the PDF or social-image generator; update those files too when changing the brand/domain.

## Checks

From `frontend/`:

```sh
npm run check
npm run build
```

`check` runs TypeScript and content tests. A production build also validates content and generates all public routes.

For browser checks, start `npm run preview` in one terminal. In another terminal, from `frontend/`, run:

```sh
npm run test:browser
npm run test:activity
```

The browser script uses locally installed Google Chrome and expects the production preview at `http://127.0.0.1:3000`. It checks representative pages for accessibility violations, horizontal overflow and broken local links, plus project search, mobile navigation, theme switching, contact copying and GitHub failure handling. GitHub responses are mocked for deterministic checks; this does not verify GitHub service availability.

Browser screenshots are saved under the ignored `.preference/qa/` directory. On a fresh checkout, create that directory before running screenshot checks:

```sh
mkdir -p ../.preference/qa
```

The content tests include current approved identity/date assertions and the ten-project browser expectation. Update relevant assertions deliberately if that approved content or project count changes. Automated checks supplement visual review, especially after layout or PDF changes.

### Performance review

A September 17, 2026 Lighthouse mobile review on the uncompressed local static preview measured:

| Page | Performance score | First contentful paint | Largest contentful paint | Layout shift |
| --- | --- | --- | --- | --- |
| Homepage before font/loading improvements | 76 | 2.0 s | 6.2 s | 0 |
| Homepage after improvements | 81 | 1.5 s | 5.2 s | 0 |
| Activity after improvements | 82 | 1.4 s | 5.0 s | 0.024 |

These are single local lab samples, not production guarantees. The site now preloads its display/body fonts and defers the homepage calendar request until nearby. Mobile LCP still merits a deployed check once the owner configures hosting compression and caching.

## Build and hosting handoff

From `frontend/`:

```sh
npm ci
npm run check
npm run build
```

The output is `frontend/out/`. Upload its **contents** to the static host you choose. No Node.js process or Python API needs to run in production.

The host should:

- Serve directory index files for routes such as `/about/` and `/projects/coldstart/`.
- Serve `404.html` for unknown URLs with an HTTP 404 response.
- Serve the site over HTTPS at the configured canonical domain.
- Apply permanent legacy redirects from `/post` to `/posts/` and from `/post/<slug>` to `/posts/<slug>/`.

`frontend/public/_redirects` is copied to the export for hosts supporting that format. Other hosts require equivalent configuration. Python’s local preview server does not interpret `_redirects` or automatically use the custom error page.

Deploy only the static output, not the repository root. `.preference/`, original résumés, backend tools and the source seed are not deployment assets. Hosting, DNS, TLS and production availability remain outside this repository’s implemented website scope.

### Routine update checklist

1. Edit JSON, MDX or page components.
2. Regenerate the PDF if résumé content changed.
3. Run checks and build.
4. Preview changed pages and the PDF locally.
5. Commit the intended source and public-asset changes when ready.
6. Upload the new export using your hosting workflow.

Use Git history to recover earlier content. There is no database to migrate or back up.

## Optional Python tools

`backend/` retains the initial FastAPI health endpoint, Pydantic seed models, extraction tooling and tests. It is not connected to the public website and is not required for its normal use.

With Python 3.12+ and uv, from `backend/`:

```sh
uv sync --extra ingest --extra test --locked
uv run --no-sync python -m app.cli.validate_seed ../seed/content-seed.json --require-approved
uv run --no-sync python -m unittest discover -s tests -v
```

Optional development API:

```sh
uv run --no-sync uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Health: `http://127.0.0.1:8000/api/v1/health`. API documentation: `http://127.0.0.1:8000/docs`.

To re-extract the original PDFs into a local review directory:

```sh
uv run --no-sync python -m app.cli.extract_resumes ../resume ../.preference/resume-extraction
```

Original source PDFs and `.preference/` are ignored by Git. A fresh clone will not contain them. The historical seed is separate from the current website JSON and is not automatically synchronized.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Port 3000 is occupied | Stop the other development/preview process with `Ctrl+C` |
| Production preview shows old content | Run `npm run build` again; preview serves `out/` |
| PDF still shows old content | Run the Python generator, rebuild, then reopen the PDF or refresh the browser |
| `No module named reportlab` | Install ReportLab using the same Python interpreter that runs the generator |
| PDF generator cannot find a job | Match each master experience ID to `profile.json` |
| PDF generator raises `StopIteration` | A selected project slug no longer exists in `projects.json` |
| PDF has extra pages or awkward gaps | Shorten selected content or adjust generator spacing; job/project blocks stay together |
| Project build validation fails | Check required fields, unique slugs and HTTPS links; use `null` for absent optional links |
| An article is missing | Check its `.mdx` filename, frontmatter and `published: true`, then rebuild |
| Browser checks cannot launch | Install Google Chrome; the script explicitly requests the `chrome` channel |
| Screenshot checks cannot write files | Create `.preference/qa/` using the command in the checks section |
| GitHub activity is unavailable | Retry later or use the direct GitHub link; the public API can be rate-limited |
| Contact does not open a draft | Configure a default email application or use Copy message and email directly |
| Legacy redirects do not work | Configure them in the host; `_redirects` is not supported by every server |

## Project decisions

The site presents software engineering, AI engineering, forward-deployed engineering and forward-deployed AI experience. The latest owner direction is a public, file-edited website with owner-managed hosting. Admin/database workflows and AI chat are outside the current scope.

The full decision history and questions/answers are stored locally in `.preference/planning-questions.md`. Current implementation scope is documented in this README.

Design inspiration: [Tukesh1/tukesh.in](https://github.com/Tukesh1/tukesh.in). No upstream application code was copied.
