"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import {
  DEFAULT_GUEST_NAME,
  GUEST_NAME_KEY,
  guestInitials,
  normalizeGuestName,
} from "@/lib/guest-name";
import Icon from "./Icon";
let sessionName = DEFAULT_GUEST_NAME;
let storageWritable = true;
function snapshot() {
  if (!storageWritable) return sessionName;
  try {
    return normalizeGuestName(
      localStorage.getItem(GUEST_NAME_KEY) ?? DEFAULT_GUEST_NAME,
    );
  } catch {
    return sessionName;
  }
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("atelier:guest", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("atelier:guest", listener);
  };
}
export default function GuestIdentity() {
  const name = useSyncExternalStore(
    subscribe,
    snapshot,
    () => DEFAULT_GUEST_NAME,
  );
  const [editing, setEditing] = useState(false),
    [draft, setDraft] = useState(""),
    [message, setMessage] = useState("");
  const cancelled = useRef(false);
  function save() {
    if (cancelled.current) return;
    const next = normalizeGuestName(draft);
    sessionName = next;
    try {
      if (next === DEFAULT_GUEST_NAME) localStorage.removeItem(GUEST_NAME_KEY);
      else localStorage.setItem(GUEST_NAME_KEY, next);
      storageWritable = true;
      setMessage("Nom enregistré sur cet appareil.");
    } catch {
      storageWritable = false;
      setMessage(
        "Nom modifié pour cette visite. Le stockage local est indisponible.",
      );
    }
    window.dispatchEvent(new Event("atelier:guest"));
    setEditing(false);
  }
  return (
    <div className="guest-identity">
      <span className="guest-avatar" aria-hidden="true">
        {guestInitials(name)}
      </span>
      <div className="guest-text">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <input
              autoFocus
              aria-label="Votre prénom ou pseudo"
              value={draft}
              maxLength={64}
              onChange={(e) => setDraft(e.target.value)}
              onFocus={(e) => e.currentTarget.select()}
              onBlur={save}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  cancelled.current = true;
                  setEditing(false);
                }
              }}
            />
          </form>
        ) : (
          <button
            className="guest-name"
            type="button"
            aria-label={`Renommer l’invité, actuellement ${name}`}
            title="Cliquer pour changer votre nom"
            onClick={() => {
              cancelled.current = false;
              setDraft(name === DEFAULT_GUEST_NAME ? "" : name);
              setEditing(true);
            }}
          >
            <span>{name}</span>
            <Icon name="edit" />
          </button>
        )}
        <span className="guest-role">Session invitée</span>
      </div>
      <span className="sr-only" role="status">
        {message}
      </span>
    </div>
  );
}
