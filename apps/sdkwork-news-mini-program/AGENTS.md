# Repository Guidelines

Read `../../AGENTS.md` first and resolve all standards through `../../../sdkwork-specs/`. This root owns the native WeChat mini-program client for SDKWork News.

Use `agent.app.config.json` for identity and release metadata, `specs/component.spec.json` for local ownership, and `etc/sdkwork.deployment.config.json` for deployment delegation. Runtime values belong to `config/mini-program/`, never the manifest.

## Architecture

- Business source lives in `packages/sdkwork-news-mp-*`; platform pages under `src/pages` and `src/subpackages` are thin projections.
- Feature packages depend on `@sdkwork/news-mp-core` ports. They must not call `wx.*`, attach auth headers, or execute raw business HTTP.
- `@sdkwork/news-mp-host` is the only place platform APIs are implemented.
- Route ids follow `<surface>.<domain>.<capability>.<screen>` and align with PC/H5/Flutter workflows.
- The tab bar renders only on tab-root pages; article detail lives in the `news` subpackage.

## Verification

```bash
pnpm --dir apps/sdkwork-news-mini-program typecheck
pnpm --dir apps/sdkwork-news-mini-program test
pnpm --dir apps/sdkwork-news-mini-program build:mini-program
```

Human review is required for public naming, security, platform app ids, release configuration, generated SDK ownership, and destructive operations.
