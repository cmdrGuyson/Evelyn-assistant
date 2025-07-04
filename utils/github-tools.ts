import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Octokit } from "@octokit/rest";
import { config } from "./config";

// Initialize Octokit client
const octokit = new Octokit({
  auth: config.GITHUB_TOKEN
});

// Tool to list repositories
export const listRepositories = createTool({
  id: "list_github_repositories",
  inputSchema: z.object({
    type: z.enum(["all", "owner", "public", "private", "member"]).optional().default("all"),
    sort: z.enum(["created", "updated", "pushed", "full_name"]).optional().default("updated"),
    direction: z.enum(["asc", "desc"]).optional().default("desc"),
    per_page: z.number().optional().default(30),
    page: z.number().optional().default(1)
  }),
  description: "List GitHub repositories for the authenticated user or organization",
  execute: async ({ context }) => {
    try {
      const response = await octokit.repos.listForAuthenticatedUser({
        type: context.type,
        sort: context.sort,
        direction: context.direction,
        per_page: context.per_page,
        page: context.page
      });

      return {
        repositories: response.data.map((repo) => ({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          private: repo.private,
          html_url: repo.html_url,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count
        })),
        total_count: response.data.length
      };
    } catch (error) {
      throw new Error(`Failed to list repositories: ${error}`);
    }
  }
});

// Tool to get repository details
export const getRepository = createTool({
  id: "get_github_repository",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string()
  }),
  description: "Get detailed information about a specific GitHub repository",
  execute: async ({ context }) => {
    try {
      const response = await octokit.repos.get({
        owner: context.owner,
        repo: context.repo
      });

      return {
        id: response.data.id,
        name: response.data.name,
        full_name: response.data.full_name,
        description: response.data.description,
        private: response.data.private,
        html_url: response.data.html_url,
        clone_url: response.data.clone_url,
        ssh_url: response.data.ssh_url,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
        pushed_at: response.data.pushed_at,
        language: response.data.language,
        stargazers_count: response.data.stargazers_count,
        forks_count: response.data.forks_count,
        open_issues_count: response.data.open_issues_count,
        default_branch: response.data.default_branch,
        topics: response.data.topics
      };
    } catch (error) {
      throw new Error(`Failed to get repository: ${error}`);
    }
  }
});

// Tool to list issues
export const listIssues = createTool({
  id: "list_github_issues",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    state: z.enum(["open", "closed", "all"]).optional().default("open"),
    assignee: z.string().optional(),
    creator: z.string().optional(),
    mentioned: z.string().optional(),
    labels: z.string().optional(),
    sort: z.enum(["created", "updated", "comments"]).optional().default("created"),
    direction: z.enum(["asc", "desc"]).optional().default("desc"),
    per_page: z.number().optional().default(30),
    page: z.number().optional().default(1)
  }),
  description: "List issues for a GitHub repository",
  execute: async ({ context }) => {
    try {
      const response = await octokit.issues.listForRepo({
        owner: context.owner,
        repo: context.repo,
        state: context.state,
        assignee: context.assignee,
        creator: context.creator,
        mentioned: context.mentioned,
        labels: context.labels,
        sort: context.sort,
        direction: context.direction,
        per_page: context.per_page,
        page: context.page
      });

      return {
        issues: response.data.map((issue) => ({
          id: issue.id,
          number: issue.number,
          title: issue.title,
          body: issue.body,
          state: issue.state,
          html_url: issue.html_url,
          created_at: issue.created_at,
          updated_at: issue.updated_at,
          closed_at: issue.closed_at,
          user: issue.user?.login,
          assignees: issue.assignees?.map((a) => a.login),
          labels: issue.labels?.map((l) => (typeof l === "string" ? l : l.name)),
          comments: issue.comments
        })),
        total_count: response.data.length
      };
    } catch (error) {
      throw new Error(`Failed to list issues: ${error}`);
    }
  }
});

// Tool to create an issue
export const createIssue = createTool({
  id: "create_github_issue",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    title: z.string(),
    body: z.string().optional(),
    assignees: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional()
  }),
  description: "Create a new issue in a GitHub repository",
  execute: async ({ context }) => {
    try {
      const response = await octokit.issues.create({
        owner: context.owner,
        repo: context.repo,
        title: context.title,
        body: context.body,
        assignees: context.assignees,
        labels: context.labels
      });

      return {
        id: response.data.id,
        number: response.data.number,
        title: response.data.title,
        body: response.data.body,
        state: response.data.state,
        html_url: response.data.html_url,
        created_at: response.data.created_at,
        user: response.data.user?.login,
        assignees: response.data.assignees?.map((a) => a.login),
        labels: response.data.labels?.map((l) => (typeof l === "string" ? l : (l as any).name))
      };
    } catch (error) {
      throw new Error(`Failed to create issue: ${error}`);
    }
  }
});

// Tool to update an issue
export const updateIssue = createTool({
  id: "update_github_issue",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    issue_number: z.number(),
    title: z.string().optional(),
    body: z.string().optional(),
    state: z.enum(["open", "closed"]).optional(),
    assignees: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional()
  }),
  description: "Update an existing issue in a GitHub repository",
  execute: async ({ context }) => {
    try {
      const response = await octokit.issues.update({
        owner: context.owner,
        repo: context.repo,
        issue_number: context.issue_number,
        title: context.title,
        body: context.body,
        state: context.state,
        assignees: context.assignees,
        labels: context.labels
      });

      return {
        id: response.data.id,
        number: response.data.number,
        title: response.data.title,
        body: response.data.body,
        state: response.data.state,
        html_url: response.data.html_url,
        updated_at: response.data.updated_at,
        user: response.data.user?.login,
        assignees: response.data.assignees?.map((a) => a.login),
        labels: response.data.labels?.map((l) => (typeof l === "string" ? l : (l as any).name))
      };
    } catch (error) {
      throw new Error(`Failed to update issue: ${error}`);
    }
  }
});

