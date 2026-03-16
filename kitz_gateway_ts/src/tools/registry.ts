/** Tool registry — name → handler mapping. */

export interface ToolParamSchema {
  type: string;
  properties: Record<string, { type: string; description?: string }>;
  required?: string[];
}

export interface ToolDef {
  name: string;
  description: string;
  parameters?: ToolParamSchema;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

export class ToolRegistry {
  private tools = new Map<string, ToolDef>();

  register(tool: ToolDef): void {
    this.tools.set(tool.name, tool);
  }

  list(): { name: string; description: string }[] {
    return Array.from(this.tools.values()).map(({ name, description }) => ({ name, description }));
  }

  async invoke(name: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) throw new ToolNotFoundError(name);
    return tool.handler(args);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }
}

export class ToolNotFoundError extends Error {
  constructor(name: string) {
    super(`Tool not found: ${name}`);
    this.name = "ToolNotFoundError";
  }
}
