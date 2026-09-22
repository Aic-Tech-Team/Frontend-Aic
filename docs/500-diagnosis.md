# 500 on `/fa/blog` — Differential Diagnosis

**Site:** https://kaic.karaj.iau.ir
**Repos:** `E:\projects\Frontend-Aic-main` (Next.js 16, App Router), `E:\projects\Backend-Aic-main` (Django + DRF)
**Date:** 2026-09-22
**Status:** Root cause confirmed; fix implemented and verified locally. Deployment config still needs applying on the server (see §8).

---

## 1. Summary

`GET /fa/blog` returns **500 after ~10.6 seconds**. The delay is the tell: a
logic error (null deref, bad destructuring) throws in microseconds. Ten seconds
is a **TCP connect timeout**.

> **Root cause (confirmed):** the `aic-frontend` container cannot open a
> connection to `https://kaic.karaj.iau.ir`. Every route that fetches during
> the Server Component render times out, throws an uncaught
> `TypeError: fetch failed`, and returns 500. The backend API itself is
> healthy and returns correct data.

This is **not** a data problem, **not** locale-specific, and **not** a
regression in the blog render code.

---

## 2. Method and limits

Diagnosed from source plus read-only `GET` probes of the live site (no server,
log, or digest access was available).

| Limit | Consequence |
|---|---|
| `Frontend-Aic-main` is **not a git repository** (`.gitignore` only, no `.git/`) | No `git log` / `git blame` regression hunt possible |
| `node_modules` absent | No type-check or production build was run |
| No server logs / no digest lookup | Root cause established by black-box probing instead |

**A local run would not reproduce this.** A dev machine resolves and reaches
`kaic.karaj.iau.ir` normally, so `pnpm dev` renders `/fa/blog` fine. That
non-reproduction is itself corroborating evidence: the fault is environmental,
not in the render logic.

---

## 3. Evidence

### 3.1 Route probes

| Route | Result | Server-side fetch? |
|---|---|---|
| `/fa/blog` | **500 @ 10.6 s** | yes — 2 parallel |
| `/en/blog` | **hangs → 500** | yes — 2 parallel |
| `/fa/events` | **500 @ 10.6 s** | yes — 6 parallel |
| `/fa/blog/1` | **500 @ 21.1 s** | yes — 2 **sequential** |
| `/fa/activities` | 200 @ 47 ms, `x-nextjs-cache: HIT`, `x-nextjs-prerender: 1` | **no** — client-side React Query |
| `/fa` (landing) | 200 @ 96 ms | **no** — static translation strings |

The split is perfectly along *"does this route fetch on the server"* — not along
locale, and not along content type.

- `/fa/activities` is prerendered and its data is fetched **by the browser**
  (`ActivitiesExplorer` is a client component). I watched it successfully call
  `https://kaic.karaj.iau.ir/api/v1/activities/?page_size=100` → 200.
- `/fa`'s `BlogSection` renders hardcoded strings from `messages/*.json`, not
  the API.
- Timings quantize to a single ~10.5 s unit: ~10.6 s for parallel fetches,
  ~21.1 s (= 2 x) for the sequential detail page.

### 3.2 The decisive probe — no application code involved

```
GET /_next/image?url=https%3A%2F%2Fkaic.karaj.iau.ir%2Fmedia%2Fblog%2Ftest.jpg&w=640&q=75
  → 504 Gateway Timeout after 7.2 s
```

This is **Next.js's own image optimizer** fetching a `kaic.karaj.iau.ir` URL
server-side. Nothing in `src/` participates. It times out too. That isolates
the failure to container egress with certainty.

### 3.3 The API is healthy

Probed directly from a browser:

| Request | Result |
|---|---|
| `/api/v1/blogs/?page_size=2` | **200** — `{"count":1,"next":null,"previous":null,"results":[…]}` |
| `/api/v1/blogs/?page_size=100` | **200** |
| `/api/v1/blogs/1/` | **200** |
| `/api/v1/activities/?page_size=2` | **200** |
| `/api/v1/events/?page_size=2` | **200** |

The response shape matches `PaginatedBlogsResponse<ApiBlogPost>`
(`src/hooks/api/blogs.ts:5-32`) exactly.

---

## 4. Why: one env var doing two incompatible jobs

`Frontend-Aic-main/docker-compose.yml:6`

```yaml
NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL:-https://kaic.karaj.iau.ir/api}
```

`NEXT_PUBLIC_*` is **inlined at build time** and consumed by *both* sides:

- **Browser** — correct. Confirmed working against the live site.
- **Server** — wrong. The container is published on `127.0.0.1:8040:3000`
  behind host nginx. Reaching its own public hostname means public DNS out and
  hairpin-NAT back to the host's public IP. Without hairpin (or with egress
  filtered), the connect just hangs until timeout.

