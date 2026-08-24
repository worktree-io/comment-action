import { Buffer } from "node:buffer";
import console from "node:console";
import process from "node:process";
import { buildCommentBody } from "../comment.mjs";

class AzureDevOpsCommentError extends Error {}

// See https://learn.microsoft.com/en-us/rest/api/azure/devops/wit/comments/add
const API_VERSION = "7.1-preview.3";

// ponytail: only Bearer (System.AccessToken / OAuth) and Basic (PAT) are supported —
// those are the two auth shapes ADO's REST API actually accepts. Add another if a
// workflow needs it.
function buildAuthHeader({ token, authScheme }) {
  if (authScheme === "bearer") return `Bearer ${token}`;
  return `Basic ${Buffer.from(`:${token}`).toString("base64")}`;
}

/**
 * Posts a comment on an Azure DevOps work item via the Work Item Comments REST API.
 *
 * @param {{ organization: string, project: string, workItemId: string|number, token: string, authScheme?: "bearer"|"basic", text: string, fetchImpl?: typeof fetch }} params
 */
async function postWorkItemComment({ organization, project, workItemId, token, authScheme, text, fetchImpl }) {
  const request = fetchImpl || globalThis.fetch;
  const url = `https://dev.azure.com/${organization}/${encodeURIComponent(project)}/_apis/wit/workItems/${workItemId}/comments?api-version=${API_VERSION}`; // eslint-disable-line default/no-hardcoded-urls

  const response = await request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: buildAuthHeader({ token, authScheme: authScheme || "bearer" }),
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new AzureDevOpsCommentError(`Azure DevOps API error: ${response.status} ${response.statusText} ${detail}`.trim());
  }

  return response.json();
}

// Pulls the organization name out of SYSTEM_COLLECTIONURI (e.g.
// "https://dev.azure.com/my-org/"), the standard pipeline-provided variable —
// avoids requiring users to configure it separately.
function organizationFromCollectionUri(collectionUri) {
  if (!collectionUri) return undefined;
  const match = collectionUri.match(/^https?:\/\/[^/]+\/([^/]+)\/?/);
  return match?.[1];
}

// ponytail: trigger wiring (service hook vs pipeline step) is an open design
// question from the issue, left for follow-up. This adapter assumes it is run
// with the env vars below already populated by whatever triggers it and only
// guards on their presence.
async function run() {
  const organization = process.env.AZURE_DEVOPS_ORG || organizationFromCollectionUri(process.env.SYSTEM_COLLECTIONURI);
  const project = process.env.SYSTEM_TEAMPROJECT;
  const repo = process.env.BUILD_REPOSITORY_NAME || project;
  const workItemId = process.env.WORKITEM_ID;

  // Prefer the pipeline-provided OAuth token (System.AccessToken) over a manually
  // configured PAT — see README's Azure DevOps section for the pipeline setting
  // required to expose it.
  const systemAccessToken = process.env.SYSTEM_ACCESSTOKEN;
  const token = systemAccessToken || process.env.AZURE_DEVOPS_TOKEN;
  const authScheme = systemAccessToken ? "bearer" : "basic";

  if (!organization || !project || !workItemId || !token) {
    console.log("Skipping: missing required Azure DevOps environment variables.");
    return;
  }

  const body = buildCommentBody({ owner: organization, repo, issue: workItemId });

  await postWorkItemComment({ organization, project, workItemId, token, authScheme, text: body });

  console.log(`Posted workspace link for work item #${workItemId}`);
}

export { AzureDevOpsCommentError, organizationFromCollectionUri, postWorkItemComment, run };
