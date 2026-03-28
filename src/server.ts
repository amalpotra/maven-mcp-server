import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MavenCentralClient } from "./api/index.js";
import {
  searchArtifactsTool,
  searchArtifactsSchema,
  executeSearchArtifacts,
  listVersionsTool,
  listVersionsSchema,
  executeListVersions,
  getLatestVersionTool,
  getLatestVersionSchema,
  executeGetLatestVersion,
  checkVersionExistsTool,
  checkVersionExistsSchema,
  executeCheckVersionExists,
  getArtifactInfoTool,
  getArtifactInfoSchema,
  executeGetArtifactInfo,
} from "./tools/index.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "maven-mcp-server",
    version: "1.0.0",
  });

  const client = new MavenCentralClient();

  server.registerTool(
    searchArtifactsTool.name,
    {
      description: searchArtifactsTool.description,
      inputSchema: searchArtifactsSchema,
    },
    async (args) => {
      return executeSearchArtifacts(client, args);
    },
  );

  server.registerTool(
    listVersionsTool.name,
    {
      description: listVersionsTool.description,
      inputSchema: listVersionsSchema,
    },
    async (args) => {
      return executeListVersions(client, args);
    },
  );

  server.registerTool(
    getLatestVersionTool.name,
    {
      description: getLatestVersionTool.description,
      inputSchema: getLatestVersionSchema,
    },
    async (args) => {
      return executeGetLatestVersion(client, args);
    },
  );

  server.registerTool(
    checkVersionExistsTool.name,
    {
      description: checkVersionExistsTool.description,
      inputSchema: checkVersionExistsSchema,
    },
    async (args) => {
      return executeCheckVersionExists(client, args);
    },
  );

  server.registerTool(
    getArtifactInfoTool.name,
    {
      description: getArtifactInfoTool.description,
      inputSchema: getArtifactInfoSchema,
    },
    async (args) => {
      return executeGetArtifactInfo(client, args);
    },
  );

  return server;
}
