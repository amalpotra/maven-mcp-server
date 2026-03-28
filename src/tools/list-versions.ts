import * as z from "zod/v4";
import type { MavenCentralClient } from "../api/index.js";
import { formatVersionList } from "../utils/formatter.js";
import { isPreRelease } from "../utils/version.js";
import { text, toolError } from "./helpers.js";

export const listVersionsSchema = z.object({
  groupId: z.string().describe('Maven groupId (e.g. "com.google.guava")'),
  artifactId: z.string().describe('Maven artifactId (e.g. "guava")'),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(20)
    .describe("Max versions to return (1-200, default 20)"),
  includePreRelease: z
    .boolean()
    .default(true)
    .describe("Include pre-release/snapshot versions (default true)"),
});

export type ListVersionsInput = z.infer<typeof listVersionsSchema>;

export const listVersionsTool = {
  name: "list_maven_versions",
  description:
    "List available versions of a Maven artifact. Returns versions sorted by " +
    "publish date (newest first) with timestamps. Can filter out pre-release versions.",
  inputSchema: listVersionsSchema,
};

export async function executeListVersions(
  client: MavenCentralClient,
  input: ListVersionsInput,
) {
  try {
    // Fetch more than requested if we need to filter out pre-releases
    const fetchLimit = input.includePreRelease ? input.limit : input.limit * 3;
    const result = await client.listVersions(
      input.groupId,
      input.artifactId,
      fetchLimit,
    );

    let docs = result.response.docs;

    if (!input.includePreRelease) {
      docs = docs.filter((doc) => !isPreRelease(doc.v));
    }

    // Trim to requested limit after filtering
    docs = docs.slice(0, input.limit);

    if (docs.length === 0) {
      return text(
        `No versions found for ${input.groupId}:${input.artifactId}.`,
      );
    }

    const total = result.response.numFound;
    const header = `Versions of ${input.groupId}:${input.artifactId} (${total} total, showing ${docs.length}):\n`;
    const list = formatVersionList(docs);

    return text(header + "\n" + list);
  } catch (error: unknown) {
    return toolError("Error listing versions", error);
  }
}
