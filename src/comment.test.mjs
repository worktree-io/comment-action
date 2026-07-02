import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCommentBody } from "./comment.mjs";

test("buildCommentBody includes the workspace link with owner/repo/issue", () => {
  const body = buildCommentBody({ owner: "worktree-io", repo: "comment-action", issue: 1 });

  assert.match(body, /A workspace is ready for this issue\./);
  assert.match(body, /owner=worktree-io&repo=comment-action&issue=1/);
  assert.match(body, /Open workspace/);
});
