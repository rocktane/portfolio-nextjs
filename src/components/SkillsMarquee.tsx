import { technologies } from "@/data/projects";

/**
 * Infinite skills marquee.
 *
 * Two identical groups sit side by side inside a `width: max-content` track,
 * and the track is translated by exactly -50% — i.e. exactly one group — so the
 * loop restarts on a pixel-identical frame and the seam is invisible.
 * Hovering pauses the scroll and dims every item except the one under the cursor.
 */
export default function SkillsMarquee() {
  return (
    <section className="marquee" aria-label="Compétences techniques">
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="marquee__group"
            /* The second copy is purely decorative padding for the loop */
            aria-hidden={copy === 1 || undefined}
          >
            {technologies.map((tech) => (
              <li key={tech} className="marquee__item">
                {tech}
                <span className="marquee__dot" aria-hidden="true">
                  •
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
