"use client";
import { useState } from "react";
import Icon from "./Icon";
export default function ContactActions() {
  const [copied, setCopied] = useState(false),
    [message, setMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText("dev@yohangouiran.com");
      setCopied(true);
      setMessage("Adresse copiée.");
    } catch {
      setCopied(false);
      setMessage(
        "La copie est indisponible. Sélectionnez l’adresse ci-dessus pour la copier.",
      );
    }
  }
  return (
    <>
      <div className="contact-actions">
        <a className="solid-button" href="mailto:dev@yohangouiran.com">
          Écrire un message
          <Icon name="arrow" />
        </a>
        <button type="button" className="outline-button" onClick={copy}>
          {copied ? "Copié !" : "Copier l’adresse"}
        </button>
      </div>
      <p className="contact-feedback" role="status">
        {message}
      </p>
    </>
  );
}
