import Image from "next/image";
import type { Project } from "@/types";
import Icon from "./Icon";
export default function ProjectImage({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  if (project.shot)
    return (
      <Image
        className="project-capture"
        src={project.shot}
        alt={`Capture d’écran de ${project.title}`}
        width={1440}
        height={900}
        sizes="(max-width: 600px) 100vw, (max-width: 1499px) 45vw, 30vw"
        priority={priority}
      />
    );
  return (
    <div className="project-no-capture">
      <Icon
        name={
          project.id === "travel-resolver"
            ? "route"
            : project.id === "kubequest"
              ? "code"
              : "archive"
        }
      />
      <span>{project.title}</span>
      <small>{project.stack.slice(0, 2).join(" / ")}</small>
    </div>
  );
}
