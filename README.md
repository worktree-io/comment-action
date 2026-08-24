# Worktree comment action

Posts an **Open workspace** link as a comment whenever a new issue is opened in your repository. Clicking the link opens a local workspace in your editor via the [Worktree](https://worktree.io) desktop app — in a new browser tab, so you don't lose the issue you were reading.

## Usage

Add a workflow file to your repository:

```yaml
# .github/workflows/worktree.yml
name: Worktree

on:
  issues:
    types: [opened]

jobs:
  comment:
    runs-on: ubuntu-latest
    permissions:
      issues: write
    steps:
      - uses: worktree-io/comment-action@v1
```

That's it. Every new issue will receive a comment like this:

> A workspace is ready for this issue.
>
> [**Open workspace →**](https://worktree.io)

## Inputs

| Input   | Required | Default          | Description                            |
| ------- | -------- | ---------------- | -------------------------------------- |
| `token` | No       | `github.token`   | GitHub token used to post the comment. |

The built-in `GITHUB_TOKEN` is used by default. You only need to supply your own token if you want to post as a different user or bot account.

## Permissions

The workflow needs `issues: write` to post comments. No other permissions are required.

## Requirements

Clicking **Open workspace** requires the [Worktree](https://worktree.io) app to be installed locally. See [worktree.io#install](https://worktree.io#install) for setup instructions.

## Azure DevOps

Azure Pipelines doesn't have a GitHub-Actions-style marketplace step here, so run the adapter as a pipeline script instead. Clone this repo (or install it as a dependency) and add a step like:

```yaml
# azure-pipelines.yml
steps:
  - checkout: self
  - script: node path/to/comment-action/src/azure/index.mjs
    env:
      SYSTEM_ACCESSTOKEN: $(System.AccessToken)
    displayName: Post workspace link
```

You must explicitly map `System.AccessToken` into the environment as shown above — Azure Pipelines does not expose it to scripts otherwise. Also make sure the pipeline setting **"Allow scripts to access the OAuth token"** is enabled (Pipeline → Edit → triggers/options), and that the pipeline's build service account has permission to comment on work items in the project.

The adapter reads:

| Env var                | Source                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `SYSTEM_ACCESSTOKEN`   | `$(System.AccessToken)` — the pipeline's OAuth token (preferred). |
| `AZURE_DEVOPS_TOKEN`   | A manually configured PAT, used only if `SYSTEM_ACCESSTOKEN` is not set. |
| `SYSTEM_COLLECTIONURI` | Standard pipeline variable; the organization name is parsed from it. Override with `AZURE_DEVOPS_ORG` if needed. |
| `SYSTEM_TEAMPROJECT`   | Standard pipeline variable for the project name.                  |
| `BUILD_REPOSITORY_NAME`| Standard pipeline variable for the repo name.                     |
| `WORKITEM_ID`          | The work item to comment on — set this from whatever trigger (service hook or pipeline trigger) fires on work item creation. |

If any of these are missing, the adapter logs and exits without posting, so it's safe to wire into pipelines that also run for other events.
