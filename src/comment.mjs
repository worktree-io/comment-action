const BASE_URL = "https://worktree.io"; // eslint-disable-line default/no-hardcoded-urls

/**
 * Builds the platform-agnostic "Open workspace" comment body.
 *
 * @param {{ owner: string, repo: string, issue: string|number }} params
 * @returns {string} markdown comment body
 */
function buildCommentBody({ owner, repo, issue }) {
  const url = `${BASE_URL}/open?owner=${owner}&repo=${repo}&issue=${issue}`;

  return [
    "A workspace is ready for this issue.",
    "",
    `<a href="${url}" target="_blank" rel="noopener noreferrer"><img alt="Open workspace →" src="https://img.shields.io/badge/Open_workspace_%E2%86%92-F05032?style=for-the-badge&logo=git&logoColor=white"></a>`,
    "",
    `<sub>Powered by <a href="${BASE_URL}" target="_blank" rel="noopener noreferrer">Worktree</a> · <a href="${BASE_URL}#install" target="_blank" rel="noopener noreferrer">Install</a></sub>`,
  ].join("\n");
}

export { BASE_URL, buildCommentBody };
