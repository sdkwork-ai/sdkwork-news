# SDKWork News Mini Program

WeChat mini-program surface root for `sdkwork-news`.

- Architecture: `MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md`
- UI standard: `APP_MINI_PROGRAM_UI_SPEC.md`
- Platform: WeChat mini program (`mp-weixin`)
- Source root: `src/`

## Structure

```text
apps/sdkwork-news-mini-program/
  src/
    app.ts / app.json / app.wxss
    bootstrap/
    pages/{feed,ranking,topics,profile,search}
    subpackages/news/pages/article
  packages/
    sdkwork-news-mp-core
    sdkwork-news-mp-commons
    sdkwork-news-mp-shell
    sdkwork-news-mp-news
    sdkwork-news-mp-host
  config/mini-program/
  config/host/
  specs/component.spec.json
```

## Commands

```bash
pnpm --dir apps/sdkwork-news-mini-program typecheck
pnpm --dir apps/sdkwork-news-mini-program test
pnpm --dir apps/sdkwork-news-mini-program build:mini-program
```

Open the root in WeChat DevTools with `miniprogramRoot = src/`.

## Boundaries

- Business pages and services live in `packages/`, not in platform page files.
- Feature packages never call `wx.*`; platform APIs pass through `sdkwork-news-mp-host`.
- Runtime config is selected from `config/mini-program/` and must never contain private secrets.
- Native tab icons ship as filled/outline pairs.
