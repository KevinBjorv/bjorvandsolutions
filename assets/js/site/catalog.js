(() => {
  window.SiteCatalog = {
    snapshotDate: "2026-03-11",
    snapshotDateLabel: "March 11, 2026",
    author: {
      name: "Kevin Ahlgren Bjorvand",
      role: "Founder, Bjorvand Solutions",
      bio: "Kevin builds Unity tools focused on release safety, build visibility, migration safety, and deterministic compliance workflows.",
      image: "/assets/images/authors/kevin-ahlgren-bjorvand.jpg"
    },
    articleCategories: [
      {
        slug: "build-ci",
        label: "Build & CI",
        description: "Articles about budgets, regressions, automation, and release pipeline guardrails."
      },
      {
        slug: "asset-pipeline",
        label: "Asset Pipeline",
        description: "Articles about import standards, validation, and asset setup consistency."
      },
      {
        slug: "serialization-refactoring",
        label: "Serialization & Refactoring",
        description: "Articles about safe field renames, coverage checks, and reserialize workflows."
      },
      {
        slug: "compliance-release",
        label: "Compliance & Release",
        description: "Articles about notices, credits, manifests, and release-readiness checks."
      }
    ],
    tools: [
      {
        key: "build-size-guard",
        name: "Build Size Guard",
        summary: "Detect and prevent Unity build size regressions with snapshots, diffs, budgets, and CI-ready reports.",
        audience: "Unity teams shipping frequent builds and enforcing size budgets.",
        links: {
          product: "/assets/build-size-guard/",
          docs: "/assets/build-size-guard/docs/",
          license: "/assets/build-size-guard/license/",
          store: "https://assetstore.unity.com/packages/slug/361332"
        }
      },
      {
        key: "shader-variant-budget-ci-guard",
        name: "Shader Variant Budget & CI Guard",
        summary: "Capture shader variant snapshots from Editor.log, compare builds, enforce budgets, and stop regressions in CI.",
        audience: "Teams that need shader variant visibility across editor workflows and CI.",
        links: {
          product: "/assets/shader-variant-budget-ci-guard/",
          docs: "/assets/shader-variant-budget-ci-guard/docs/",
          license: "/assets/shader-variant-budget-ci-guard/license/",
          store: "https://u3d.as/3SYC"
        }
      },
      {
        key: "unity-serialization-migration-guard",
        name: "Unity Serialization Migration Guard",
        summary: "Audit serialized rename mappings, scan YAML coverage, preview reserialize work, and prove cleanup safety.",
        audience: "Teams migrating serialized fields during refactors and long-lived data model changes.",
        links: {
          product: "/assets/unity-serialization-migration-guard/",
          docs: "/assets/unity-serialization-migration-guard/docs/",
          license: "/assets/unity-serialization-migration-guard/license/",
          store: "https://u3d.as/3Sae"
        }
      },
      {
        key: "import-settings-validator-fix",
        name: "Import Settings Validator & Fix",
        summary: "Enforce Unity import setting standards and validate/fix drift across projects.",
        audience: "Teams standardizing texture, audio, and model import settings across contributors.",
        links: {
          product: "/assets/import-settings-validator-fix/",
          docs: "/assets/import-settings-validator-fix/docs/",
          license: "/assets/import-settings-validator-fix/license/",
          store: "https://assetstore.unity.com/packages/slug/362308"
        }
      },
      {
        key: "compliance",
        name: "Third-Party Notices & Credits",
        summary: "Generate deterministic third-party notice, credits, and manifest files for Unity release workflows.",
        audience: "Teams that need repeatable attribution outputs before shipping.",
        links: {
          product: "/assets/compliance/",
          docs: "/assets/compliance/docs/",
          license: "/assets/compliance/license/",
          store: "https://u3d.as/3PWR"
        }
      }
    ],
    articles: [
      {
        slug: "catch-unity-build-size-regressions-before-release",
        path: "/articles/build-size-guard/catch-unity-build-size-regressions-before-release/",
        toolKey: "build-size-guard",
        toolName: "Build Size Guard",
        category: "build-ci",
        title: "How to Catch Unity Build Size Regressions Before Release",
        description: "Use build snapshots, diffs, and grouped totals to make Unity build size regressions visible before release day.",
        publishDate: "2026-03-11",
        updatedDate: "2026-03-11",
        readTime: "8 min read",
        heroImage: "/assets/images/BuildSizeGuard/BuildSizeGuardMarketing/Build%20size%20guard%20cover%20image.jpg",
        author: "Kevin Ahlgren Bjorvand",
        primaryCtaLabel: "Open Build Size Guard",
        primaryCtaHref: "/assets/build-size-guard/",
        relatedLinks: ["/assets/build-size-guard/docs/", "/support/", "/assets/build-size-guard/license/"]
      },
      {
        slug: "set-build-size-budgets-in-unity-ci",
        path: "/articles/build-size-guard/set-build-size-budgets-in-unity-ci/",
        toolKey: "build-size-guard",
        toolName: "Build Size Guard",
        category: "build-ci",
        title: "How to Set Build Size Budgets in Unity CI",
        description: "Set measurable Unity build size budgets and enforce them in CI with deterministic reports and exit codes.",
        publishDate: "2026-03-11",
        updatedDate: "2026-03-11",
        readTime: "8 min read",
        heroImage: "/assets/images/BuildSizeGuard/BuildSizeGuardMarketing/Set%20budgets%20and%20regression%20rules.jpg",
        author: "Kevin Ahlgren Bjorvand",
        primaryCtaLabel: "Buy Build Size Guard",
        primaryCtaHref: "https://assetstore.unity.com/packages/slug/361332",
        relatedLinks: ["/assets/build-size-guard/docs/", "/support/", "/assets/build-size-guard/license/"]
      },
      {
        slug: "compare-unity-build-snapshots-and-find-what-changed",
        path: "/articles/build-size-guard/compare-unity-build-snapshots-and-find-what-changed/",
        toolKey: "build-size-guard",
        toolName: "Build Size Guard",
        category: "build-ci",
        title: "How to Compare Unity Build Snapshots and Find What Changed",
        description: "Break down build growth with baseline comparisons, grouped totals, and contributor-focused diffs inside Unity.",
        publishDate: "2026-03-11",
        updatedDate: "2026-03-11",
        readTime: "7 min read",
        heroImage: "/assets/images/BuildSizeGuard/BuildSizeGuardMarketing/Compare%20any%20two%20builds%20in%20seconds.jpg",
        author: "Kevin Ahlgren Bjorvand",
        primaryCtaLabel: "Open Build Size Guard",
        primaryCtaHref: "/assets/build-size-guard/",
        relatedLinks: ["/assets/build-size-guard/docs/", "/support/", "/assets/build-size-guard/license/"]
      },
      {
        slug: "reduce-shader-variant-creep-in-unity",
        path: "/articles/shader-variant-budget-ci-guard/reduce-shader-variant-creep-in-unity/",
        toolKey: "shader-variant-budget-ci-guard",
        toolName: "Shader Variant Budget & CI Guard",
        category: "build-ci",
        title: "How to Reduce Shader Variant Creep in Unity",
        description: "Use snapshot-based visibility to catch shader variant growth before it turns into a release problem.",
        publishDate: "2026-03-11",
        updatedDate: "2026-03-11",
        readTime: "8 min read",
        heroImage: "/assets/images/ShaderVariantBudgetCIGuard/marketing/Cover%20image.jpg",
        author: "Kevin Ahlgren Bjorvand",
        primaryCtaLabel: "Open Shader Variant Budget & CI Guard",
        primaryCtaHref: "/assets/shader-variant-budget-ci-guard/",
        relatedLinks: ["/assets/shader-variant-budget-ci-guard/docs/", "/support/", "/assets/shader-variant-budget-ci-guard/license/"]
      },
      {
        slug: "set-shader-variant-budgets-in-unity-ci",
        path: "/articles/shader-variant-budget-ci-guard/set-shader-variant-budgets-in-unity-ci/",
        toolKey: "shader-variant-budget-ci-guard",
        toolName: "Shader Variant Budget & CI Guard",
        category: "build-ci",
        title: "How to Set Shader Variant Budgets in Unity CI",
        description: "Turn shader variant growth into a measurable CI gate with deterministic snapshots, ignore rules, and budget policies.",
        publishDate: "2026-03-11",
        updatedDate: "2026-03-11",
        readTime: "8 min read",
        heroImage: "/assets/images/ShaderVariantBudgetCIGuard/marketing/Enforce%20hard%20budgets.jpg",
        author: "Kevin Ahlgren Bjorvand",
        primaryCtaLabel: "Buy Shader Variant Budget & CI Guard",
        primaryCtaHref: "https://u3d.as/3SYC",
        relatedLinks: ["/assets/shader-variant-budget-ci-guard/docs/", "/support/", "/assets/shader-variant-budget-ci-guard/license/"]
      },
      {
        slug: "compare-shader-variant-snapshots-from-editor-log",
        path: "/articles/shader-variant-budget-ci-guard/compare-shader-variant-snapshots-from-editor-log/",
        toolKey: "shader-variant-budget-ci-guard",
        toolName: "Shader Variant Budget & CI Guard",
        category: "build-ci",
        title: "How to Compare Shader Variant Snapshots from Editor.log",
        description: "Capture and compare Editor.log variant snapshots to see what changed between builds and why it matters.",
        publishDate: "2026-03-11",
        updatedDate: "2026-03-11",
        readTime: "7 min read",
        heroImage: "/assets/images/ShaderVariantBudgetCIGuard/marketing/See%20what%20changed%20fast.jpg",
        author: "Kevin Ahlgren Bjorvand",
        primaryCtaLabel: "Open Shader Variant Budget & CI Guard",
        primaryCtaHref: "/assets/shader-variant-budget-ci-guard/",
        relatedLinks: ["/assets/shader-variant-budget-ci-guard/docs/", "/support/", "/assets/shader-variant-budget-ci-guard/license/"]
      },
      {
        slug: "safely-rename-serialized-fields-in-unity",
        path: "/articles/unity-serialization-migration-guard/safely-rename-serialized-fields-in-unity/",
        toolKey: "unity-serialization-migration-guard",
        toolName: "Unity Serialization Migration Guard",
        category: "serialization-refactoring",
        title: "How to Safely Rename Serialized Fields in Unity",
        description: "Reduce serialization risk during Unity refactors by validating rename mappings before data disappears.",
        publishDate: "2026-03-11",
        updatedDate: "2026-03-11",
        readTime: "8 min read",
        heroImage: "/assets/images/UnitySerializationMigrationGuard/marketing/Cover%20image.jpg",
        author: "Kevin Ahlgren Bjorvand",
        primaryCtaLabel: "Open Unity Serialization Migration Guard",
        primaryCtaHref: "/assets/unity-serialization-migration-guard/",
        relatedLinks: ["/assets/unity-serialization-migration-guard/docs/", "/support/", "/assets/unity-serialization-migration-guard/license/"]
      },
      {
        slug: "audit-unity-yaml-coverage-before-removing-old-rename-mappings",
        path: "/articles/unity-serialization-migration-guard/audit-unity-yaml-coverage-before-removing-old-rename-mappings/",
        toolKey: "unity-serialization-migration-guard",
        toolName: "Unity Serialization Migration Guard",
        category: "serialization-refactoring",
        title: "How to Audit Unity YAML Coverage Before Removing Old Rename Mappings",
        description: "Use coverage scans to prove whether old serialized field names still exist before removing migration safety attributes.",
        publishDate: "2026-03-11",
        updatedDate: "2026-03-11",
        readTime: "8 min read",
        heroImage: "/assets/images/UnitySerializationMigrationGuard/marketing/Locate%20every%20affected%20asset.jpg",
        author: "Kevin Ahlgren Bjorvand",
        primaryCtaLabel: "Open Unity Serialization Migration Guard",
        primaryCtaHref: "/assets/unity-serialization-migration-guard/",
        relatedLinks: ["/assets/unity-serialization-migration-guard/docs/", "/support/", "/assets/unity-serialization-migration-guard/license/"]
      },
      {
        slug: "preview-and-validate-unity-reserialization-during-refactors",
        path: "/articles/unity-serialization-migration-guard/preview-and-validate-unity-reserialization-during-refactors/",
        toolKey: "unity-serialization-migration-guard",
        toolName: "Unity Serialization Migration Guard",
        category: "serialization-refactoring",
        title: "How to Preview and Validate Unity Reserialization During Refactors",
        description: "Build previews, scope runs carefully, and keep backups when you need to reserialize Unity assets during refactors.",
        publishDate: "2026-03-11",
        updatedDate: "2026-03-11",
        readTime: "8 min read",
        heroImage: "/assets/images/UnitySerializationMigrationGuard/marketing/Preview%20migrations%20safely.jpg",
        author: "Kevin Ahlgren Bjorvand",
        primaryCtaLabel: "Buy Unity Serialization Migration Guard",
        primaryCtaHref: "https://u3d.as/3Sae",
        relatedLinks: ["/assets/unity-serialization-migration-guard/docs/", "/support/", "/assets/unity-serialization-migration-guard/license/"]
      },
      {
        slug: "enforce-unity-import-settings-across-a-team",
        path: "/articles/import-settings-validator-fix/enforce-unity-import-settings-across-a-team/",
        toolKey: "import-settings-validator-fix",
        toolName: "Import Settings Validator & Fix",
        category: "asset-pipeline",
        title: "How to Enforce Unity Import Settings Across a Team",
        description: "Use deterministic rules to keep Unity import settings consistent across contributors, machines, and asset drops.",
        publishDate: "2026-03-11",
        updatedDate: "2026-03-11",
        readTime: "7 min read",
        heroImage: "/assets/images/ImportSettingsValidatorFix/marketing/Cover%20image.jpg",
        author: "Kevin Ahlgren Bjorvand",
        primaryCtaLabel: "Open Import Settings Validator & Fix",
        primaryCtaHref: "/assets/import-settings-validator-fix/",
        relatedLinks: ["/assets/import-settings-validator-fix/docs/", "/support/", "/assets/import-settings-validator-fix/license/"]
      },
      {
        slug: "validate-texture-audio-and-model-import-settings-in-unity",
        path: "/articles/import-settings-validator-fix/validate-texture-audio-and-model-import-settings-in-unity/",
        toolKey: "import-settings-validator-fix",
        toolName: "Import Settings Validator & Fix",
        category: "asset-pipeline",
        title: "How to Validate Texture, Audio, and Model Import Settings in Unity",
        description: "Scan a Unity project for non-compliant import settings and surface the exact rule and diff for each asset.",
        publishDate: "2026-03-11",
        updatedDate: "2026-03-11",
        readTime: "8 min read",
        heroImage: "/assets/images/ImportSettingsValidatorFix/marketing/Validate%20the%20project.jpg",
        author: "Kevin Ahlgren Bjorvand",
        primaryCtaLabel: "Buy Import Settings Validator & Fix",
        primaryCtaHref: "https://assetstore.unity.com/packages/slug/362308",
        relatedLinks: ["/assets/import-settings-validator-fix/docs/", "/support/", "/assets/import-settings-validator-fix/license/"]
      },
      {
        slug: "fix-import-setting-drift-without-manual-reimports",
        path: "/articles/import-settings-validator-fix/fix-import-setting-drift-without-manual-reimports/",
        toolKey: "import-settings-validator-fix",
        toolName: "Import Settings Validator & Fix",
        category: "asset-pipeline",
        title: "How to Fix Import Setting Drift Without Manual Reimports",
        description: "Reduce repetitive importer cleanup work by using rule-based fixes instead of manual asset-by-asset reimports.",
        publishDate: "2026-03-11",
        updatedDate: "2026-03-11",
        readTime: "7 min read",
        heroImage: "/assets/images/ImportSettingsValidatorFix/marketing/Rule%20based%20import%20standards.jpg",
        author: "Kevin Ahlgren Bjorvand",
        primaryCtaLabel: "Open Import Settings Validator & Fix",
        primaryCtaHref: "/assets/import-settings-validator-fix/",
        relatedLinks: ["/assets/import-settings-validator-fix/docs/", "/support/", "/assets/import-settings-validator-fix/license/"]
      },
      {
        slug: "generate-third-party-notices-for-a-unity-game",
        path: "/articles/compliance/generate-third-party-notices-for-a-unity-game/",
        toolKey: "compliance",
        toolName: "Third-Party Notices & Credits",
        category: "compliance-release",
        title: "How to Generate Third-Party Notices for a Unity Game",
        description: "Build repeatable third-party notice output for Unity projects with conservative license resolution and export artifacts.",
        publishDate: "2026-03-11",
        updatedDate: "2026-03-11",
        readTime: "8 min read",
        heroImage: "/assets/images/CompliancePack/marketing/Overview.jpg",
        author: "Kevin Ahlgren Bjorvand",
        primaryCtaLabel: "Open Third-Party Notices & Credits",
        primaryCtaHref: "/assets/compliance/",
        relatedLinks: ["/assets/compliance/docs/", "/support/", "/assets/compliance/license/"]
      },
      {
        slug: "build-a-repeatable-unity-license-compliance-workflow",
        path: "/articles/compliance/build-a-repeatable-unity-license-compliance-workflow/",
        toolKey: "compliance",
        toolName: "Third-Party Notices & Credits",
        category: "compliance-release",
        title: "How to Build a Repeatable Unity License Compliance Workflow",
        description: "Turn Unity license compliance into a deterministic scan-review-export process before release pressure takes over.",
        publishDate: "2026-03-11",
        updatedDate: "2026-03-11",
        readTime: "8 min read",
        heroImage: "/assets/images/CompliancePack/marketing/Deterministic%20output.jpg",
        author: "Kevin Ahlgren Bjorvand",
        primaryCtaLabel: "Buy Third-Party Notices & Credits",
        primaryCtaHref: "https://u3d.as/3PWR",
        relatedLinks: ["/assets/compliance/docs/", "/support/", "/assets/compliance/license/"]
      },
      {
        slug: "export-unity-credits-and-compliance-manifests-before-release",
        path: "/articles/compliance/export-unity-credits-and-compliance-manifests-before-release/",
        toolKey: "compliance",
        toolName: "Third-Party Notices & Credits",
        category: "compliance-release",
        title: "How to Export Unity Credits and Compliance Manifests Before Release",
        description: "Export credits, notices, and manifest files with stable structure so legal review and release checks stay predictable.",
        publishDate: "2026-03-11",
        updatedDate: "2026-03-11",
        readTime: "7 min read",
        heroImage: "/assets/images/CompliancePack/marketing/Evidence%20based.jpg",
        author: "Kevin Ahlgren Bjorvand",
        primaryCtaLabel: "Buy Third-Party Notices & Credits",
        primaryCtaHref: "https://u3d.as/3PWR",
        relatedLinks: ["/assets/compliance/docs/", "/support/", "/assets/compliance/license/"]
      }
    ],
    games: {
      published: [
        {
          name: "Forbidden Buttons",
          summary: "Bright first-person puzzle rooms where a single forbidden button rewrites the rules.",
          links: [
            { label: "Homepage", href: "/games/forbiddenbuttons/" },
            { label: "Wishlist on Steam", href: "https://store.steampowered.com/app/4540560/Forbidden_buttons" }
          ]
        },
        {
          name: "Orbital Chaos",
          summary: "Arcade game available on mobile storefronts.",
          links: [
            { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.kevinbjorvand.orbitalchaos" },
            { label: "App Store", href: "https://apps.apple.com/us/app/orbital-chaos/id6754812237" }
          ]
        },
        {
          name: "NeonSurge 2",
          summary: "A neon-action sequel published on itch.io.",
          links: [
            { label: "Open on itch.io", href: "https://kevindevelopment.itch.io/neonsurge-2" }
          ]
        },
        {
          name: "NeonSurge",
          summary: "Original NeonSurge release, available on itch.io.",
          links: [
            { label: "Open on itch.io", href: "https://kevindevelopment.itch.io/neonsurge" }
          ]
        }
      ],
      prototypes: [
        {
          name: "Teleportation Prototype",
          summary: "Prototype experiment published on itch.io.",
          links: [
            { label: "Open on itch.io", href: "https://kevindevelopment.itch.io/teleportation-prototype" }
          ]
        },
        {
          name: "Core Ascend",
          summary: "Prototype build available on itch.io.",
          links: [
            { label: "Open on itch.io", href: "https://kevindevelopment.itch.io/core-ascend" }
          ]
        },
        {
          name: "Dodge the Blocks",
          summary: "Prototype arcade concept available on itch.io.",
          links: [
            { label: "Open on itch.io", href: "https://kevindevelopment.itch.io/dodge-the-blocks" }
          ]
        },
        {
          name: "LumaCore",
          summary: "Prototype minigame release on itch.io.",
          links: [
            { label: "Open on itch.io", href: "https://kevindevelopment.itch.io/lumacore-minigame" }
          ]
        },
        {
          name: "Duestien: City Scene",
          summary: "Prototype environment scene available on itch.io.",
          links: [
            { label: "Open on itch.io", href: "https://kevindevelopment.itch.io/duestien" }
          ]
        }
      ]
    },
    socials: [
      {
        platform: "YouTube",
        handle: "@devwithkevin",
        href: "https://www.youtube.com/@devwithkevin",
        content: "Video updates, development logs, and walkthrough content."
      },
      {
        platform: "X",
        handle: "@BjorvandKevin",
        href: "https://x.com/BjorvandKevin",
        content: "Short-form updates and release announcements."
      },
      {
        platform: "Instagram",
        handle: "@kevinbdev",
        href: "https://www.instagram.com/kevinbdev/",
        content: "Visual snapshots, clips, and behind-the-scenes posts."
      },
      {
        platform: "TikTok",
        handle: "@kevinbdev",
        href: "https://www.tiktok.com/@kevinbdev",
        content: "Short videos and quick game/tool highlights."
      },
      {
        platform: "Skool",
        handle: "Kevin Bjorvand",
        href: "https://skool.com/@kevin-bjorvand-9175",
        content: "Community learning and discussion channel."
      }
    ],
    smartIndieDestinations: [
      { label: "Smart Indie Website", href: "https://smartindie.dev/" },
      { label: "App Hub", href: "https://smartindie.dev/app/index/" },
      { label: "Games", href: "https://smartindie.dev/games/" },
      { label: "Articles", href: "https://smartindie.dev/articles/" },
      { label: "FAQ", href: "https://smartindie.dev/faq/" },
      { label: "About & Contact", href: "https://smartindie.dev/about-contact/" },
      { label: "Email Updates", href: "https://smartindie.dev/email-updates/" }
    ]
  };
})();
