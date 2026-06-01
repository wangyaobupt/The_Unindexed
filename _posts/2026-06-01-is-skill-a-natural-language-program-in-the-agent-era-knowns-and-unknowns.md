---
layout: post
title: "Is Skill a Natural Language Program in the Agent Era? Knowns and Unknowns"
---

## The hypothesis

A skill can be viewed as a computer program written in natural language. An agent paired with a foundation model is the interpreter. Once this framing is taken seriously, much of the design space for skill management becomes predictable by analogy — because every property of a programming language ecosystem (modules, imports, dependencies, lint, tests, versioning, packaging, registries) exists for a reason, and many of those reasons seem to apply here too.

That hypothesis is useful, but it is not yet stable enough to support the full programming-language analogy. The central issue is not whether skill libraries feel like code libraries. They do. The issue is whether the interpreter has a stable primitive set, because package management depends on stable interfaces, and stable interfaces depend on stable primitives.

## The package-management temptation

A new skill almost always invokes existing skills as steps. "How to cut a release" cites "how to run the test suite" cites "how to activate the conda env." Without composition, every skill either duplicates content from the skills it would otherwise call, or balloons in size, or both. Neither survives at scale.

This means a skill library is not a flat catalog of independent units. It's a **directed composition graph** — edges represent A invoking B as a subroutine. Structurally it's much closer to a function-call graph in code than to a wiki of interlinked synthesis pages. Karpathy's wiki edges are loose semantic associations; skill graph edges are mechanical and meaningful.

The composition-graph framing has consequences:

- **Edges are directed.** A depends on B, not the reverse.
- **Edges are checkable.** A reference either resolves or it doesn't.
- **Edges propagate change.** When B changes, every A that depends on B may need to update.
- **Graph structure carries information.** Topological depth (leaf vs composite skills), in-degree (how widely-used a skill is), out-degree (how complex a skill is) — all are observable and useful.

Treating the skill graph as a function-call graph predicts the infrastructure required to manage it at scale. From the Python analogy:

| In Python | In a skill ecosystem |
|---|---|
| `import foo` | Declared reference to another skill |
| `requirements.txt` / `pyproject.toml` | Per-skill or per-library dependency manifest |
| Package namespacing | Skill collections with shared prefixes |
| Version pins | Compatibility expectations between skill versions |
| `pyflakes` / `mypy` | Broken-reference and cycle detection |
| `pytest` | Empirical "does this skill still work" check |
| PyPI | A registry of shareable skills |
| Virtualenvs | Isolation of skill collections per project |

These are the pressures a mature skill ecosystem would need to answer: name collisions, transitive dependency hell, "works on my machine" failures when a skill's underlying tool changes, and the impossibility of confidently reusing other people's skills without a trust mechanism. But the analogy breaks at a deeper point before these answers can simply be copied from code.

## The central break: primitives and interfaces

The deepest weakness in the Python analogy is the status of primitives. In Python, the interpreter boundary is relatively clear. You know what the interpreter can do: parse syntax, bind names, call functions, operate on built-in types, import modules, raise exceptions. Libraries are built on top of these stable primitives, so the boundary between interpreter and library is intelligible.

With LLM agents, the primitive set is murky. The "interpreter" already contains a large amount of latent procedural competence: summarizing, planning, translating, inferring schemas, writing code, recognizing intent, following conventions. But those capabilities are probabilistic and subject to drift across model families, versions, prompts, context windows, decoding policies, tool APIs, permission modes, memory layers, and host applications. The agent loop itself is also not fixed: planning, tool selection, delegation, reflection, retry behavior, and context management differ across products. What is primitive for one model with one tool environment may need to be encoded as a skill for another model or another permission setting.

This makes leaf/composite classification unstable. A leaf skill is not an atom in the Python sense. It is a current operational boundary: below this point, the library trusts the model/tool substrate; above this point, the library chooses to encode the procedure explicitly. That boundary depends on reliability needs, auditability, cost, context budget, user risk, and the actual model being used, not just on conceptual decomposition.

It also blurs the distinction between function and interface. In ordinary software, an interface describes behavior while the implementation performs it. In a natural-language program, the description often is part of the implementation. "Review the diff for security issues" names the capability and also shapes the behavior. A higher-level skill can be an interface when viewed by callers and a function when viewed as executable procedure. The same text can be API, implementation, documentation, and test oracle at different levels of the graph.

The practical implication: do not hunt for true atoms too early. Treat "leaf" as an operational role, not a metaphysical category. A leaf is a behavior stable enough, relied on enough, and small enough to treat as primitive inside a particular skill library. A composite is a behavior whose correctness depends on orchestrating other named procedures.

Python's interpreter has its own substrate variation — across implementations, versions, OS, hardware. But execution is deterministic enough that the abstractions package management relies on — references that resolve or don't, types that match or don't, builds that are reproducible — are well-defined. LLM execution is not. The same skill returns different outputs across runs, has no specifiable type for what it produces, and offers no reproducible build of its effect. The code-side package-management apparatus rests on a kind of determinism the LLM substrate doesn't provide. That is a narrower and more defensible claim than "the substrate isn't stable," and it is the one the argument actually needs.

