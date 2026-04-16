import core from "@actions/core";
import github from "@actions/github";

const BASE_URL = "https://worktree.io"; // eslint-disable-line default/no-hardcoded-urls

async function run() {
  const token = core.getInput("token");
  const octokit = github.getOctokit(token);
  const { context } = github;

  if (context.eventName !== "issues" || context.payload.action !== "opened") {
    core.info("Skipping: not an issue opened event.");
    return;
  }

  const { owner, repo } = context.repo;
  const issue_number = context.payload.issue.number;
  const url = `${BASE_URL}/open?owner=${owner}&repo=${repo}&issue=${issue_number}`;

  const body = [
    "A workspace is ready for this issue.",
    "",
    `<a href="${url}" target="_blank" rel="noopener noreferrer"><img alt="Open workspace →" src="https://img.shields.io/badge/Open_workspace_%E2%86%92-F05032?style=for-the-badge&logo=git&logoColor=white"></a>`,
    "",
    `<sub>Powered by <a href="${BASE_URL}" target="_blank" rel="noopener noreferrer">Worktree</a> · <a href="${BASE_URL}#install" target="_blank" rel="noopener noreferrer">Install</a></sub>`,
  ].join("\n");

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number,
    body,
  });

  core.info(`Posted workspace link for issue #${issue_number}`);
}

run().catch(core.setFailed);
