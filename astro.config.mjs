// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://cmhc-multi-family.pages.dev",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes("/404") &&
        !page.includes("/cookie-policy") &&
        !page.includes("/privacy") &&
        !page.includes("/terms"),
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      i18n: {
        defaultLocale: "en",
        locales: { en: "en-CA" },
      },
      serialize(item) {
        const url = item.url;
        // Homepage gets highest priority
        if (url.endsWith("/") && url.split("/").length <= 4) {
          item.priority = 1.0;
          item.changefreq = "weekly";
          return item;
        }
        // Top-level hubs (programs, underwriting, calculators, tools, etc.)
        if (/\/(programs|calculators|tools|underwriting|eligibility|lifecycle|provinces|developers)\/?$/.test(url)) {
          item.priority = 0.9;
          item.changefreq = "weekly";
          return item;
        }
        // Key landing content
        if (/\/(faq|glossary|data|policy|timeline|lenders)\/?$/.test(url)) {
          item.priority = 0.85;
          item.changefreq = "weekly";
          return item;
        }
        // Legal/utility
        if (/\/(privacy|terms|cookie-policy|404)\/?$/.test(url)) {
          item.priority = 0.2;
          item.changefreq = "yearly";
          return item;
        }
        // Everything else (detail pages)
        item.priority = 0.7;
        item.changefreq = "monthly";
        return item;
      },
    }),
    react(),
  ],
  output: "static",

  fonts: [
    {
      provider: fontProviders.google(),
      name: "Figtree",
      cssVariable: "--font-figtree",
      weights: ["400", "500", "600", "700"],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
