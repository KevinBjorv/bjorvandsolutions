const fs = require("fs");
const path = require("path");
const vm = require("vm");

const rootDir = path.resolve(__dirname, "..");
const catalogCode = fs.readFileSync(path.join(rootDir, "assets/js/site/catalog.js"), "utf8");
const catalogContext = { window: {} };
vm.runInNewContext(catalogCode, catalogContext);
const catalog = catalogContext.window.SiteCatalog;

const siteUrl = "https://bjorv.com";
const publishDateLabel = "March 11, 2026";
const authorImage = catalog.author.image;
const toolByKey = new Map(catalog.tools.map((tool) => [tool.key, tool]));
const categoryBySlug = new Map(catalog.articleCategories.map((category) => [category.slug, category]));
const articlesByTool = new Map();

catalog.tools.forEach((tool) => articlesByTool.set(tool.key, []));
catalog.articles.forEach((article) => {
  if (!articlesByTool.has(article.toolKey)) {
    articlesByTool.set(article.toolKey, []);
  }

  articlesByTool.get(article.toolKey).push(article);
});

const articleBodies = {};

Object.assign(articleBodies, {
  "catch-unity-build-size-regressions-before-release": {
    answer: "The practical way to catch Unity build size regressions before release is to snapshot every build, compare against a known baseline, and review grouped totals before the regression reaches a store candidate.",
    heroCaption: "Build snapshots and grouped totals make regressions visible before release day.",
    midCtaTitle: "Make build size visible before the release branch gets noisy.",
    midCtaText: "Build Size Guard gives you snapshot capture, side-by-side comparisons, and direct links into documentation so the size jump is measured instead of guessed.",
    endTitle: "Use the tool page when you are ready to connect the workflow to your build pipeline.",
    endText: "The product page links directly to setup docs, license details, and support routes.",
    sections: [
      {
        id: "why-build-size-regressions-get-missed",
        title: "Why do Unity build size regressions get missed?",
        paragraphs: [
          "Most build size regressions are not caused by one dramatic mistake. They come from a sequence of normal changes: textures are reimported with a different compression profile, audio assets keep a heavier load type, a folder is added to Addressables, or a plugin update lands quietly inside the project.",
          "If the team only checks total size at the very end, the regression has already blended into other work. That is why a baseline-first workflow matters more than a last-minute audit."
        ],
        bullets: [
          "Release builds often combine many changes from different contributors.",
          "Raw build output folders do not explain which assets pushed the size upward.",
          "Manual comparison between builds is slow enough that teams stop doing it."
        ]
      },
      {
        id: "what-to-measure-on-every-build",
        title: "What should you measure on every build?",
        paragraphs: [
          "The useful baseline is not only the final total. Build Size Guard stores the reported build total, output artifact size on disk, ranked top contributors, grouped totals by category and folder, and Addressables rollups when a build layout file is available.",
          "That combination answers two different questions: did the build grow, and where did that growth come from?"
        ],
        bullets: [
          "Reported build total from Unity's BuildReport.",
          "Output artifact size on disk for the build output path.",
          "Top contributors so the biggest growth shows up first.",
          "Grouped category and folder totals for everything outside the top contributor list.",
          "Optional Addressables group, bundle, and asset totals when buildlayout.json is available."
        ]
      },
      {
        id: "how-build-size-guard-fits-the-workflow",
        title: "How does Build Size Guard make that review practical?",
        paragraphs: [
          "The tool is built around a simple sequence: capture a snapshot after a build, compare a baseline snapshot to the current one, evaluate the delta, and export a report if the team needs a written record for review.",
          "Because the snapshots stay small and focused, the diff is centered on the assets and grouped totals that matter most during release triage."
        ],
        steps: [
          "Set the data root and snapshot capture options in Project Settings > Build Size Guard.",
          "Make at least two builds so there is a current snapshot and a baseline to compare against.",
          "Open the Build Size Guard window and review the baseline/current pair.",
          "Use grouped totals and contributor rows to isolate the spike before it reaches a release build."
        ]
      },
      {
        id: "what-the-tool-does-and-does-not-solve",
        title: "What does the tool intentionally not solve for you?",
        paragraphs: [
          "Build Size Guard is editor-only. It is designed to detect regressions, not to predict storefront compression, CDN packaging behavior, or every possible runtime optimization outcome.",
          "Its snapshots store a ranked top-N contributor list plus grouped remainder totals. That keeps capture and comparison fast, but it also means the tool is optimized for release decisions, not for cataloging every file in the build."
        ],
        bullets: [
          "It does not ship in the player build.",
          "It does not replace release-specific store-size validation.",
          "Detailed contributor tables are intentionally focused on the top contributors, not the full asset universe."
        ]
      }
    ]
  },
  "set-build-size-budgets-in-unity-ci": {
    answer: "If you want build size guardrails to hold under release pressure, define explicit budget rules, compare each CI build against a known baseline, and fail the run when the size delta crosses the policy you set.",
    heroCaption: "Budget rules, reports, and CI baselines work best when the policy is explicit.",
    midCtaTitle: "Turn build size from a feeling into a release gate.",
    midCtaText: "Build Size Guard supports batchmode execution, JSON and Markdown reports, and baseline-aware comparisons so your CI run can block the regression where it starts.",
    endTitle: "If you are ready to wire budgets into CI, start from the product page and docs.",
    endText: "That path keeps the policy, setup, and support links in one place.",
    sections: [
      {
        id: "why-ci-budgets-matter",
        title: "Why should build size budgets live in CI?",
        paragraphs: [
          "A release checklist is not enough if the regression already merged into the main branch. CI matters because it runs at the moment the change lands, while the context is still easy to recover.",
          "A useful size budget is not a vague warning. It is a measurable limit tied to a baseline and enforced by the same workflow every time."
        ],
        bullets: [
          "Teams stop arguing about whether the increase is acceptable after the fact.",
          "The diff is attached to the build that introduced the regression.",
          "The budget can be different per build target when platform constraints differ."
        ]
      },
      {
        id: "which-budget-types-are-available",
        title: "Which budget types can Build Size Guard evaluate?",
        paragraphs: [
          "The tool supports both default and per-target policy blocks. That gives you a global guardrail and a way to tighten or relax rules where platform realities differ.",
          "The important point is that you are not limited to one total-size number. You can budget the overall build, the delta versus baseline, and grouped category growth."
        ],
        bullets: [
          "Report total size.",
          "Report delta versus baseline.",
          "Report percent increase.",
          "Output artifact total, delta, and percent increase.",
          "Per-category budgets for texture, audio, mesh, shader, code, and other."
        ]
      },
      {
        id: "how-to-roll-the-policy-into-ci",
        title: "How do you roll the policy into a CI workflow?",
        paragraphs: [
          "First, store Build Size Guard data somewhere the runner can access. The tool's latestPassing baseline support only helps if the data root survives between runs through cache restore, artifact download, or another persistence step.",
          "Second, run the batchmode entrypoint with the report outputs you want. JSON is useful for machine-readable processing, while Markdown is useful for build artifacts and review comments."
        ],
        steps: [
          "Set the data root path and budget policy in Project Settings.",
          "Persist the data root between CI runs if you want latestPassing to resolve.",
          "Run the batchmode entrypoint on each build and export JSON or Markdown reports.",
          "Fail the run when the budget evaluation returns violations that exceed your policy."
        ]
      },
      {
        id: "the-main-ci-gotchas",
        title: "What usually goes wrong in a first CI rollout?",
        paragraphs: [
          "The common mistake is assuming latestPassing will work on an ephemeral runner that starts with an empty workspace. Without persistent snapshot data, there is no historical passing baseline to resolve.",
          "The second mistake is setting a budget without agreeing on which metric actually matters to the team. Report total and output artifact size can tell slightly different stories, so the policy should reflect the number the release team cares about."
        ],
        bullets: [
          "Persist snapshot data if you want historical baselines.",
          "Choose the metric the team actually ships against.",
          "Keep the reports enabled so failures stay reviewable after the CI run ends."
        ]
      }
    ]
  },
  "compare-unity-build-snapshots-and-find-what-changed": {
    answer: "To compare Unity build snapshots effectively, pick a trusted baseline, compare it to a current build, and use contributor and grouped-total views to narrow the delta to the assets that actually changed the result.",
    heroCaption: "Snapshot comparison works best when the baseline is trusted and the diff stays readable.",
    midCtaTitle: "Stop diffing build folders by hand.",
    midCtaText: "Build Size Guard keeps the current snapshot, baseline snapshot, grouped totals, and report exports in one place so the review stays short and concrete.",
    endTitle: "Open the tool page if you want the full compare workflow and rollout links.",
    endText: "It leads straight into documentation, licensing, and support.",
    sections: [
      {
        id: "start-with-a-useful-baseline",
        title: "What makes a snapshot pair useful?",
        paragraphs: [
          "A comparison only helps if the baseline represents a build you still trust. That might be the latest approved release candidate, the latest green CI build, or a local snapshot taken before a risky asset import.",
          "Once the baseline is clear, the current snapshot becomes easier to read because every number answers the same question: what changed since the last acceptable state?"
        ],
        bullets: [
          "Use a baseline that the team would still ship or approve.",
          "Avoid comparing unrelated build targets when the goal is release triage.",
          "Keep snapshot labels readable so the pair makes sense later."
        ]
      },
      {
        id: "which-diff-views-matter-most",
        title: "Which diff views matter most inside the tool?",
        paragraphs: [
          "Build Size Guard computes overall delta, percent delta, increases, decreases, new items, removed items, and moved items when GUID data is available. It also groups the remainder outside the top contributor list by category and folder.",
          "That structure is useful because the biggest release decisions usually come from a few heavy assets plus a broader category trend."
        ],
        bullets: [
          "Summary totals explain how much the build moved.",
          "Contributor rows explain which assets drove the movement.",
          "Grouped category and folder totals explain what happened outside the top-N contributor list.",
          "Imported .buildreport files can be turned into snapshots for comparison."
        ]
      },
      {
        id: "how-to-review-the-diff-faster",
        title: "How do you review the result faster?",
        paragraphs: [
          "Start with the high-level totals, then move straight into the top contributors and grouped totals. If a texture category jumped sharply, you do not need to inspect every row before deciding where to look next.",
          "When the contributor row points at a known asset, the editor window can ping the asset directly. That shortens the path from regression detection to a concrete fix."
        ],
        steps: [
          "Pick the baseline and current snapshot in the editor window.",
          "Review total and percent delta before diving into individual assets.",
          "Use contributor rows and grouped totals to isolate the spike.",
          "Export the report if the change needs to be reviewed outside the editor."
        ]
      },
      {
        id: "why-the-diff-is-focused-not-exhaustive",
        title: "Why is the diff intentionally focused instead of exhaustive?",
        paragraphs: [
          "The snapshot model is designed to keep files small and diffs fast. That is why the tool stores a ranked contributor list and grouped remainder totals rather than a complete export of every build artifact.",
          "For release teams, that trade-off is usually correct. The goal is to identify the decision-driving change quickly, not to build a perfect archive of every file in the build."
        ],
        bullets: [
          "Top contributor limits keep the snapshot practical.",
          "Grouped remainder totals preserve context outside the top-N list.",
          "The tool is optimized for regression review, not for a full forensic inventory."
        ]
      }
    ]
  }
});

