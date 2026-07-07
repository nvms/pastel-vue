import MarkdownIt from "markdown-it"
import { tokenizeCode } from "./syntax.js"

const escapeHtml = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))

// fenced code blocks reuse the library's prism setup so they match CodeBlock.
// returning a full <pre> tells markdown-it to use it verbatim
const highlight = (code, lang) => {
  const tokens = tokenizeCode(code, lang)
  const body = tokens
    ? tokens
        .map((t) => (t.type ? `<span class="token ${t.type}">${escapeHtml(t.text)}</span>` : escapeHtml(t.text)))
        .join("")
    : escapeHtml(code)
  return `<pre class="pc-markdown__pre pc-syntax"><code>${body}</code></pre>`
}

const build = (breaks) => {
  // html: false keeps raw HTML in the source escaped, so rendering untrusted
  // model output is safe without a sanitizer pass
  const md = new MarkdownIt({ html: false, linkify: true, breaks, highlight })

  const defaultLink =
    md.renderer.rules.link_open ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet("target", "_blank")
    tokens[idx].attrSet("rel", "noopener noreferrer")
    return defaultLink(tokens, idx, options, env, self)
  }

  return md
}

const instances = {}

/**
 * Render a markdown string to HTML. Raw HTML in the source is escaped, links
 * open in a new tab, and fenced code blocks are highlighted with the same
 * Prism setup used by CodeBlock.
 *
 * @param {string} source markdown text
 * @param {{ breaks?: boolean }} [options] breaks: treat single newlines as line breaks (default true)
 * @returns {string} rendered HTML
 */
export const renderMarkdown = (source, { breaks = true } = {}) => {
  if (!source) return ""
  const key = breaks ? "breaks" : "plain"
  if (!instances[key]) instances[key] = build(breaks)
  return instances[key].render(source)
}
