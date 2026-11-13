import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/projets",
    "/a-essayer",
    "/labo",
    "/parcours",
    "/contact",
    "/archives",
    ...projects.map((p) => `/projets/${p.id}`),
  ].map((path) => ({
    url: `https://yohangouiran.com${path}`,
    lastModified: new Date("2026-11-13"),
    changeFrequency: "monthly",
    priority: path ? 0.6 : 1,
  }));
}