### Why nothing surfaces the error

| Location | Problem |
|---|---|
| `src/app/[locale]/blog/page.tsx:48` | Catches **only** `ApiError` with `status === 400`. A `TypeError: fetch failed` has no `.status` and escapes. |
| `src/services/api/client.ts:113` | No `signal` / no timeout — waits on the OS default (~10 s, then nginx 504 on longer routes). |
| **Nowhere** | There is **no `error.tsx`, `global-error.tsx`, or `not-found.tsx` anywhere in `src/`.** Nothing swallows the error — but nothing degrades it either, so it surfaces as a bare 500. |

---

## 5. Differential — every candidate considered

| # | Hypothesis | Verdict | Evidence |
|---|---|---|---|
| 1 | **Server cannot reach the API host** | **CONFIRMED — this is it** | 10.6 s timeouts; `_next/image` 504 with zero app code; only server-fetching routes fail |
| 2 | Backend API down / unreachable | **Ruled out** | All three list endpoints return 200 with valid payloads from the public internet |
| 3 | Malformed API response → `.results.map()` on undefined | **Ruled out** | Response shape verified correct; a TypeError would also throw instantly, not after 10.6 s |
| 4 | Locale-routing bug (`fa` vs `en`) | **Ruled out** | `/en/blog` fails identically; `/fa` and `/fa/activities` both return 200 |
| 5 | Missing `next-intl` message keys | **Ruled out** | `BlogPage` namespace complete in **both** `messages/fa.json` and `messages/en.json` (badge, title, description, searchLabel, searchPlaceholder, resultsCount, noResultsTitle, noResultsDesc, clearFilters, readMore, filters.all) |
| 6 | Blog-content-specific data (bad row, null field) | **Ruled out** | Only 1 post exists; it serializes fine; `mapApiBlogPost` null-coalesces every optional field (`src/hooks/api/blogs.ts:53-67`) |
| 7 | Auth / permissions rejecting the server | **Ruled out** | `ReadOnlyOrAdmin` returns `True` for all SAFE_METHODS; `DEFAULT_PERMISSION_CLASSES = AllowAny` (`config/settings/base.py:143`) |
| 8 | `page_size=100` exceeds `max_page_size` | **Ruled out** | `DefaultPagination.max_page_size = 100` — exactly equal, honored. Probe returns 200 |
| 9 | `next/image` `remotePatterns` rejecting a host | **Ruled out for this route** | Grid cards pass `unoptimized` (`BlogPostTicketCard.tsx:49`); `kaic.karaj.iau.ir` is allowed in `next.config.ts` anyway |
| 10 | Turbopack / build-output bug | **Ruled out** | Failure is I/O-bound and reproduces on the optimizer, which is not app-compiled code |
| 11 | `error.tsx` swallowing the real error | **Ruled out** | No error boundary exists anywhere in `src/` |
| 12 | Missing ICU / `toLocaleDateString` throwing | **Ruled out** | `node:22-slim` ships full ICU; these calls don't throw regardless |
| 13 | `NODE_ENV`-conditional logic | **Ruled out** | No `NODE_ENV` branching exists in the blog render path |

---

## 6. Latent 500s — these will still bite after the network fix

These are **independent, reproducible defects** in the frontend, currently
masked by cause #1. Each one turns a normal backend response into a 500.

### 6.1 Out-of-range `?page=` → 404 → 500  ⚠ HIGH

**Verified live:** `GET /api/v1/blogs/?page=999&page_size=6` → **404**
`{"detail":"Invalid page."}` (stock DRF `PageNumberPagination`).

`src/app/[locale]/blog/page.tsx:34` clamps only the **lower** bound:

```ts
const currentPage = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
```

The unclamped value is sent to the API (`page: currentPage`, line 45). The
`catch` at line 48 handles only `status === 400`, so a **404 propagates and
500s the route.** With `count: 1` and `PAGE_SIZE = 6` there is exactly one page,
so **`/fa/blog?page=2` is enough to 500 the site today** — crawlers, stale
links, and prefetches will find this. Same defect in
`src/app/[locale]/events/page.tsx:72`.

### 6.2 `ALLOWED_HOSTS` will reject the internal hostname  ⚠ HIGH

`config/settings/base.py:17` is `ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")`
(no default); `.env.example:3` ships `127.0.0.1,localhost`. The moment the
frontend calls `http://app-backend:8000/...`, the `Host` header becomes
`app-backend` and Django returns **400 DisallowedHost** → uncaught `ApiError`
→ 500 again. **`app-backend` must be added to `ALLOWED_HOSTS`** as part of any
internal-URL fix. This is the most likely way the fix fails on first attempt.

