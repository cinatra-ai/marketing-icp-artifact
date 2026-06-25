# Marketing ICP

An Ideal Customer Profile — the audience a company sells into, captured as buyer persona, firmographics, pain points, triggering events, disqualifiers, and buying-process notes. The ICP is the audience layer that grounds outbound campaigns, sales conversations, and content briefs in "who are we actually selling to".

To create your first ICP, open the Cinatra chat assistant and type "create an ICP for [your company name]". The assistant asks for your company name, what you sell, and an optional website to scrape for grounding context, then produces a structured markdown ICP and saves it as an artifact in your workspace. No credentials or connector setup is required — the artifact ships with its own authoring skill.

When you attach an existing ICP document (Markdown, plain text, or PDF), Cinatra classifies it automatically using the bundled matcher skill. A confidence score of 0.7 or above registers the document as an ICP artifact; below that threshold the file is left untyped. Binary PDF documents are accepted for upload but the chat-authoring path uses Markdown or plain text only.

The ICP artifact has no runtime dependencies and no connector configuration. It works with the Email Outreach agent by supplying audience context at campaign time, and with the Web Scrape agent to ground an ICP draft in live website copy. Install this extension from the marketplace; no environment variables or secrets are needed.

For development, clone this repository and run `node extension-kind-gate.mjs --package-root .` to validate the extension manifest and README before publishing. The authoring skill lives in `skills/marketing-icp-author/SKILL.md` and the matcher in `skills/marketing-icp-matcher/SKILL.md`. If classification misses a document, check whether the document's dominant content is a different artifact type — strategy, brand voice, or sales playbook documents are intentionally excluded.

## Works with

- Email Outreach agent
- Web Scrape agent

## Capabilities

- Capture buyer persona, firmographics, and pain points in one document
- Ground outbound email copy in the right audience and pain points
- Brief writers, campaigners, and inbound qualifiers with a shared audience definition
- Generate a first-draft ICP through an interview in chat, with optional web-grounding
