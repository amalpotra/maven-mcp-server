#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("Maven MCP Server running on stdio");
}

main().catch((error: unknown) => {
  console.error("Fatal error starting Maven MCP Server:", error);
  process.exit(1);
});
