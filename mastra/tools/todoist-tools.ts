import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { config } from "../../utils/config";
import { Logger } from "../../structs/Logger";
import { TodoistApi } from "@doist/todoist-api-typescript";

// Initialize Todoist client
const todoistClient = new TodoistApi(config.TODOIST_TOKEN);

// Tool to create a new task
export const createTask = createTool({
  id: "create_todoist_task",
  inputSchema: z.object({
    content: z.string().describe("The text content of the task"),
    description: z.string().optional().describe("A description for the task"),
    due_string: z.string().optional().describe("Natural language due date like 'tomorrow', 'next Monday', 'Jan 23'"),
    priority: z.number().min(1).max(4).optional().describe("Task priority from 1 (normal) to 4 (urgent)")
  }),
  description: "Create a new task in Todoist with specified content and optional parameters",
  execute: async ({ context }) => {
    Logger.info({
      type: "TODOIST_TOOL",
      msg: `Starting createTask tool with content: "${context.content}"`
    });

    try {
      const task = await todoistClient.addTask({
        content: context.content,
        description: context.description,
        dueString: context.due_string,
        priority: context.priority
      });

      Logger.log({
        type: "TODOIST_TOOL",
        msg: `createTask completed successfully. Task ID: ${task.id}`
      });

      return {
        id: task.id,
        content: task.content,
        description: task.description,
        due: task.due?.string,
        priority: task.priority,
        url: task.url,
        created_at: task.createdAt,
        is_completed: task.isCompleted
      };
    } catch (error) {
      Logger.error({ type: "TODOIST_TOOL", err: `createTask failed: ${error}` });
      throw new Error(`Failed to create task: ${error}`);
    }
  }
});

// Tool to get tasks
export const getTasks = createTool({
  id: "get_todoist_tasks",
  inputSchema: z.object({
    project_id: z.string().optional().describe("Filter tasks by project ID"),
    filter: z
      .string()
      .optional()
      .describe("Natural language filter like 'today', 'tomorrow', 'next week', 'priority 1', 'overdue'"),
    priority: z.number().min(1).max(4).optional().describe("Filter by priority level (1-4)"),
    limit: z.number().optional().describe("Maximum number of tasks to return").default(10)
  }),
  description: "Get a list of tasks from Todoist with various filters",
  execute: async ({ context }) => {
    Logger.info({
      type: "TODOIST_TOOL",
      msg: `Starting getTasks tool with filters: ${JSON.stringify(context)}`
    });

    try {
      // Build API parameters
      const apiParams: any = {};
      if (context.project_id) {
        apiParams.projectId = context.project_id;
      }
      if (context.filter) {
        apiParams.filter = context.filter;
      }

      // Get tasks from API
      const tasks = await todoistClient.getTasks(Object.keys(apiParams).length > 0 ? apiParams : undefined);

      // Apply additional filters
      let filteredTasks = tasks;
      if (context.priority) {
        filteredTasks = filteredTasks.filter((task) => task.priority === context.priority);
      }

      // Apply limit
      if (context.limit && context.limit > 0) {
        filteredTasks = filteredTasks.slice(0, context.limit);
      }

      Logger.log({
        type: "TODOIST_TOOL",
        msg: `getTasks completed successfully. Found ${filteredTasks.length} tasks`
      });

      return {
        tasks: filteredTasks.map((task) => ({
          id: task.id,
          content: task.content,
          description: task.description,
          due: task.due?.string,
          priority: task.priority,
          url: task.url,
          created_at: task.createdAt,
          is_completed: task.isCompleted
        })),
        total_count: filteredTasks.length
      };
    } catch (error) {
      Logger.error({ type: "TODOIST_TOOL", err: `getTasks failed: ${error}` });
      throw new Error(`Failed to get tasks: ${error}`);
    }
  }
});

// Tool to update a task
export const updateTask = createTool({
  id: "update_todoist_task",
  inputSchema: z.object({
    task_name: z.string().describe("Name/content of the task to search for and update"),
    content: z.string().optional().describe("New content/title for the task"),
    description: z.string().optional().describe("New description for the task"),
    due_string: z.string().optional().describe("New due date in natural language like 'tomorrow', 'next Monday'"),
    priority: z.number().min(1).max(4).optional().describe("New priority level from 1 (normal) to 4 (urgent)")
  }),
  description: "Update an existing task in Todoist by searching for it by name and then updating it",
  execute: async ({ context }) => {
    Logger.info({
      type: "TODOIST_TOOL",
      msg: `Starting updateTask tool for task name: "${context.task_name}"`
    });

    try {
      // First, search for the task
      const tasks = await todoistClient.getTasks();
      const matchingTask = tasks.find((task) => task.content.toLowerCase().includes(context.task_name.toLowerCase()));

      if (!matchingTask) {
        throw new Error(`Could not find a task matching "${context.task_name}"`);
      }

      // Build update data
      const updateData: any = {};
      if (context.content) updateData.content = context.content;
      if (context.description) updateData.description = context.description;
      if (context.due_string) updateData.dueString = context.due_string;
      if (context.priority) updateData.priority = context.priority;

      const updatedTask = await todoistClient.updateTask(matchingTask.id, updateData);

      Logger.log({
        type: "TODOIST_TOOL",
        msg: `updateTask completed successfully for task ID: ${matchingTask.id}`
      });

      return {
        id: updatedTask.id,
        content: updatedTask.content,
        description: updatedTask.description,
        due: updatedTask.due?.string,
        priority: updatedTask.priority,
        url: updatedTask.url,
        created_at: updatedTask.createdAt,
        is_completed: updatedTask.isCompleted
      };
    } catch (error) {
      Logger.error({ type: "TODOIST_TOOL", err: `updateTask failed: ${error}` });
      throw new Error(`Failed to update task: ${error}`);
    }
  }
});

