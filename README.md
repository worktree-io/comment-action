# Worktree comment action

Posts an **Open workspace** link as a comment whenever a new issue is opened in your repository. Clicking the link opens a local workspace in your editor via the [Worktree](https://worktree.io) desktop app.

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
