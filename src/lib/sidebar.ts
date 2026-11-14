export const SIDEBAR_KEY = "atelier.sidebar";
const EVENT = "atelier:sidebar";
let sessionCollapsed = false;
let storageWritable = true;
export function readSidebarCollapsed(): boolean {
  if (!storageWritable) return sessionCollapsed;
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "collapsed";
  } catch {
    return sessionCollapsed;
  }
}
export function applySidebar(collapsed: boolean) {
  const root = document.documentElement;
  if (collapsed) root.dataset.sidebar = "collapsed";
  else delete root.dataset.sidebar;
}
export function saveSidebarCollapsed(collapsed: boolean) {
  sessionCollapsed = collapsed;
  try {
    if (collapsed) localStorage.setItem(SIDEBAR_KEY, "collapsed");
    else localStorage.removeItem(SIDEBAR_KEY);
    storageWritable = true;
  } catch {
    storageWritable = false;
  }
  applySidebar(collapsed);
  window.dispatchEvent(new Event(EVENT));
}
export function subscribeSidebar(listener: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key !== SIDEBAR_KEY && event.key !== null) return;
    storageWritable = true;
    applySidebar(readSidebarCollapsed());
    listener();
  };
  window.addEventListener("storage", storage);
  window.addEventListener(EVENT, listener);
  return () => {
    window.removeEventListener("storage", storage);
    window.removeEventListener(EVENT, listener);
  };
}
// Runs in <head> so a collapsed sidebar never flashes open on load.
export const SIDEBAR_INIT = `(function(){try{if(localStorage.getItem('${SIDEBAR_KEY}')==='collapsed')document.documentElement.dataset.sidebar='collapsed';}catch(e){}})();`;
