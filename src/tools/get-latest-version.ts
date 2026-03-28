import * as z from "zod/v4";
import type { MavenCentralClient } from "../api/index.js";
import { formatAllDependencySnippets } from "../utils/formatter.js";
import { text, toolError } from "./helpers.js";

export const getLatestVersionSchema = z.object({
  groupId: z.string().describe('Maven groupId (e.g. "com.google.guava")'),
  artifactId: z.string().describe('Maven artifactId (e.g. "guava")'),
  includePreRelease: z
    .boolean()
    .default(false)
    .describe(
      "Include pre-release versions when determining latest (default false)",
    ),
});

export type GetLatestVersionInput = z.infer<typeof getLatestVersionSchema>;

export const getLatestVersionTool = {
  name: "get_latest_version",
  description:
    "Get the latest release version of a Maven artifact. Returns the version string " +
    "along with ready-to-use dependency snippets for Maven, Gradle, and SBT. " +
    "By default returns only stable releases; set includePreRelease to true for pre-release versions.",
  inputSchema: getLatestVersionSchema,
};

export async function executeGetLatestVersion(
  client: MavenCentralClient,
  input: GetLatestVersionInput,
) {
  try {
    const coord = `${input.groupId}:${input.artifactId}`;
    const notFound = {
      ...text(`Artifact ${coord} not found on Maven Central.`),
      isError: true as const,
    };

    if (input.includePreRelease) {
      const result = await client.listVersions(
        input.groupId,
        input.artifactId,
        1,
      );
      const doc = result.response.docs[0];
      if (!doc) return notFound;

      const snippets = formatAllDependencySnippets(
        input.groupId,
        input.artifactId,
        doc.v,
      );
      return text(`Latest version of ${coord}: ${doc.v}\n\n${snippets}`);
    }

    const result = await client.getArtifact(input.groupId, input.artifactId);
    const doc = result.response.docs[0];
    if (!doc) return notFound;

    const version = doc.latestVersion;
    const snippets = formatAllDependencySnippets(
      input.groupId,
      input.artifactId,
      version,
    );
    return text(`Latest version of ${coord}: ${version}\n\n${snippets}`);
  } catch (error: unknown) {
    return toolError("Error getting latest version", error);
  }
}
