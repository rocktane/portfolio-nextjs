import { describe, expect, test } from "bun:test";
import { guestInitials, normalizeGuestName } from "../../src/lib/guest-name";
describe("guest display name", () => {
  test("blank names return to the anonymous guest", () => {
    expect(normalizeGuestName("  \n ")).toBe("Invité");
  });
  test("preserves real names and trims whitespace/control characters", () => {
    expect(normalizeGuestName("  Léa   Martin\u0000 ")).toBe("Léa Martin");
    expect(guestInitials("Léa Martin")).toBe("LM");
  });
  test("limits Unicode code points without breaking an emoji surrogate pair", () => {
    const name = normalizeGuestName("🙂".repeat(40));
    expect(Array.from(name)).toHaveLength(32);
    expect(name.endsWith("🙂")).toBe(true);
  });
});
