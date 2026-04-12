// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://cmhc-multi-family.pages.dev",
  integrations: [mdx(), sitemap(), react()],
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
