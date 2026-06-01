import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// histoire builds the public showcase through vite. when deploying to a github
// pages project site the assets live under /<repo>/, so honor an env override
export default defineConfig({
  base: process.env.HISTOIRE_BASE || "/",
  plugins: [vue()],
})
