export type ThemePreference = "light" | "system" | "dark";
export const THEME_KEY = "atelier.theme";
let sessionPreference: ThemePreference = "system";
let storageWritable = true;
export function readThemePreference(): ThemePreference {
  if (!storageWritable) return sessionPreference;
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return sessionPreference;
  }
}
export function applyTheme(preference: ThemePreference) {
  const dark =
    preference === "dark" ||
    (preference === "system" &&
      matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.dataset.themePreference = preference;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#0c2018" : "#f5f7f4");
}
export function saveThemePreference(preference: ThemePreference) {
  sessionPreference = preference;
  try {
    if (preference === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, preference);
    storageWritable = true;
  } catch {
    storageWritable = false;
  }
  applyTheme(preference);
  window.dispatchEvent(new Event("atelier:theme"));
}
export function subscribeTheme(listener: () => void) {
  const system = matchMedia("(prefers-color-scheme: dark)");
  const sync = () => {
    applyTheme(readThemePreference());
    listener();
  };
  const storage = (event: StorageEvent) => {
    if (event.key !== THEME_KEY && event.key !== null) return;
    storageWritable = true;
    sync();
  };
  sync();
  system.addEventListener("change", sync);
  window.addEventListener("storage", storage);
  window.addEventListener("atelier:theme", listener);
  return () => {
    system.removeEventListener("change", sync);
    window.removeEventListener("storage", storage);
    window.removeEventListener("atelier:theme", listener);
  };
}
// Runs in <head>, before the app paints, including when storage is blocked.
export const THEME_INIT = `(function(){var t='system';try{var s=localStorage.getItem('${THEME_KEY}');if(s==='light'||s==='dark')t=s;}catch(e){}var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.dataset.themePreference=t;})();`;
