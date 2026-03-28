/** Maven version format: `major.minor.patch[-qualifier]` */

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  qualifier: string | null;
  original: string;
}

/** Splits a version string into numeric parts and an optional qualifier. */
export function parseVersion(version: string): ParsedVersion {
  const original = version;
  const hyphenIndex = version.indexOf("-");
  let numericPart: string;
  let qualifier: string | null = null;

  if (hyphenIndex !== -1) {
    numericPart = version.substring(0, hyphenIndex);
    qualifier = version.substring(hyphenIndex + 1);
  } else {
    numericPart = version;
  }

  const parts = numericPart.split(".").map(Number);

  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
    qualifier,
    original,
  };
}

/** Matches SNAPSHOT, alpha, beta, RC, CR, milestone (M#), DR, PR, and EA qualifiers. */
export function isPreRelease(version: string): boolean {
  const preReleasePatterns = [
    /SNAPSHOT/i,
    /alpha/i,
    /beta/i,
    /\bRC\d*/i,
    /\bCR\d*/i,
    /\bM\d+/i,
    /\bdr\d*/i,
    /\bpr\d*/i,
    /\bea\d*/i,
  ];
  return preReleasePatterns.some((pattern) => pattern.test(version));
}

/** Compares major → minor → patch, then treats unqualified as greater than qualified. */
export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const va = parseVersion(a);
  const vb = parseVersion(b);

  if (va.major !== vb.major) return va.major > vb.major ? 1 : -1;
  if (va.minor !== vb.minor) return va.minor > vb.minor ? 1 : -1;
  if (va.patch !== vb.patch) return va.patch > vb.patch ? 1 : -1;

  if (!va.qualifier && !vb.qualifier) return 0;
  if (!va.qualifier) return 1;
  if (!vb.qualifier) return -1;
  return va.qualifier < vb.qualifier ? -1 : va.qualifier > vb.qualifier ? 1 : 0;
}
