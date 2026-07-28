/** État d'avancement d'un projet. */
export type ProjectStatus = "live" | "beta" | "wip" | "unreleased" | "sunset";

/** Section du site où le projet apparaît. */
export type ProjectSection = "projets" | "labo" | "archives";

/** Nature du lien sortant, détermine le libellé du bouton. */
export type LinkKind = "site" | "code" | "brew";

/** Motif graphique utilisé pour les projets sans capture d'écran. */
export type PosterMotif =
  | "amp"
  | "tama"
  | "battery"
  | "cashou"
  | "nlp"
  | "kube"
  | "raycast";

/** Trame de fond de l'affiche : une par projet, pour que deux plans du
 *  carrousel ne se ressemblent jamais. */
export type PosterPattern = "grid" | "dots" | "diagonals" | "rings" | "scanlines";

export interface Project {
  id: string;
  title: string;
  /** L'accroche affichée sous le titre. Courte, une idée. */
  tagline: string;
  /** Description longue, dans le panneau de détail. */
  summary: string;
  year: string;
  role: string;
  stack: string[];
  status: ProjectStatus;
  section: ProjectSection;
  /** Couleur signature, utilisée en fond du visuel. */
  accent: string;
  href?: string;
  hrefLabel?: string;
  hrefKind?: LinkKind;
  /** Capture d'écran de l'interface. */
  shot?: string;
  /** Motif graphique, pour les projets sans capture exploitable. Sa présence
   *  signale aussi une application native : la fenêtre porte alors le nom de
   *  l'application, pas une URL. */
  motif?: PosterMotif;
  /** Trame de fond de l'affiche. `grid` par défaut. */
  pattern?: PosterPattern;
  /** Plateforme affichée en tête d'affiche dans le labo. `macOS` par défaut. */
  platform?: string;
  /** Présent dans le carrousel d'accueil. */
  hero?: boolean;
}

/** Une ligne du parcours ou de la stack. */
export interface CreditLine {
  role: string;
  value: string;
}
