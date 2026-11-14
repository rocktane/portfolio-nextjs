"use client";
import { useState } from "react";
import { tryTools } from "@/data/try-tools";
import Icon from "./Icon";
export default function TryTools() {
  const [copied, setCopied] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  async function copy(id: string, command: string) {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(id);
      setMessage("Commande copiée.");
    } catch {
      setCopied(null);
      setMessage("Copie indisponible. Sélectionnez la commande ci-dessous.");
    }
  }
  return (
    <>
      <ul className="try-tools">
        {tryTools.map(
          ({ id, project, action, constraint, command, href, description }) => (
            <li key={id}>
              <div className="try-tool-info">
                <h2>{project.title}</h2>
                <p>{description}</p>
                <span className="tool-constraint">{constraint}</span>
                {command && <code className="install-command">{command}</code>}
              </div>
              {command ? (
                <button
                  className="outline-button"
                  onClick={() => void copy(id, command)}
                >
                  {copied === id ? "Copié !" : action}
                </button>
              ) : (
                <a
                  className="outline-button"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {action}
                  <Icon name="arrow" />
                  <span className="sr-only"> {project.title}</span>
                </a>
              )}
            </li>
          ),
        )}
      </ul>
      <p className="tool-feedback" role="status">
        {message}
      </p>
    </>
  );
}