Object.assign(articleBodies, {
  "generate-third-party-notices-for-a-unity-game": {
    answer: "The reliable way to generate third-party notices for a Unity game is to scan the project for real dependency evidence, resolve licenses conservatively, keep unresolved items explicit, and export notices and credits from that verified project state.",
    heroCaption: "Attribution output is safer when it comes from project evidence instead of memory.",
    midCtaTitle: "Replace notice guesswork with a repeatable export workflow.",
    midCtaText: "Third-Party Notices & Credits scans packages, folders, and native libraries, then exports notices, credits, and manifest data from the project state it can actually verify.",
    endTitle: "Open the product page when you want the scan, export, and support links in one place.",
    endText: "The homepage leads directly to the docs, license, and support routes.",
    sections: [
      {
        id: "why-notice-generation-turns-chaotic",
        title: "Why does third-party notice generation become chaotic near release?",
        paragraphs: [
          "Unity projects gather dependencies from several places over time: UPM packages, plugin folders, native libraries, copied utilities, and manual imports. By release time, many teams know some of what they used but not all of it with confidence.",
          "That is the worst moment to rely on memory. Notice generation should start from evidence found in the project itself."
        ],
        bullets: [
          "Dependencies arrive through different channels and at different times.",
          "Legal files are often stored near the component, not in one central place.",
          "Missing evidence should stay visible instead of being guessed away."
        ]
      },
      {
        id: "what-the-tool-scans-and-resolves",
        title: "What does the tool actually scan and resolve?",
        paragraphs: [
          "The tool scans UPM dependencies from manifest and lock data, scans configured file-system roots plus native libraries in Assets, and looks for nearby legal files such as LICENSE, NOTICE, COPYING, and related variants within a bounded scope.",
          "License resolution is intentionally conservative. It can use SPDX identifiers, package metadata, and text similarity against a local SPDX corpus, but it falls back to UNKNOWN when the evidence is not strong enough."
        ],
        bullets: [
          "UPM registry, git, local, and transitive package detection.",
          "Folder-based component detection under scan roots such as Assets/Plugins and Assets/ThirdParty.",
          "Native library detection with file hashing for native components.",
          "Conservative UNKNOWN fallback when license evidence is incomplete."
        ]
      },
      {
        id: "how-to-run-a-practical-workflow",
        title: "How do you run a practical notice workflow?",
        paragraphs: [
          "A practical pass starts with Scan, continues through review of the components that need attention, and only then moves into export. Manual entries and overrides are there for the components that cannot be resolved automatically from project evidence.",
          "That makes the export step more trustworthy because the unresolved items were either fixed or left explicitly unresolved, not silently guessed."
        ],
        steps: [
          "Run Scan All or a narrower scan mode from the tool window.",
          "Filter for UNKNOWN items, missing fields, and other attention states.",
          "Resolve fields through overrides or manual entries where needed.",
          "Export the pack once the project state is reviewable."
        ]
      },
      {
        id: "what-to-remember-about-the-output",
        title: "What should you remember about the output?",
        paragraphs: [
          "The tool produces THIRD_PARTY_NOTICES.txt, CREDITS.md, compliance-manifest.json, and the persistent overrides file. The point is not only to generate a human-readable notice. It is also to keep a machine-readable manifest of what was resolved and why.",
          "The workflow is local and offline by design. It does not scrape websites or act as legal advice."
        ],
        bullets: [
          "THIRD_PARTY_NOTICES.txt stores the per-component notice blocks.",
          "CREDITS.md is a concise attribution output.",
          "compliance-manifest.json keeps structured component and license state.",
          "The tool reports evidence from the project; it does not replace legal review."
        ]
      }
    ]
  },
  "build-a-repeatable-unity-license-compliance-workflow": {
    answer: "A repeatable Unity license compliance workflow is built around the same sequence every time: scan, review evidence, resolve gaps conservatively, export structured artifacts, and keep build-time behavior aligned with that review policy.",
    heroCaption: "Compliance gets more manageable when the scan, review, and export steps are clear.",
    midCtaTitle: "Make license compliance a workflow instead of a release scramble.",
    midCtaText: "Compliance Exporter is designed around project scans, override review, and stable export files so teams can repeat the same process each release.",
    endTitle: "Use the product page when you want the full rollout path and support links.",
    endText: "The homepage keeps the scan, docs, license, and support routes together.",
    sections: [
      {
        id: "why-repeatability-matters",
        title: "Why does repeatability matter more than speed here?",
        paragraphs: [
          "A compliance workflow that only works when one person remembers the exact steps is not stable enough for a release process. Repeatability matters because the project will add and remove dependencies over time, and the output needs to stay reviewable from one build to the next.",
          "That is why structured exports and stable diff sections matter. They keep the next release from starting over."
        ],
        bullets: [
          "Dependency changes should show up as added, removed, or changed outputs.",
          "Manual decisions should persist instead of being re-entered every release.",
          "The team needs a workflow that behaves the same way under deadline pressure."
        ]
      },
      {
        id: "what-the-repeatable-loop-looks-like",
        title: "What does the repeatable loop look like?",
        paragraphs: [
          "The tool's repeatable loop is straightforward: scan the project, review the components that need attention, resolve missing fields or overrides, and then export the pack. The diff tab and manifest help make the delta visible between runs.",
          "This is the kind of workflow that scales better than a last-minute search for old plugin notes and package pages."
        ],
        steps: [
          "Scan the project from the tool window.",
          "Review UNKNOWN items, missing fields, and diff changes.",
          "Use overrides and manual entries only where the project evidence is incomplete.",
          "Export the notice, credits, and manifest files once the result is reviewable."
        ]
      },
      {
        id: "how-build-integration-fits",
        title: "How does build integration fit into the workflow?",
        paragraphs: [
          "The build hook exists to keep the release path aligned with the policy, not to replace the review step. If failBuildOnUnknown is enabled and unresolved items remain, export is blocked in the window and the build policy can stop the release path from moving ahead blindly.",
          "That creates a cleaner handoff between review and release: the build only proceeds when the compliance state matches the standard the team chose."
        ],
        bullets: [
          "Build-time warning or fail behavior keeps unresolved items visible.",
          "The same exported artifacts stay available for review after the scan.",
          "The workflow remains local and offline, so it depends on project evidence, not live network lookups."
        ]
      },
      {
        id: "where-conservative-resolution-helps",
        title: "Why is conservative resolution a strength here?",
        paragraphs: [
          "The tool is intentionally conservative with license resolution. UNKNOWN is not a failure of the workflow. It is a signal that the project evidence was not enough to support a stronger claim automatically.",
          "That is usually safer than over-resolving a dependency and shipping the wrong attribution file with false confidence."
        ],
        bullets: [
          "SPDX IDs and package metadata are used when available.",
          "Text similarity is a fallback, not a guarantee.",
          "UNKNOWN keeps uncertainty visible instead of hiding it."
        ]
      }
    ]
  },
  "export-unity-credits-and-compliance-manifests-before-release": {
    answer: "Before release, export both the human-readable attribution files and the machine-readable compliance manifest so legal review, release packaging, and future diffs all point back to the same project state.",
    heroCaption: "Release-ready compliance output should be readable by both people and pipelines.",
    midCtaTitle: "Export the files release reviewers actually need.",
    midCtaText: "Third-Party Notices & Credits produces notices, credits, and manifest files with stable structure so the release handoff stays predictable.",
    endTitle: "Open the product page if you want the export workflow, docs, and support in one place.",
    endText: "The homepage links directly to the documentation, license, and support route.",
    sections: [
      {
        id: "why-export-multiple-artifacts",
        title: "Why export multiple compliance artifacts instead of one file?",
        paragraphs: [
          "Different parts of the release workflow need different formats. A notice file is not the same thing as a concise credits list, and neither of those replaces a structured manifest that a pipeline or reviewer can diff cleanly.",
          "That is why the tool exports several artifacts from the same resolved project state instead of forcing everything into a single catch-all document."
        ],
        bullets: [
          "Notices are detailed and component-oriented.",
          "Credits are concise and easier to place in a game or store context.",
          "Structured manifest data is better for diffing and automation."
        ]
      },
      {
        id: "what-each-export-is-for",
        title: "What is each exported file for?",
        paragraphs: [
          "THIRD_PARTY_NOTICES.txt contains the detailed notice blocks. CREDITS.md is a concise attribution list. compliance-manifest.json stores the structured component metadata and resolved license state. The overrides file preserves manual decisions and adjustments that shaped the result.",
          "Used together, those files give the team a stronger release package than a single manually assembled notice page."
        ],
        table: {
          headers: ["File", "Primary use"],
          rows: [
            ["THIRD_PARTY_NOTICES.txt", "Detailed per-component notice output for release packaging and review."],
            ["CREDITS.md", "Concise attribution file for credits and supporting release materials."],
            ["compliance-manifest.json", "Machine-readable manifest for review, diffing, and pipeline usage."],
            ["compliance-overrides.json", "Persistent record of manual decisions and override data."]
          ]
        }
      },
      {
        id: "how-to-use-the-export-before-release",
        title: "How should the team use the export before release?",
        paragraphs: [
          "Run the export after the review pass, not before. That way the manifest, notice file, and credits file all reflect the final resolved state instead of a partially reviewed scan.",
          "Once the files are exported, the manifest diff and What Changed sections help reviewers understand what moved since the last release."
        ],
        steps: [
          "Scan and review the project until unresolved items are intentionally handled.",
          "Export the pack to the configured output directory.",
          "Review the added, removed, and changed sections before packaging the release.",
          "Keep the manifest with the release materials so later diffs have a clean baseline."
        ]
      },
      {
        id: "why-the-structured-manifest-matters",
        title: "Why does the structured manifest matter so much?",
        paragraphs: [
          "The manifest is what turns one clean export into a repeatable release workflow. Without it, the team is left diffing long text files and trying to reconstruct whether a component was added, renamed, or reclassified.",
          "A machine-readable manifest also helps the next release because the previous state is preserved in a format that tools and humans can both reason about."
        ],
        bullets: [
          "Manifest diffs make dependency changes easier to review.",
          "Structured data lowers the chance of missing a release change.",
          "The manifest stays useful even when the notice text is long and dense."
        ]
      }
    ]
  }
});

