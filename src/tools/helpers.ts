import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function text(value: string): CallToolResult {
  return { content: [{ type: "text", text: value }] };
}

export function toolError(prefix: string, error: unknown): CallToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: "text", text: `${prefix}: ${message}` }], isError: true };
}
