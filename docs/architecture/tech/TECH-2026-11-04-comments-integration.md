# SDKWork Comments Integration Across News Clients

- Status: implemented
- Date: 2026-11-04
- Surfaces: H5, PC, Flutter mobile, WeChat mini program
- Authority: `APP_SDK_INTEGRATION_SPEC.md`, `FRONTEND_SPEC.md`, `PAGINATION_SPEC.md`, `APP_MINI_PROGRAM_UI_SPEC.md`, `APP_FLUTTER_UI_SPEC.md`

## 1. Composition

News treats comments as a dependency capability, not an app-local feature:

```text
article page
  -> client comments controller / repository
  -> @sdkwork/news-comments-service port
  -> @sdkwork/news-comments-sdk-adapter (browser) or
     sdkwork_news_flutter_mobile_comments_sdk_adapter (Flutter)
  -> @sdkwork/comments-app-sdk / sdkwork_comments_app_sdk_flutter
  -> SDKWork Comments app API
```

Every client uses the same thread identity: `ownerKind = news-item`, `ownerId =
article.id`. No client copies comment DTOs from the generated transport or builds
an HTTP client of its own.

## 2. Shared Contracts

`@sdkwork/news-comments-service` owns `NewsComment`, `NewsCommentsSummary`,
`NewsCommentPage`, `NewsCommentsService`, and a deterministic demo service.
Pagination is offset based with a hard page-size cap; the browser adapter maps
the generated `PageInfo` and preserves the int64 total as a safe number for
display only.

`@sdkwork/news-comments-sdk-adapter` maps generated SDK methods:

| News operation | Generated app SDK |
| --- | --- |
| ensure thread | `comments.threads.ensure` |
| list comments | `comments.comments.list` with `page`, `pageSize`, `sort` |
| create / update / delete | `comments.comments.create/update/delete` |
| like / unlike | `comments.reactions.update/delete` |
| thread summary | `comments.threads.retrieve` |
| article favorite | `engagement.favorites.update/delete/list` |
| article like | `engagement.likes.update/delete` |
| article visit | `engagement.visits.create` |
| article counts | `engagement.targets.retrieve` |

## 3. Client Packages

| Client | State | UI | SDK boundary |
| --- | --- | --- | --- |
| H5 | `@sdkwork/news-comments-react` | `@sdkwork/news-h5-comments` | browser adapter |
| PC | `@sdkwork/news-comments-react` | `@sdkwork/news-pc-comments` | browser adapter |
| Flutter | `sdkwork_news_flutter_mobile_comments` | same package widget | generated Flutter adapter |
| Mini program | `@sdkwork/news-comments-service` | article subpackage section | demo service; generated SDK adapted at the root |

The H5 and PC controllers share load, page, reply, submit, optimistic like, rollback,
delete, and error handling. The Flutter controller mirrors the same state machine.

Article-level engagement is separate from comment reactions:

- `useNewsEngagement` / `NewsEngagementController` own favorite, like, visit, counts,
  optimistic mutation, and rollback.
- H5 and PC use the same header heart/bookmark and bottom action bar; the mini program
  adds the like action; Flutter uses the article app-bar heart/bookmark.
- Favorites are written back to the mini program saved cache so the existing profile
  saved list remains consistent with the server state.
- The generated engagement summary has counts but no viewer-specific like flag, so the
  adapter reports `liked: false` until the reader taps like; favorites are recovered
  from `engagement.favorites.list`.

## 4. Browser Runtime

`createNewsBrowserRuntime` now initializes Account, Agent, AI Store, Comments, and
News in parallel. Comments is its own capability:

- demo: `createDemoNewsCommentsService()`
- SDK: generated Comments app client from
  `VITE_SDKWORK_COMMENTS_APPLICATION_PUBLIC_HTTP_URL`, falling back to the platform
  gateway, bound to the shared token manager.

A comments failure leaves the article readable and renders a comments-only
unavailable state.

## 5. SDK Work

The Comments repository service was aligned to the actual generated app SDK:
threads use `ensure`/`retrieve`, reactions use `update`, deletes return void, and
legacy `requestId` fields became optional. The app SDK family now also generates
and verifies a Flutter transport at
`sdkwork-comments/sdks/sdkwork-comments-app-sdk/sdkwork-comments-app-sdk-flutter`.

## 6. Verification

```bash
pnpm --dir apps/sdkwork-news-h5 test
pnpm --dir apps/sdkwork-news-pc test
pnpm --dir apps/sdkwork-news-mini-program test
node tools/run-news-flutter.mjs analyze
node tools/run-news-flutter.mjs test
```

Comments service tests run with the News Vitest toolchain against the Comments
package; the generated Flutter SDK is checked with `dart analyze`.