Object.assign(articleBodies, {
  "enforce-unity-import-settings-across-a-team": {
    answer: "A reliable way to enforce Unity import settings across a team is to define rule presets, connect them to asset paths, and validate those rules every time assets enter the project.",
    heroCaption: "Import policies hold better when the project enforces them instead of relying on memory.",
    midCtaTitle: "Replace importer policing with a repeatable rule set.",
    midCtaText: "Import Settings Validator & Fix is designed around rule sets, preset-driven enforcement, and project-wide validation so standards stay consistent across contributors and machines.",
    endTitle: "Open the product page when you want the setup path and support links.",
    endText: "The homepage keeps the docs, license page, and support route close together.",
    sections: [
      {
        id: "why-import-settings-drift",
        title: "Why do import settings drift so easily?",
        paragraphs: [
          "Unity projects accumulate inconsistency when multiple people import assets over time. Compression settings, audio load types, mesh options, and sprite flags can drift because the project does not automatically enforce one standard.",
          "That drift becomes expensive when it affects build size, runtime behavior, or review time across a growing asset library."
        ],
        bullets: [
          "Different contributors import the same asset type with different habits.",
          "Platform targets often need overrides that are easy to forget.",
          "Manual review loops do not scale once the project holds many assets."
        ]
      },
      {
        id: "what-the-rule-system-looks-like",
        title: "What does the rule system look like?",
        paragraphs: [
          "The tool is designed around a RuleSet asset that holds ordered rules. Each rule matches by path and importer type, then applies a Unity Preset and optional platform overrides.",
          "That keeps the policy explicit. The rules are not trying to guess the best setting. They enforce the standard the team already decided on."
        ],
        bullets: [
          "Glob matching is the required path selector.",
          "Regex is available as an advanced option when needed.",
          "Texture, audio, and model importers are the main coverage targets.",
          "Last match wins, which keeps precedence predictable."
        ]
      },
      {
        id: "how-team-enforcement-actually-works",
        title: "How does team-wide enforcement actually work?",
        paragraphs: [
          "The import hook can apply the expected settings when a matching asset is imported or reimported. That means the project can enforce the standard at the point where drift normally enters.",
          "The important implementation detail is change detection. The tool is designed to avoid pointless churn by applying settings only when the computed result differs from the importer's current state."
        ],
        steps: [
          "Create a RuleSet and assign presets for the asset groups you care about.",
          "Enable enforcement in project settings when the team is ready to enforce automatically.",
          "Use dry-run mode first if you want visibility before the tool starts changing assets.",
          "Keep the rule ordering deliberate so the final match is predictable."
        ]
      },
      {
        id: "where-the-tool-draws-the-line",
        title: "Where does the tool deliberately draw the line?",
        paragraphs: [
          "The design is deliberately rules-based. It does not claim to discover the best settings for you, and it is not framed as a heuristic optimization tool.",
          "Its value is repeatability: one declared standard, one import path, one place to review drift when it happens."
        ],
        bullets: [
          "No smart guesswork about what settings should be.",
          "No runtime package; the workflow is editor-only.",
          "The team still owns the policy, while the tool enforces it consistently."
        ]
      }
    ]
  },
  "validate-texture-audio-and-model-import-settings-in-unity": {
    answer: "To validate import settings in Unity, scan the project against your declared rules, inspect the non-compliant assets by importer type, and review the readable diff before you decide whether to fix selected assets or the entire filtered set.",
    heroCaption: "Project-wide validation works best when the diff is readable and the rule match is visible.",
    midCtaTitle: "Audit importer drift without checking assets one by one.",
    midCtaText: "Import Settings Validator & Fix is designed to scan textures, audio, and models against the active rule set and surface the exact mismatches in one workflow.",
    endTitle: "Use the tool page if you want the full validation and setup path.",
    endText: "It links directly to the product page, documentation, license, and support.",
    sections: [
      {
        id: "what-good-validation-looks-like",
        title: "What does useful validation look like?",
        paragraphs: [
          "A useful validation pass does more than list bad assets. It shows which rule matched, what importer type was evaluated, and which settings are out of policy in language the team can read quickly.",
          "That matters because a large project does not need another opaque report. It needs a filtered list that makes action obvious."
        ],
        bullets: [
          "Asset path and importer type should be visible in the results.",
          "Compliance status should separate compliant, non-compliant, and skipped assets.",
          "The result should explain the mismatch instead of hiding it behind generic warnings."
        ]
      },
      {
        id: "which-asset-types-should-you-start-with",
        title: "Which asset types should you start with?",
        paragraphs: [
          "The most practical first pass is the same one highlighted on the product page: textures, audio, and models. Those categories create a large share of importer drift in typical Unity projects.",
          "They also map cleanly to the rule and preset workflow, which keeps the initial rollout manageable."
        ],
        bullets: [
          "Textures affect compression, filtering, mipmaps, and sprite handling.",
          "Audio settings influence load type and sample-rate behavior.",
          "Model settings can affect scale, rig setup, and mesh handling."
        ]
      },
      {
        id: "how-the-validator-fits-the-workflow",
        title: "How does the validator fit the wider workflow?",
        paragraphs: [
          "The validator sits between rule authoring and enforcement. It gives the team a project-wide read on whether the rules are doing what they expect before enabling automatic enforcement everywhere.",
          "That makes it a good checkpoint for rollout. You can see the size of the problem, review the diff, and then decide whether to apply fixes gradually or broadly."
        ],
        steps: [
          "Define or assign the RuleSet asset.",
          "Run the validation scan from the tool window.",
          "Filter by importer type or compliance status to narrow the list.",
          "Review the diff summary before applying fixes."
        ]
      },
      {
        id: "why-this-is-better-than-spot-checking",
        title: "Why is this better than spot-checking importer settings manually?",
        paragraphs: [
          "Spot-checking only catches the assets you already suspect. A validator makes the policy visible across the whole project so drift stops hiding in folders nobody opened that day.",
          "That is especially helpful when several people are importing assets or when large drops of content land close to release."
        ],
        bullets: [
          "The scan result is more complete than random manual review.",
          "Filters keep the output usable even when the project is large.",
          "Readable diffs help the team agree on whether the rule or the asset is wrong."
        ]
      }
    ]
  },
  "fix-import-setting-drift-without-manual-reimports": {
    answer: "To fix import setting drift without living in manual reimports, define the expected importer state in rules, preview the affected asset set, and use fix-selected or fix-all only after the result is filtered to the scope you actually want.",
    heroCaption: "Fix actions are more useful when the policy is already declared and the scope is filtered first.",
    midCtaTitle: "Stop burning review time on repetitive importer cleanup.",
    midCtaText: "Import Settings Validator & Fix is designed to move teams from manual asset-by-asset cleanup to rule-driven fixes with confirmations and readable diffs.",
    endTitle: "Open the product page if you want the full enforcement and fix workflow.",
    endText: "That path keeps setup, licensing, and support one click away.",
    sections: [
      {
        id: "why-manual-reimports-do-not-scale",
        title: "Why do manual reimport loops break down so quickly?",
        paragraphs: [
          "Manual cleanup feels manageable when the project is small, but it breaks as soon as assets arrive in batches or when several contributors are importing content at once.",
          "The deeper problem is not only time. It is that manual cleanup does not create a lasting policy. The same drift returns with the next import wave."
        ],
        bullets: [
          "The same settings are applied repeatedly by hand.",
          "Teams lose time checking whether the importer still matches the standard.",
          "A fixed asset can drift again on the next reimport."
        ]
      },
      {
        id: "what-the-fix-workflow-should-do",
        title: "What should a good fix workflow do?",
        paragraphs: [
          "A useful fix workflow starts from validation. The team should be able to filter the list, review the top diffs, and then choose whether to fix only selected items or the whole filtered scope.",
          "That is why the design includes both fix-selected and fix-all behavior, with confirmation and dry-run style visibility before broader changes."
        ],
        bullets: [
          "Fix Selected should target only the rows you picked.",
          "Fix All should respect the active filter scope.",
          "A confirmation step matters before broad changes are applied."
        ]
      },
      {
        id: "how-rules-remove-the-repeat-work",
        title: "How do rules remove the repeat work?",
        paragraphs: [
          "The point of a rule-based fix is that the desired state is already defined. The tool does not need a one-off decision every time an asset drifts. It computes the expected settings from the rule set and compares them to the current importer state.",
          "That allows the fix action to focus on enforcement instead of manual judgment."
        ],
        steps: [
          "Define the RuleSet and preset mapping first.",
          "Run validation to identify the non-compliant assets.",
          "Filter to the asset type or scope you want to fix.",
          "Apply the fix action after the visible diff matches your intent."
        ]
      },
      {
        id: "what-to-check-before-you-fix-everything",
        title: "What should you check before using a broad fix-all pass?",
        paragraphs: [
          "The rule order should be deliberate, and the diff summary should read like a policy you want to enforce. If either one looks wrong, fix the rule set before running the broad action.",
          "That keeps the tool aligned with its main value: rule-based enforcement of a standard the team already trusts."
        ],
        bullets: [
          "Make sure the right rule is winning for the assets in scope.",
          "Use dry-run visibility first if the project has a lot of drift.",
          "Do not confuse fixing drift with inventing the standard on the fly."
        ]
      }
    ]
  }
});

