// https://search.maven.org/classic/#api

/** Standard search response (artifact-level). */
export interface MavenSearchResponse {
  responseHeader: {
    status: number;
    QTime: number;
    params: Record<string, string>;
  };
  response: {
    numFound: number;
    start: number;
    docs: MavenArtifactDoc[];
  };
}

/** GAV (group/artifact/version) core query response. */
export interface MavenGAVSearchResponse {
  responseHeader: {
    status: number;
    QTime: number;
    params: Record<string, string>;
  };
  response: {
    numFound: number;
    start: number;
    docs: MavenVersionDoc[];
  };
}

/** Artifact summary returned by standard (non-GAV) searches. */
export interface MavenArtifactDoc {
  id: string;
  /** groupId (e.g. `com.google.guava`) */
  g: string;
  /** artifactId (e.g. `guava`) */
  a: string;
  latestVersion: string;
  repositoryId: string;
  /** Packaging type — `jar`, `pom`, `bundle`, `aar`, etc. */
  p: string;
  /** Last update time in epoch milliseconds. */
  timestamp: number;
  versionCount: number;
  text: string[];
  /** Available file extensions (e.g. `[".jar", ".pom", "-sources.jar"]`). */
  ec: string[];
}

/** Single version entry returned by GAV core queries. */
export interface MavenVersionDoc {
  id: string;
  /** groupId */
  g: string;
  /** artifactId */
  a: string;
  /** Version string (e.g. `33.4.8-jre`). */
  v: string;
  /** Packaging type. */
  p: string;
  /** Publication time in epoch milliseconds. */
  timestamp: number;
  /** Available file extensions. */
  ec: string[];
  tags?: string[];
}
