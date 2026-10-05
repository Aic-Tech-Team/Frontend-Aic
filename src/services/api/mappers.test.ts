import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapApiEvent } from "./events";
import { mapApiActivity } from "./activities";
import { mapApiBlogPost } from "./blogs";
import { mapTeamRows } from "./teams";

describe("content mappers", () => {
  it("mapApiEvent maps status finished → past", () => {
    const mapped = mapApiEvent({
      id: 7,
      title: "Demo",
      event_type: "workshop",
      event_date: "2026-01-01T10:00:00Z",
      status: "finished",
      short_description: "hi",
      location: "Hall",
    });

    assert.equal(mapped.id, "7");
    assert.equal(mapped.status, "past");
    assert.equal(mapped.category, "workshop");
  });

  it("mapApiActivity falls back summary from description", () => {
    const mapped = mapApiActivity({
      id: "a1",
      title: "Act",
      description: "Long text about the activity",
    });

    assert.equal(mapped.id, "a1");
    assert.match(mapped.summary, /Long text/);
  });

  it("mapApiBlogPost uses published_at label", () => {
    const mapped = mapApiBlogPost({
      id: 3,
      title: "Post",
      summary: "sum",
      published_at: "2026-02-02T00:00:00Z",
    });

    assert.equal(mapped.id, "3");
    assert.ok(mapped.publishedLabel.length > 0);
  });

  it("mapTeamRows sorts by display_order", () => {
    const teams = mapTeamRows([
      { id: 2, name: "B", display_order: 2 },
      { id: 1, name: "A", display_order: 1 },
    ]);

    assert.deepEqual(
      teams.map((t) => t.name),
      ["A", "B"],
    );
  });
});
