const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../src/core.js");

test("adds the filter terms to GitHub's default query", () => {
  assert.equal(core.toggleQuery("is:pr state:open"), "is:pr state:open draft:false -review:approved -reviewed-by:@me");
});

test("starts from the default query when there is none", () => {
  assert.equal(core.toggleQuery(null), "is:pr state:open draft:false -review:approved -reviewed-by:@me");
});

test("keeps the user's own qualifiers and state", () => {
  assert.equal(
    core.toggleQuery("is:open label:bug"),
    "is:pr is:open label:bug draft:false -review:approved -reviewed-by:@me",
  );
});

test("only adds the terms that are missing", () => {
  assert.equal(core.toggleQuery("is:pr state:open draft:false"), "is:pr state:open draft:false -review:approved -reviewed-by:@me");
});

test("removes the terms again when the filter is active", () => {
  const on = core.toggleQuery("is:pr state:open label:bug");
  assert.ok(core.isActive(on));
  assert.equal(core.toggleQuery(on), "is:pr state:open label:bug");
});

test("is not active with only some of the terms", () => {
  assert.equal(core.isActive("is:pr draft:false"), false);
  assert.equal(core.isActive(""), false);
});

test("recognises pull request list paths", () => {
  assert.ok(core.isPullListPath("/owner/repo/pulls"));
  assert.ok(core.isPullListPath("/pulls"));
  assert.equal(core.isPullListPath("/owner/repo/pull/12"), false);
  assert.equal(core.isPullListPath("/owner/repo/issues"), false);
});
