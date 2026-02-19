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
    `[**Open workspace →**](${url})`,
    "",
    `<sub>Powered by [Worktree](${BASE_URL}) · [Install](${BASE_URL}#install)</sub>`,
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
