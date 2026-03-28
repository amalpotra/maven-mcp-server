# Maven MCP Server

[![Build](https://github.com/amalpotra/maven-mcp-server/actions/workflows/build.yml/badge.svg)](https://github.com/amalpotra/maven-mcp-server/actions/workflows/build.yml)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.0.0-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)](https://www.typescriptlang.org/)

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that connects AI assistants to **Maven Central** — enabling them to search for libraries, look up versions, validate dependencies, and generate build-tool-specific snippets.

## Tools

| Tool                     | Description                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `search_maven_artifacts` | Search Maven Central by keyword                               |
| `list_maven_versions`    | List versions of an artifact (with pre-release filtering)     |
| `get_latest_version`     | Get the latest stable or pre-release version with snippets    |
| `check_version_exists`   | Verify a specific version exists on Maven Central             |
| `get_artifact_info`      | Get full artifact metadata with recent versions and snippets  |

## Getting Started

Requires [Node.js](https://nodejs.org/) >= 22.0.0.

```bash
git clone https://github.com/AmarjeetMalpotra/maven-mcp-server.git
cd maven-mcp-server
npm install
npm run build
```

Run in production:

```bash
npm start
```

Run in development (auto-reload via tsx):

```bash
npm run dev
```

## Integration

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "maven": {
      "command": "node",
      "args": ["/absolute/path/to/maven-mcp-server/dist/index.js"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add --transport stdio maven -- node /absolute/path/to/maven-mcp-server/dist/index.js
```

### GitHub Copilot CLI

Add to `~/.copilot/mcp-config.json` or use `/mcp add` in the CLI:

```json
{
  "mcpServers": {
    "maven": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/maven-mcp-server/dist/index.js"],
      "tools": ["*"]
    }
  }
}
```

### Other Clients

Uses **stdio transport**, compatible with most MCP clients. Refer to your agent's documentation for setup instructions.

## Tools Reference

### `search_maven_artifacts`

Search Maven Central for artifacts by keyword.

| Name    | Type   | Required | Default | Description                   |
| ------- | ------ | -------- | ------- | ----------------------------- |
| `query` | string | Yes      | —       | Search keyword                |
| `limit` | number | —        | `10`    | Max results to return (1–100) |

> _"Search Maven Central for JSON parsing libraries"_

---

### `list_maven_versions`

List available versions of a Maven artifact, sorted newest first.

| Name                | Type    | Required | Default | Description                           |
| ------------------- | ------- | -------- | ------- | ------------------------------------- |
| `groupId`           | string  | Yes      | —       | Maven groupId                         |
| `artifactId`        | string  | Yes      | —       | Maven artifactId                      |
| `limit`             | number  | —        | `20`    | Max versions to return (1–200)        |
| `includePreRelease` | boolean | —        | `true`  | Include snapshot / beta / RC versions |

> _"List the last 10 stable versions of com.google.guava:guava"_

---

### `get_latest_version`

Get the latest release version with dependency snippets for all major build tools.

| Name                | Type    | Required | Default | Description                  |
| ------------------- | ------- | -------- | ------- | ---------------------------- |
| `groupId`           | string  | Yes      | —       | Maven groupId                |
| `artifactId`        | string  | Yes      | —       | Maven artifactId             |
| `includePreRelease` | boolean | —        | `false` | Include pre-release versions |

> _"What's the latest version of Jackson databind?"_

---

### `check_version_exists`

Verify a specific version exists on Maven Central. Returns metadata and snippets if found.

| Name         | Type   | Required | Description             |
| ------------ | ------ | -------- | ----------------------- |
| `groupId`    | string | Yes      | Maven groupId           |
| `artifactId` | string | Yes      | Maven artifactId        |
| `version`    | string | Yes      | Version string to check |

> _"Does com.google.guava:guava version 33.2.1-jre exist?"_

---

### `get_artifact_info`

Get full artifact metadata including latest version, packaging, version count, the 5 most recent versions, and dependency snippets.

| Name         | Type   | Required | Description      |
| ------------ | ------ | -------- | ---------------- |
| `groupId`    | string | Yes      | Maven groupId    |
| `artifactId` | string | Yes      | Maven artifactId |

> _"Tell me about the Spring Boot starter web artifact"_

## Architecture

```
src/
├── index.ts                  # Entry point — stdio transport
├── server.ts                 # MCP server setup & tool registration
├── tools/
│   ├── helpers.ts            # Shared tool response helpers
│   ├── search-artifacts.ts
│   ├── list-versions.ts
│   ├── get-latest-version.ts
│   ├── check-version-exists.ts
│   └── get-artifact-info.ts
├── api/
│   ├── maven-central.ts      # Maven Central Search HTTP client
│   └── types.ts              # API response type definitions
└── utils/
    ├── version.ts            # Version parsing & comparison
    └── formatter.ts          # Output formatting helpers
```

### Data Flow

```
MCP Client (Claude, Copilot, etc.)
    │  JSON-RPC over stdio
    ▼
index.ts → StdioServerTransport
    ▼
server.ts → McpServer (tool registration)
    ▼
tools/*.ts → Zod validation + execution
    ▼
api/maven-central.ts → fetch()
    ▼
search.maven.org/solrsearch/select
```

### Design Decisions

- **stdio transport** — The standard for CLI-integrated MCP servers; works with all major clients
- **Native `fetch`** — Zero HTTP dependencies
- **Zod schemas** — Input validation with automatic JSON Schema generation for MCP tool discovery
- **One tool per file** — Each tool is a self-contained module with schema, metadata, and executor
- **Maven Central Solr API** — Public API, no authentication required

## Development

```bash
npm install          # Install dependencies
npm run dev          # Dev mode (auto-reload)
npm run build        # Build for production
npm test             # Run tests (Vitest)
npm run test:watch   # Run tests in watch mode
```

### Adding a New Tool

1. Create `src/tools/my-tool.ts` with a Zod schema, tool metadata object, and async executor function. Use `text()` and `toolError()` from `helpers.ts` for responses.
2. Re-export from `src/tools/index.ts`
3. Register the tool in `src/server.ts`

## Maven Central API

All tools query the [Maven Central Solr Search API](https://search.maven.org/classic/#api):

| Operation       | Query                                                             |
| --------------- | ----------------------------------------------------------------- |
| Keyword search  | `q={keyword}`                                                     |
| Artifact lookup | `q=g:{groupId} AND a:{artifactId}`                                |
| Version listing | `q=g:{groupId} AND a:{artifactId}&core=gav`                       |
| Version check   | `q=g:{groupId} AND a:{artifactId} AND v:{version}&core=gav`       |

No authentication required. Please be respectful of rate limits — the API is shared infrastructure.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-tool`)
3. Commit your changes (`git commit -m 'Add my-tool'`)
4. Push to the branch (`git push origin feature/my-tool`)
5. Open a Pull Request

## License

[MIT](LICENSE)

## Acknowledgements

- [Model Context Protocol](https://modelcontextprotocol.io) — Open standard for LLM context exchange
- [Maven Central](https://search.maven.org/) — Public search API
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) — Server and client implementation
