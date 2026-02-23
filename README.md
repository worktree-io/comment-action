# Worktree comment action

Posts an **Open workspace** link as a comment whenever a new issue (GitHub) or work item (Azure DevOps) is created. Clicking the link opens a local workspace in your editor via the [Worktree](https://worktree.io) desktop app.

## GitHub Actions

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

### Inputs

| Input   | Required | Default          | Description                            |
| ------- | -------- | ---------------- | -------------------------------------- |
| `token` | No       | `github.token`   | GitHub token used to post the comment. |

The built-in `GITHUB_TOKEN` is used by default. You only need to supply your own token if you want to post as a different user or bot account.

### Permissions

The workflow needs `issues: write` to post comments. No other permissions are required.

## Azure DevOps

Azure Pipelines has no native "work item created" trigger, so a **service hook** is used to fire the pipeline:

```
Work item created
  → ADO Service Hook ("Azure Pipelines" type, triggers pipeline)
    → pipeline runs azure-pipelines.yml
      → WorktreeComment task posts comment via ADO Comments REST API
```

### Setup

1. Add `task.json` (included in this repo) to your ADO extension or reference the task directly.
2. Configure an **Azure Pipelines** service hook in your ADO project settings:
   - Event: *Work item created*
   - Action: *Trigger a pipeline run*
   - Pass the work item ID as pipeline variable `WORK_ITEM_ID`
3. Add a pipeline file:

```yaml
# azure-pipelines.yml
trigger: none  # triggered by service hook

steps:
  - task: WorktreeComment@1
    inputs:
      workItemId: $(WORK_ITEM_ID)
    env:
      SYSTEM_ACCESSTOKEN: $(System.AccessToken)
```

### Inputs

| Input        | Required | Default                  | Description                                           |
| ------------ | -------- | ------------------------ | ----------------------------------------------------- |
| `token`      | No       | `$(System.AccessToken)`  | ADO token used to post the comment.                   |
| `workItemId` | Yes      | `$(WORK_ITEM_ID)`        | ID of the work item forwarded by the service hook.    |

The built-in `System.AccessToken` is used by default. Enable it per-step with `env: SYSTEM_ACCESSTOKEN: $(System.AccessToken)`.

## Requirements

Clicking **Open workspace** requires the [Worktree](https://worktree.io) app to be installed locally. See [worktree.io#install](https://worktree.io#install) for setup instructions.