Object.assign(articleBodies, {
  "safely-rename-serialized-fields-in-unity": {
    answer: "The safe way to rename serialized fields in Unity is to validate the mapping before you clean up the old path, not after data disappears from scenes, prefabs, or ScriptableObject assets.",
    heroCaption: "Field renames become safer when mappings, attributes, and risks are checked together.",
    midCtaTitle: "Treat serialized field renames like migration work, not a search-and-replace.",
    midCtaText: "Unity Serialization Migration Guard gives you a focused audit workflow for mappings, risk checks, and diff import so the rename is reviewed before cleanup starts.",
    endTitle: "Open the product page if you want the full audit and cleanup workflow.",
    endText: "It links directly to the documentation, license, and support pages.",
    sections: [
      {
        id: "why-field-renames-are-risky",
        title: "Why are serialized field renames riskier than they look?",
        paragraphs: [
          "A code rename is easy. The difficult part is proving that Unity can still resolve the old serialized token across the assets that already exist in the project.",
          "If the mapping is wrong, the attribute is missing, or the new field is not serializable under current rules, the risk is not theoretical. It shows up as lost data or stale mappings that nobody trusts."
        ],
        bullets: [
          "Scenes, prefabs, and ScriptableObjects may already contain the old token.",
          "A valid code rename does not guarantee a valid serialized migration.",
          "The cleanup step is dangerous if it is done before coverage is proven."
        ]
      },
      {
        id: "what-the-audit-pass-checks",
        title: "What does the audit pass actually check?",
        paragraphs: [
          "The Audit tab validates manual rename mappings against the project script index and then reports concrete risk categories. That makes the review specific instead of leaving the team with a vague sense that the migration is probably fine.",
          "Git diff import also helps bootstrap candidate mappings when the change started from a real rename inside one file."
        ],
        bullets: [
          "Missing or ambiguous target types.",
          "Missing new fields on the target type.",
          "New fields that exist but are not serializable.",
          "Missing FormerlySerializedAs attributes on the target field.",
          "Conservative diff import that only accepts supported same-file field rename hunks."
        ]
      },
      {
        id: "how-to-run-the-rename-safely",
        title: "How do you run the rename safely?",
        paragraphs: [
          "Start by importing or writing the mapping, then run the audit before touching coverage or cleanup. If the audit surfaces a missing FormerlySerializedAs path or a type mismatch, fix that first rather than pushing the uncertainty deeper into the workflow.",
          "The goal is to make the mapping trustworthy before you ask the rest of the toolchain to reason about project-wide asset coverage."
        ],
        steps: [
          "Capture the rename mapping manually or from a Git diff preview.",
          "Run the audit and resolve every high-risk finding first.",
          "Confirm the target field is serializable and decorated correctly.",
          "Move into coverage and reserialize steps only after the audit is clean."
        ]
      },
      {
        id: "what-cleanup-should-wait-for",
        title: "What should cleanup wait for?",
        paragraphs: [
          "Cleanup is the last step, not the first. The tool's cleanup proof only becomes safe when coverage shows no remaining legacy token occurrences and the supported scope is complete.",
          "That ordering matters because removing legacy mappings too early is the fastest way to turn a manageable rename into hidden data damage."
        ],
        bullets: [
          "A clean audit is necessary but not sufficient.",
          "Coverage has to prove the legacy token is gone from supported assets.",
          "Cleanup is safe only after the evidence path is complete."
        ]
      }
    ]
  },
  "audit-unity-yaml-coverage-before-removing-old-rename-mappings": {
    answer: "Before you remove old rename mappings in Unity, scan YAML coverage first so you can prove whether the legacy token still exists in supported assets and whether the scan scope was complete enough to trust the answer.",
    heroCaption: "Coverage is the proof step between a clean audit and a safe cleanup.",
    midCtaTitle: "Do not remove rename safety paths until the asset coverage says you can.",
    midCtaText: "Unity Serialization Migration Guard turns coverage into a concrete report with affected assets, token counts, unreadable files, and cleanup proof status.",
    endTitle: "Use the tool page when you are ready to run coverage and cleanup checks together.",
    endText: "The docs and support paths are one click away from the homepage.",
    sections: [
      {
        id: "why-yaml-coverage-is-the-proof-step",
        title: "Why is YAML coverage the proof step?",
        paragraphs: [
          "An audit tells you whether the mapping is plausible in code. Coverage tells you whether the old token still exists inside the assets that matter. Those are different questions, and the second one is the one that protects cleanup.",
          "If the project still contains the legacy token in supported assets, removing the old path is not a cleanup win. It is an avoidable migration risk."
        ],
        bullets: [
          "Coverage moves the discussion from code intent to stored asset reality.",
          "The result is useful only if the scan scope is visible and complete enough to trust.",
          "A zero count without a supported scope check is not strong evidence."
        ]
      },
      {
        id: "what-the-coverage-scan-requires",
        title: "What does the coverage scan require first?",
        paragraphs: [
          "The scan requires valid manual mappings and Force Text serialization mode in Unity. Without those prerequisites, the tool cannot reliably inspect YAML keys for legacy field tokens.",
          "The supported scope includes scenes, prefabs, standalone ScriptableObject assets, and embedded ScriptableObject parent assets."
        ],
        bullets: [
          "Valid mapping rows with type, old, and new names filled in.",
          "Asset Serialization Mode set to Force Text.",
          "Understanding that unreadable supported assets are surfaced and counted."
        ]
      },
      {
        id: "which-results-actually-matter",
        title: "Which result fields matter when you decide about cleanup?",
        paragraphs: [
          "The output is more than a yes or no. The report shows candidate assets, scanned assets, unreadable assets, supported-scope completeness, affected assets, and legacy token occurrence counts.",
          "That gives the team enough context to decide whether the scan proved safety or whether the remaining uncertainty is still too high."
        ],
        bullets: [
          "Affected asset count tells you where the old token still appears.",
          "Occurrence totals show whether the problem is isolated or widespread.",
          "Unreadable assets and incomplete scope tell you when the proof is still weak."
        ]
      },
      {
        id: "how-cleanup-proof-uses-the-coverage-report",
        title: "How does the cleanup proof use that coverage report?",
        paragraphs: [
          "Cleanup proof is only safe when the coverage report is both clean and complete for the supported scope. The tool marks cleanup unsafe when no coverage report exists, when legacy tokens remain, or when unreadable supported assets leave the scope incomplete.",
          "That is the right bias. Cleanup should be blocked by missing evidence rather than allowed by optimism."
        ],
        bullets: [
          "No coverage report means cleanup is unsafe.",
          "Remaining legacy token occurrences mean cleanup is unsafe.",
          "Incomplete supported scope means cleanup is unsafe even when the hit count looks good."
        ]
      }
    ]
  },
  "preview-and-validate-unity-reserialization-during-refactors": {
    answer: "When Unity assets need reserialization during a refactor, build the target list first, preview the scope, keep backups outside Assets or Packages, and only run the reserialize step once the input set is explicit.",
    heroCaption: "Preview, scope control, and backups matter more than speed when a reserialize pass touches real project data.",
    midCtaTitle: "Do not run a broad reserialize pass until the scope is visible.",
    midCtaText: "Unity Serialization Migration Guard gives you previewed target sets, scope selection, and backup controls so the run stays reviewable before it becomes destructive.",
    endTitle: "Open the product page when you are ready to connect preview, coverage, and cleanup in one flow.",
    endText: "The homepage links directly to docs, licensing, and support.",
    sections: [
      {
        id: "why-preview-matters",
        title: "Why does preview matter so much before reserialize?",
        paragraphs: [
          "A reserialize pass touches real assets. If the scope is not visible before the run starts, the team is effectively asking Unity to rewrite data without a final review of what will be touched.",
          "That is why the tool centers the workflow around Build Preview first. The preview is not a convenience feature. It is the safety gate."
        ],
        bullets: [
          "You need to see the exact asset count before the run starts.",
          "Skipped inputs and warnings often explain why the scope is smaller than expected.",
          "Run Reserialize stays disabled until the preview contains at least one asset."
        ]
      },
      {
        id: "which-scope-options-exist",
        title: "Which scope options are available?",
        paragraphs: [
          "The tool supports Coverage Results, Folder, and Selection scopes. That lets the team choose whether the run should follow existing migration evidence or a narrower folder- or selection-based target set.",
          "Each option is useful for a different stage. Coverage Results is best when the migration is already mapped. Folder and Selection are useful when the team needs to limit blast radius deliberately."
        ],
        bullets: [
          "Coverage Results seeds the run from the current coverage report.",
          "Folder scope enumerates supported assets recursively under a chosen folder.",
          "Selection scope expands Project window selections and skips unsupported items cleanly."
        ]
      },
      {
        id: "how-backups-are-handled",
        title: "How are backups handled before the reserialize run?",
        paragraphs: [
          "Backup handling is opinionated for a reason. Backup paths cannot live under Assets or Packages, and invalid paths fall back to a timestamped location under the project Logs folder with a warning.",
          "The backup includes each target asset, its .meta file, and restore instructions. That keeps the rollback path concrete instead of assumed."
        ],
        bullets: [
          "Create Backup is optional but enabled by default through settings if the project keeps that default.",
          "Backups mirror directory structure relative to the project root.",
          "Restore instructions are written alongside the backup output."
        ]
      },
      {
        id: "how-to-validate-the-run",
        title: "How do you validate the run after it starts?",
        paragraphs: [
          "The tool exposes stage, current asset path, and completed-versus-total progress while processing. Cancellation is supported during backup and processing stages through Unity's progress UI.",
          "That means validation is not limited to the preview. The run itself stays observable while it is happening."
        ],
        steps: [
          "Build the preview and confirm the asset list and warnings.",
          "Keep backups enabled unless the team has a deliberate reason not to.",
          "Run the reserialize pass and watch stage and asset progress.",
          "Use coverage and cleanup proof after the run before removing legacy mappings."
        ]
      }
    ]
  }
});

