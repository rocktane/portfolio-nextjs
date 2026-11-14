import { useSyncExternalStore } from "react";

/** A local visitor workspace. Invalid or unavailable storage never prevents editing. */
export function createLocalStore<T>(
  key: string,
  initial: T,
  validate: (value: unknown) => value is T,
) {
  let current = initial;
  let observed: string | null | undefined;
  const listeners = new Set<() => void>();
  function snapshot() {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== observed) {
        observed = raw;
        if (raw === null) current = initial;
        else {
          try {
            const parsed: unknown = JSON.parse(raw);
            current = validate(parsed) ? parsed : initial;
          } catch {
            current = initial;
          }
        }
      }
    } catch {
      /* Keep the in-memory workspace when storage is denied. */
    }
    return current;
  }
  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }
  function set(value: T) {
    current = value;
    let persisted = true;
    try {
      const raw = JSON.stringify(value);
      localStorage.setItem(key, raw);
      observed = raw;
    } catch {
      persisted = false;
    }
    listeners.forEach((listener) => listener());
    return persisted;
  }
  return {
    useValue: () => useSyncExternalStore(subscribe, snapshot, () => initial),
    set,
    initial,
  };
}
