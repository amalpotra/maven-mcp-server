import * as z from "zod/v4";
import type { MavenCentralClient } from "../api/index.js";
import {
  formatArtifactInfo,
  formatAllDependencySnippets,
} from "../utils/formatter.js";
import { text, toolError } from "./helpers.js";

export const getArtifactInfoSchema = z.object({
  groupId: z.string().describe('Maven groupId (e.g. "com.google.guava")'),
  artifactId: z.string().describe('Maven artifactId (e.g. "guava")'),
});

export type GetArtifactInfoInput = z.infer<typeof getArtifactInfoSchema>;

export const getArtifactInfoTool = {
  name: "get_artifact_info",
  description:
    "Get detailed information about a Maven artifact including its latest version, " +
    "packaging type, total version count, last update date, and ready-to-use " +
    "dependency snippets for all major build tools.",
  inputSchema: getArtifactInfoSchema,
};

export async function executeGetArtifactInfo(
  client: MavenCentralClient,
  input: GetArtifactInfoInput,
) {
  try {
    const result = await client.getArtifact(input.groupId, input.artifactId);
    const doc = result.response.docs[0];

    if (!doc) {
      return {
        ...text(
          `Artifact ${input.groupId}:${input.artifactId} not found on Maven Central.`,
        ),
        isError: true as const,
      };
    }

    const info = formatArtifactInfo(doc);
    const snippets = formatAllDependencySnippets(
      doc.g,
      doc.a,
      doc.latestVersion,
    );

    const versionsResult = await client.listVersions(
      input.groupId,
      input.artifactId,
      5,
    );
    const recentVersions = versionsResult.response.docs
      .map(
        (v) =>
          `  ${v.v} (${new Date(v.timestamp).toISOString().split("T")[0]})`,
      )
      .join("\n");

    return text(
      `${info}\n\nRecent Versions:\n${recentVersions}\n\n${snippets}`,
    );
  } catch (error: unknown) {
    return toolError("Error getting artifact info", error);
  }
}
