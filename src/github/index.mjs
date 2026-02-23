import core from "@actions/core";
import github from "@actions/github";
import { buildCommentBody } from "../comment.mjs";

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
  const body = buildCommentBody({ owner, repo, issue: issue_number });

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number,
    body,
  });

  core.info(`Posted workspace link for issue #${issue_number}`);
}

run().catch(core.setFailed);
