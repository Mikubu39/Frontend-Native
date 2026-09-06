/**
 * Utilities for parsing and generating QR code data for user profiles.
 */

/**
 * Parses raw QR code string and extracts a clean username.
 * Supports:
 * - Scheme URLs: `nihongo://friends/profile/username`, `nihongoapp://profile/@username`, etc.
 * - HTTP(S) URLs: `https://nihongoapp.com/profile/username`, `https://nihongoapp.com/user/@username`
 * - Plain username strings: `username`, `@username`
 *
 * @param rawData The raw string decoded from the QR code.
 * @returns Clean username without leading '@', or null if invalid.
 */
export function parseUsernameFromQR(
  rawData: string | null | undefined,
): string | null {
  if (!rawData || typeof rawData !== "string") {
    return null;
  }

  const trimmed = rawData.trim();
  if (!trimmed) {
    return null;
  }

  let candidate = trimmed;

  // 1. If it's a URL (custom scheme or HTTP/HTTPS)
  if (candidate.includes("://")) {
    const urlMatch = candidate.match(
      /(?:friends\/profile|profile|user)\/([^/?#]+)/i,
    );
    if (urlMatch && urlMatch[1]) {
      candidate = urlMatch[1];
    } else {
      // Unrecognized URL schema or path
      return null;
    }
  }

  // 2. Remove any trailing slashes, queries, or hashes
  candidate = candidate.split("?")[0].split("#")[0].replace(/\/+$/, "").trim();

  // 3. Strip leading '@' if present
  candidate = candidate.replace(/^@+/, "").trim();

  // 4. Validate candidate username (allow alphanumeric, underscore, hyphen, dot)
  if (!candidate || candidate.length > 50) {
    return null;
  }

  // Reject if candidate still contains protocols, colons, slashes, or whitespace
  if (
    candidate.includes("/") ||
    candidate.includes(":") ||
    candidate.includes(" ")
  ) {
    return null;
  }

  return candidate;
}

/**
 * Builds the canonical deep link URL for a user's profile QR code.
 */
export function buildProfileQRUrl(username: string): string {
  const clean = (username || "").trim().replace(/^@+/, "");
  return `nihongo://friends/profile/${clean}`;
}
