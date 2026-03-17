/** Tool registry — name → handler mapping. */

export interface ToolParamSchema {
  type: string;
  properties: Record<string, { type: string; description?: string; items?: { type: string } }>;
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

  registerAll(tools: ToolDef[]): void {
    for (const tool of tools) this.register(tool);
  }

  list(): ToolDef[] {
    return Array.from(this.tools.values());
  }

  get(name: string): ToolDef | undefined {
    return this.tools.get(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  async invoke(name: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool not found: ${name}`);
    return tool.handler(args);
  }
}
