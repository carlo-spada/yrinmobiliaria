import { describe, expect, it } from "vitest";

import { sanitizeRedirect } from "./safeRedirect";

describe("sanitizeRedirect", () => {
  it("accepts a normal internal path", () => {
    expect(sanitizeRedirect("/admin/users")).toBe("/admin/users");
  });

  it("preserves query string and hash on internal paths", () => {
    expect(sanitizeRedirect("/admin/users?tab=1#section")).toBe(
      "/admin/users?tab=1#section"
    );
  });

  it("rejects protocol-relative URLs (//evil.com)", () => {
    expect(sanitizeRedirect("//evil.com")).toBeNull();
    expect(sanitizeRedirect("//evil.com/path")).toBeNull();
  });

  it("rejects the backslash variant (/\\evil.com)", () => {
    expect(sanitizeRedirect("/\\evil.com")).toBeNull();
    expect(sanitizeRedirect("/\\/evil.com")).toBeNull();
  });

  it("rejects absolute URLs", () => {
    expect(sanitizeRedirect("https://evil.com")).toBeNull();
    expect(sanitizeRedirect("http://evil.com/admin")).toBeNull();
  });

  it("rejects non-rooted, empty and nullish values", () => {
    expect(sanitizeRedirect("admin")).toBeNull();
    expect(sanitizeRedirect("")).toBeNull();
    expect(sanitizeRedirect(null)).toBeNull();
    expect(sanitizeRedirect(undefined)).toBeNull();
  });
});
