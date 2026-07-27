/**
 * Constantes non typographiques. Les couleurs et les polices vivent dans
 * globals.css (@theme) — Tailwind y est la source unique de vérité.
 */

/**
 * Identifiant du formulaire, celui de `form.typeform.com/to/<id>`.
 *
 * Typeform en expose deux : l'identifiant « live » (`01HMTZ…`), réservé à
 * l'embarqué en pleine page, et l'identifiant du formulaire, seul accepté par
 * la surcouche. Le premier ne déclenche rien en popup — il échoue en silence,
 * sans erreur en console.
 */
export const TYPEFORM_ID = process.env.NEXT_PUBLIC_TYPEFORM_ID ?? "lgl3RBTB";

export const MAP_CONFIG = {
  /** Marseille [latitude, longitude] — les coordonnées affichées dans le texte. */
  center: [43.2969, 5.3699] as [number, number],
  /**
   * Le repère, et le cadrage avec lui, sont posés un peu au nord du point
   * exact. Les tuiles ancrent le nom de la ville sur ces mêmes coordonnées :
   * centré dessus, le point se retrouvait au milieu des lettres. Panoramiquer
   * n'y changeait rien — le nom suit le lieu. Un demi-kilomètre de décalage
   * dégage le mot, ce qui est sans conséquence pour une carte qui situe.
   */
  marker: [43.3019, 5.3699] as [number, number],
  zoom: 12,
  /** Tuiles sombres CartoDB — la désaturation finale est faite en CSS. */
  tileUrl: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}",
  subdomains: "abcd",
} as const;
