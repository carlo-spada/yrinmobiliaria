import { vi } from "vitest";

import { runAdminHealthChecks } from "./adminHealthChecks";

describe("runAdminHealthChecks", () => {
  it("uses only read-only storage probes", async () => {
    const listMock = vi.fn().mockResolvedValue({ data: [], error: null });
    const uploadMock = vi.fn();
    const removeMock = vi.fn();

    const client = {
      from: vi.fn((table: string) => {
        if (table === "properties") {
          return {
            select: vi.fn().mockResolvedValue({ error: null, count: 3 }),
          };
        }

        if (table === "profiles") {
          return {
            select: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue({ error: null }),
            })),
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      }),
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      },
      storage: {
        from: vi.fn(() => ({
          list: listMock,
          upload: uploadMock,
          remove: removeMock,
        })),
      },
      channel: vi.fn(() => ({ id: "health-check" })),
      removeChannel: vi.fn().mockResolvedValue(undefined),
    };

    const checks = await runAdminHealthChecks(
      client as NonNullable<Parameters<typeof runAdminHealthChecks>[0]>
    );

    expect(checks.some((check) => check.name === "Storage Path Access")).toBe(true);
    expect(uploadMock).not.toHaveBeenCalled();
    expect(removeMock).not.toHaveBeenCalled();
    expect(listMock).toHaveBeenCalledTimes(2);
  });
});
