export const GUEST_NAME_KEY = "atelier.guest-name";
export const DEFAULT_GUEST_NAME = "Invité";
export const MAX_GUEST_NAME_LENGTH = 32;
export function normalizeGuestName(value: string): string {
  return (
    Array.from(
      value
        .replace(/[\u0000-\u001f\u007f]/g, "")
        .trim()
        .replace(/\s+/g, " "),
    )
      .slice(0, MAX_GUEST_NAME_LENGTH)
      .join("") || DEFAULT_GUEST_NAME
  );
}
export function guestInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0] ?? "")
    .join("")
    .toLocaleUpperCase("fr");
}
