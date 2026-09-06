import { parseUsernameFromQR, buildProfileQRUrl } from "../qr";

describe("QR Utilities", () => {
  describe("parseUsernameFromQR", () => {
    it("parses canonical scheme nihongo://friends/profile/{username}", () => {
      expect(parseUsernameFromQR("nihongo://friends/profile/tanaka")).toBe(
        "tanaka",
      );
    });

    it("parses canonical scheme with @ prefix", () => {
      expect(parseUsernameFromQR("nihongo://friends/profile/@tanaka")).toBe(
        "tanaka",
      );
    });

    it("parses legacy scheme nihongoapp://profile/@{username}", () => {
      expect(parseUsernameFromQR("nihongoapp://profile/@yamada")).toBe(
        "yamada",
      );
      expect(parseUsernameFromQR("nihongoapp://profile/yamada")).toBe("yamada");
    });

    it("parses frontend scheme frontend://friends/profile/{username}", () => {
      expect(parseUsernameFromQR("frontend://friends/profile/kenji")).toBe(
        "kenji",
      );
    });

    it("parses web universal links", () => {
      expect(parseUsernameFromQR("https://nihongoapp.com/profile/sakura")).toBe(
        "sakura",
      );
      expect(parseUsernameFromQR("https://nihongoapp.com/user/@sakura")).toBe(
        "sakura",
      );
      expect(
        parseUsernameFromQR("http://nihongoapp.com/friends/profile/sakura"),
      ).toBe("sakura");
    });

    it("parses plain usernames with and without @", () => {
      expect(parseUsernameFromQR("daiki")).toBe("daiki");
      expect(parseUsernameFromQR("@daiki")).toBe("daiki");
      expect(parseUsernameFromQR("  @daiki_123  ")).toBe("daiki_123");
    });

    it("strips trailing query parameters and hashes", () => {
      expect(
        parseUsernameFromQR("nihongo://friends/profile/tanaka?ref=qr#section"),
      ).toBe("tanaka");
      expect(parseUsernameFromQR("@tanaka?source=camera")).toBe("tanaka");
    });

    it("returns null for invalid or empty inputs", () => {
      expect(parseUsernameFromQR("")).toBeNull();
      expect(parseUsernameFromQR("   ")).toBeNull();
      expect(parseUsernameFromQR(null as any)).toBeNull();
      expect(parseUsernameFromQR(undefined as any)).toBeNull();
      expect(
        parseUsernameFromQR(
          "https://randomsite.com/invalid/deep/path/to/nothing/here/more",
        ),
      ).toBeNull();
      expect(parseUsernameFromQR("invalid:string:with:colons")).toBeNull();
    });
  });

  describe("buildProfileQRUrl", () => {
    it("builds the canonical URL for username", () => {
      expect(buildProfileQRUrl("tanaka")).toBe(
        "nihongo://friends/profile/tanaka",
      );
    });

    it("strips leading @ from username if passed", () => {
      expect(buildProfileQRUrl("@tanaka")).toBe(
        "nihongo://friends/profile/tanaka",
      );
      expect(buildProfileQRUrl("  @tanaka  ")).toBe(
        "nihongo://friends/profile/tanaka",
      );
    });
  });
});
