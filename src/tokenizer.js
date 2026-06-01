import { encode as encodeO200k, decode as decodeO200k } from "gpt-tokenizer/encoding/o200k_base"
import { encode as encodeCl100k, decode as decodeCl100k } from "gpt-tokenizer/encoding/cl100k_base"

/**
 * Token counts are tokenizer-specific. These are OpenAI's BPE encodings:
 *   o200k_base  - GPT-4o, GPT-4.1, GPT-5 family (the current default)
 *   cl100k_base - GPT-4, GPT-3.5-turbo
 * They are a solid "roughly how many tokens" read; Claude and Gemini tokenize
 * differently.
 */
const ENCODINGS = {
  o200k_base: { encode: encodeO200k, decode: decodeO200k },
  cl100k_base: { encode: encodeCl100k, decode: decodeCl100k },
}

export const ENCODING_NAMES = Object.keys(ENCODINGS)

// returns { count, tokens: [{ id, text }] }
export const tokenize = (text, encoding = "o200k_base") => {
  const enc = ENCODINGS[encoding] || ENCODINGS.o200k_base
  const ids = enc.encode(text || "")
  return {
    count: ids.length,
    tokens: ids.map((id) => ({ id, text: enc.decode([id]) })),
  }
}
