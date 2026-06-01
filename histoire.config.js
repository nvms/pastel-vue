import { defineConfig } from "histoire"
import { HstVue } from "@histoire/plugin-vue"

export default defineConfig({
  plugins: [HstVue()],
  setupFile: "./src/histoire-setup.js",
  theme: {
    title: "Pastel Vue",
    favicon: undefined,
  },
  storyMatch: ["./stories/**/*.story.vue"],
  // gpt-tokenizer's subpath exports don't externalize cleanly in vite-node -
  // inline it so the story collector can resolve it
  viteNodeInlineDeps: [/gpt-tokenizer/],
})