> Note: CORS is **not** a factor. `CORS_ALLOWED_ORIGINS` being empty is
> irrelevant to a server-side `fetch` — CORS is browser-enforced, not
> Node-enforced. `ALLOWED_HOSTS` is the real constraint.

### 6.3 Image URLs break if the base URL split is done carelessly  ⚠ HIGH

`apps/blog/views.py:47` instantiates `BlogPostSerializer(blog_post)` **without
`context={"request": request}`**, so the *detail* endpoint emits `cover_image`
as a **relative** path (verified live: `"/media/…"`), while the *list* endpoint
emits an absolute URL. `resolveBlogImage` (`src/hooks/api/blogs.ts:69-81`)
resolves the relative form against `getApiConfig().apiBaseUrl`'s **origin** —
the comment in `resolveEventImage` documents exactly this.

**Therefore:** if `getApiConfig().apiBaseUrl` is switched to the internal URL,
every `<img src>` becomes `http://app-backend:8000/media/…`, which no browser
can reach. The split must be surgical — only `base()` may use the internal URL;
`getApiConfig().apiBaseUrl` stays public. Same applies to `resolveEventImage`
(`src/hooks/api/events.ts:99`) and `src/hooks/api/activities.ts:75`.

### 6.4 `/_next/image` 504 on remote media  ⚠ MEDIUM (broken images, not 500)

The optimizer cannot reach the media host either. Components that render
API-sourced images **without** `unoptimized` will show broken images even after
the API fix:

- `src/components/blog/detail/BlogHero.tsx:12`
- `src/components/blog/detail/SidebarPostCard.tsx:20`
- `src/components/activities/detail/ActivityHero.tsx:12`

(The grid cards — `BlogPostTicketCard`, `EventTicketCard`, `ActivityTicketCard`,
`OtherEventsRow` — already pass `unoptimized` and are unaffected.)

### 6.5 Non-array `results` → TypeError  ⚠ LOW

`page.tsx:70` and `:81` call `.results.map()` with no shape guard. Low
likelihood given a stable DRF contract, but free to defend against.

### 6.6 Draft posts are served publicly  ⚠ LOW (correctness, not 500)

`apps/blog/selectors.py` filters only `is_active=True` — **not**
`status="published"`. Drafts appear in `GET /api/v1/blogs/`. The frontend never
sends `status=published`. Not a 500, but likely unintended.

### 6.7 `?category=` — correctly handled already ✅

