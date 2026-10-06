import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";

describe("api client soft result", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  it("apiResult returns data on 200", async () => {
    mock.method(globalThis, "fetch", async () => {
      return new Response(JSON.stringify({ results: [{ id: 1 }], count: 1 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    const { apiResult } = await import("./client");
    const result = await apiResult<{ results: { id: number }[]; count: number }>(
      "https://example.test/api/v1/events/",
      { cache: "no-store" },
    );

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.count, 1);
      assert.equal(result.data.results[0]?.id, 1);
    }
  });

  it("apiSoft returns null on timeout without throwing", async () => {
    mock.method(globalThis, "fetch", async () => {
      await new Promise(() => {});
      return new Response();
    });

    const { apiSoft } = await import("./client");
    const data = await apiSoft("https://example.test/api/v1/events/", {
      timeoutMs: 50,
      retries: 0,
      cache: "no-store",
    });

    assert.equal(data, null);
  });

  it("apiResult marks HTTP 404 as notFound", async () => {
    mock.method(globalThis, "fetch", async () => {
      return new Response(JSON.stringify({ detail: "missing" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    });

    const { apiResult } = await import("./client");
    const result = await apiResult("https://example.test/api/v1/events/9/", {
      cache: "no-store",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.notFound, true);
    }
  });

  it("api does not throw through soft path when using apiSoft on network fail", async () => {
    mock.method(globalThis, "fetch", async () => {
      throw new TypeError("fetch failed");
    });

    const { apiSoft } = await import("./client");
    await assert.doesNotReject(async () => {
      const data = await apiSoft("https://example.test/api/v1/blogs/", {
        retries: 0,
        cache: "no-store",
      });
      assert.equal(data, null);
    });
  });

  it("apiResult retries once after network failure then succeeds", async () => {
    let calls = 0;
    mock.method(globalThis, "fetch", async () => {
      calls += 1;
      if (calls === 1) throw new TypeError("fetch failed");
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    const { apiResult } = await import("./client");
    const result = await apiResult<{ ok: boolean }>(
      "https://example.test/api/v1/events/",
      { cache: "no-store", retries: 1 },
    );

    assert.equal(calls, 2);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.data.ok, true);
  });

  it("apiResult does not retry HTTP 500", async () => {
    let calls = 0;
    mock.method(globalThis, "fetch", async () => {
      calls += 1;
      return new Response(JSON.stringify({ detail: "boom" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    });

    const { apiResult } = await import("./client");
    const result = await apiResult("https://example.test/api/v1/events/", {
      cache: "no-store",
      retries: 2,
    });

    assert.equal(calls, 1);
    assert.equal(result.ok, false);
  });
});
