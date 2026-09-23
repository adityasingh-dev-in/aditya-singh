import { Octokit } from '@octokit/rest'

const octokit = new Octokit({ auth: process.env.GITHUB_PAT })
const OWNER = process.env.GITHUB_OWNER!
const REPO = process.env.GITHUB_REPO!
const BRANCH = process.env.GITHUB_BRANCH ?? 'main'

interface CommitPostInput {
  slug: string
  content: string
  message: string
}

/**
 * Atomic commit via the Git Data API.
 * Flow: getRef → getCommit (base tree) → createBlob → createTree → createCommit → updateRef
 * This is a single atomic commit — no 409 SHA conflicts from sequential single-file calls.
 */
export async function commitPostToGitHub({
  slug,
  content,
  message,
}: CommitPostInput): Promise<{ commitSha: string }> {
  // 1. Get HEAD reference
  const refRes = await octokit.rest.git.getRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
  })
  const latestCommitSha = refRes.data.object.sha

  // 2. Fetch base tree SHA from latest commit
  const commitRes = await octokit.rest.git.getCommit({
    owner: OWNER,
    repo: REPO,
    commit_sha: latestCommitSha,
  })
  const baseTreeSha = commitRes.data.tree.sha

  // 3. Create blob for the MDX file content
  const blobRes = await octokit.rest.git.createBlob({
    owner: OWNER,
    repo: REPO,
    content: Buffer.from(content).toString('base64'),
    encoding: 'base64',
  })

  // 4. Create tree referencing the new blob at the correct path
  const treeRes = await octokit.rest.git.createTree({
    owner: OWNER,
    repo: REPO,
    base_tree: baseTreeSha,
    tree: [
      {
        path: `content/posts/${slug}.mdx`,
        mode: '100644',
        type: 'blob',
        sha: blobRes.data.sha,
      },
    ],
  })

  // 5. Create the new commit
  const newCommitRes = await octokit.rest.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message,
    tree: treeRes.data.sha,
    parents: [latestCommitSha],
  })

  // 6. Advance the branch ref — force: false to reject non-fast-forward
  await octokit.rest.git.updateRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
    sha: newCommitRes.data.sha,
    force: false,
  })

  return { commitSha: newCommitRes.data.sha }
}

/**
 * Fetch existing MDX file content from GitHub (for the edit flow).
 * Returns the raw string content, or null if the file doesn't exist.
 */
export async function getPostFromGitHub(slug: string): Promise<string | null> {
  try {
    const res = await octokit.rest.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: `content/posts/${slug}.mdx`,
      ref: BRANCH,
    })
    if (Array.isArray(res.data) || res.data.type !== 'file') return null
    return Buffer.from(res.data.content, 'base64').toString('utf-8')
  } catch {
    return null
  }
}
