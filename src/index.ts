import type { SemanticArtifactManifest } from "@cinatra-ai/sdk-extensions";

// `@cinatra-ai/marketing-icp-artifact` is the Ideal Customer Profile (ICP)
// artifact extension. It models a semantic work product describing the target
// buyer persona / firmographics / pain points / budget criteria that a company
// sells INTO. Bytes-only matcher classification uses the co-located
// `marketing-icp-matcher` SKILL.
//
// Why no `connectorRef:`: connector-form classification is not part of this
// artifact manifest.
// Why no `templates:`: templates are owned by the library UI "New from template"
// flow.
// Why no `agentDependencies:`: this manifest does not declare per-agent
// dependencies; strict cross-kind validation is handled outside this artifact.
//
// The authoring skill is the reference / exemplar for the chat-driven authoring
// path; the `chat-create-artifact` chat skill follows this skill when the user
// asks "create me an ICP for X".
//
// The manifest is mirrored in package.json `cinatra.artifact`; this typed
// export is the developer-ergonomic source of truth that
// `parseSemanticArtifactManifest` accepts. The pack's parity test pins the
// two byte-equal so they cannot drift.
export const marketingIcpArtifactManifest: SemanticArtifactManifest = {
  accepts: {
    file: {
      mimeTypes: ["text/markdown", "text/plain", "application/pdf"],
    },
  },
  skills: {
    authoring: ["@cinatra-ai/marketing-icp-artifact:marketing-icp-author"],
    matchers: ["@cinatra-ai/marketing-icp-artifact:marketing-icp-matcher"],
  },
  matcherConfidenceThreshold: 0.7,
};
