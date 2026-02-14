# Build Size Guard (Unity Editor)

Build Size Guard is a Unity Editor tool that helps you **detect and prevent build size regressions** by capturing snapshots after builds, diffing snapshots, enforcing budgets, and generating CI-friendly report artifacts with deterministic exit codes.

If you’ve ever had a build jump in size and thought “what changed?”, this tool is designed to answer quickly:

- Did the build size change?
- What were the top contributors to that change?
- Does the change violate our budgets/limits?
- Should CI fail this build?

> Build Size Guard is **Editor-only**. It does not ship in your player build.

## TODO (Roadmap)

- **Visual UI upgrades to reduce text**, such as replacing rows with interactive timeline charts, bar-first tables, delta contribution waterfall charts, and better visualized budgets as gauges instead of form fields.
- **Add a right-side selection details drawer (inspector-like)** that displays details when an item is clicked in the diff tables. It should show icon, path, size, size change, category, new/removed/moved state, and include buttons/actions like ping asset, reveal in explorer/finder, open importer, copy path, and more.
- **A minimal stripping/dependency summary**: total stripped modules, top reasons (if available), and a “why was this asset included?” view (at least at the level of asset references), including an Addressables dependency chain.
- **Capture build settings on snapshots and show a settings diff** between baseline/current snapshots.
- **Low priority (roadmap): Unused assets list** to see what assets are not included in the build (as a complement to the stripping/dependency summary).

## Table of contents