// Tool to list pull requests
export const listPullRequests = createTool({
  id: "list_github_pull_requests",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    state: z.enum(["open", "closed", "all"]).optional().default("open"),
    head: z.string().optional(),
    base: z.string().optional(),
    sort: z.enum(["created", "updated", "popularity", "long-running"]).optional().default("created"),
    direction: z.enum(["asc", "desc"]).optional().default("desc"),
    per_page: z.number().optional().default(30),
    page: z.number().optional().default(1)
  }),
  description: "List pull requests for a GitHub repository",
  execute: async ({ context }) => {
    try {
      const response = await octokit.pulls.list({
        owner: context.owner,
        repo: context.repo,
        state: context.state,
        head: context.head,
        base: context.base,
        sort: context.sort,
        direction: context.direction,
        per_page: context.per_page,
        page: context.page
      });

      return {
        pull_requests: response.data.map((pr) => ({
          id: pr.id,
          number: pr.number,
          title: pr.title,
          body: pr.body,
          state: pr.state,
          html_url: pr.html_url,
          created_at: pr.created_at,
          updated_at: pr.updated_at,
          closed_at: pr.closed_at,
          merged_at: pr.merged_at,
          user: pr.user?.login,
          assignees: pr.assignees?.map((a) => a.login),
          labels: pr.labels?.map((l) => (l as any).name),
          head: pr.head.ref,
          base: pr.base.ref,
          draft: pr.draft,
          mergeable: (pr as any).mergeable,
          comments: (pr as any).comments,
          review_comments: (pr as any).review_comments,
          commits: (pr as any).commits,
          additions: (pr as any).additions,
          deletions: (pr as any).deletions,
          changed_files: (pr as any).changed_files
        })),
        total_count: response.data.length
      };
    } catch (error) {
      throw new Error(`Failed to list pull requests: ${error}`);
    }
  }
});

// Tool to create a pull request
export const createPullRequest = createTool({
  id: "create_github_pull_request",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    title: z.string(),
    head: z.string(),
    base: z.string().optional().default("main"),
    body: z.string().optional(),
    draft: z.boolean().optional().default(false)
  }),
  description: "Create a new pull request in a GitHub repository",
  execute: async ({ context }) => {
    try {
      const response = await octokit.pulls.create({
        owner: context.owner,
        repo: context.repo,
        title: context.title,
        head: context.head,
        base: context.base,
        body: context.body,
        draft: context.draft
      });

      return {
        id: response.data.id,
        number: response.data.number,
        title: response.data.title,
        body: response.data.body,
        state: response.data.state,
        html_url: response.data.html_url,
        created_at: response.data.created_at,
        user: response.data.user?.login,
        head: response.data.head.ref,
        base: response.data.base.ref,
        draft: response.data.draft,
        mergeable: (response.data as any).mergeable
      };
    } catch (error) {
      throw new Error(`Failed to create pull request: ${error}`);
    }
  }
});

// Tool to update a pull request
export const updatePullRequest = createTool({
  id: "update_github_pull_request",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    pull_number: z.number(),
    title: z.string().optional(),
    body: z.string().optional(),
    state: z.enum(["open", "closed"]).optional()
  }),
  description: "Update an existing pull request in a GitHub repository",
  execute: async ({ context }) => {
    try {
      const response = await octokit.pulls.update({
        owner: context.owner,
        repo: context.repo,
        pull_number: context.pull_number,
        title: context.title,
        body: context.body,
        state: context.state
      });

      return {
        id: response.data.id,
        number: response.data.number,
        title: response.data.title,
        body: response.data.body,
        state: response.data.state,
        html_url: response.data.html_url,
        updated_at: response.data.updated_at,
        user: response.data.user?.login,
        head: response.data.head.ref,
        base: response.data.base.ref,
        draft: response.data.draft,
        mergeable: response.data.mergeable
      };
    } catch (error) {
      throw new Error(`Failed to update pull request: ${error}`);
    }
  }
});

// Tool to merge a pull request
export const mergePullRequest = createTool({
  id: "merge_github_pull_request",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    pull_number: z.number(),
    commit_title: z.string().optional(),
    commit_message: z.string().optional(),
    merge_method: z.enum(["merge", "squash", "rebase"]).optional().default("merge")
  }),
  description: "Merge a pull request in a GitHub repository",
  execute: async ({ context }) => {
    try {
      const response = await octokit.pulls.merge({
        owner: context.owner,
        repo: context.repo,
        pull_number: context.pull_number,
        commit_title: context.commit_title,
        commit_message: context.commit_message,
        merge_method: context.merge_method
      });

      return {
        sha: response.data.sha,
        merged: response.data.merged,
        message: response.data.message
      };
    } catch (error) {
      throw new Error(`Failed to merge pull request: ${error}`);
    }
  }
});

// Export all tools
export const githubTools = {
  listRepositories,
  getRepository,
  listIssues,
  createIssue,
  updateIssue,
  listPullRequests,
  createPullRequest,
  updatePullRequest,
  mergePullRequest
};
