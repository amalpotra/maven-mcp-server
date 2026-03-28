import { describe, it, expect } from "vitest";
import {
  parseVersion,
  isPreRelease,
  compareVersions,
} from "../../src/utils/version.js";

describe("parseVersion", () => {
  it("parses a simple three-part version", () => {
    const v = parseVersion("3.12.0");
    expect(v).toEqual({
      major: 3,
      minor: 12,
      patch: 0,
      qualifier: null,
      original: "3.12.0",
    });
  });

  it("parses a version with a qualifier", () => {
    const v = parseVersion("2.0.0-beta1");
    expect(v).toEqual({
      major: 2,
      minor: 0,
      patch: 0,
      qualifier: "beta1",
      original: "2.0.0-beta1",
    });
  });

  it("parses a two-part version", () => {
    const v = parseVersion("1.0");
    expect(v).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      qualifier: null,
      original: "1.0",
    });
  });

  it("parses a version with -jre qualifier", () => {
    const v = parseVersion("33.4.8-jre");
    expect(v).toEqual({
      major: 33,
      minor: 4,
      patch: 8,
      qualifier: "jre",
      original: "33.4.8-jre",
    });
  });

  it("parses a version with -android qualifier", () => {
    const v = parseVersion("33.4.8-android");
    expect(v).toEqual({
      major: 33,
      minor: 4,
      patch: 8,
      qualifier: "android",
      original: "33.4.8-android",
    });
  });

  it("parses a SNAPSHOT version", () => {
    const v = parseVersion("1.0-SNAPSHOT");
    expect(v).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      qualifier: "SNAPSHOT",
      original: "1.0-SNAPSHOT",
    });
  });

  it("parses a single-part version", () => {
    const v = parseVersion("5");
    expect(v).toEqual({
      major: 5,
      minor: 0,
      patch: 0,
      qualifier: null,
      original: "5",
    });
  });

  it("handles a qualifier with multiple hyphens", () => {
    const v = parseVersion("1.0.0-beta-2");
    expect(v).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      qualifier: "beta-2",
      original: "1.0.0-beta-2",
    });
  });
});

describe("isPreRelease", () => {
  it("detects SNAPSHOT", () => {
    expect(isPreRelease("1.0-SNAPSHOT")).toBe(true);
  });

  it("detects alpha", () => {
    expect(isPreRelease("2.0.0-alpha1")).toBe(true);
  });

  it("detects beta", () => {
    expect(isPreRelease("3.0.0-beta2")).toBe(true);
  });

  it("detects RC", () => {
    expect(isPreRelease("4.0.0-RC1")).toBe(true);
  });

  it("detects lowercase rc", () => {
    expect(isPreRelease("4.0.0-rc1")).toBe(true);
  });

  it("detects CR", () => {
    expect(isPreRelease("1.0.0-CR2")).toBe(true);
  });

  it("detects M milestone", () => {
    expect(isPreRelease("5.0.0-M1")).toBe(true);
  });

  it("detects early access", () => {
    expect(isPreRelease("21-ea")).toBe(true);
  });

  it("returns false for a stable release", () => {
    expect(isPreRelease("3.12.0")).toBe(false);
  });

  it("returns false for jre qualifier", () => {
    expect(isPreRelease("33.4.8-jre")).toBe(false);
  });

  it("returns false for android qualifier", () => {
    expect(isPreRelease("33.4.8-android")).toBe(false);
  });

  it("returns false for plain number version", () => {
    expect(isPreRelease("5")).toBe(false);
  });
});

describe("compareVersions", () => {
  it("returns 0 for equal versions", () => {
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
  });

  it("compares by major version", () => {
    expect(compareVersions("2.0.0", "1.0.0")).toBe(1);
    expect(compareVersions("1.0.0", "2.0.0")).toBe(-1);
  });

  it("compares by minor version", () => {
    expect(compareVersions("1.2.0", "1.1.0")).toBe(1);
    expect(compareVersions("1.1.0", "1.2.0")).toBe(-1);
  });

  it("compares by patch version", () => {
    expect(compareVersions("1.0.2", "1.0.1")).toBe(1);
    expect(compareVersions("1.0.1", "1.0.2")).toBe(-1);
  });

  it("release is greater than qualified", () => {
    expect(compareVersions("1.0.0", "1.0.0-beta1")).toBe(1);
  });

  it("qualified is less than release", () => {
    expect(compareVersions("1.0.0-beta1", "1.0.0")).toBe(-1);
  });

  it("returns 0 for equal qualified versions", () => {
    expect(compareVersions("1.0.0-jre", "1.0.0-jre")).toBe(0);
  });

  it("compares qualifiers lexicographically", () => {
    expect(compareVersions("1.0.0-alpha", "1.0.0-beta")).toBe(-1);
    expect(compareVersions("1.0.0-beta", "1.0.0-alpha")).toBe(1);
  });

  it("handles two-part vs three-part versions", () => {
    // '1.0' parses as 1.0.0
    expect(compareVersions("1.0", "1.0.0")).toBe(0);
  });

  it("handles mixed qualifier presence across different numeric versions", () => {
    // 2.0.0-beta is still "greater" than 1.9.9 by major
    expect(compareVersions("2.0.0-beta1", "1.9.9")).toBe(1);
  });
});
