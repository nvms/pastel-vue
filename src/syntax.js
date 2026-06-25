import Prism from "prismjs"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-markup"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-css"
import "prismjs/components/prism-json"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-python"
import "prismjs/components/prism-yaml"
import "prismjs/components/prism-sql"
import "prismjs/components/prism-markdown"
import "prismjs/components/prism-go"
import "prismjs/components/prism-rust"

// stop Prism from auto-highlighting the page - this library highlights on demand
Prism.manual = true

const ALIAS = {
  js: "javascript",
  ts: "typescript",
  html: "markup",
  xml: "markup",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  md: "markdown",
  py: "python",
}

export const resolveLanguage = (lang) => {
  if (!lang) return null
  const key = ALIAS[lang] || lang
  return Prism.languages[key] ? key : null
}

// flatten Prism's nested token tree into a flat list of { text, type } pieces,
// where type is the deepest syntactic scope (or null for plain text)
const flatten = (nodes, type, out) => {
  for (const node of nodes) {
    if (typeof node === "string") {
      if (node.length) out.push({ text: node, type })
    } else {
      // markdown wraps emphasized text in a generic "content" child - keep the
      // meaningful enclosing scope (bold, italic, url, title) instead of descending past it
      const t = node.type && node.type !== "content" ? node.type : type
      const content = node.content
      if (typeof content === "string") {
        if (content.length) out.push({ text: content, type: t })
      } else if (Array.isArray(content)) {
        flatten(content, t, out)
      } else if (content) {
        flatten([content], t, out)
      }
    }
  }
  return out
}

// returns a flat [{ text, type }] covering the whole line, or null when the
// language is unknown (caller should fall back to plain text)
export const tokenizeCode = (code, lang) => {
  const key = resolveLanguage(lang)
  if (!key) return null
  try {
    return flatten(Prism.tokenize(code, Prism.languages[key]), null, [])
  } catch {
    return null
  }
}