**Verified live:** `?category=bogus` → **400**
`{"category":["Select a valid choice. …"]}` (django-filter auto-generates a
`ChoiceFilter` from the model's `choices`). The existing catch at
`page.tsx:48-59` handles this correctly and falls back to unfiltered. No change
needed. Note `events` diverges — it has no `category` field
(`apps/events/filters.py` uses `event_type`), so `?category=` there is silently
ignored rather than 400.

### 6.8 DRF builds image URLs from the request Host  ⚠ HIGH — found while implementing

Not visible until the internal URL is actually in use, and it would have broken
**every image on the site**.

DRF's `FileField.to_representation` returns `request.build_absolute_uri(url)`,
which derives the host from the **incoming request's `Host` header**. Once
Server Components call `http://app-backend:8000/api/v1/blogs/`, the list
endpoint starts returning:

```json
"cover_image": "http://app-backend:8000/media/blogs/TechAic.png"
```

The old resolvers passed absolute URLs straight through
(`if (/^https?:\/\//i.test(image)) return image;`), so that internal hostname
would have been emitted directly into `<img src>` for every visitor.

**Reproduced** with a mock backend that echoes its `Host` header the way DRF
does, then fixed and re-verified — see §8.

---

## 7. What was changed

### Reachable base URL — `src/services/api/config.ts`

`base()` now resolves through `getFetchBaseUrl()`, which prefers a server-only
`API_INTERNAL_BASE_URL` when running outside the browser and otherwise falls
back to the public URL (so dev and non-container deploys are unaffected).
`getApiConfig().apiBaseUrl` deliberately still returns the **public** URL — see
§6.3 and §6.8.

Backend wiring, verified in `Backend-Aic-main/docker-compose.yml`: gunicorn
binds `0.0.0.0:8000` inside `container_name: app-backend` on the `app-network`
bridge. `config/urls.py:19` mounts routes at `api/v1/...` itself — nginx strips
nothing — so the internal base is `http://app-backend:8000/api` and the existing
`` `${baseUrl}/v${major}` `` suffix still composes correctly.

| File | Change |
|---|---|
| `src/services/api/config.ts` | `getFetchBaseUrl()` split; exported `getInternalApiBaseUrl()` |
| `docker-compose.yml` | `API_INTERNAL_BASE_URL` env + joins the backend's external `app-network` |
| `.env.example` | documents both variables and `BACKEND_NETWORK_NAME` |
| `../Backend-Aic-main/.env.example` | `ALLOWED_HOSTS` now includes `app-backend` (see §6.2) |

### Media URLs — `src/services/api/media.ts` (new)

`resolveBlogImage` / `resolveEventImage` / `resolveActivityImage` were three
copies of the same logic; they are now one `resolveMediaUrl()` that additionally
rewrites absolute URLs pointing at the **internal** origin back onto the public
origin (§6.8). Absolute URLs on any other host are left alone.

### Failing fast and degrading — no more bare 500s

| File | Change |
|---|---|
| `src/services/api/client.ts` | `AbortSignal.timeout(6000)` (caller-supplied signal still wins) + new `ApiNetworkError` naming the URL and timeout |
| `src/app/[locale]/blog/page.tsx` | 404 → empty state (§6.1); transport failure → `<ContentUnavailable/>`; `resultsOf()` shape guard |
| `src/app/[locale]/events/page.tsx` | same treatment |
| `src/app/[locale]/{blog,events,activities}/[id]/page.tsx` | transport failure → `<ContentUnavailablePage/>`; real 404 still `notFound()` |
| `src/app/[locale]/events/[id]/page.tsx` | related-events fetch was **unguarded** — now wrapped |
| `src/components/common/ContentUnavailable.tsx` | new fallback component (+ full-page variant) |
| `src/app/[locale]/error.tsx`, `src/app/global-error.tsx` | new boundaries; both surface `error.digest`, which was the missing handle in the original report |
| `messages/{fa,en}.json` | new `ErrorState` namespace, both locales in parity |

Detail routes handle failure in the page body rather than relying on
`error.tsx`, because for an *initial* SSR throw Next serves its bare
`__next_error__` document and only renders the boundary after hydration —
confirmed by probe before the change.

### Image optimizer (§6.4)

`unoptimized` added to `BlogHero`, `SidebarPostCard`, `ActivityHero`,
`SidebarActivityCard`, matching what the grid cards already did.

---

## 8. Verification

### Done locally

`pnpm build` exit 0 · `tsc --noEmit` exit 0 · `eslint .` 0 errors (2 pre-existing
warnings in untouched files).

**Healthy backend** — real content renders, and the previously guaranteed 500s
are gone:

| Route | Before | After |
|---|---|---|
| `/fa/blog` | 500 @ 10.6 s | **200**, 1 card |
| `/en/blog` | 500 | **200**, 1 card |
| `/fa/blog?page=2` (of 1 page) | **500** | **200**, empty state |
| `/fa/blog?page=999` | **500** | **200**, empty state |
| `/fa/blog?category=bogus` | 200 | **200**, unfiltered (unchanged) |
| `/fa/events?page=999` | **500** | **200**, empty state |

**Backend black-holed** (`API_INTERNAL_BASE_URL=http://10.255.255.1:8000/api`,
reproducing the production condition):

| Route | Before | After |
|---|---|---|
| `/fa/blog`, `/en/blog`, `/fa/events` | 500 @ 10.6 s | **200 @ ~6.0 s**, fallback UI, layout intact |
| `/fa/blog/1`, `/fa/events/1`, `/fa/activities/1` | 500 @ 21.1 s | **200 @ ~6.0 s**, fallback UI |

Server log now reads, instead of nothing:
`ApiNetworkError: API request to http://…/v1/blogs/1/ timed out after 6000ms`.

**URL split** — built with `NEXT_PUBLIC_API_BASE_URL=https://public-host.example/api`
against a mock backend on `127.0.0.1:8999` that echoes its `Host` header the way
DRF does. All four routes emitted
`https://public-host.example/media/blogs/TechAic.png`; the internal host appeared
nowhere in the HTML.

### Still to do on the server

1. Confirm the real network name — `docker network ls` — and set
   `BACKEND_NETWORK_NAME` if it is not `backend-aic-main_app-network`.
2. Add `app-backend` to the backend's **real** `.env` `ALLOWED_HOSTS`
   (only `.env.example` was updated here). Without it: 400 DisallowedHost.
3. Rebuild and redeploy the frontend, then:
   ```bash
   docker exec aic-frontend node -e "fetch('http://app-backend:8000/api/v1/blogs/?page_size=1').then(r=>console.log(r.status))"
   ```
   Expect a prompt `200`. `400` means step 2 was missed; a hang means step 1 was.
4. Re-probe `/fa/blog`, `/en/blog`, `/fa/events`, `/fa/blog/1` — expect sub-second 200s.
5. Inspect a rendered `<img src>` — must be `https://kaic.karaj.iau.ir/media/…`,
   never `app-backend`.
6. Consider filtering `status="published"` in `apps/blog/selectors.py` (§6.6) —
   unrelated to the outage, but drafts are currently public.