Object.assign(articleBodies, {
  "reduce-shader-variant-creep-in-unity": {
    answer: "The reliable way to reduce shader variant creep in Unity is to capture variant snapshots consistently, compare them against a baseline, and review the top offenders before variant growth becomes accepted as normal.",
    heroCaption: "Variant creep is easier to control when the build log becomes structured snapshot data.",
    midCtaTitle: "Make shader variant growth visible before it becomes background noise.",
    midCtaText: "Shader Variant Guard turns Editor.log output into snapshots, compare results, and budget findings that teams can act on quickly.",
    endTitle: "Open the product page when you want the complete workflow and support links.",
    endText: "It links directly to the documentation, license page, and support channel.",
    sections: [
      {
        id: "why-variant-creep-is-hard-to-spot",
        title: "Why does shader variant creep stay hidden for so long?",
        paragraphs: [
          "Shader variant growth is usually gradual. A new keyword path, an extra platform combination, or a build profile change can increase counts without producing a dramatic failure right away.",
          "If the only source of truth is the raw Editor.log, teams are left scrolling through text instead of working with a stable baseline and a meaningful diff."
        ],
        bullets: [
          "The growth is often spread across many normal-looking changes.",
          "Raw logs are not a good review surface.",
          "Mixed targets and profiles make ad hoc comparison even harder."
        ]
      },
      {
        id: "what-the-tool-captures",
        title: "What does Shader Variant Budget & CI Guard actually capture?",
        paragraphs: [
          "The tool reads Editor.log, extracts summary totals and per-shader contributor data, stores stable snapshot JSON, and carries parser diagnostics alongside the numbers. That matters because you need both the totals and the confidence that the parser saw a valid snapshot.",
          "The same pipeline runs in the editor and in batchmode, so the local comparison path and the CI path stay aligned."
        ],
        bullets: [
          "Total variant counts.",
          "Per-shader contributor totals.",
          "Snapshot metadata such as target and build profile when available.",
          "Parser diagnostics and completeness information."
        ]
      },
      {
        id: "how-to-use-snapshots-to-control-creep",
        title: "How do you use snapshots to control the creep instead of reacting late?",
        paragraphs: [
          "The fastest routine is to capture a snapshot after a build, refresh the browser list, and compare the new snapshot against the nearest valid baseline. In the editor window, Compare Selection uses a defined baseline order that prefers the same target and build profile when possible.",
          "That baseline logic matters because it reduces false comparison pairs. You get a result that is more likely to explain real growth instead of noise from unrelated targets."
        ],
        steps: [
          "Capture snapshots consistently after the builds you care about.",
          "Compare against the closest valid baseline for the same target or build profile when possible.",
          "Review top contributors and diff results before the growth is normalized.",
          "Promote clean runs to a latestPassing baseline when the project uses CI."
        ]
      },
      {
        id: "what-the-tool-is-not",
        title: "What is the tool not trying to be?",
        paragraphs: [
          "Shader Variant Budget & CI Guard is editor-only. It is not a runtime package and it does not add in-game diagnostics or runtime optimization logic.",
          "The current editor window also does not try to be a full report exporter. Diagnostics export is available in the window, but full JSON and Markdown compare reports are batchmode features."
        ],
        bullets: [
          "No runtime package or in-game UI.",
          "No snapshot delete button in the current editor window.",
          "No full compare report export from the editor window itself."
        ]
      }
    ]
  },
  "set-shader-variant-budgets-in-unity-ci": {
    answer: "Shader variant budgets only hold under schedule pressure if they are enforced in CI with explicit caps, a known baseline, and failure behavior the team agrees on before the regression lands.",
    heroCaption: "Explicit policy beats manual log reading when a branch starts drifting.",
    midCtaTitle: "Move shader variant policy out of tribal knowledge and into CI.",
    midCtaText: "The tool supports hard caps, warnings, per-shader limits, and batchmode report output so the CI rule is explicit instead of informal.",
    endTitle: "Start from the product page if you want the full CI rollout path.",
    endText: "You can go directly from the homepage into docs, license terms, and support.",
    sections: [
      {
        id: "why-ci-enforcement-matters",
        title: "Why does shader variant policy belong in CI?",
        paragraphs: [
          "Once variant creep is visible, the next mistake is to leave the response informal. If the only rule is that someone should notice the number eventually, the project will drift again under time pressure.",
          "CI matters because it ties the variant jump to a specific build and gives the team a consistent place to stop and decide what should happen next."
        ],
        bullets: [
          "The regression is attached to the build that introduced it.",
          "The same policy runs for every branch or release candidate.",
          "The build can fail early instead of surprising the release pass."
        ]
      },
      {
        id: "which-policy-controls-exist",
        title: "Which policy controls are available?",
        paragraphs: [
          "The default policy block supports hard caps, warning thresholds, per-shader caps, ignore rules, and allow rules. That gives you one policy surface for overall totals and a second one for the individual shaders that routinely cause trouble.",
          "The behavior of each rule type matters. Ignore rules remove matching shaders from the filtered diff and from per-shader evaluation, while allow rules only skip matching per-shader caps. They do not restore ignored shaders or change the global totals."
        ],
        bullets: [
          "Hard caps for total variants, delta variants, and percent delta.",
          "Warning thresholds for the same high-level totals.",
          "Per-shader caps for known heavy shaders.",
          "Ignore rules with exact, contains, or regex matching.",
          "Allow rules that apply to per-shader cap evaluation."
        ]
      },
      {
        id: "how-to-roll-it-out-in-batchmode",
        title: "How do you roll the policy out in batchmode?",
        paragraphs: [
          "Batchmode can read the effective Project Settings policy or an external budgets JSON file. That is useful when the team wants budgets-as-code checked into source control instead of edited only through Project Settings.",
          "Once the baseline strategy is set, the CI run can compare latest, latestPassing, or an explicit snapshot path and then emit machine-readable and human-readable reports for the build artifact set."
        ],
        steps: [
          "Decide whether the policy will live in Project Settings or an external budgets JSON file.",
          "Choose the baseline strategy for CI, including whether latestPassing data is persisted between runs.",
          "Enable fail-on-violation for blocking findings and decide whether warnings should also fail the run.",
          "Export JSON and Markdown so the failure remains reviewable after the job ends."
        ]
      },
      {
        id: "where-teams-usually-slip",
        title: "Where do teams usually misread the results?",
        paragraphs: [
          "Two areas cause confusion. First, allow rules are not a global include list. They only affect per-shader cap evaluation. Second, unchanged shaders can still violate a per-shader cap if they remain above the configured maximum.",
          "That means the policy should be written with those semantics in mind instead of assumed from other tools."
        ],
        bullets: [
          "Warnings fail CI only when Treat Warnings As Violations is enabled and fail-on-violation is active.",
          "Allow rules do not re-add shaders removed by ignore rules.",
          "Per-shader caps can fire even when a shader count decreased but still remains above the cap."
        ]
      }
    ]
  },
  "compare-shader-variant-snapshots-from-editor-log": {
    answer: "The most useful Editor.log comparison workflow is to capture clean snapshots, compare the current snapshot to a matching baseline, and use completeness and diagnostics to avoid making decisions from bad log data.",
    heroCaption: "Editor.log becomes much more useful once it is stored as snapshot data with diagnostics.",
    midCtaTitle: "Compare shader variant output without living in raw log files.",
    midCtaText: "Shader Variant Budget & CI Guard turns log parsing, baseline pairing, and completeness checks into one review loop so the comparison stays trustworthy.",
    endTitle: "Open the tool page if you want the full window reference and CI entrypoints.",
    endText: "That path keeps setup, license, and support links close together.",
    sections: [
      {
        id: "what-a-clean-capture-looks-like",
        title: "What does a clean capture look like?",
        paragraphs: [
          "The tool can capture manually from the current Editor.log or automatically after builds. In both cases the goal is the same: produce snapshot JSON with totals, per-shader contributors, metadata, and parser diagnostics.",
          "The parser recognizes several supported summary formats and, when a total shader variants line exists, it uses the latest summary block after the last total line instead of mixing old build history into the current capture."
        ],
        bullets: [
          "Manual capture reads the current log and saves immediately.",
          "Automatic capture runs through the post-build hook.",
          "The parser is designed to survive active log writes and can fall back to a temporary snapshot copy."
        ]
      },
      {
        id: "how-baseline-selection-works",
        title: "How does baseline selection work in the editor window?",
        paragraphs: [
          "You can select baseline and current explicitly, but Compare Selection is usually faster because the baseline order is defined. It first prefers older or newer snapshots with the same target and build profile, then falls back to same-target matches, and finally any different snapshot if nothing else exists.",
          "That ordering keeps the common workflow short when you are comparing neighboring captures from the same build context."
        ],
        steps: [
          "Capture or refresh the snapshot list.",
          "Select the current snapshot you want to investigate.",
          "Use Compare Selection when the target and profile history is consistent.",
          "Switch to explicit baseline/current picks when the history is mixed."
        ]
      },
      {
        id: "why-completeness-and-diagnostics-matter",
        title: "Why do completeness and diagnostics matter so much?",
        paragraphs: [
          "A variant total is only useful if the snapshot reconciles cleanly. The tool marks snapshots incomplete when contributor totals do not match the total, when no patterns are recognized, or when the data is otherwise inconsistent.",
          "Incomplete snapshots are hidden by default in the editor window and can fail batchmode by default. That is a useful guardrail because a bad parse should not quietly become the baseline for a release decision."
        ],
        bullets: [
          "Missing contributor data is a red flag, not a harmless detail.",
          "Diagnostics explain whether the parser used direct log access or a snapshot copy.",
          "Incomplete current snapshots are never promoted to latestPassing."
        ]
      },
      {
        id: "what-to-review-after-the-compare",
        title: "What should you review after the compare runs?",
        paragraphs: [
          "Start with the summary totals, then move into budget findings and the diff entries. The tool separates summary, findings, diff rows, and diagnostics so the review can stay ordered instead of mixing parser health and budget outcomes together.",
          "That sequence is especially useful when a run looks suspicious. If diagnostics look weak, stop there and fix capture quality before trusting the compare output."
        ],
        bullets: [
          "Summary totals show the size of the variant movement.",
          "Budget findings show whether the movement actually broke policy.",
          "Diff entries tell you which shaders created the jump.",
          "Diagnostics tell you whether the snapshot was trustworthy."
        ]
      }
    ]
  }
});

function filePathFromSitePath(sitePath) {
  const cleaned = sitePath.replace(/^\/+/, "");
  return path.join(rootDir, cleaned, "index.html");
}

function ensureDirForFile(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(filePath, content) {
  ensureDirForFile(filePath);
  const normalized = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n/g, "\r\n");
  fs.writeFileSync(filePath, normalized);
}

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderParagraphs(paragraphs = []) {
  return paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("\n");
}

