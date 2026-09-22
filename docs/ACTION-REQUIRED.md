# `/fa/blog` 500 — What Needs Fixing

**Site:** https://kaic.karaj.iau.ir
**Reported:** `GET /fa/blog` returns 500 on every request
**Status:** Cause confirmed. Frontend code is fixed. **Server-side config changes are still required — the fix does not work without them.**

---

## The problem in one line

The frontend container cannot reach `https://kaic.karaj.iau.ir`, so every server-rendered page times out after ~10s and returns 500. The backend API itself is healthy.

Only routes that fetch **on the server** break (`/blog`, `/events`, detail pages). `/fa` and `/fa/activities` work because they fetch in the browser instead — which is why the outage looked random.

**Cause:** `NEXT_PUBLIC_API_BASE_URL=https://kaic.karaj.iau.ir/api` is used by both the browser and the server. It is correct for the browser. From inside the container it is unroutable — resolving that hostname returns the host's own public IP, so the connection has to hairpin back through nginx and instead hangs until it times out.

---

## A. Required — server / infrastructure

Nothing below is optional. The frontend changes are inert until these are done.

### A1. Add the backend container name to `ALLOWED_HOSTS`

The frontend will now call the backend directly at `http://app-backend:8000/api`, which sets `Host: app-backend`. Django rejects unknown hosts with **400 DisallowedHost**.

In the backend's **real** `.env` (not `.env.example`):

```bash
ALLOWED_HOSTS=kaic.karaj.iau.ir,app-backend,127.0.0.1,localhost
```

> Keep every value that is already there and add `app-backend`. Removing the public hostname will break the site for visitors.

Then: `docker compose up -d backend`

**Skipping this trades the timeout for a 400.** It is the most likely reason a first attempt fails.

### A2. Confirm the docker network name

The frontend now joins the network the backend already created. Compose prefixes network names with its project name, so the real name may differ from the assumed default.

```bash
docker network ls | grep app-network
```

- If it prints `backend-aic-main_app-network` → nothing to do.
- If it prints anything else → set it in the frontend's `.env`:

```bash
BACKEND_NETWORK_NAME=<the name docker printed>
```

### A3. Rebuild and redeploy the frontend

```bash
docker compose up -d --build web
```

The new `docker-compose.yml` adds `API_INTERNAL_BASE_URL` and joins `app-network`. `NEXT_PUBLIC_API_BASE_URL` is unchanged and must stay pointing at the public URL.

---

## B. Verification — run these in order

**1. Can the frontend container reach the backend?**

```bash
docker exec aic-frontend node -e "fetch('http://app-backend:8000/api/v1/blogs/?page_size=1').then(r=>console.log(r.status))"
```

| Result | Meaning |
|---|---|
| `200` promptly | Correct — continue |
| `400` | A1 was missed or `ALLOWED_HOSTS` was not reloaded |
| Hangs | A2 was missed — the containers are not on the same network |

**2. The previously broken routes**

```bash
for p in /fa/blog /en/blog /fa/events /fa/blog/1; do
  curl -s -o /dev/null -w "%{http_code}  %{time_total}s  $p\n" "https://kaic.karaj.iau.ir$p"
done
```

Expect `200` in well under a second. Before the fix these were `500` at 10.6s (21.1s for `/fa/blog/1`).

**3. Images still point at the public host**

Open `/fa/blog` and inspect any post image. The `src` must be `https://kaic.karaj.iau.ir/media/...` — **never** `app-backend`. If you see `app-backend`, stop and report it.

**4. Out-of-range page no longer 500s**

```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://kaic.karaj.iau.ir/fa/blog?page=999"
```

Expect `200` (empty state). This returned `500` before — see C2.

---

## C. Already fixed in the frontend — no action needed

Listed so you know what changed and why.

| # | Issue | Fix |
|---|---|---|
| C1 | One env var used for both browser and server fetches | Server-only `API_INTERNAL_BASE_URL`; public URL untouched for the browser |
| C2 | **`/fa/blog?page=2` returned 500** — an out-of-range page makes the API return 404, which was uncaught. With 1 post and 6 per page, page 2 is already out of range | 404 → empty state |
| C3 | No timeout on API calls — a dead backend blocked the render for 10–21s | 6s timeout; errors now name the URL and duration in the logs |
| C4 | No error boundary anywhere in the app — any failure became a bare 500 with no UI and no error ID | Boundaries added; the error `digest` is now shown on screen so it can be matched to server logs |
| C5 | Unreachable API took the whole page down | Blog/events/detail pages render a "content unavailable" section, keeping nav, heading and footer |
| C6 | Detail-page images routed through Next's image optimizer, which also cannot reach the media host (verified: **504**) | Those images now load directly in the browser |
| C7 | Once the server calls the internal address, Django builds image URLs from that address — every image on the site would have broken | Image URLs are rewritten back onto the public origin |
| C8 | Related-events fetch on `/events/[id]` was completely unguarded | Wrapped |

Verified locally: `build`, `tsc --noEmit` and `eslint` all pass. With the backend deliberately black-holed, every affected route returns **200 with a fallback in ~6s** instead of 500.

---

## D. Optional — backend issues found along the way

Neither caused the outage. Both are real.

### D1. Draft posts are publicly visible

`apps/blog/selectors.py` filters only `is_active=True`, not `status="published"`. Drafts are returned by `GET /api/v1/blogs/`. Same pattern in the activities and events apps.

### D2. Detail endpoints return relative image paths

`apps/blog/views.py:47` builds the serializer without request context:

```python
serializer = BlogPostSerializer(blog_post)          # no context={"request": request}
```

So list responses return absolute image URLs while detail responses return relative ones. The frontend handles both, so this is a consistency issue rather than a bug. Same in the activities and events detail views.

---

## E. If something goes wrong

Revert `docker-compose.yml` and redeploy. With `API_INTERNAL_BASE_URL` unset the code falls back to the public URL — i.e. exactly the current behaviour. The `ALLOWED_HOSTS` addition is harmless to leave in place.

---

## Notes on how this was diagnosed

No server access, no logs, and no digest lookup were available, so this was established from source plus read-only probes of the live site. The decisive evidence was `/_next/image` returning **504** when asked to fetch a `kaic.karaj.iau.ir` media URL — that is Next.js's own image optimizer, with no application code involved, proving the container cannot make outbound connections to that hostname.

The frontend directory is not a git repository, so no commit history was available to check for a regression.