// Tool to delete a task
export const deleteTask = createTool({
  id: "delete_todoist_task",
  inputSchema: z.object({
    task_name: z.string().describe("Name/content of the task to search for and delete")
  }),
  description: "Delete a task from Todoist by searching for it by name",
  execute: async ({ context }) => {
    Logger.info({
      type: "TODOIST_TOOL",
      msg: `Starting deleteTask tool for task name: "${context.task_name}"`
    });

    try {
      // First, search for the task
      const tasks = await todoistClient.getTasks();
      const matchingTask = tasks.find((task) => task.content.toLowerCase().includes(context.task_name.toLowerCase()));

      if (!matchingTask) {
        throw new Error(`Could not find a task matching "${context.task_name}"`);
      }

      // Delete the task
      await todoistClient.deleteTask(matchingTask.id);

      Logger.log({
        type: "TODOIST_TOOL",
        msg: `deleteTask completed successfully for task ID: ${matchingTask.id}`
      });

      return {
        success: true,
        message: `Successfully deleted task: "${matchingTask.content}"`,
        deleted_task_id: matchingTask.id
      };
    } catch (error) {
      Logger.error({ type: "TODOIST_TOOL", err: `deleteTask failed: ${error}` });
      throw new Error(`Failed to delete task: ${error}`);
    }
  }
});

// Tool to complete a task
export const completeTask = createTool({
  id: "complete_todoist_task",
  inputSchema: z.object({
    task_name: z.string().describe("Name/content of the task to search for and complete")
  }),
  description: "Mark a task as complete by searching for it by name",
  execute: async ({ context }) => {
    Logger.info({
      type: "TODOIST_TOOL",
      msg: `Starting completeTask tool for task name: "${context.task_name}"`
    });

    try {
      // First, search for the task
      const tasks = await todoistClient.getTasks();
      const matchingTask = tasks.find((task) => task.content.toLowerCase().includes(context.task_name.toLowerCase()));

      if (!matchingTask) {
        throw new Error(`Could not find a task matching "${context.task_name}"`);
      }

      // Complete the task
      await todoistClient.closeTask(matchingTask.id);

      Logger.log({
        type: "TODOIST_TOOL",
        msg: `completeTask completed successfully for task ID: ${matchingTask.id}`
      });

      return {
        success: true,
        message: `Successfully completed task: "${matchingTask.content}"`,
        completed_task_id: matchingTask.id
      };
    } catch (error) {
      Logger.error({ type: "TODOIST_TOOL", err: `completeTask failed: ${error}` });
      throw new Error(`Failed to complete task: ${error}`);
    }
  }
});

// Tool to get a specific task by ID
export const getTask = createTool({
  id: "get_todoist_task",
  inputSchema: z.object({
    task_id: z.string().describe("The ID of the task to retrieve")
  }),
  description: "Get detailed information about a specific Todoist task by ID",
  execute: async ({ context }) => {
    Logger.info({
      type: "TODOIST_TOOL",
      msg: `Starting getTask tool for task ID: ${context.task_id}`
    });

    try {
      const task = await todoistClient.getTask(context.task_id);

      Logger.log({
        type: "TODOIST_TOOL",
        msg: `getTask completed successfully for task ID: ${context.task_id}`
      });

      return {
        id: task.id,
        content: task.content,
        description: task.description,
        due: task.due?.string,
        priority: task.priority,
        url: task.url,
        created_at: task.createdAt,
        is_completed: task.isCompleted
      };
    } catch (error) {
      Logger.error({ type: "TODOIST_TOOL", err: `getTask failed for task ID ${context.task_id}: ${error}` });
      throw new Error(`Failed to get task: ${error}`);
    }
  }
});

// Tool to reopen a completed task
export const reopenTask = createTool({
  id: "reopen_todoist_task",
  inputSchema: z.object({
    task_name: z.string().describe("Name/content of the task to search for and reopen")
  }),
  description: "Reopen a previously completed Todoist task by searching for it by name",
  execute: async ({ context }) => {
    Logger.info({
      type: "TODOIST_TOOL",
      msg: `Starting reopenTask tool for task name: "${context.task_name}"`
    });

    try {
      // First, search for the task
      const tasks = await todoistClient.getTasks();
      const matchingTask = tasks.find((task) => task.content.toLowerCase().includes(context.task_name.toLowerCase()));

      if (!matchingTask) {
        throw new Error(`Could not find a task matching "${context.task_name}"`);
      }

      // Reopen the task
      await todoistClient.reopenTask(matchingTask.id);

      Logger.log({
        type: "TODOIST_TOOL",
        msg: `reopenTask completed successfully for task ID: ${matchingTask.id}`
      });

      return {
        success: true,
        message: `Successfully reopened task: "${matchingTask.content}"`,
        reopened_task_id: matchingTask.id
      };
    } catch (error) {
      Logger.error({ type: "TODOIST_TOOL", err: `reopenTask failed: ${error}` });
      throw new Error(`Failed to reopen task: ${error}`);
    }
  }
});

// Export all tools
export const todoistTools = {
  createTask,
  getTask,
  getTasks,
  updateTask,
  deleteTask,
  completeTask,
  reopenTask
};
