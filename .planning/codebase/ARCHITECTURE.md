<!-- refreshed: 2026-06-09 -->
# Architecture

**Analysis Date:** 2026-06-09

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│             Cinatra Host Platform (monorepo)                 │
│   chat-create-artifact flow / artifact_extension_search      │
└────────────┬────────────────────────────┬───────────────────┘
             │ loads manifest              │ dispatches skill
             ▼                            ▼
┌─────────────────────────┐   ┌──────────────────────────────┐
│  Artifact Manifest       │   │  Skills (SKILL.md prompts)   │
│  `src/index.ts`          │   ├──────────────────────────────┤
│  `package.json`          │   │ `skills/marketing-icp-author/│
│  (cinatra.artifact key)  │   │  SKILL.md`                   │
│                          │   │ `skills/marketing-icp-matcher/│
│  - acceptedMimes         │   │  SKILL.md`                   │
│  - authoring skill ref   │   └──────────────────────────────┘
│  - matcher skill ref     │
│  - confidence threshold  │
└─────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Artifact Manifest (typed) | Typed TypeScript export consumed by `parseSemanticArtifactManifest` | `src/index.ts` |
| Artifact Manifest (JSON) | Machine-readable manifest embedded in package.json `cinatra.artifact` | `package.json` |
| ICP Author Skill | LLM prompt instructing the chat assistant how to gather inputs and emit a finished ICP markdown artifact | `skills/marketing-icp-author/SKILL.md` |
| ICP Matcher Skill | Strict semantic classifier prompt that returns `{matches, confidence, rationale}` JSON when a file is uploaded | `skills/marketing-icp-matcher/SKILL.md` |

## Pattern Overview

**Overall:** Cinatra Semantic Artifact Extension — a declarative, content-driven extension package that registers a work-product kind into the Cinatra platform. No runtime application code; behavior is expressed as LLM skill prompts and a manifest.

**Key Characteristics:**
- Single typed export (`marketingIcpArtifactManifest`) mirrors the `package.json` `cinatra.artifact` block; a parity test in the monorepo pins them byte-equal to prevent drift.
- Skills are plain markdown files (`SKILL.md`) loaded by the Cinatra host; they are not executed in this repo directly.
- The package is a **source mirror**: `@cinatra-ai/sdk-extensions` is an optional peer dependency that lives only in the host monorepo and is never resolved standalone.

## Layers

**Manifest Layer:**
- Purpose: Declares what MIME types the artifact accepts, which authoring and matcher skills it references, and the confidence threshold for matcher classification.
- Location: `src/index.ts` (typed) and `package.json` `cinatra.artifact` key (JSON)
- Contains: One constant `marketingIcpArtifactManifest` of type `SemanticArtifactManifest`
- Depends on: `@cinatra-ai/sdk-extensions` (optional peer, type-only)
- Used by: Cinatra host platform's artifact registry and `chat-create-artifact` flow

**Skill Layer:**
- Purpose: Provides LLM prompt instructions for authoring (creating an ICP from user context) and matching (classifying whether an uploaded file is an ICP).
- Location: `skills/marketing-icp-author/SKILL.md`, `skills/marketing-icp-matcher/SKILL.md`
- Contains: Markdown files with structured prompts, input contracts, output contracts, and error-handling guidance
- Depends on: Nothing (content-only)
- Used by: Cinatra host loads these into the LLM context when the skill is dispatched

## Data Flow

### Artifact Authoring Path

1. User asks "create an ICP for X" in Cinatra chat.
2. Host calls `artifact_extension_search({query: "ICP"})` → matches this extension via manifest.
3. Host loads `skills/marketing-icp-author/SKILL.md` as LLM context.
4. Author skill gathers inputs (company name, offering, optional website) from the user.
5. Author skill optionally dispatches `web-scrape-agent` for grounded context.
6. Author skill calls `artifact_authoring_emit({extension, content, declaredMime, title})`.
7. Host validates: size ≤ 10 MB, MIME in `authorableMimes` (`text/markdown`, `text/plain`), recursion ledger, and returns `artifact_id`.

### Artifact Matching Path

1. User uploads a file to a Cinatra workspace.
2. Host iterates registered matchers; loads `skills/marketing-icp-matcher/SKILL.md`.
3. Matcher skill classifies the file and returns `{ "matches": <bool>, "confidence": <0..1>, "rationale": "..." }`.
4. Host applies `matcherConfidenceThreshold: 0.7`; only scores ≥ 0.7 are accepted as this artifact kind.

