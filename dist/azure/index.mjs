/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/comment.mjs
const BASE_URL = "https://worktree.io"; // eslint-disable-line default/no-hardcoded-urls

function buildCommentBody({ owner, repo, issue }) {
  const url = `${BASE_URL}/open?owner=${owner}&repo=${repo}&issue=${issue}`;

  return [
    "A workspace is ready for this issue.",
    "",
    `[![Open workspace →](https://img.shields.io/badge/Open_workspace_%E2%86%92-F05032?style=for-the-badge&logo=git&logoColor=white)](${url})`,
    "",
    `<sub>Powered by [Worktree](${BASE_URL}) · [Install](${BASE_URL}#install)</sub>`,
  ].join("\n");
}

;// CONCATENATED MODULE: ./src/azure/index.mjs


function extractOrgName(collectionUri) {
  const url = new URL(collectionUri);
  if (url.hostname === "dev.azure.com") {
    return url.pathname.split("/").filter(Boolean)[0];
  }
  // Legacy: {org}.visualstudio.com
  return url.hostname.split(".")[0];
}

async function run() {
  const token = process.env.INPUT_TOKEN || process.env.SYSTEM_ACCESSTOKEN;
  const collectionUri = process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI;
  const project = process.env.SYSTEM_TEAMPROJECT;
  const repo = process.env.BUILD_REPOSITORY_NAME;
  const workItemId = process.env.INPUT_WORKITEMID;

  if (!workItemId) {
    console.error("Missing required input: workItemId");
    process.exit(1);
  }

  const owner = extractOrgName(collectionUri);
  const body = buildCommentBody({ owner, repo, issue: workItemId });

  const apiUrl = `${collectionUri}${project}/_apis/wit/workItems/${workItemId}/comments?api-version=7.1`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: body }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Failed to post comment: ${response.status} ${text}`);
    process.exit(1);
  }

  console.log(`Posted workspace link for work item #${workItemId}`);
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

