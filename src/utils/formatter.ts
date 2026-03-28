import type { MavenArtifactDoc, MavenVersionDoc } from "../api/types.js";

export function formatArtifactInfo(doc: MavenArtifactDoc): string {
  return [
    `📦 ${doc.g}:${doc.a}`,
    `   Latest Version: ${doc.latestVersion}`,
    `   Packaging: ${doc.p}`,
    `   Total Versions: ${doc.versionCount}`,
    `   Last Updated: ${new Date(doc.timestamp).toISOString().split("T")[0]}`,
    `   Available Extensions: ${doc.ec.join(", ")}`,
  ].join("\n");
}

export function formatVersionList(docs: MavenVersionDoc[]): string {
  if (docs.length === 0) return "No versions found.";
  return docs
    .map((doc) => {
      const date = new Date(doc.timestamp).toISOString().split("T")[0];
      return `  ${doc.v.padEnd(30)} (${date})`;
    })
    .join("\n");
}

function formatGradleDependency(
  groupId: string,
  artifactId: string,
  version: string,
): string {
  return `implementation '${groupId}:${artifactId}:${version}'`;
}

function formatGradleKotlinDependency(
  groupId: string,
  artifactId: string,
  version: string,
): string {
  return `implementation("${groupId}:${artifactId}:${version}")`;
}

function formatMavenDependency(
  groupId: string,
  artifactId: string,
  version: string,
): string {
  return [
    "<dependency>",
    `    <groupId>${groupId}</groupId>`,
    `    <artifactId>${artifactId}</artifactId>`,
    `    <version>${version}</version>`,
    "</dependency>",
  ].join("\n");
}

function formatSbtDependency(
  groupId: string,
  artifactId: string,
  version: string,
): string {
  return `"${groupId}" % "${artifactId}" % "${version}"`;
}

export function formatAllDependencySnippets(
  groupId: string,
  artifactId: string,
  version: string,
): string {
  return [
    "📋 Dependency Snippets:",
    "",
    "Maven:",
    formatMavenDependency(groupId, artifactId, version),
    "",
    "Gradle (Groovy):",
    formatGradleDependency(groupId, artifactId, version),
    "",
    "Gradle (Kotlin DSL):",
    formatGradleKotlinDependency(groupId, artifactId, version),
    "",
    "SBT (Scala):",
    formatSbtDependency(groupId, artifactId, version),
  ].join("\n");
}
