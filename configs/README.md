# Configs

## Purpose

`configs/` holds repository-local declarative configuration that is read by tooling, generators, or the deployment entrypoints — never runtime application logic.

## Owner

The `sdkwork-news` repository owns the configuration stored here.

## Allowed Content

- Declarative tool, generator, and validator configuration.
- Environment-neutral defaults that are not deployment-profile specific.
- Schema and lint rule sets consumed by repository scripts.

## Forbidden Content

- Secrets, tokens, credentials, or environment-specific connection strings.
- Deployment profiles, bind addresses, and dependency Base URLs, which belong in `etc/`.
- Runtime application code or importable modules.
- Values that only one package needs and that belong beside that package.

## Related Specs

- `../sdkwork-specs/SDKWORK_WORKSPACE_SPEC.md`
- `../sdkwork-specs/SOURCE_CONFIG_SPEC.md`

## Verification

Run `pnpm run test:node`.
