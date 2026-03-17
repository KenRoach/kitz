/** Built-in utility tools. */

import type { ToolDef } from "./registry.js";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export function createBuiltinTools(): ToolDef[] {
  return [
    {
      name: "utc_now",
      description: "Obtener la fecha y hora actual en UTC e ISO 8601",
      parameters: { type: "object", properties: {} },
      handler: async () => ({
        utc: new Date().toISOString(),
        local: new Date().toLocaleString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    },
    {
      name: "shell_exec",
      description: "Ejecutar un comando en la terminal del usuario. Usar con precaución.",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "Shell command to execute" },
        },
        required: ["command"],
      },
      handler: async (args) => {
        const cmd = String(args.command);
        try {
          const { stdout, stderr } = await execAsync(cmd, { timeout: 30000 });
          return {
            stdout: stdout.slice(0, 2000),
            stderr: stderr.slice(0, 500),
            success: true,
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return { error: msg.slice(0, 500), success: false };
        }
      },
    },
  ];
}
