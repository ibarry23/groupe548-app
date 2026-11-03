# Groupe 548 mobile app — delivery notes

Date: 2026-11-03 · Project folder: `C:\Groupe 548` · Run: `npm install && npm run dev`

---

## 1. The business and its customers

**Verified on the live site** (https://groupe548-pbbrwr9z.manus.space, FR and EN, plus its JavaScript bundle):

- Seven services: residential cleaning, commercial cleaning, post-construction cleaning, window cleaning, moving, transport & delivery, interior painting. Each has a detailed "what's included / what affects the price / FAQ" page in both languages; this content was reused and tightened in the app.
- Service area: island of Montréal, Laval, Longueuil, Brossard, South Shore and North Shore ("call us if a little further").
- Two phone numbers (514-559-6494, 438-462-4710), 7 days a week incl. holidays, emergencies "subject to availability", bilingual service, certified non-toxic/biodegradable products, free detailed written quote with no hidden fees.
- Founded in Montréal, first registered as **Transports 548 Inc.**
- The website's quote form posts to **Web3Forms** (public access key embedded in the bundle). There is no backend, account system, pricing engine, availability calendar or CRM. Submissions arrive as emails.
- No reviews, customer counts, certifications, insurance details, response-time promises or photos of completed work are published. None were invented in the app.

**Customer situations that bring people to Groupe 548** (inferred from the services, guides and FAQ; not customer-interview data): moving (especially around July 1), end-of-lease handback, renovation handover, keeping a shop/office/condo common areas clean, refreshing walls, getting a bulky item delivered.

**Their concerns**, and how the app answers them: *"What does it cost?"* → honest "written quote, no price in the app" + "what affects the price" on each service. *"Will they show up / are they legit?"* → verified facts only (bilingual, 7/7, Transports 548 Inc. heritage, certified products), direct phone always one tap away. *"What happens after I send this?"* → a 3-step "what happens next" on every confirmation and a readable reference number. *"Do they serve me?"* → areas on the home screen and in Contact. *"Can I do everything at once?"* → multi-service requests and situation shortcuts.

**Gaps that could not be filled** (business decisions, not design work): typical response delay; insurance/RBQ/NEQ details; real customer reviews; photos of the team or completed work; whether photo attachments should be accepted (Web3Forms attachments require a paid plan or a custom endpoint).

## 2. Competitor and reference research

Budget note: this session was run with a strict token-usage constraint, so competitor interfaces were **not** opened live. The observations below come from documented knowledge of these products up to mid-2026 and should be treated as such; only the Groupe 548 site was inspected directly.

| Product | What it does well | Weakness Groupe 548 can beat |
|---|---|---|
| Handy / Angi (app) | Instant price per hours × frequency, calendar booking | Prices mislead for irregular jobs; pushy upsells and subscriptions; the pro is a stranger |
| Thumbtack (app) | Short question-first intake, pros answer | Marketplace noise, multiple pros contact you, pricing opaque until messages arrive |
| TaskRabbit (app) | Clear task categories, photo of the tasker, hourly rate shown | Not suited to multi-service projects (move + clean + paint) |
| Lugg / Dolly (apps) | Pick "what, from, to" and get a price; live tracking | Delivery-only; no cleaning/painting; Montréal coverage limited |
| Hellamaid / Adèle (Québec, web) | Simple online booking for recurring cleaning with a price calculator | Generic templates, cleaning only, no post-construction/moving |
| Local Montréal movers (web forms) | Soumission forms everyone understands | Long single-page forms asking everything at once; no confirmation beyond "merci"; no record of what was sent |

**Reference products for craft** (same caveat): Airbnb (editorial type + restrained colour, one obvious action per screen), Apple Store app (quiet surfaces, generous spacing, honest status), Wise (step-by-step flows that show progress and let you go back without losing data), Linear (consistent iconography, disciplined motion).

**Opportunities taken:** situation-first entry ("Je déménage", "Fin de bail"…), one request for several services, only the questions relevant to each chosen service, a preferred date treated as a *request* with Québec peak-period warning, an honest confirmation that says exactly what was and wasn't done, a local record of every request with a reference you can read over the phone, and a direct call button on every decision screen.

## 3. Visual direction

Three directions were compared:

1. **Maison 548 (selected)** — evolves the existing burgundy/gold identity: burgundy becomes a confident *signature* (hero, primary buttons, selected states) instead of wall-to-wall wallpaper; gold becomes a brass *hairline* (eyebrows, rules, checkmarks) and is never used as a large fill; warm ivory surfaces carry most screens. Serif display (Fraunces, optical sizes, softened terminals) paired with a humanist UI face (Instrument Sans). Premium, Montréal, trustworthy; strong brand recognition.
2. **Atelier** — near-monochrome editorial layout with photography and a single burgundy accent. Elegant but the business has no photography of its own, so it would depend on stock imagery and drift generic.
3. **Nuit** — dark-mode-first burgundy/black with gold type. Dramatic, but low readability for forms and a utilitarian service flow.

Direction 1 won because it keeps the recognition the business already has, reads well in daylight on a phone, and makes the single primary action unmistakable. Tokens live in `src/styles/app.css` (colour, type, radius, shadow, motion). The business's own line illustrations (from the site) are reused in the hero of image-bearing services and in list thumbnails; services without an illustration get a consistent glyph treatment.

## 4. Marketing and positioning changes

- Headline: *"Votre espace, entre bonnes mains."* / *"Your space, in good hands."* — outcome-centred, replaces the name-only hero. Lead names the four service families, bilingual team and 7/7 availability in one sentence.
- Services are explained by situation on the home screen, then by family (Nettoyage · Déménagement & transport · Peinture) on the Services tab, each with a specific one-line tagline.
- The quote process is explained before, during and after: "You send a request, not a firm booking", "The date is a preference", "Nothing is charged, nothing is booked yet", then "What happens next" on confirmation.
- Trust block uses only verifiable facts. Copy avoids "rapidement" promises that the business has not committed to in writing.
- French (Québec) first: "soumission", "fin de bail", "4½", "1er juillet"; English equally complete, including validation and error messages.

## 5. Customer journey

Discover (home) → choose a situation or a service → understand the offer (service page: included, price factors, FAQ, combos) → **Request a quote** (5 steps: Services → Details → Where & when → Contact → Review) → Confirmation with reference and next steps → Requests tab keeps the record.

Quote-flow specifics: service(s) first; per-service questions only (2–5 each, all optional); optional photos (downscaled on device, max 6) and free notes; city/area, optional address, preferred date with flexibility and time window; name + 10-digit phone required, email optional, preferred contact channel and follow-up language; review with "Edit" per section; progress bar, back without losing data, draft persisted on device and resumable; duplicate-submit lock; offline → queued and auto-sent on reconnect; no account anywhere.

## 6. Architecture and delivery format

The folder was empty and the website has no backend, so a new project was created.

**Chosen:** React 18 + TypeScript + Vite, packaged with **Capacitor** (hybrid cross-platform app for iOS and Android) and installable as a **PWA**. This is explicitly *not* a native Swift/Kotlin app, and *not* just a responsive website: the UI is built for phones only (tab bar, safe areas, sticky actions, native date/tel inputs, haptic feedback where supported), ships as an app shell, and runs offline.

Why: design quality is the top criterion and this stack gives full control over typography, motion and layout, verifiable in this environment; Capacitor adds native packaging and plugins (camera, haptics, push) when the business is ready; a single codebase serves iPhone, Android and the web.

**Integration:** `src/lib/submit.ts` has two providers — `mock` (nothing leaves the device, UI labels it "Simulée (démo)") and `web3forms` (the same service the website already uses, same field names, plus `reference` and `source=app`). **The app is now configured live** (`.env`: `VITE_SUBMIT_MODE=web3forms` with the website's key). One real test request was sent on 2026-11-03 — name "TEST application mobile (ignorer)", reference **G548-4J32**, services post-construction + windows — and Web3Forms acknowledged it (`success: true`); it should be in the inbox attached to that key and can be ignored.

**Design pass 2 (state-of-the-art polish):** brass "548" monogram watermark and radial brass glow in the hero; situation *cards* (snap-scrolling, brass-ringed glyph, grouped-services sub-line) replacing plain chips; a bordeaux "manifesto" trust block with a serif statement and a two-column fact list; gradient + inner-highlight primary buttons; staggered list entrances; pill highlight behind the active tab icon; "Continuer · 2 services" count in the quote footer; PNG app icons (192/512 + maskable) generated so the PWA installs cleanly.

**Ongoing-value features implemented** (each solves a customer problem, helps the business, and runs without new infrastructure): saved requests with reference and honest status; resume an unfinished request; repeat a similar request (pre-fills everything except the date); call about a specific request; queued sending when offline; language preference; guides linked from the site.

**Deferred until infrastructure exists:** real request status updates, appointment reminders and push notifications (need a backend/CRM and a decision about who updates status); photo attachments (Web3Forms attachments need the paid plan or a small custom endpoint); account sync across devices.

## 6b. Audit pass (objective review, 2026-11-03)

Fixed after a self-audit of design, accessibility, flow and code:

- **Contrast**: eyebrow text now uses a darker brass (`--brass-700`, ≈5.2:1 on ivory) and subtle text a darker grey (`--ink-500`, ≈5.3:1); placeholders darkened. Previously both were below WCAG AA for small text.
- **Touch targets**: chips and the review "Modifier" buttons are now ≥44 px.
- **Semantics**: single-choice groups use `radiogroup`; collapsed FAQ panels are `aria-hidden`; quote step titles are the page `h1`; request detail no longer has two `h1`s; the photo button is labelled "Ajouter des photos"; a hard-coded French screen-reader string was removed from the tab bar.
- **Visual consistency**: list/picker thumbnails now share one warm tile system (illustrations on beige, glyphs on brass-100) instead of two.
- **Flow**: an explicit Close (×) on quote steps 2–5 opens the "Quitter la demande?" sheet; "Réessayer l'envoi" shows a spinner and a success/failure toast; the reference pill copies the reference to the clipboard; the Requests badge counts only queued/failed requests (not an unfinished draft).
- **Robustness**: an error boundary shows a bilingual recovery screen instead of a blank page; missing-id routes use `<Navigate>` instead of navigating during render; unknown URLs redirect to home; the draft save is debounced (250 ms); native haptics via `@capacitor/haptics` inside the Capacitor shell; the version in "À propos de cette application" comes from `package.json`.
- Verified visually afterwards: home, services, quote step 2 with the leave sheet, empty Requests state, live confirmation with copy pill, About page.

### Pass 3 — design and customer-experience improvements

- **Dark mode**, verified: the palette is remapped under `prefers-color-scheme: dark` (warm near-black surfaces, lighter bordeaux for interactive states, brass eyebrows lifted for contrast); brand surfaces (hero, manifesto, primary buttons) keep their own colours through an `--on-brand` token; illustrations are slightly dimmed; `theme-color` switches with the scheme. Screenshots 22–25.
- **Native-feeling navigation**: scroll position is restored when going Back; new screens open at the top.
- **Bottom sheet focus trap** for keyboard and screen-reader users.
- **Floating "Demander une soumission" CTA** on the home screen once the hero scrolls out of view, so the primary action is always one tap away.
- **Quote step 3**: city/area is now a tap grid instead of a native select; a **"Quand?"** choice — *Dès que possible* or *À une date précise* — replaces an empty date field as the default path; ASAP requests are flagged as such in the review, the saved request and the email (`date: ASAP`).
- Step 1 now sets expectations: "Environ 2 minutes, aucun compte à créer."

### Brand essence (the brief for every image and animation)

What Groupe 548 actually sells is not cleaning or trucks; it is **the feeling of being at home in a space that is cared for** — the site's own line, *« Tout ce dont vous avez besoin pour vous sentir bien chez vous »*. Everything verified about the business points the same way: one bilingual team you can call for all of it, 7 days a week, written quotes with no surprises, certified gentle products, roots in Montréal (first as Transports 548 Inc.). So the visual essence is:

- **Care, not machinery** — people in their homes and workplaces at the moment the work is done: the exhale, the first step into a finished room, the door opening to a delivery.
- **Calm warmth** — natural morning/golden light, ivory and wood, a single bordeaux accent (cushion, mug) echoing the brand; never neon, never stock-photo grins.
- **Montréal textures** — brick triplexes, wrought-iron spiral staircases, maple leaves, the skyline through a clean window.
- **Quiet motion** — slow push-ins, curtains breathing, dust in a sunbeam; 5-second loops that reward a second look rather than demand attention.

Applied in pass 5: every "plain" screen gets an ambient clip in this language (empty Requests, confirmation, Services and More headers, About), and the icon system itself comes alive — stroke draw-on for check lists, trust facts and the confirmation mark, a soft breathing empty-state icon, floating situation glyphs, a pop on the active tab — all disabled under reduced motion.

### Pass 4 — generated motion and imagery (Higgsfield)

- **Home hero ambient loop**: one 5 s clip generated with Seedance 2.0 Mini (9:16, 720p, silent), turned into a seamless 10 s ping-pong loop with ffmpeg (H.264, 854 KB) with a JPEG poster. It plays muted/inline under the bordeaux wash (luminosity blend, ~60 % opacity) so the headline stays legible; it is **not played** when the person prefers reduced motion or is on data-saver / 2G, pauses in the background, and fades in only once it can play.
- **Seven photorealistic service stills** (GPT Image 2.5, 4:3, 1200 px JPEG, 94–220 KB each) used as "living photos" in the service-page heroes: a 22 s slow drift and a soft light sweep, static under reduced motion. Files: `public/img/photos/<service-id>.jpg`.
- First pass credits: ≈ 6.75 (Seedance Mini hero 5, stills 7 × 0.25).
- **Second pass (after a credit top-up): eight Kling 3.0 clips.** Seven service scenes in *pro* mode (1:1, 5 s, silent, 8.75 credits each) and a new ambient hero in *std* mode (9:16, 7.5 credits) — ≈ 68.75 credits. Each clip was written as a single emotional beat rather than a demo of the service: a woman closing her eyes in her freshly cleaned living room (relief), a cleaner taking in an immaculate café at dawn (quiet pride), a couple stepping into their renovated home (a new chapter), a squeegee revealing a red-brick Montréal street (clarity), movers carrying an armchair up a spiral staircase while the new tenant waits with a coffee (care), a delivery greeted by an elderly man (kindness), a roller laying fresh paint while the owner watches (transformation). Plain charcoal uniforms, no text or logos, warm muted palette with small bordeaux accents (cushion, mug) for brand cohesion.
- Post-processing with ffmpeg: a 0.6 s crossfade loop (the tail dissolves into the head, so the loop point is invisible), 720 px, H.264 crf 27, 310–520 KB per clip; the first frame is the poster. Files: `public/video/<service-id>.mp4` and `public/img/photos/<service-id>-poster.jpg`. The earlier stills remain as fallbacks (`clip: false` on a service switches back to the living photo).
- The "unlimited Kling" pack bought in the Higgsfield web app was **not usable through the API connector** (`Unlimited generations aren't supported for kling3_0`); the clips were paid from credits instead. Worth raising with Higgsfield support if the pack was meant to cover API use.
- **Disclosure:** these are AI-generated illustrative images of generic staff and scenes, not photographs of the Groupe 548 team or of completed work. They are used as editorial illustration only; replace them with real photography when it exists, and do not present them as the actual crew in marketing.

### Pass 5 — no plain screens (Kling 3 Unlimited, via the Higgsfield web app)

The unlimited pack works in the web app once **Quality is 720p/1080p and "Unlimited mode" is on** (4K is not covered — that is why the earlier web generations were charged). Driving the web UI through the browser extension, every generation showed "Generate · Unlimited" and no credits moved (balance stayed at 2.61).

Atmosphere clips, each a 5 s 1080p Kling 3.0 pro render looped with a 0.6 s crossfade (`public/video/<name>.mp4`, poster `public/img/photos/<name>-poster.jpg`, switched on in `src/data/clips.ts`):

| Screen | Clip | Why |
|---|---|---|
| Requests, empty state | Sunlit entryway: console table, keys, plant, curtain breathing | "Nothing yet" shown as a calm home waiting for its day |
| Confirmation (sent/demo/queued) | A woman answering her phone in her kitchen and smiling | The next step is a callback — show it |
| Services header (16:9) | Still life of the tools: cloths, brass key, bordeaux/ivory swatches, tape, box, squeegee | Seven services, one table |
| More header (16:9) | White van pulling to the curb on a brick-triplex street at golden hour | Help arriving, Montréal |
| About (16:9) | Plateau street, spiral staircases, a woman watering balcony flowers | Rooted in the neighbourhood |

Service-page retakes generated with the pack and compared frame by frame against pass 4: **residential** now uses the father-and-daughter take (relief → joy) and **commercial** the café-chairs-at-dawn take (warmer than the office lobby); pass-4 versions are kept outside the app. The post-construction retake (a woman alone at a new counter) was quieter but less moving than the couple stepping into their finished home, so pass 4 stays there; likewise the sage-green painting retake (beautiful raking light, but the roller's shadow reads more than the roller at phone size) stays as an alternative outside the app. Retakes replace a clip only when they are clearly better; rejected takes are in `docs/screenshots/46–47`.

Living icons (CSS/SVG, no assets): stroke draw-on for check lists, trust facts and the confirmation mark; breathing empty-state icon; floating situation glyphs; pop on the active tab. All off under `prefers-reduced-motion`. Bundle with all media: ≈ 6.9 MB.

### Pass 6 — launch and photographic continuity

- **Branded launch splash** (`index.html` + `main.tsx`): bordeaux screen with the brass roofline mark and "548" in serif, rising in and fading out ~0.75 s after the app mounts (instant under reduced motion). It is plain HTML/CSS so it appears before any JavaScript, and it also stands in for the Capacitor splash until native assets are generated.
- **Photo situation cards** on Home: each "Que voulez-vous accomplir?" card now sits on the primary service's still (360 px crop) under a bordeaux gradient, with the glyph in a frosted brass-ringed disc and a slow zoom on press.
- **Photographic continuity** everywhere a service is named: 192 px thumbnails (5–10 KB) in the Home and Services lists and the quote picker, 44 px thumbnails on request cards, 34 px thumbnails in the quote's per-service question groups, 26 px round thumbnails in "Souvent combiné avec" chips. The line illustrations remain only as fallbacks.
- Verified at 375 px: screenshots 50–54. Bundle with all media ≈ 7 MB.

### Pass 7 — hosting, audit and the honest score

- **Live**: https://ibarry23.github.io/groupe548-app/ (GitHub Pages from `gh-pages`; source https://github.com/ibarry23/groupe548-app; redeploy with `bash scripts/deploy-pages.sh`, a delta push so only changed files travel). Verified on the live URL: app renders, hero video plays, service worker and manifest active, privacy page served.
- **Accessibility audit** with axe-core 4.10 (WCAG 2.0 A/AA + best practices) on Home, quote steps 1 and 4, and a service page: two findings (buttons carrying `role="listitem"`, an `h3` following the quote's `h1`), both fixed; re-run clean.
- **After sending**, the customer now has things to do: Share (native share sheet, clipboard fallback), Email me a copy (mail app, pre-filled), Calendar reminder (.ics for the preferred date, labelled "to be confirmed"). An explicit "Passer cette étape" on the optional details step. The request detail page carries the callback clip.
- Robustness: iOS `dvh` fallback, hero poster preloaded with high fetch priority, install card on More (browser prompt on Android/desktop, instructions on iPhone), bilingual privacy page, store listing and refund letter drafted.

**Score, objectively.** Design 8.5/10 — identity, media and craft are at the level of the best consumer apps; the half point missing is real-device verification and real photography. Experience 8/10 — the quote journey and post-send actions are better than any competitor reviewed; what remains cannot be built from this machine: live request status and customer notifications (a backend), photo attachments reaching the team, native store builds, and a screen-reader walkthrough on real hardware. Those are the path from 8 to 10, and each is scoped in §8.

### Pass 8 — meaningful motion, invisible loops

- **Every clip now explains something.** The four "Comment ça se passe" steps are illustrated by scenes that *are* the step: a man typing the request on his sofa (bordeaux cushion), a coordinator with a headset taking notes, a pen running down a printed itemized quote, and the handshake at the door of the finished home. Every service page now has an **"En 10 secondes"** section: a single continuous 10 s take (16:9, Kling 3.0 pro) of what the team actually does on site — counter → floor → cushions for residential; meeting table → bin → vacuum at dusk for commercial; sill → glass → floor for post-construction; soap → squeegee → sill on a storefront; blanket → dolly → ramp for moving; van → path → doorway for delivery; tape → cut-in → roller for painting. Files `public/video/<id>-tasks.mp4`, switched on in `src/data/clips.ts` → `TASK_CLIPS`; review sheets in `docs/screenshots/58–65`.
- **Loops no longer read as loops.** All clips were re-processed (`scripts/loop-clips.py`) with a longer dissolve — 1.0 s on people scenes, 1.2–1.4 s on ambient scenes — so the tail melts into the head instead of cutting; the poster is the exact first frame of the loop, so the image→video hand-off is invisible too.
- **Customer-maintained progress** on each request ("Où en êtes-vous?") replaces the empty promise of status tracking until a backend exists.
- Working rules while generating in a shared Higgsfield account: only jobs whose prompt text matches ours are fetched; no user images or clips are touched; composer settings are restored (1:1 / 5 s) when done.

### Pass 9 — clips that belong to the brand

- **`BrandClip`** (`src/components/Media.tsx`) dresses every clip in the identity: a brass hairline inset frame, the "548" monogram, a bordeaux shade at the foot, a scroll-triggered entrance with a brass light sweep (fallback reveal after 1.8 s), and — on the "En 10 secondes" sequences — **captions keyed to the video's time** that name each action as it happens (e.g. Comptoirs → Planchers → Finitions), with a brass progress hairline. Process-step clips carry a serif numeral (01–04); the callback clip on confirmation and request detail carries "On vous recontacte". Captions live in `src/data/services.ts` (`taskCaptions`, FR/EN).
- **Tab bar** now belongs too: the active tab is a bordeaux pill whose icon draws itself on, with a brass dot under the label and a soft spring on change; a brass hairline tops the bar.
- All seven service sequences are in (painting completed), all loops use long dissolves, composer settings in Higgsfield were restored to 1:1 / 5 s.

Remaining, deliberately not done: Capacitor status-bar styling per screen (needs the native shells to test), and in-app reading of the website guides (the site is a SPA; links open in the browser).

## 7. What was tested

Environment: Chrome (Claude desktop browser pane) with device emulation — **375×812 (iPhone SE/13 mini class)** and **430×932 (iPhone Pro Max class)**. No physical iPhone/Android, Xcode simulator or Android emulator was available on this Windows machine; the Capacitor iOS/Android projects were not generated.

Checked end to end at 375×812: home → situation "Je déménage" → quote with 2 services pre-selected (end-of-lease preset applied) → details → where/when → contact with **empty submit (inline errors, scroll to error)** → valid contact → review → submit with a **double tap (only one request created)** → demo confirmation with reference → Requests list → request detail. Also: offline simulation (offline bar, request queued, automatic send on reconnect verified in storage), draft persistence across reloads, service pages (illustrated and glyph variants), More/Contact/FAQ/About, English experience, 430×932 home/services/quote/service page. `npm run build` passes with strict TypeScript.

Screenshots: `docs/screenshots/` (file names describe screen, language and width).

## 8. Remaining requirements

**Integration**
- Decide `VITE_SUBMIT_MODE=web3forms` and which Web3Forms key (reuse the site's or create an app-specific one) — then send one real test request.
- Optional: a small endpoint (or Web3Forms Pro) to receive photo attachments; the app already collects and downsizes them.
- Optional: a CRM/sheet where the team marks requests "quoted / scheduled" if real status tracking is wanted later.

**Assets**
- App icon and splash sets generated from `public/icon.svg` with `@capacitor/assets` (brand review of the icon recommended).
- Illustrations exist for cleaning, moving, transport, painting only; commissioning three more (commercial, post-construction, windows) in the same line-art style would complete the set.
- Real photographs of the team/vehicles, if the business wants them, would strengthen trust more than any copy.

**Publishing**
- macOS with Xcode for the iOS build and an Apple Developer account; Android Studio and a Google Play account.
- Store listings in FR and EN, privacy policy URL (the app stores data only on device; nothing is collected until "Send").
- Hosting for the PWA/web build (any static host; `dist/` with `base: './'`).
