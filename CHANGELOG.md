# Changelog

All notable changes to Herald will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-06-02

### Added
- **Honored Verification** (ACVP at the construct layer): HERALD reasons, a deterministic tool verifies, and HERALD's active inference honors the verdict.
  - `scripts/ai-stench-check.mjs` — the AI-stench markov blanket. Blocks production on em/en dashes, the "it's not X, it's Y" cadence, the LLM lexicon, throat-clear transitions, and hype words. Exit 1 on any HIGH marker.
  - Declared as a first-class verifier in `construct.yaml` (`verifiers[]`, id `ai-stench`, `pass_when: exit-0`, `blocking: true`).
  - `grounding-announcements` skill now runs it and heals until exit 0 before delivery (Phase 5: Cross the Markov Blanket). The agent cannot self-grade past the exit code.
  - Emits `forge.herald.stench_gated`. GECKO owns the evolving lexicon. Inventoried in `scripts/MANIFEST.yaml`.
  - Follow-up (framework cycle): wire `verifiers[]` into `construct-validate.sh` so the field is manifest-checked, not only honored by the skill body.

## [0.1.0] - 2026-02-23

### Added
- `grounding-announcements` skill — `/announce` command for drafting grounded announcements
- `synthesizing-voice` skill — `/synthesize-voice` command for extracting voice profiles
- `chronicling-changes` skill — `/chronicle` command for git history research
- Default `voice.md` with lowercase, casual-direct register
- Default `principles.md` with "We Say" / "We Never Say" constraints
- Post-install script for grimoire directory initialization
- Event emission for inter-construct communication
