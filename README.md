# Irhah Arshad Siddiqui: Portfolio (coded version)

Plain HTML/CSS/JS, no build step, no dependencies, deploys instantly on Vercel.

## What's built

- `index.html`: homepage with the hero, Download Resume button, category filter tabs (All / Experience Design / Visual & Brand Design), and the full project grid.
- `about.html`: real bio, education, and skills content.
- `contact.html`: real contact info.
- `case-studies/wayhome.html`: quick facts, top stat row, Scope/Process/Outcome, process diagram, Research Findings block (3 stats + 4 insight cards with real quotes), storyboard gallery (6 panels), floating section jump rail, next project card.
- `case-studies/how-do-we-love.html`, `imagin8-v-park.html`, `dolled-up.html`, `flipped.html`, `aqs.html`, `mr-whiskerworths.html`: all built from content pulled off your old site (irhaharshad.com), each with Scope/Process/Outcome and a next project link that chains through all 7 pages and loops back to WayHome.
- `css/style.css`: the full design system. Light/dark mode, glass sticky nav, per-project accent color (set via an inline `style="--accent:#..."` on each page's `<body>` tag), stat tiles, research findings block, gallery block styles, storyboard panels, scroll reveal animation classes.
- `js/main.js`: theme toggle and persistence, mobile nav, scroll reveal, category filtering, floating section rail with scrollspy, the hero's one time letter reveal animation with the cursor proximity hover effect.

## Known gap

`case-studies/qrco.html` doesn't exist yet. Your old site never had a QRco project, so there was no source content to pull from. The homepage card still links to it, so that link is a 404 until you send project details (or point me somewhere to pull them from) and I build the page.

## What's still needed from you

**Assets I don't have and need from you:**
- Your logo files (black version for light mode, white version for dark mode): save them into `assets/` as `logo-black.png` / `logo-white.png` and I'll wire them into the nav (a text fallback is in place for now).
- Your resume as a PDF: save it into `assets/` as `Irhah-Arshad-Resume.pdf` (the Download Resume buttons already link to this path).
- Real project images/screenshots for every place marked with an HTML comment like `<!-- assets/wayhome-thumb.jpg -->`: these are currently empty placeholder boxes on every page.

Once you send these (attach them in our chat), I'll drop them into the right spots and the placeholders will disappear.

A custom cursor was built and tested but pulled back out for now at your request, it kept breaking depending on the device. The working demo versions are still saved from our conversation if you want to revisit it later.

## Getting this onto GitHub

1. Create a GitHub account at github.com if you don't have one (free).
2. Create a new repository (the "+" icon top right, then "New repository"). Name it `irhah-portfolio`. Leave it empty: don't add a README, .gitignore, or license.
3. On the repo page, click "uploading an existing file" (or Add file, then Upload files). Drag in this entire folder. GitHub keeps the `css/`, `js/`, `case-studies/`, and `assets/` subfolders as long as you drag the folder itself, not just the loose files inside it. Commit the upload.

## Deploying on Vercel

1. Go to vercel.com and sign up with "Continue with GitHub": this links your accounts.
2. Click "Add New, then Project," then select your `irhah-portfolio` repository from the list.
3. Vercel will detect it as a static site automatically, no configuration needed. Click "Deploy."
4. Within about a minute, Vercel gives you a live URL like `irhah-portfolio.vercel.app`. That confirms it's working.
5. To connect your real domain: in the Vercel project, go to Settings, then Domains, add `irhaharshad.com`, then update the DNS records in your Squarespace domain settings with what Vercel shows you (usually an A record or CNAME).

Every time I hand you updated files, repeat the GitHub upload step (drag and drop, overwrite). Vercel automatically redeploys within about a minute of any push to the repo, no manual redeploy needed.
