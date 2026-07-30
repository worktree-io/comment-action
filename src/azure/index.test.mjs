import { test } from "node:test";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { postWorkItemComment } from "./index.mjs";

test("postWorkItemComment posts to the Work Item Comments REST API with Basic auth", async () => {
  let capturedUrl;
  let capturedInit;

  const fetchImpl = async (url, init) => {
    capturedUrl = url;
    capturedInit = init;
    return { ok: true, status: 200, json: async () => ({ id: 1 }) };
  };

  await postWorkItemComment({
    organization: "my-org",
    project: "My Project",
    workItemId: 42,
    token: "secret-pat",
    text: "hello",
    fetchImpl,
  });

  assert.equal(
    capturedUrl,
    "https://dev.azure.com/my-org/My%20Project/_apis/wit/workItems/42/comments?api-version=7.1-preview.3", // eslint-disable-line default/no-hardcoded-urls
  );
  assert.equal(capturedInit.method, "POST");
  assert.equal(capturedInit.headers.Authorization, `Basic ${Buffer.from(":secret-pat").toString("base64")}`);
  assert.equal(JSON.parse(capturedInit.body).text, "hello");
});

test("postWorkItemComment throws on a non-ok response", async () => {
  const fetchImpl = async () => ({ ok: false, status: 401, statusText: "Unauthorized", text: async () => "nope" });

  await assert.rejects(
    postWorkItemComment({
      organization: "my-org",
      project: "proj",
      workItemId: 1,
      token: "bad",
      text: "hello",
      fetchImpl,
    }),
    /Azure DevOps API error: 401/,
  );
});
