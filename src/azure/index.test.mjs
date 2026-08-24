import { test } from "node:test";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { organizationFromCollectionUri, postWorkItemComment } from "./index.mjs";

test("postWorkItemComment defaults to Bearer auth (System.AccessToken)", async () => {
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
    token: "oauth-token",
    text: "hello",
    fetchImpl,
  });

  assert.equal(
    capturedUrl,
    "https://dev.azure.com/my-org/My%20Project/_apis/wit/workItems/42/comments?api-version=7.1-preview.3", // eslint-disable-line default/no-hardcoded-urls
  );
  assert.equal(capturedInit.method, "POST");
  assert.equal(capturedInit.headers.Authorization, "Bearer oauth-token");
  assert.equal(JSON.parse(capturedInit.body).text, "hello");
});

test("postWorkItemComment uses Basic auth for a PAT when authScheme is 'basic'", async () => {
  let capturedInit;

  const fetchImpl = async (url, init) => {
    capturedInit = init;
    return { ok: true, status: 200, json: async () => ({ id: 1 }) };
  };

  await postWorkItemComment({
    organization: "my-org",
    project: "proj",
    workItemId: 1,
    token: "secret-pat",
    authScheme: "basic",
    text: "hello",
    fetchImpl,
  });

  assert.equal(capturedInit.headers.Authorization, `Basic ${Buffer.from(":secret-pat").toString("base64")}`);
});

test("organizationFromCollectionUri extracts the org name from SYSTEM_COLLECTIONURI", () => {
  assert.equal(organizationFromCollectionUri("https://dev.azure.com/my-org/"), "my-org"); // eslint-disable-line default/no-hardcoded-urls
  assert.equal(organizationFromCollectionUri("https://dev.azure.com/my-org"), "my-org"); // eslint-disable-line default/no-hardcoded-urls
  assert.equal(organizationFromCollectionUri(undefined), undefined);
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
