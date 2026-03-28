import * as z from "zod/v4";
import type { MavenCentralClient } from "../api/index.js";
import { formatAllDependencySnippets } from "../utils/formatter.js";
import { text, toolError } from "./helpers.js";

export const checkVersionExistsSchema = z.object({
  groupId: z.string().describe('Maven groupId (e.g. "com.google.guava")'),
  artifactId: z.string().describe('Maven artifactId (e.g. "guava")'),
  version: z.string().describe('Version to check (e.g. "33.2.1-jre")'),
});

export type CheckVersionExistsInput = z.infer<typeof checkVersionExistsSchema>;

export const checkVersionExistsTool = {
  name: "check_version_exists",
  description:
    "Check if a specific version of a Maven artifact exists on Maven Central. " +
    "Returns whether the version exists and, if so, its metadata and dependency snippets. " +
    "Useful for validating dependency versions before adding them to a project.",
  inputSchema: checkVersionExistsSchema,
};

export async function executeCheckVersionExists(
  client: MavenCentralClient,
  input: CheckVersionExistsInput,
) {
  try {
    const result = await client.checkVersionExists(
      input.groupId,
      input.artifactId,
      input.version,
    );

    const exists = result.response.numFound > 0;
    const coordinate = `${input.groupId}:${input.artifactId}:${input.version}`;

    if (!exists) {
      return text(`❌ Version ${coordinate} does NOT exist on Maven Central.`);
    }

    const doc = result.response.docs[0];
    const date = new Date(doc.timestamp).toISOString().split("T")[0];
    const snippets = formatAllDependencySnippets(
      input.groupId,
      input.artifactId,
      input.version,
    );

    return text(
      `✅ Version ${coordinate} exists on Maven Central.\n` +
        `   Published: ${date}\n` +
        `   Packaging: ${doc.p}\n\n${snippets}`,
    );
  } catch (error: unknown) {
    return toolError("Error checking version", error);
  }
}