This is why package management is premature. A package manager would require skill identities, dependency edges, version constraints, and compatibility rules. Those concepts become misleading if they are defined before the primitive set and interface boundary are understood. They would create metadata with false precision: an import graph that cannot fully represent model capability, tool permissions, context state, side effects, eval evidence, or behavioral drift.

## What current systems provide instead

As of June 2026, Claude Code and Codex share the same broad Agent Skills idea but make different product choices around the boundary between a skill, a plugin, and a tool integration.

The shared core is now clear:

- **SKILL.md is the execution unit.** A skill is a directory whose main file contains frontmatter plus natural-language instructions.
- **Description-driven discovery.** `name` and `description` are the primary index. The agent sees lightweight metadata first and loads the full skill only when it decides the skill is relevant.
- **Progressive disclosure.** Supporting files such as scripts, references, templates, and assets are bundled near the skill and loaded or executed only when needed.
- **Manual and automatic invocation.** A user can call a skill directly; the model can also choose a skill when the request matches the description.

Claude Code's current substrate is richer at the per-skill runtime-control layer:

- **Invocation metadata.** Claude Code exposes fields such as `when_to_use`, argument hints, manual-only invocation, user visibility, path filters, and shell selection.
- **Runtime controls.** It can attach tool allow/deny rules, model and effort overrides, hooks, and subagent selection to a skill.
- **Subagent isolation** (`context: fork`). A skill can run in a forked subagent context — composition via process boundary rather than via declared import. This is closer to a syscall than a function call, but real.
- **Plugin bundling.** Plugins can bundle skills and related configuration under a shared distribution boundary.

Codex's current substrate is more explicit about plugins as the distribution unit:

- **Skill authoring.** Codex ships a `skill-creator` workflow and local validation scripts. The default shape is `SKILL.md` plus optional `scripts/`, `references/`, `assets/`, and `agents/openai.yaml`.
- **Skill installation.** Codex ships a `skill-installer` for curated skills and GitHub-hosted skills, useful for local setup and experimentation.
- **Plugin distribution.** Codex plugins bundle skills, app integrations, MCP servers, hooks, and assets behind a `.codex-plugin/plugin.json` manifest. The plugin has package-like metadata: name, version, description, license, repository, bundled component paths, and install-surface metadata.
- **Tool dependency metadata.** `agents/openai.yaml` can declare UI metadata, implicit-invocation policy, and tool dependencies such as required MCP servers. This is useful, but it is not a skill-to-skill dependency model.

This makes the skill/plugin distinction important:

- **Skill = natural-language program or module.** It says what the agent should do and how.
- **Plugin = installable package, capability bundle, and trust boundary.** It says what gets installed, enabled, versioned, displayed, and wired to external tools.

Plugins can partially manage inter-skill dependence if the whole coherent skill graph is bundled inside one plugin and versioned together. In that model, `cut-release` can safely assume `run-tests`, `activate-env`, and `publish-pr` exist because all four ship in the same plugin. But plugin management is coarser than true dependency management. It does not by itself express "skill A imports skill B", "skill A requires skill B >= 1.4", or "editing this leaf skill breaks these composite callers."

What is still absent across both systems is exactly what the unstable-interpreter argument predicts:

- No first-class `depends:` or `uses:` field for skill-to-skill imports.
- No dependency resolver, lockfile, or transitive dependency model.
- No graph lint as a built-in operation: broken references, cycles, orphans, redundant leaves, reverse-dependency checks.
- No skill-level semantic versioning model. Plugin versions exist, but that is coarser than compatibility between individual skill interfaces.
- No stable interface schema for a skill's preconditions, outputs, side effects, required tools, expected artifacts, or user-interaction contract.
- No standard behavioral eval convention embedded in the skill package. Current validation is mostly structural; real validity is still empirical.

This does not look like negligence or evidence that the problem is not worth solving. It follows from the primitive/interface problem. For now, Claude Code is exploring richer per-skill execution controls, while Codex is making the plugin/package boundary more explicit; neither has committed to skill-level package semantics.

## Open questions, in rough order of pressure

- **Name resolution.** When two collections both ship a skill called `run-tests`, what does invocation resolve to: global name, plugin-local name, user preference, or model choice?
- **Stabilization criteria.** What evidence says a behavior is stable enough to treat as substrate, skill interface, or package boundary?
- **Compatibility evidence.** If static version constraints are weak, what combination of behavioral contract, eval trace, invocation example, and model/tool fingerprint should substitute?
- **Distribution and trust.** Eventually people will share skills. A registry without a trust model is dangerous (a skill is a prompt-injection vector); a trust model without a registry is unscalable.
- **Execution boundary.** If composition happens through subagent forks, plugins, or ordinary model context rather than function calls, how should cost, latency, state propagation, and isolation be represented?

## In one line

A skill library may behave like a composition graph, but "skill as natural-language program" is not yet a stable programming abstraction: until foundation-model and agent primitives settle, plugin systems can distribute capabilities, but true package management would create false precision.
