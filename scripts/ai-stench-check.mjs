#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// AI-STENCH MARKOV BLANKET — the boundary copy cannot cross with the smell on it.
//
// Operator doctrine (2026-06-02): "ensure HERALD writes our copy and that it works
// with GECKO to heal it and provide the markov blanket to prevent production of ANY
// AI stench in writing ever."
//
// HERALD writes → this gate scans → GECKO maintains the pattern set → only clean
// human voice crosses into production. Wire it as a pre-commit / pre-publish hook.
//
// Home: the `herald` construct (CANONICAL). Mirror lives at ~/.claude/scripts for cross-repo use.
// GECKO owns the evolving lexicon. Declared in construct.yaml verifiers[]; honored by the skill body.
//
// Usage:  node ai-stench-check.mjs <file...>        # exit 1 if HIGH stench found
//         node ai-stench-check.mjs --json <file...>
//         cat copy.md | node ai-stench-check.mjs -   # stdin
// ─────────────────────────────────────────────────────────────────────────────
import fs from "node:fs";

// severity: HIGH = blocks production. MED = strong smell, review. LOW = watch.
const RULES = [
  // The cardinal tell. Em dash / en dash. Hyphens (-) are fine.
  { id: "em-dash", sev: "HIGH", re: /[—–]/g, why: "em/en dash — the #1 LLM punctuation tell. Use a period, comma, or parens." },
  // The "not X, but Y" / "isn't X, it's Y" false-dichotomy cadence.
  { id: "false-dichotomy", sev: "HIGH", re: /\b(it['’]s|this is) not (just |merely |simply |only )?(an? |the )?[^.,;!?]{1,40}?,?\s*(it['’]s|but|rather)\b/gi, why: "the 'it's not X, it's Y' rhetorical cadence — pure LLM rhythm." },
  { id: "not-just-but", sev: "HIGH", re: /\bnot (just|only|merely|simply) [^.]{1,50}?,?\s*but\b/gi, why: "'not just X but Y' escalation pattern." },
  { id: "more-than-just", sev: "MED", re: /\bmore than just\b/gi, why: "'more than just' — overused setup." },
  // Stench lexicon — words LLMs reach for that humans rarely do in this register.
  { id: "lexicon", sev: "HIGH", re: /\b(delve|delving|tapestry|testament to|a testament|realm of|the realm|landscape of|ever-evolving|ever-changing|fast-paced|seamless(ly)?|robust|leverage|leverages|leveraging|elevate|elevates|unlock(s|ing)? the|embark|embarking|treasure trove|game[- ]changer|cutting-edge|state-of-the-art|harness(ing)? the power|navigat(e|ing) the|underscore(s|d)?|boasts|nestled|bustling|vibrant (community|world|ecosystem)|rich (history|tapestry)|plays? a (vital|crucial|key|pivotal) role|at the forefront|in the world of|a wide (range|array) of|when it comes to|first and foremost|rest assured)\b/gi, why: "AI-overused vocabulary for this register." },
  // Throat-clearing transitions & meta-hedging.
  { id: "throat-clear", sev: "MED", re: /(^|\n)\s*(In conclusion|Furthermore|Moreover|In today['’]s|In a world where|Needless to say|It['’]s worth noting that|That said,|At the end of the day|Whether you['’]re)\b/gi, why: "essay-bot transition / hedge opener." },
  // Hype adjectives in clusters (low-confidence, info only).
  { id: "hype", sev: "LOW", re: /\b(incredible|amazing|revolutionary|groundbreaking|unparalleled|world-class|next-level|supercharge[ds]?)\b/gi, why: "marketing-bot hype word." },
];

function scan(text, name) {
  const lines = text.split("\n");
  const hits = [];
  for (const rule of RULES) {
    lines.forEach((line, i) => {
      let m;
      const re = new RegExp(rule.re.source, rule.re.flags);
      while ((m = re.exec(line)) !== null) {
        hits.push({ file: name, line: i + 1, sev: rule.sev, id: rule.id, match: m[0].trim().replace(/\s+/g, " ").slice(0, 60), why: rule.why });
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    });
  }
  return hits;
}

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const files = args.filter((a) => a !== "--json");
let all = [];
if (files.length === 0 || files[0] === "-") {
  const stdin = fs.readFileSync(0, "utf8");
  all = scan(stdin, "<stdin>");
} else {
  for (const f of files) { try { all = all.concat(scan(fs.readFileSync(f, "utf8"), f)); } catch { console.error(`skip ${f}`); } }
}

const rank = { HIGH: 0, MED: 1, LOW: 2 };
all.sort((a, b) => rank[a.sev] - rank[b.sev] || a.line - b.line);
const high = all.filter((h) => h.sev === "HIGH").length;

if (asJson) { console.log(JSON.stringify({ stench: all.length, high, hits: all }, null, 2)); }
else {
  if (all.length === 0) { console.log("✓ clean — no AI stench detected. Copy may cross the blanket."); }
  else {
    console.log(`✗ ${all.length} stench marker(s) (${high} HIGH) — copy is held at the boundary:\n`);
    for (const h of all) console.log(`  [${h.sev}] ${h.file}:${h.line} · ${h.id} · "${h.match}"\n        ↳ ${h.why}`);
    console.log(`\n  HIGH markers block production. HERALD rewrites; re-run until clean.`);
  }
}
process.exit(high > 0 ? 1 : 0);
