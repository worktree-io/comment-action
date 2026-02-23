const BASE_URL = "https://worktree.io"; // eslint-disable-line default/no-hardcoded-urls

export function buildCommentBody({ owner, repo, issue }) {
  const url = `${BASE_URL}/open?owner=${owner}&repo=${repo}&issue=${issue}`;

  return [
    "A workspace is ready for this issue.",
    "",
    `[![Open workspace →](https://img.shields.io/badge/Open_workspace_%E2%86%92-F05032?style=for-the-badge&logo=git&logoColor=white)](${url})`,
    "",
    `<sub>Powered by [Worktree](${BASE_URL}) · [Install](${BASE_URL}#install)</sub>`,
  ].join("\n");
}
