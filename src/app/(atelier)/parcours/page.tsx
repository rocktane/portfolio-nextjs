import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/atelier/Icon";
export const metadata: Metadata = {
  title: "Parcours",
  description:
    "De la construction durable au développement fullstack et mobile : le parcours de Yohan Gouiran.",
  alternates: { canonical: "/parcours" },
};
const experiences = [
  {
    period: "2024–2026",
    title: "Développeur Fullstack / mobile",
    company: "Safee",
    detail: "Application mobile, API & infrastructure",
    tags: ["React Native", "TypeScript", "NestJS"],
  },
  {
    period: "2024–2026",
    title: "Architecte des systèmes d’information",
    company: "Epitech",
    detail: "Master, spécialité intelligence artificielle",
    tags: ["Architecture SI", "IA"],
  },
  {
    period: "2024",
    title: "Professeur assistant",
    company: "Le Wagon",
    detail: "Accompagnement des élèves en développement web",
    tags: ["Ruby on Rails", "JavaScript"],
  },
  {
    period: "2023",
    title: "Développement web",
    company: "Le Wagon",
    detail: "Bootcamp & reconversion",
    tags: ["Ruby", "SQL", "JavaScript"],
  },
  {
    period: "2018–2023",
    title: "Ingénieur en construction durable",
    company: "ESTP Paris · Bureaux d’études",
    detail: "5 ans dans la construction et l’environnement",
    tags: ["Ingénierie", "Gestion de projets"],
  },
];
export default function CareerPage() {
  return (
    <>
      <div className="page-heading">
        <h1>Parcours</h1>
        <a
          className="outline-button"
          href="/CV-20260409.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ouvrir le CV
          <Icon name="arrow" />
        </a>
      </div>
      <div className="career-intro">
        <h2>Yohan Gouiran</h2>
        <p>Développeur Fullstack / mobile · Marseille</p>
      </div>
      <ol className="career-list">
        {experiences.map((experience, index) => (
          <li
            key={experience.company + experience.period}
            className={index === 0 ? "career-current" : ""}
          >
            <time>{experience.period}</time>
            <div>
              <span className="career-company">{experience.company}</span>
              <h2>{experience.title}</h2>
              <p>{experience.detail}</p>
              <div className="technology-list">
                {experience.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="career-actions">
        <Link className="solid-button" href="/contact">
          Contacter Yohan
          <Icon name="arrow" />
        </Link>
      </div>
    </>
  );
}
