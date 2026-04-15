import type { Json } from "@/integrations/supabase/types";

import { sanitizeChanges } from "./adminAuditLogUtils";

describe("sanitizeChanges", () => {
  it("redacts nested secrets without dropping safe fields", () => {
    const input: Json = {
      token: "top-level-secret",
      nested: {
        refresh_token: "nested-secret",
        safe: "visible",
      },
      items: [
        {
          password: "array-secret",
        },
      ],
      html: "<script>alert('xss')</script>",
    };

    const output = sanitizeChanges(input);

    expect(output).toContain("[REDACTED]");
    expect(output).toContain("visible");
    expect(output).toContain("<script>alert('xss')</script>");
    expect(output).not.toContain("top-level-secret");
    expect(output).not.toContain("nested-secret");
    expect(output).not.toContain("array-secret");
  });
});
