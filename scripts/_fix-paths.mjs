import { readFile, writeFile } from "node:fs/promises"
const f = "src/data/products.js"
let s = await readFile(f, "utf8")
const slugs = ["h200","h100","l4","qm9700","connectx-7","bluefield-3","sn5600"]
const re = new RegExp("(nvidia-(?:" + slugs.join("|") + "))\\.jpg'(,\\s*dark:\\s*true)?", "g")
let n = 0
s = s.replace(re, (m, base) => { n++; return base + ".png'" })
await writeFile(f, s, "utf8")
console.log("rewritten:", n)