function renderList(items = [], ordered = false) {
  if (!items.length) {
    return "";
  }

  const tag = ordered ? "ol" : "ul";
  return `<${tag}>\n${items.map((item) => `  <li>${item}</li>`).join("\n")}\n</${tag}>`;
}

function renderTable(table) {
  if (!table) {
    return "";
  }

  const head = `<thead><tr>${table.headers.map((item) => `<th scope="col">${item}</th>`).join("")}</tr></thead>`;
  const rows = `<tbody>${table.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>`;
  return `<table>${head}${rows}</table>`;
}

function renderSection(section) {
  return `
      <section class="article-section" id="${section.id}" data-article-section>
        <h2>${section.title}</h2>
        ${renderParagraphs(section.paragraphs)}
        ${renderList(section.bullets)}
        ${renderList(section.steps, true)}
        ${renderTable(section.table)}
      </section>
  `.trim();
}

function renderHeader() {
  return `
  <header class="site-header">
    <div class="container nav-shell">
      <a class="brand" href="/">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>Bjorvand Solutions</span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        <ul class="menu-root">
          <li class="menu-item"><a class="menu-link" href="/">Home</a></li>
          <li class="menu-item"><a class="menu-link" href="/tools/">Tools</a></li>
          <li class="menu-item"><a class="menu-link" href="/games/">Games</a></li>
          <li class="menu-item"><a class="menu-link" href="/articles/">Articles</a></li>
          <li class="menu-item menu-item-smart-indie"><a class="menu-link menu-link-smart-indie" target="_blank" rel="noopener noreferrer" href="https://smartindie.dev/">Smart Indie</a></li>
          <li class="menu-item"><a class="menu-link" href="/support/">Support</a></li>
        </ul>
      </nav>

      <button class="mobile-nav-toggle" type="button" data-mobile-nav-toggle aria-controls="mobileNavPanel" aria-expanded="false">Menu</button>
    </div>
    <div class="mobile-nav-panel" id="mobileNavPanel" data-mobile-nav-panel hidden>
      <div class="mobile-nav-shell container">
        <div class="mobile-nav-group mobile-nav-single-link"><a href="/">Home</a></div>
        <div class="mobile-nav-group mobile-nav-single-link"><a href="/tools/">Tools</a></div>
        <div class="mobile-nav-group mobile-nav-single-link"><a href="/games/">Games</a></div>
        <div class="mobile-nav-group mobile-nav-single-link"><a href="/articles/">Articles</a></div>
        <div class="mobile-nav-group mobile-nav-single-link"><a target="_blank" rel="noopener noreferrer" href="https://smartindie.dev/">Smart Indie</a></div>
        <div class="mobile-nav-group mobile-nav-single-link"><a href="/support/">Support</a></div>
      </div>
    </div>
  </header>
  `.trim();
}

function renderFooter() {
  return `
  <footer class="site-footer">
    <div class="container footer-shell">
      <div class="footer-columns">
        <section>
          <h2>Explore</h2>
          <ul class="link-list">
            <li><a href="/">Home</a></li>
            <li><a href="/tools/">Tools</a></li>
            <li><a href="/articles/">Articles</a></li>
            <li><a href="/games/">Games</a></li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://smartindie.dev/">Smart Indie</a></li>
            <li><a href="/support/">Support</a></li>
          </ul>
        </section>
        <section>
          <h2>Tools</h2>
          <ul class="link-list">
            ${catalog.tools.map((tool) => `<li><a href="${tool.links.product}">${tool.name}</a></li>`).join("\n            ")}
            <li><a href="/tools/">Tools Directory</a></li>
          </ul>
        </section>
        <section>
          <h2>Articles</h2>
          <ul class="link-list">
            <li><a href="/articles/">All Articles</a></li>
            ${catalog.articleCategories.map((category) => `<li><a href="/articles/?category=${category.slug}">${category.label}</a></li>`).join("\n            ")}
            <li><a href="/articles/?sort=title">Sort A-Z</a></li>
          </ul>
        </section>
        <section>
          <h2>Games</h2>
          <ul class="link-list">
            <li><a href="/games/">Games Directory</a></li>
            <li><a href="/dopamine/">Dopamine Machine Play</a></li>
            <li><a href="/games/orbital-chaos/">Orbital Chaos Homepage</a></li>
            <li><a href="/games/neonsurge-2/">NeonSurge 2 Homepage</a></li>
            <li><a href="/games/neonsurge/">NeonSurge Homepage</a></li>
            <li><a target="_blank" rel="noopener noreferrer" href="https://smartindie.dev/games/">Smart Indie Games</a></li>
          </ul>
        </section>
        <section>
          <h2>Support</h2>
          <ul class="link-list">
            <li><a href="/support/">Support Form</a></li>
            <li><a href="/support/#docs-shortcuts-title">Documentation</a></li>
            <li><a href="/support/#faq">Support FAQ</a></li>
          </ul>
        </section>
        <section class="footer-email-updates" aria-label="Email subscription">
          <h2>Email Updates</h2>
          <div class="ml-embedded" data-form="bk4D7K"></div>
        </section>
      </div>
      <div class="footer-legal">
        <span>&copy; Bjorvand Solutions <span data-current-year>2026</span> &bull; Company registration number: 836 135 652 (Norway)</span>
      </div>
    </div>
  </footer>
  `.trim();
}

function absoluteUrl(value) {
  if (/^https?:\/\//.test(value)) {
    return value;
  }

  return `${siteUrl}${value}`;
}

function formatDateLabel(value) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });
}

function renderJsonLd(schema) {
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

function renderToolRelatedSection(tool) {
  const toolArticles = articlesByTool.get(tool.key) || [];
  if (!toolArticles.length) {
    return "";
  }

  const cards = toolArticles.map((article) => {
    const category = categoryBySlug.get(article.category);
    return `
          <article class="sales-article-card" data-spotlight>
            <img src="${article.heroImage}" alt="${htmlEscape(article.title)}" loading="lazy">
            <div class="sales-article-meta">
              <span class="sales-article-pill">${htmlEscape(category.label)}</span>
              <span class="sales-article-pill">${htmlEscape(article.readTime)}</span>
            </div>
            <h3>${htmlEscape(article.title)}</h3>
            <p>${htmlEscape(article.description)}</p>
            <div class="sales-actions">
              <a class="sales-button sales-button--primary" href="${article.path}">Read article</a>
              <a class="sales-button sales-button--ghost" href="${tool.links.docs}">Docs</a>
            </div>
          </article>
    `.trim();
  }).join("\n");

  return `
      <section id="tool-articles" class="sales-section reveal">
        <div class="sales-copy" data-stagger>
          <p class="sales-kicker">Articles</p>
          <h2>Guides built around ${htmlEscape(tool.name)}</h2>
          <p class="sales-lede">Related guides for setup, rollout, and release checks.</p>
        </div>
        <div class="sales-articles-grid">
${cards}
        </div>
      </section>
  `.trim();
}

function renderHubPage() {
  const sortedArticles = [...catalog.articles].sort((left, right) =>
    right.publishDate.localeCompare(left.publishDate) || left.title.localeCompare(right.title)
  );
  const toolKeysWithArticles = new Set(catalog.articles.map((article) => article.toolKey));

  const toolFilters = catalog.tools.filter((tool) => toolKeysWithArticles.has(tool.key)).map((tool) =>
    `<button class="filter-pill" type="button" data-tool-filter data-filter-value="${tool.key}" aria-pressed="false">${htmlEscape(tool.name)}</button>`
  ).join("\n              ");

  const categoryFilters = catalog.articleCategories.map((category) =>
    `<button class="filter-pill" type="button" data-category-filter data-filter-value="${category.slug}" aria-pressed="false">${htmlEscape(category.label)}</button>`
  ).join("\n              ");

  const cards = sortedArticles.map((article) => {
    const tool = toolByKey.get(article.toolKey);
    const category = categoryBySlug.get(article.category);
    return `
          <article class="card article-card" data-article-card data-tool="${article.toolKey}" data-category="${article.category}" data-date="${article.publishDate}" data-title="${htmlEscape(article.title.toLowerCase())}">
            <figure>
              <img src="${article.heroImage}" alt="${htmlEscape(article.title)}" loading="lazy">
            </figure>
            <div class="article-card-body">
              <div class="article-card-meta">
                <span class="article-tag">${htmlEscape(category.label)}</span>
                <span class="article-tag">${htmlEscape(article.readTime)}</span>
              </div>
              <div class="article-card-tags">
                <span class="article-tag">${htmlEscape(tool.name)}</span>
                <span class="article-tag">${htmlEscape(formatDateLabel(article.publishDate))}</span>
              </div>
              <h2><a href="${article.path}">${htmlEscape(article.title)}</a></h2>
              <p>${htmlEscape(article.description)}</p>
              <div class="card-actions">
                <a class="button button-primary" href="${article.path}">Read article</a>
                <a class="button button-secondary" href="${tool.links.product}">View tool</a>
              </div>
            </div>
          </article>
    `.trim();
  }).join("\n");

  const collectionSchema = {
    "@type": "CollectionPage",
    "@id": `${siteUrl}/articles/#collection`,
    url: `${siteUrl}/articles/`,
    name: "Unity Tool Articles | Bjorvand Solutions",
    description: "Articles about Unity build pipelines, import standards, migration safety, and compliance workflows.",
    isPartOf: {
      "@type": "WebSite",
      name: "Bjorvand Solutions",
      url: siteUrl
    },
    about: catalog.tools.map((tool) => ({
      "@type": "SoftwareApplication",
      name: tool.name,
      applicationCategory: "DeveloperApplication",
      url: absoluteUrl(tool.links.product)
    }))
  };

  const itemListSchema = {
    "@type": "ItemList",
    "@id": `${siteUrl}/articles/#list`,
    itemListElement: sortedArticles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(article.path),
      name: article.title
    }))
  };

  return `
<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unity Release Workflows | Bjorvand Solutions</title>
  <meta name="description" content="Practical guides for catching build, asset, refactor, and compliance problems before they hit release.">
  <meta name="author" content="${htmlEscape(catalog.author.name)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Unity Release Workflows | Bjorvand Solutions">
  <meta property="og:description" content="Practical guides for catching build, asset, refactor, and compliance problems before they hit release.">
  <meta property="og:url" content="${siteUrl}/articles/">
  <meta property="og:image" content="${absoluteUrl(authorImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Unity Release Workflows | Bjorvand Solutions">
  <meta name="twitter:description" content="Practical guides for catching build, asset, refactor, and compliance problems before they hit release.">
  <meta name="twitter:image" content="${absoluteUrl(authorImage)}">
  <link rel="canonical" href="${siteUrl}/articles/">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon/favicon-16x16.png">
  <link rel="icon" href="/assets/favicon/favicon.ico">
  <link rel="manifest" href="/assets/favicon/site.webmanifest">
  <script src="/assets/js/site/theme-init.js"></script>
  <link rel="stylesheet" href="/assets/css/site/tokens.css">
  <link rel="stylesheet" href="/assets/css/site/base.css">
  <link rel="stylesheet" href="/assets/css/site/layout.css">
  <link rel="stylesheet" href="/assets/css/site/components.css">
  <link rel="stylesheet" href="/assets/css/site/pages/articles.css">
  <link rel="stylesheet" href="/assets/css/shared/link-decorators.css">
  <link rel="stylesheet" href="/assets/css/shared/typography-overrides.css">
  <script src="/assets/js/site/mailerlite-universal.js"></script>
  ${renderJsonLd({
    "@context": "https://schema.org",
    "@graph": [collectionSchema, itemListSchema]
  })}
</head>
<body>
  ${renderHeader()}
  <main class="site-main">
    <div class="container articles-page">
      <section class="articles-hero">
        <span class="badge">Articles</span>
        <h1>Unity Release Workflows</h1>
        <p>Practical guides for catching build, asset, refactor, and compliance problems before they hit release.</p>
        <p>Build size &middot; Shader variants &middot; Import settings &middot; Serialization &middot; Compliance</p>
        <div class="articles-summary-strip" aria-label="Article summary">
          <article>
            <strong>${catalog.articles.length} practical guides</strong>
            <span>Unity release workflows for build, asset, refactor, and compliance cleanup.</span>
          </article>
        </div>
      </section>

      <section class="articles-toolbar" aria-labelledby="articles-toolbar-title">
        <div class="articles-toolbar-head">
          <div>
            <h2 id="articles-toolbar-title">Find the workflow you are trying to clean up.</h2>
            <p>Filter by tool, category, or release problem.</p>
          </div>
          <div class="sort-field">
            <label for="article-sort">Sort</label>
            <select id="article-sort" data-article-sort>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        <div class="filter-group" aria-labelledby="tool-filters-title">
          <h2 id="tool-filters-title">Tool filters</h2>
          <div class="filter-pills">
            <button class="filter-pill is-active" type="button" data-tool-filter data-filter-value="all" aria-pressed="true">All tools</button>
              ${toolFilters}
          </div>
        </div>

        <div class="filter-group" aria-labelledby="category-filters-title">
          <h2 id="category-filters-title">Workflow filters</h2>
          <div class="filter-pills">
            <button class="filter-pill is-active" type="button" data-category-filter data-filter-value="all" aria-pressed="true">All categories</button>
              ${categoryFilters}
          </div>
        </div>

        <p class="articles-status" data-article-status>Showing ${catalog.articles.length} articles</p>
      </section>

      <section aria-labelledby="articles-grid-title">
        <div class="section-head">
          <h2 id="articles-grid-title">Article library</h2>
          <p class="articles-toolbar-note">Use the filters above, or open any guide directly from the cards below.</p>
        </div>
        <div class="articles-grid" data-articles-grid>
${cards}
        </div>
        <div class="articles-empty" data-article-empty>
          <h2>No articles match the current filters.</h2>
          <p>Clear one of the filters or switch the sort order to reopen the full library.</p>
        </div>
      </section>
    </div>
  </main>
  ${renderFooter()}
  <script defer src="/assets/js/site/nav.js"></script>
  <script defer src="/assets/js/site/articles.js"></script>
  <script defer src="/assets/js/site/link-decorators.js"></script>
</body>
</html>
  `.trim();
}

