import type { SemanticArtifactManifest } from "@cinatra-ai/sdk-extensions";

// `@cinatra-ai/marketing-icp-artifact` is the Ideal Customer Profile (ICP)
// artifact extension. It models a semantic work product describing the target
// buyer persona / firmographics / pain points / budget criteria that a company
// sells INTO. Bytes-only matcher classification uses the `marketing-icp-matcher`
// SKILL, which ships in its own `@cinatra-ai/marketing-icp-matcher-skill`
// provider package and is named here by its skills-catalog id.
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
// asks "create me an ICP for X". It ships in its own
// `@cinatra-ai/marketing-icp-authoring-skill` provider package.
//
// The manifest of record is package.json `cinatra.artifact` — what the
// object-registry bridge reads at registration time. This typed export is its
// developer-ergonomic mirror, the shape `parseSemanticArtifactManifest`
// accepts. The pack's parity test pins the two structurally equal so they
// cannot diverge.
export const marketingIcpArtifactManifest: SemanticArtifactManifest = {
  accepts: {
    file: {
      mimeTypes: ["text/markdown", "text/plain", "application/pdf"],
    },
  },
  skills: {
    authoring: [
      "@cinatra-ai/marketing-icp-authoring-skill:marketing-icp-authoring",
    ],
    matchers: ["@cinatra-ai/marketing-icp-matcher-skill:marketing-icp-matcher"],
  },
  matcherConfidenceThreshold: 0.7,
  // Explicit type declaration (epic #1785 entry 95): the pack DECLARES the one
  // object type it owns rather than relying on the retired `<pkg>:artifact`
  // auto-derivation. `@cinatra-ai/marketing-icp:profile` is a dedicated claim —
  // an authored, editable ICP markdown deliverable (draftable, content-snapshot,
  // artifact-safe projection). The namespace differs from the package name, so a
  // self-contained inline JSON Schema ships with the claim.
  objectTypes: [
    {
      type: "@cinatra-ai/marketing-icp:profile",
      claim: "dedicated",
      dispositions: {
        projection: "artifact-safe",
        pinnable: true,
        snapshotPolicy: "content",
        sensitivity: "normal",
        mutability: "draftable",
      },
      schema: {
        type: "object",
        additionalProperties: true,
      },
    },
  ],
};
