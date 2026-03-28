import * as z from "zod/v4";
import type { MavenCentralClient } from "../api/index.js";
import { formatArtifactInfo } from "../utils/formatter.js";
import { text, toolError } from "./helpers.js";

export const searchArtifactsSchema = z.object({
  query: z
    .string()
    .describe(
      'Search keyword (e.g. "guava", "jackson-databind", "spring-boot")',
    ),
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(10)
    .describe("Max results to return (1-100, default 10)"),
});

export type SearchArtifactsInput = z.infer<typeof searchArtifactsSchema>;

export const searchArtifactsTool = {
  name: "search_maven_artifacts",
  description:
    "Search Maven Central for artifacts by keyword. Returns matching artifacts " +
    "with their latest version, packaging type, and version count. Useful for " +
    "discovering libraries or finding the correct groupId:artifactId for a dependency.",
  inputSchema: searchArtifactsSchema,
};

export async function executeSearchArtifacts(
  client: MavenCentralClient,
  input: SearchArtifactsInput,
) {
  try {
    const result = await client.searchArtifacts(input.query, input.limit);
    const { docs, numFound } = result.response;

    if (docs.length === 0) {
      return text(`No artifacts found matching "${input.query}".`);
    }

    const header = `Found ${numFound} artifacts matching "${input.query}" (showing ${docs.length}):\n`;
    const formatted = docs.map(formatArtifactInfo).join("\n\n");

    return text(header + "\n" + formatted);
  } catch (error: unknown) {
    return toolError("Error searching Maven Central", error);
  }
}