function renderArticlePage(article) {
  const tool = toolByKey.get(article.toolKey);
  const category = categoryBySlug.get(article.category);
  const body = articleBodies[article.slug];
  if (!tool || !category || !body) {
    throw new Error(`Missing data for article ${article.slug}`);
  }

  const visibleDate = formatDateLabel(article.publishDate);
  const sameToolArticles = (articlesByTool.get(article.toolKey) || []).filter((candidate) => candidate.slug !== article.slug);
  const sidebarLinks = [
    { label: `${tool.name} homepage`, href: tool.links.product },
    { label: `${tool.name} docs`, href: tool.links.docs },
    { label: "Support", href: "/support/" },
    { label: `${tool.name} license`, href: tool.links.license }
  ];

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Articles", href: `/articles/?tool=${article.toolKey}` },
    { label: tool.name, href: tool.links.product },
    { label: article.title }
  ];

  const tocLinks = body.sections.map((section) =>
    `<a href="#${section.id}" data-article-toc-link>${htmlEscape(section.title)}</a>`
  ).join("\n            ");

  const mainSections = body.sections.map((section, index) => {
    const rendered = renderSection(section);
    if (index !== 1) {
      return rendered;
    }

    return `${rendered}
      <section class="article-cta-panel" aria-label="Primary call to action">
        <h2>${htmlEscape(body.midCtaTitle)}</h2>
        <p>${htmlEscape(body.midCtaText)}</p>
        <div class="article-cta-actions">
          <a class="button button-primary" href="${article.primaryCtaHref}">${htmlEscape(article.primaryCtaLabel)}</a>
          <a class="button button-secondary" href="${tool.links.docs}">Read ${htmlEscape(tool.name)} docs</a>
        </div>
      </section>`;
  }).join("\n");

  const relatedCards = sameToolArticles.slice(0, 2).map((candidate) => `
            <article class="card article-related-card">
              <img src="${candidate.heroImage}" alt="${htmlEscape(candidate.title)}" loading="lazy">
              <span>${htmlEscape(candidate.readTime)}</span>
              <h3><a href="${candidate.path}">${htmlEscape(candidate.title)}</a></h3>
              <p>${htmlEscape(candidate.description)}</p>
            </article>
  `.trim()).join("\n");

  const articleSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        description: article.description,
        image: [absoluteUrl(article.heroImage)],
        author: {
          "@type": "Person",
          name: catalog.author.name,
          image: absoluteUrl(authorImage)
        },
        publisher: {
          "@type": "Organization",
          name: "Bjorvand Solutions",
          url: siteUrl
        },
        mainEntityOfPage: absoluteUrl(article.path),
        datePublished: article.publishDate,
        dateModified: article.updatedDate,
        articleSection: category.label,
        about: [
          {
            "@type": "SoftwareApplication",
            name: tool.name,
            applicationCategory: "DeveloperApplication",
            url: absoluteUrl(tool.links.product)
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Articles",
            item: `${siteUrl}/articles/?tool=${article.toolKey}`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tool.name,
            item: absoluteUrl(tool.links.product)
          },
          {
            "@type": "ListItem",
            position: 4,
            name: article.title,
            item: absoluteUrl(article.path)
          }
        ]
      }
    ]
  };

  return `
<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${htmlEscape(article.title)} | ${htmlEscape(tool.name)} Article</title>
  <meta name="description" content="${htmlEscape(article.description)}">
  <meta name="author" content="${htmlEscape(catalog.author.name)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${htmlEscape(article.title)}">
  <meta property="og:description" content="${htmlEscape(article.description)}">
  <meta property="og:url" content="${absoluteUrl(article.path)}">
  <meta property="og:image" content="${absoluteUrl(article.heroImage)}">
  <meta property="article:published_time" content="${article.publishDate}">
  <meta property="article:modified_time" content="${article.updatedDate}">
  <meta property="article:author" content="${htmlEscape(catalog.author.name)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${htmlEscape(article.title)}">
  <meta name="twitter:description" content="${htmlEscape(article.description)}">
  <meta name="twitter:image" content="${absoluteUrl(article.heroImage)}">
  <link rel="canonical" href="${absoluteUrl(article.path)}">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon/favicon-16x16.png">
  <link rel="icon" href="/assets/favicon/favicon.ico">
  <link rel="manifest" href="/assets/favicon/site.webmanifest">
  <script src="/assets/js/site/theme-init.js"></script>
  <link rel="stylesheet" href="/assets/css/site/tokens.css">
  <link rel="stylesheet" href="/assets/css/site/base.css">
  <link rel="stylesheet" href="/assets/css/site/layout.css">
  <link rel="stylesheet" href="/assets/css/site/components.css">
  <link rel="stylesheet" href="/assets/css/site/pages/article-detail.css">
  <link rel="stylesheet" href="/assets/css/shared/link-decorators.css">
  <link rel="stylesheet" href="/assets/css/shared/typography-overrides.css">
  <script src="/assets/js/site/mailerlite-universal.js"></script>
  ${renderJsonLd(articleSchema)}
</head>
<body>
  ${renderHeader()}
  <main class="site-main">
    <div class="container article-page">
      <nav class="article-breadcrumbs" aria-label="Breadcrumb">
        ${breadcrumbs.map((item, index) => {
          if (!item.href) {
            return `<span aria-current="page">${htmlEscape(item.label)}</span>`;
          }

          const suffix = index < breadcrumbs.length - 1 ? "<span aria-hidden=\"true\">/</span>" : "";
          return `<a href="${item.href}">${htmlEscape(item.label)}</a>${suffix}`;
        }).join("\n        ")}
      </nav>

      <section class="article-hero">
        <div class="article-hero-copy">
          <div class="article-eyebrow">
            <span class="article-kicker">${htmlEscape(category.label)}</span>
            <span class="article-chip">${htmlEscape(tool.name)}</span>
          </div>
          <h1>${htmlEscape(article.title)}</h1>
          <p>${htmlEscape(article.description)}</p>
          <div class="article-meta-line">
            <span>${htmlEscape(visibleDate)}</span>
            <span>&bull;</span>
            <span>${htmlEscape(article.readTime)}</span>
            <span>&bull;</span>
            <span>${htmlEscape(catalog.author.name)}</span>
          </div>
          <div class="article-answer">
            <p>${htmlEscape(body.answer)}</p>
          </div>
          <div class="article-keyline">
            <span class="article-chip">Updated ${htmlEscape(formatDateLabel(article.updatedDate))}</span>
            <span class="article-chip">Tool homepage, docs, support, and license linked in the sidebar</span>
          </div>
        </div>
        <figure class="article-hero-media">
          <img src="${article.heroImage}" alt="${htmlEscape(article.title)}" loading="eager" fetchpriority="high">
          <figcaption>${htmlEscape(body.heroCaption)}</figcaption>
        </figure>
      </section>

      <div class="article-layout">
        <article class="article-main">
${mainSections}
          <section class="article-callout">
            <h2>${htmlEscape(body.endTitle)}</h2>
            <p>${htmlEscape(body.endText)}</p>
            <div class="article-cta-actions">
              <a class="button button-primary" href="${article.primaryCtaHref}">${htmlEscape(article.primaryCtaLabel)}</a>
              <a class="button button-secondary" href="${tool.links.product}">Visit ${htmlEscape(tool.name)}</a>
            </div>
          </section>

          <section class="article-section" id="related-articles">
            <h2>More articles for ${htmlEscape(tool.name)}</h2>
            <p>The tool workflow stays easier to evaluate when the next steps stay inside the same product and documentation surface.</p>
            <div class="article-related-grid">
${relatedCards}
            </div>
          </section>
        </article>

        <aside class="article-sidebar" aria-label="Article sidebar">
          <section class="article-sidebar-card">
            <h2>On this page</h2>
            <nav class="article-toc" aria-label="Table of contents">
            ${tocLinks}
            </nav>
          </section>

          <section class="article-sidebar-card">
            <h2>Author</h2>
            <div class="author-card">
              <div class="author-card-header">
                <img src="${authorImage}" alt="${htmlEscape(catalog.author.name)}" loading="lazy">
                <div>
                  <strong>${htmlEscape(catalog.author.name)}</strong>
                  <p>${htmlEscape(catalog.author.role)}</p>
                </div>
              </div>
              <p>${htmlEscape(catalog.author.bio)}</p>
            </div>
          </section>

          <section class="article-sidebar-card">
            <h2>${htmlEscape(tool.name)} links</h2>
            <ul>
              ${sidebarLinks.map((link) => `<li><a href="${link.href}">${htmlEscape(link.label)}</a></li>`).join("\n              ")}
            </ul>
          </section>

          <section class="article-sidebar-card">
            <h2>Same-tool articles</h2>
            <ul>
              ${sameToolArticles.slice(0, 2).map((candidate) => `<li><a href="${candidate.path}">${htmlEscape(candidate.title)}</a></li>`).join("\n              ")}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  </main>
  ${renderFooter()}
  <script defer src="/assets/js/site/nav.js"></script>
  <script defer src="/assets/js/site/article-detail.js"></script>
  <script defer src="/assets/js/site/link-decorators.js"></script>
</body>
</html>
  `.trim();
}

