import { Buffer } from "node:buffer";
import console from "node:console";
import process from "node:process";
import { buildCommentBody } from "../comment.mjs";

class AzureDevOpsCommentError extends Error {}

// ponytail: PAT auth only (Basic auth, empty username). Service-connection auth
// is a bigger surface (OAuth/token exchange) with no clear consumer yet — add if
// a workflow actually needs it. See https://learn.microsoft.com/en-us/rest/api/azure/devops/wit/comments/add
const API_VERSION = "7.1-preview.3";

/**
 * Posts a comment on an Azure DevOps work item via the Work Item Comments REST API.
 *
 * @param {{ organization: string, project: string, workItemId: string|number, token: string, text: string, fetchImpl?: typeof fetch }} params
 */
async function postWorkItemComment({ organization, project, workItemId, token, text, fetchImpl }) {
  const request = fetchImpl || globalThis.fetch;
  const url = `https://dev.azure.com/${organization}/${encodeURIComponent(project)}/_apis/wit/workItems/${workItemId}/comments?api-version=${API_VERSION}`; // eslint-disable-line default/no-hardcoded-urls
  const auth = Buffer.from(`:${token}`).toString("base64");

  const response = await request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new AzureDevOpsCommentError(`Azure DevOps API error: ${response.status} ${response.statusText} ${detail}`.trim());
  }

  return response.json();
}

// ponytail: trigger wiring (service hook vs pipeline step) is an open design
// question from the issue, left for follow-up. This adapter assumes it is run
// with the env vars below already populated by whatever triggers it and only
// guards on their presence.
async function run() {
  const organization = process.env.AZURE_DEVOPS_ORG;
  const project = process.env.SYSTEM_TEAMPROJECT;
  const repo = process.env.BUILD_REPOSITORY_NAME || project;
  const workItemId = process.env.WORKITEM_ID;
  const token = process.env.AZURE_DEVOPS_TOKEN;

  if (!organization || !project || !workItemId || !token) {
    console.log("Skipping: missing required Azure DevOps environment variables.");
    return;
  }

  const body = buildCommentBody({ owner: organization, repo, issue: workItemId });

  await postWorkItemComment({ organization, project, workItemId, token, text: body });

  console.log(`Posted workspace link for work item #${workItemId}`);
}

export { AzureDevOpsCommentError, postWorkItemComment, run };
