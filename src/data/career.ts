export type CareerEntry = {
  id: string;
  title: string;
  organization: string;
  kind: "Expérience" | "Formation" | "Voyage";
  period: string;
  start: string;
  end: string;
  contract: string;
  domain: string;
  skills: string[];
  context: string;
  contributions: string[];
  projects: string[];
  diploma: string;
  specialty: string;
  team: string;
  url: string;
};
const entry = (
  value: Partial<CareerEntry> &
    Pick<
      CareerEntry,
      | "id"
      | "title"
      | "organization"
      | "kind"
      | "period"
      | "start"
      | "end"
      | "domain"
    >,
): CareerEntry => ({
  contract: "",
  skills: [],
  context: "",
  contributions: [],
  projects: [],
  diploma: "",
  specialty: "",
  team: "",
  url: "",
  ...value,
});

// Sources : CV fullstack v03 (octobre 2026) et contenu public du portfolio.
// Une propriété vide est une information non documentée, jamais une déduction.
// Format des périodes : « mois aaaa → mois aaaa » (mois abrégés si longs), ou « aaaa → aaaa ».
export const career: CareerEntry[] = [
  entry({
    id: "safee",
    title: "Développeur fullstack web et mobile",
    organization: "Safee",
    kind: "Expérience",
    period: "sept. 2024 → sept. 2026",
    start: "2024-09",
    end: "2026-09",
    contract: "Alternance",
    domain: "Développement",
    skills: [
      "TypeScript",
      "React",
      "React Native",
      "NestJS",
      "PostgreSQL",
      "Kotlin",
      "Swift",
      "Python",
      "n8n",
    ],
    context:
      "Solution de sécurité B2B pour les collaborateurs mobiles et les travailleurs isolés.",
    contributions: [
      "Alertes WebSocket et notifications web push, du backend NestJS aux écrans React ; pagination et indexation PostgreSQL.",
      "Refonte de l’application React Native à partir de maquettes Figma et évolution du backoffice React ; correction de vulnérabilités et authentification TOTP.",
      "Conception et livraison de SDK Android (Kotlin) et iOS (Swift), avec API et documentation d’intégration.",
      "Chatbot RAG sur la documentation produit et API Python d’OCR intégrée à des workflows n8n.",
    ],
    projects: ["safee"],
    team: "Équipe software de 2 personnes",
    url: "https://safee.fr",
  }),
  entry({
    id: "epitech",
    title: "Architecte des systèmes d’information",
    organization: "Epitech",
    kind: "Formation",
    period: "sept. 2024 → sept. 2026",
    start: "2024-09",
    end: "2026-09",
    contract: "N/A",
    domain: "Informatique & IA",
    diploma: "Master obtenu en 2026",
    specialty: "Intelligence artificielle",
    skills: [
      "Architecture SI",
      "IA",
      "tRPC",
      "Kubernetes",
      "Terraform",
      "ArgoCD",
    ],
    context:
      "Formation en architecture des systèmes d’information, spécialité intelligence artificielle.",
    contributions: [
      "Cashou : projet de fin d’études sur deux ans.",
      "Déploiement AWS avec Kubernetes, Helm, Terraform et ArgoCD.",
    ],
    projects: ["cashou"],
  }),
  entry({
    id: "missions-ia",
    title: "Déploiement d’agents IA",
    organization: "SASU",
    kind: "Expérience",
    period: "févr. 2026 → mai 2026",
    start: "2026-02",
    end: "2026-05",
    contract: "Indépendant",
    domain: "IA & automatisation",
    skills: ["OpenClaw", "Hermes Agent", "Automatisation"],
    context: "Deux missions pour des indépendants.",
    contributions: [
      "Déploiement d’agents pour automatiser des tâches et connecter les outils des utilisateurs.",
    ],
  }),
  entry({
    id: "wagon-assistant",
    title: "Professeur assistant",
    organization: "Le Wagon",
    kind: "Expérience",
    period: "févr. 2024 → juin 2024",
    start: "2024-02",
    end: "2024-06",
    contract: "Indépendant",
    domain: "Enseignement",
    skills: ["HTML", "CSS", "JavaScript", "Ruby", "Ruby on Rails"],
    context: "Accompagnement des élèves en développement web.",
    contributions: [
      "Accompagnement en HTML, CSS, JavaScript, Ruby et Ruby on Rails.",
    ],
  }),
  entry({
    id: "voyage-sac-a-dos",
    title: "Voyage en sac-à-dos",
    organization: "N/A",
    kind: "Voyage",
    period: "mai 2022 → juil. 2023",
    start: "2022-05",
    end: "2023-07",
    contract: "N/A",
    domain: "Culture",
    skills: ["Anglais", "Espagnol", "Organisation"],
  }),
  entry({
    id: "wagon-bootcamp",
    title: "Bootcamp Web Development",
    organization: "Le Wagon",
    kind: "Formation",
    period: "oct. 2023 → déc. 2023",
    start: "2023-10",
    end: "2023-12",
    contract: "N/A",
    domain: "Développement",
    skills: ["Ruby", "Ruby on Rails", "SQL", "JavaScript"],
    context:
      "Reconversion de l’ingénierie de la construction vers le développement web.",
    projects: ["geeft"],
  }),
  entry({
    id: "gon",
    title: "Chef de projets et chargé d’études",
    organization: "G-ON",
    kind: "Expérience",
    period: "mai 2021 → déc. 2021",
    start: "2021-05",
    end: "2021-12",
    contract: "CDI",
    domain: "Construction durable",
    skills: ["BREEAM In-Use", "Gestion de projets"],
    context: "Études et certifications environnementales.",
    contributions: ["Certifications BREEAM In-Use."],
  }),
  entry({
    id: "ratp",
    title: "Chef de projets adjoint — ligne 14",
    organization: "RATP",
    kind: "Expérience",
    period: "nov. 2020 → mai 2021",
    start: "2020-11",
    end: "2021-05",
    contract: "CDI",
    domain: "Construction & transport",
    skills: ["BIM", "Revit", "Gestion de projets"],
    context: "Projet de la ligne 14.",
    contributions: [
      "Gestion des interfaces inter-entreprises et synthèse BIM sur Revit.",
    ],
  }),
  entry({
    id: "themaverde",
    title: "Ingénieur énergie environnement",
    organization: "ThemaVerde",
    kind: "Expérience",
    period: "sept. 2018 → janv. 2020",
    start: "2018-09",
    end: "2020-01",
    contract: "CDI",
    domain: "Construction durable",
    skills: ["LEED", "HQE", "Commissioning"],
    contributions: ["Certifications LEED/HQE et commissioning."],
  }),
  entry({
    id: "themaverde-apprentissage",
    title: "Apprenti ingénieur",
    organization: "ThemaVerde",
    kind: "Expérience",
    period: "sept. 2014 → sept. 2018",
    start: "2014-09",
    end: "2018-09",
    contract: "Apprentissage",
    domain: "Construction durable",
    skills: ["LEED", "HQE", "Commissioning"],
    context: "Apprentissage en ingénierie énergie et environnement.",
    contributions: ["Certifications LEED/HQE et commissioning."],
  }),
  entry({
    id: "estp",
    title: "Ingénieur Énergétique de la Construction Durable",
    organization: "ESTP Paris",
    kind: "Formation",
    period: "sept. 2015 → sept. 2018",
    start: "2015-09",
    end: "2018-09",
    contract: "N/A",
    domain: "Construction durable",
    diploma: "Diplôme d’ingénieur, 2018",
    specialty: "Énergétique de la Construction Durable",
    skills: ["Ingénierie", "Énergie", "Environnement"],
  }),
];