function walkHtmlFiles(directory, output = []) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  entries.forEach((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules") {
      return;
    }

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(fullPath, output);
      return;
    }

    if (entry.isFile() && entry.name.toLowerCase() === "index.html") {
      output.push(fullPath);
    }
  });
  return output;
}

function updateSharedChrome() {
  const headerPattern = /<header class="site-header">[\s\S]*?<\/header>/;
  const footerPattern = /<footer class="site-footer">[\s\S]*?<\/footer>/;
  const htmlFiles = walkHtmlFiles(rootDir).filter((filePath) => !filePath.includes(`${path.sep}.git${path.sep}`));

  htmlFiles.forEach((filePath) => {
    let content = fs.readFileSync(filePath, "utf8");
    let changed = false;
    const hasHeader = headerPattern.test(content);
    const hasFooter = footerPattern.test(content);
    const isRedirectPage = /data-redirect=|<meta\s+http-equiv=["']refresh["']/i.test(content);

    if (hasHeader) {
      content = content.replace(headerPattern, renderHeader());
      changed = true;
    }

    if (hasFooter) {
      content = content.replace(footerPattern, renderFooter());
      changed = true;
    } else if (hasHeader && !isRedirectPage && /<\/body>/.test(content)) {
      content = content.replace(/<\/body>/, `${renderFooter()}\n</body>`);
      changed = true;
    }

    if (changed) {
      writeFile(filePath, content);
    }
  });
}

function updateToolHomepages() {
  catalog.tools.forEach((tool) => {
    const filePath = filePathFromSitePath(tool.links.product);
    if (!fs.existsSync(filePath)) {
      return;
    }

    const content = fs.readFileSync(filePath, "utf8");
    const sectionMarkup = renderToolRelatedSection(tool);
    if (!sectionMarkup) {
      return;
    }

    const existingPattern = /\s*<section id="tool-articles"[\s\S]*?(?=\s*<section id="final-cta")/;
    let nextContent = content;

    if (existingPattern.test(content)) {
      nextContent = content.replace(existingPattern, `\n\n${sectionMarkup}\n`);
    } else {
      nextContent = content.replace(/\s*<section id="final-cta"/, `\n\n${sectionMarkup}\n\n      <section id="final-cta"`);
    }

    if (nextContent !== content) {
      writeFile(filePath, nextContent);
    }
  });
}

function generateArticlePages() {
  writeFile(filePathFromSitePath("/articles/"), renderHubPage());
  catalog.articles.forEach((article) => {
    writeFile(filePathFromSitePath(article.path), renderArticlePage(article));
  });
}

function sitemapEntryMeta(url) {
  if (url === `${siteUrl}/`) {
    return { priority: "1.00", changefreq: "weekly" };
  }

  if (
    url === `${siteUrl}/articles/` ||
    url === `${siteUrl}/games/` ||
    url === `${siteUrl}/support/` ||
    url === `${siteUrl}/tools/`
  ) {
    return { priority: "0.90", changefreq: "weekly" };
  }

  if (url.startsWith(`${siteUrl}/articles/`) && url !== `${siteUrl}/articles/`) {
    return { priority: "0.74", changefreq: "monthly" };
  }

  return { priority: "0.70", changefreq: "monthly" };
}

function updateSitemap() {
  const sitemapPath = path.join(rootDir, "sitemap.xml");
  const current = fs.readFileSync(sitemapPath, "utf8");
  const existingEntries = new Map();
  const existingUrls = [];
  const readTag = (block, tag) => {
    const match = block.match(new RegExp(`<${tag}>([^<]+)</${tag}>`));
    return match ? match[1] : "";
  };

  Array.from(current.matchAll(/<url>\s*[\s\S]*?<\/url>/g)).forEach((match) => {
    const block = match[0];
    const url = readTag(block, "loc");
    if (!url) {
      return;
    }

    existingUrls.push(url);
    existingEntries.set(url, {
      lastmod: readTag(block, "lastmod"),
      changefreq: readTag(block, "changefreq"),
      priority: readTag(block, "priority")
    });
  });

  const toolUrls = catalog.tools.flatMap((tool) => [
    tool.links.product,
    tool.links.docs,
    tool.links.license
  ].filter(Boolean).map((value) => absoluteUrl(value)));

  const orderedUrls = [];
  const seen = new Set();

  existingUrls
    .concat(toolUrls, [`${siteUrl}/articles/`], catalog.articles.map((article) => absoluteUrl(article.path)))
    .forEach((url) => {
    if (seen.has(url)) {
      return;
    }

    seen.add(url);
    orderedUrls.push(url);
  });

  const body = orderedUrls.map((url) => {
    const currentEntry = existingEntries.get(url);
    const fallbackMeta = sitemapEntryMeta(url);
    const meta = {
      lastmod: currentEntry && currentEntry.lastmod ? currentEntry.lastmod : catalog.snapshotDate,
      changefreq: currentEntry && currentEntry.changefreq ? currentEntry.changefreq : fallbackMeta.changefreq,
      priority: currentEntry && currentEntry.priority ? currentEntry.priority : fallbackMeta.priority
    };

    return `  <url>
    <loc>${url}</loc>
    <lastmod>${meta.lastmod}</lastmod>
    <changefreq>${meta.changefreq}</changefreq>
    <priority>${meta.priority}</priority>
  </url>`;
  }).join("\n");

  writeFile(
    sitemapPath,
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
  );
}

function renderImageSitemapEntry(loc, images) {
  const uniqueImages = [...new Set(images.filter(Boolean).map((image) => absoluteUrl(image)))];
  return `  <url>
    <loc>${loc}</loc>
${uniqueImages.map((image) => `    <image:image><image:loc>${image}</image:loc></image:image>`).join("\n")}
  </url>`;
}

function updateImageSitemap() {
  const sitemapPath = path.join(rootDir, "image-sitemap.xml");
  const current = fs.readFileSync(sitemapPath, "utf8");
  const additions = [];
  const hubUrl = `${siteUrl}/articles/`;
  const defaultIconImages = [
    "/assets/favicon/apple-touch-icon.png",
    "/assets/favicon/favicon-16x16.png",
    "/assets/favicon/favicon-32x32.png"
  ];

  catalog.tools.forEach((tool) => {
    const toolImageEntries = [
      { url: absoluteUrl(tool.links.product), images: tool.images && tool.images.length ? tool.images : defaultIconImages },
      { url: absoluteUrl(tool.links.docs), images: defaultIconImages },
      { url: absoluteUrl(tool.links.license), images: defaultIconImages }
    ];

    toolImageEntries.forEach((entry) => {
      if (!entry.url || current.includes(`<loc>${entry.url}</loc>`)) {
        return;
      }

      additions.push(renderImageSitemapEntry(entry.url, entry.images));
    });
  });

  if (!current.includes(`<loc>${hubUrl}</loc>`)) {
    additions.push(renderImageSitemapEntry(hubUrl, [authorImage]));
  }

  catalog.articles.forEach((article) => {
    const articleUrl = absoluteUrl(article.path);
    if (current.includes(`<loc>${articleUrl}</loc>`)) {
      return;
    }

    additions.push(renderImageSitemapEntry(articleUrl, [article.heroImage, authorImage]));
  });

  if (!additions.length) {
    return;
  }

  writeFile(
    sitemapPath,
    current.replace(/\s*<\/urlset>\s*$/, `\n${additions.join("\n")}\n</urlset>\n`)
  );
}

generateArticlePages();
updateSharedChrome();
updateToolHomepages();
updateSitemap();
updateImageSitemap();

console.log(`Generated ${catalog.articles.length} article pages and updated shared navigation, tool homepages, and sitemaps.`);