**State Management:**
- Stateless. The extension holds no runtime state. All state (artifact content, conversation history) lives in the Cinatra host platform.

## Key Abstractions

**SemanticArtifactManifest:**
- Purpose: Platform contract type that declares accepted MIME types, skill references, and matcher confidence threshold for an artifact extension kind.
- Examples: `src/index.ts`
- Pattern: Single exported constant; type imported from `@cinatra-ai/sdk-extensions`

**SKILL.md (Author):**
- Purpose: Structured LLM system-prompt document; governs what inputs to gather, what the output must contain, how to call the platform emit API, and what errors to surface.
- Examples: `skills/marketing-icp-author/SKILL.md`
- Pattern: Markdown with H2 sections — Inputs, Output format, Emit step, Error handling, Prohibitions

**SKILL.md (Matcher):**
- Purpose: Strict binary classifier prompt; defines IS/IS-NOT taxonomy and returns structured JSON.
- Examples: `skills/marketing-icp-matcher/SKILL.md`
- Pattern: Markdown with IS/IS-NOT taxonomy, confidence bands, and a rigid JSON output contract

## Entry Points

**Typed Manifest Export:**
- Location: `src/index.ts`
- Triggers: Imported by Cinatra host's extension registry or `parseSemanticArtifactManifest` utility.
- Responsibilities: Provides the type-safe manifest object that the host uses to configure the extension.

**JSON Manifest (package.json):**
- Location: `package.json` → `cinatra.artifact`
- Triggers: Read by the Cinatra extension loader at install/registration time.
- Responsibilities: Machine-readable equivalent of the typed manifest; must stay byte-equal with `src/index.ts` export.

## Architectural Constraints

- **Threading:** Not applicable — no runtime code executes in this package.
- **Global state:** None. The single exported constant is immutable.
- **Circular imports:** Not applicable — single source file, no inter-module graph.
- **Source mirror rule:** First-party `@cinatra-ai/*` packages MUST be optional peer dependencies, never direct/dev/optional dependencies. CI enforces this (`ci.yml` "Classify repo" step).
- **Parity constraint:** `src/index.ts` manifest and `package.json` `cinatra.artifact` block must remain byte-equal. The monorepo parity test pins this.
- **Authorable MIME subset:** `application/pdf` is in `acceptedMimes` (upload route) but NOT in `authorableMimes` (chat-authoring route). The author skill must always emit `text/markdown` or `text/plain`.

## Anti-Patterns

### Leaking first-party deps into direct dependencies

**What happens:** A `@cinatra-ai/*` package is added to `dependencies` or `devDependencies`.
**Why it's wrong:** These packages are not published to any registry; the repo cannot be resolved standalone and CI will fail with exit 2.
**Do this instead:** Declare as `peerDependencies` with `peerDependenciesMeta.<pkg>.optional: true`.

### Emitting PDF from the author skill

**What happens:** The author skill calls `artifact_authoring_emit` with `declaredMime: "application/pdf"`.
**Why it's wrong:** PDF is in `acceptedMimes` (upload-only) but not in `authorableMimes`; the host returns `mime-not-text-authorable`.
**Do this instead:** Always emit `text/markdown` (preferred) or `text/plain` from the author skill.

### Adding front-matter to artifact content

**What happens:** The author skill includes a `---` YAML front-matter block in the emitted ICP markdown.
**Why it's wrong:** Semantic artifacts are content-only; front-matter is reserved for skill files.
**Do this instead:** Start content directly with `## Buyer Persona` or equivalent heading; no `---` block.

## Error Handling

**Strategy:** Error handling is declared in the author skill prompt (`skills/marketing-icp-author/SKILL.md`) as a set of named `error.reason` codes the LLM surfaces to the user. No try/catch in TypeScript source.

**Patterns:**
- `extension-not-found` → direct user to `/configuration/marketplace`
- `mime-not-text-authorable` → switch to `text/markdown` emit
- `cycle` / `depth-cap-exceeded` → stop recursion, surface chain to user
- `content-too-large` → tighten generated content

## Cross-Cutting Concerns

**Logging:** Not applicable — no runtime code.
**Validation:** CI "Classify repo" step validates dependency shape; monorepo parity test validates manifest consistency.
**Authentication:** Not applicable — handled entirely by the Cinatra host platform.

---

*Architecture analysis: 2026-06-09*