- [Features](#features)
- [Requirements](#requirements)
- [Install](#install)
- [Quick start](#quick-start)
- [How it works](#how-it-works)
- [Configuration (Project Settings)](#configuration-project-settings)
- [Editor workflow](#editor-workflow)
- [CI / batchmode (CLI)](#ci--batchmode-cli)
- [Outputs (snapshots, reports)](#outputs-snapshots-reports)
- [Addressables support](#addressables-support)
- [Metrics and definitions](#metrics-and-definitions)
- [Limitations](#limitations)
- [Troubleshooting](#troubleshooting)
- [Contributing / development](#contributing--development)
- [License](#license)

## Features

- **Automatic snapshot capture after builds**
  - Captures from Unity’s `BuildReport` after build completion.
  - Optional snapshot retention per build target.
- **Snapshot diffing**
  - Total delta, percent delta, increases/decreases, new/removed items, moved items (when GUID is available).
  - Grouped totals by **category** and **folder** (with “remainder” grouping for anything outside the top-N list).
  - Addressables grouped totals by **group**, **bundle**, and **asset** when `buildlayout.json` is available.
- **Budget enforcement (guardrails)**
  - Reported total size limits (Unity `BuildReport.summary.totalSize`)
  - Output artifact limits (measured bytes on disk of the build output path)
  - Delta increase and percent increase limits
  - Per-category budgets (texture/audio/mesh/shader/code/other)
- **CI-friendly runner**
  - Unity batchmode entry point with stable exit codes.
  - Optional JSON and Markdown report outputs.
  - “Latest passing” baseline support for CI via an index file.
- **Editor window**
  - Local compare baseline/current snapshots.
  - Browse and filter snapshots, inspect grouped totals, export reports, import `.buildreport` files.
  - Click diff rows to ping the asset (when present).

## Requirements

- **Unity**: Tested baseline `6000.3.7f1` (Unity 6.0).
- **Editor-only**: Uses `UnityEditor` APIs and runs in the editor / batchmode editor.
- Optional: **Addressables build layout** (only if you want Addressables rollups in snapshots).

## Install

This repository is structured as a Unity project. To use Build Size Guard in another project:

1. Copy the folder `Assets/BuildSizeGuard` into your Unity project’s `Assets/` directory (or import it as a `.unitypackage`).
2. Open Unity and let it recompile.
3. Configure the tool under `Project Settings > Build Size Guard`.

Recommended: ensure your repo ignores generated data:

- Ignore the Build Size Guard data root (default `BuildSizeGuardData/`). This project already includes `/BuildSizeGuardData/` in `.gitignore`.

## Quick start

1. Open `Project Settings > Build Size Guard`.
2. Confirm or set:
   - `Data Root Path` (default: `BuildSizeGuardData`)
   - Snapshot capture settings (auto-capture, what build results to capture)
   - `Top Contributor Limit` (detail vs. snapshot size)
   - Default budget policy and any per-target overrides
3. Make two builds (so there’s something to diff).
4. Open the window: `Tools > Build Size Guard > Open Window`.
5. Compare snapshots, then export a report if needed.

For a step-by-step walkthrough, see `Assets/BuildSizeGuard/Documentation~/QuickStart.md`.

## How it works

At a high level:

1. **Capture**: after each build, Build Size Guard extracts metrics and a “top contributors” list from the `BuildReport` and writes a snapshot JSON file to your data root.
2. **Diff**: it compares a baseline snapshot to a current snapshot and computes:
   - overall report-total delta and percent delta
   - per-item increases/decreases/new/removed/moved (based on the snapshot’s contributor list)
   - grouped totals (category/folder) for items outside the top-N list (“remainder”)
3. **Evaluate**: it applies your budgets (totals/delta/percent/category) and produces violations (if any).
4. **Report**: it prints a concise console summary and can write JSON + Markdown reports for CI artifacts / PR comments.

Important detail: snapshots store a **ranked top-N contributor list** plus grouped “remainder” totals. This keeps snapshots small and diffs fast, but means the diff tables are intentionally focused on the biggest contributors (not a complete list of every file in the build).

## Configuration (Project Settings)

Open: `Project Settings > Build Size Guard`

### Storage

- **Data Root Path**
  - Where snapshots, reports, and the latest-passing index are stored.
  - Can be relative (to project root) or absolute.

### Snapshot capture

- **Auto Capture Snapshots**
  - Captures automatically after build completion.
- **Capture successful builds / failed builds**
  - Control what build results produce a snapshot.
- **Treat unknown build result as usable**
  - Some build pipelines report `Unknown`; this setting controls how “completeness” is classified.
- **Top Contributor Limit**
  - Higher = more detailed diffs, larger snapshot files.
- **Snapshot Retention (per target)**
  - Keeps the N most recent snapshots per build target.

### Comparison and display

- **Default comparison metric**
  - What the UI emphasizes when presenting totals (report total vs output artifact, etc.).
- **Display units / budget input mode**
  - Choose how sizes are displayed and entered.

### Budgets (default + per-target)

Budgets can be configured in the default policy and overridden per build target.

Supported limit types:

- **Report total**: max `BuildReport.summary.totalSize`
- **Report delta**: max increase vs baseline
- **Report percent increase**: max growth vs baseline
- **Output artifact total**: max bytes on disk for the build output path
- **Output artifact delta / percent increase**
- **Category budgets**: per-category maximums (texture/audio/mesh/shader/code/other)

## Editor workflow

Open: `Tools > Build Size Guard > Open Window`

Common workflow:

1. **Refresh** snapshots.
2. Select a **baseline** and **current** snapshot (or use “latest vs previous” convenience actions).
3. Review:
   - summary totals and deltas
   - grouped totals (category/folder, plus Addressables rollups when available)
   - diff tables (increases/decreases/new/removed)
4. Click rows to **ping the asset** in the Project window (when present).
5. Export a **JSON** and/or **Markdown** report for sharing.

You can also **import** a historical `.buildreport` file (toolbar) and store it as a snapshot for comparison.

## CI / batchmode (CLI)

Build Size Guard includes a batchmode entry point designed for CI:

- Execute method: `BuildSizeGuard.Editor.Cli.BuildSizeGuardBatchRunner.Run`

Example (macOS):

```bash
/Applications/Unity/Hub/Editor/6000.3.7f1/Unity.app/Contents/MacOS/Unity \
  -batchmode -nographics \
  -projectPath /absolute/path/to/project \
  -executeMethod BuildSizeGuard.Editor.Cli.BuildSizeGuardBatchRunner.Run \
  -buildSizeGuard.baseline latestPassing \
  -buildSizeGuard.current latest \
  -buildSizeGuard.baselineMatch targetAndProfile \
  -buildSizeGuard.exportPrefix BuildSizeGuardData/reports/ci_guard \
  -buildSizeGuard.failOnViolation true \
  -quit
```

### CLI arguments

- `-buildSizeGuard.baseline <path|latest|latestPassing>`
- `-buildSizeGuard.current <path|latest>`
- `-buildSizeGuard.baselineMatch <targetAndProfile|targetOnly|any>`
- `-buildSizeGuard.reportJson <path>`
- `-buildSizeGuard.reportMarkdown <path>`
- `-buildSizeGuard.exportPrefix <path-prefix>`
- `-buildSizeGuard.failOnViolation <true|false>`

Notes:

- If `exportPrefix` is provided and explicit report paths aren’t provided, the runner writes:
  - `<exportPrefix>.json`
  - `<exportPrefix>.md`
- `baselineMatch` controls how `latest` / `latestPassing` resolve:
  - `targetAndProfile` (default): same build target + build profile
  - `targetOnly`: same build target, ignore build profile
  - `any`: first available previous snapshot

### Exit codes

- `0`: success (no blocking violations)
- `2`: budget/regression violation (and failure enabled)
- `3`: invalid CLI arguments
- `4`: baseline resolution failure
- `5`: snapshot load/schema failure
- `6`: report write failure
- `7`: runtime error

### Making `latestPassing` work in CI

`latestPassing` is stored in an index file under your data root (default `BuildSizeGuardData/latest_passing_snapshots.json`) and points at snapshot paths.

To get value from `latestPassing` in ephemeral CI runners, you typically need to **persist the data root** between runs (CI cache, artifact download, or similar), so the next run can load older snapshots as baselines.

## Outputs (snapshots, reports)

By default, everything is stored under the configured **Data Root Path** (default `BuildSizeGuardData/` in the project root):

- Snapshots: `BuildSizeGuardData/snapshots/*.json`
- Reports: `BuildSizeGuardData/reports/*.json` and/or `*.md`
- Latest passing index: `BuildSizeGuardData/latest_passing_snapshots.json`

Snapshots include:

- Build identifiers (target, build profile, options)
- Timestamps and output path
- Multiple size metrics (report total, output artifact, Addressables totals when present)
- A top-N contributor list plus grouped “remainder” totals
- Optional CI metadata (branch/commit/build number/workflow when CI env vars are present)

## Addressables support

If a `buildlayout.json` is present under the build output directory, Build Size Guard captures Addressables rollups in the snapshot:

- grouped totals by **group**
- grouped totals by **bundle**
- grouped totals by **asset**

If the layout is missing, malformed, or stale, Addressables totals will simply be empty for that snapshot.

## Metrics and definitions

Build Size Guard captures multiple metrics on purpose. They answer slightly different questions:

- `reportTotalSizeBytes`
  - Unity-reported `BuildReport.summary.totalSize`.
- `outputArtifactSizeBytes`
  - Measured bytes on disk for the build output path (file or directory).
- `addressablesTotalBytes`
  - Best-effort total bytes inferred from Addressables `buildlayout.json` (when present).

## Limitations

- Unity’s reported total size and the output artifact size are related but not identical (platform packaging varies).
- Store/download sizes (compression, delta patching, CDN packaging) are not the same as local artifact sizes; this tool is intended for **regression detection**, not store-size prediction.
- Addressables totals require a valid `buildlayout.json`; otherwise Addressables data is absent.
- Diff tables are based on the snapshot’s **top-N contributor list**, not a full build inventory.

## Troubleshooting

### “Why don’t I see a contributor breakdown?”

Contributor detail depends on what Unity includes in the build report and what APIs are available for your Unity version/platform. Increase `Top Contributor Limit` to store more detail per snapshot.

### Batchmode or tests intermittently fail with package compile errors

This can happen due to environment/package-cache issues (not Build Size Guard logic). Typical recovery:

1. Close Unity.
2. Delete `Library/`.
3. Reopen the project and let packages reimport fully.
4. Retry your batchmode command.

### Clean import validation (Asset Store quality gate)

This repo includes a helper script that fails if there are C# compile errors/warnings under `Assets/BuildSizeGuard`:

```bash
./scripts/verify_clean_import.sh /absolute/path/to/project /tmp/buildsizeguard-clean-import.log
```

## Contributing / development

- Code lives under `Assets/BuildSizeGuard/` (Editor code under `Assets/BuildSizeGuard/Editor/`).
- EditMode tests live under `Assets/BuildSizeGuard/Tests/Editor/`.
- Run EditMode tests via Unity batchmode (example):

```bash
/Applications/Unity/Hub/Editor/6000.3.7f1/Unity.app/Contents/MacOS/Unity \
  -batchmode -nographics \
  -projectPath /absolute/path/to/project \
  -runTests -testPlatform EditMode \
  -testResults /tmp/buildsizeguard-editmode-results.xml \
  -logFile /tmp/buildsizeguard-editmode.log \
  -quit
```

## License

MIT. See `LICENSE` in the repository root.

