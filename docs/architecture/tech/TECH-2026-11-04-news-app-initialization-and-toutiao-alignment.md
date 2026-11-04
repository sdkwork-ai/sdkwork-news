# News App Initialization And Toutiao-Aligned Reading Experience

- Status: implemented
- Date: 2026-11-04
- Surfaces: H5, PC, WeChat mini program, Flutter mobile
- Specs: `FRONTEND_SPEC.md`, `UI_ARCHITECTURE_SPEC.md`, `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`, `APP_H5_ARCHITECTURE_SPEC.md`, `APP_PC_ARCHITECTURE_SPEC.md`, `MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md`, `APP_FLUTTER_UI_SPEC.md`

## 1. Problem

The previous clients were functional but assistant-first. The first screen
prioritized agent setup over reading, the feed lacked the information density
and ranking affordances readers expect from a Chinese news product, and the
browser startups duplicated capability wiring. A native mini-program surface did
not exist.

## 2. Product Decisions

- News becomes the default surface on every client. Assistant, AI curation, and
  account remain one tap away.
- The home surface follows the reading hierarchy used by leading news apps:
  brand/search bar, hot ranking strip, category rail, editorial lead, topic
  chips, timestamped feed, and a persistent hot list on wide screens.
- Article reading adds an explicit AI summary card, source identity, reading
  time, tags, feedback, font scaling, related reading, and save/share actions.
- Ranking is a first-class destination: a compact strip on mobile and a full
  ranked page, with a dedicated tab on the mini program.
- The visual language uses a news-red accent, white surfaces, restrained lines,
  dense but readable typography, and monochrome outline/filled navigation icons.

## 3. Initialization

### Browser

`@sdkwork/news-runtime` now exposes `createNewsBrowserRuntime`. It resolves and
initializes Account, Agent, AI Store, Comments, and News in parallel, applies a
bounded hydration timeout, and reports per-capability diagnostics instead of
failing the whole application when one capability is unavailable. H5 and PC render
a branded startup screen before initialization and pass the resulting services
into the existing app shell.

### Flutter

The app now opens on News and catches bootstrap failures with a branded failure
surface instead of leaving a blank frame. Navigation order, labels, palette, and
tests were aligned with the news-first shell.

### Mini Program

A new `apps/sdkwork-news-mini-program` root follows the native WeChat package
taxonomy:

- `mp-core`: runtime config, ports, route ids, host contract.
- `mp-commons`: design tokens and formatting.
- `mp-shell`: tab and route-placement metadata.
- `mp-news`: demo/service adapter, view models, feed/ranking/topics/search route
  contributions and locale fragments.
- `mp-host`: the only WeChat platform adapter.

Platform pages are thin projections. The article page lives in the `news`
subpackage, so the native tab bar is absent on secondary reading screens. Route
projection and config/host-boundary checks run in `pnpm test` and
`build:mini-program`.

## 4. Interaction Coverage

- Loading, empty, unavailable, error, and retry states.
- Search entry, suggestions, results, clear, and empty results.
- Category switching, hot ranking, topic discovery, article save/share/font.
- Responsive H5 at 390–430 px and PC at 1280–1440 px.
- Mini-program tab icons ship as filled/outline pairs; safe-area insets are
  respected.

## 5. Verification

```bash
pnpm typecheck
pnpm --dir apps/sdkwork-news-h5 test
pnpm --dir apps/sdkwork-news-h5 build
pnpm --dir apps/sdkwork-news-pc test
pnpm --dir apps/sdkwork-news-pc build
pnpm --dir apps/sdkwork-news-mini-program test
pnpm --dir apps/sdkwork-news-mini-program build:mini-program
node tools/run-news-flutter.mjs analyze
node tools/run-news-flutter.mjs test
```

Visual evidence is captured with `tools/capture-ui.mjs` under
`docs/quality/screenshots/`.
