import type { MavenGAVSearchResponse, MavenSearchResponse } from "./types.js";

/** Error with optional HTTP status code from Maven Central API. */
export class MavenCentralError extends Error {
  public readonly statusCode: number | undefined;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "MavenCentralError";
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, MavenCentralError.prototype);
  }
}

/** HTTP client for the Maven Central Solr search API. */
export class MavenCentralClient {
  private readonly baseUrl: string;

  constructor(baseUrl = "https://search.maven.org/solrsearch/select") {
    this.baseUrl = baseUrl;
  }

  private async query<T>(params: Record<string, string>): Promise<T> {
    const searchParams = new URLSearchParams({ ...params, wt: "json" });
    const url = `${this.baseUrl}?${searchParams.toString()}`;

    let response: Response;
    try {
      response = await fetch(url);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new MavenCentralError(
        `Network request to Maven Central failed: ${message}`,
      );
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "<unreadable body>");
      throw new MavenCentralError(
        `Maven Central API returned HTTP ${response.status}: ${body}`,
        response.status,
      );
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new MavenCentralError(
        "Failed to parse JSON response from Maven Central",
      );
    }
  }

  /** Free-text keyword search. Query: `q={keyword}` */
  async searchArtifacts(
    keyword: string,
    limit = 20,
    offset = 0,
  ): Promise<MavenSearchResponse> {
    return this.query<MavenSearchResponse>({
      q: keyword,
      rows: String(limit),
      start: String(offset),
    });
  }

  /** Lookup by groupId:artifactId. Query: `q=g:{gid} AND a:{aid}` */
  async getArtifact(
    groupId: string,
    artifactId: string,
  ): Promise<MavenSearchResponse> {
    return this.query<MavenSearchResponse>({
      q: `g:${groupId} AND a:${artifactId}`,
    });
  }

  /** List versions for a groupId:artifactId, newest first. Uses the GAV core. */
  async listVersions(
    groupId: string,
    artifactId: string,
    limit = 50,
    offset = 0,
  ): Promise<MavenGAVSearchResponse> {
    return this.query<MavenGAVSearchResponse>({
      q: `g:${groupId} AND a:${artifactId}`,
      core: "gav",
      rows: String(limit),
      start: String(offset),
    });
  }

  /** Check if a specific groupId:artifactId:version exists. Uses the GAV core. */
  async checkVersionExists(
    groupId: string,
    artifactId: string,
    version: string,
  ): Promise<MavenGAVSearchResponse> {
    return this.query<MavenGAVSearchResponse>({
      q: `g:${groupId} AND a:${artifactId} AND v:${version}`,
      core: "gav",
    });
  }
}
