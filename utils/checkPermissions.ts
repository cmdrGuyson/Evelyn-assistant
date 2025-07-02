import { ChatInputCommandInteraction, PermissionResolvable } from "discord.js";
import { Command } from "../interfaces/Command";

export interface PermissionResult {
  result: boolean;
  missing: string[];
}

export async function checkPermissions(
  command: Command,
  interaction: ChatInputCommandInteraction
): Promise<PermissionResult> {
  // If no permissions are required, return true
  if (!command.permissions) return { result: true, missing: [] };

  // Check if interaction is in a guild context
  if (!interaction.guild) {
    return { result: false, missing: ["This command can only be used in a server."] };
  }

  try {
    const member = await interaction.guild.members.fetch({ user: interaction.client.user!.id });
    const requiredPermissions = command.permissions as PermissionResolvable[];

    const missing = member.permissions.missing(requiredPermissions);

    return { result: !Boolean(missing.length), missing };
  } catch (error) {
    console.error("Error checking permissions:", error);
    return { result: false, missing: ["Unable to check permissions."] };
  }
}
