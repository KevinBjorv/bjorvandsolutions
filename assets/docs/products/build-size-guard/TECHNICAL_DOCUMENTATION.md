# Build Size Guard Technical Documentation

## 1. Scope and Source of Truth
This document is derived from code and serialized project settings in this repository, mainly under `Assets/BuildSizeGuard` and `ProjectSettings/BuildSizeGuardSettings.asset`.

Validated source anchors:
- `Assets/BuildSizeGuard/Core/*`
- `Assets/BuildSizeGuard/Editor/*`
- `Assets/BuildSizeGuard/Tests/Editor/*`
- `ProjectSettings/BuildSizeGuardSettings.asset`
- `ProjectSettings/ProjectVersion.txt`
- `scripts/verify_clean_import.sh`

Repository Unity editor version:
- `6000.3.7f1` (`ProjectSettings/ProjectVersion.txt`)

## 2. Overview
Build Size Guard is an editor-only Unity build size regression tool. It captures build snapshots, computes diffs between snapshots, evaluates size budgets, and exports reports for local inspection and CI.

It is implemented as source code inside this project (not as a UPM package in this repository).

## 3. What You Get
### 3.1 Assemblies
- `BuildSizeGuard.Core` (Editor-only)
- `BuildSizeGuard.Editor` (Editor-only, references `BuildSizeGuard.Core`)
- `BuildSizeGuard.Editor.Tests` (Editor-only test assembly, `UNITY_INCLUDE_TESTS`)

All three asmdefs are restricted to `includePlatforms: ["Editor"]`.

### 3.2 Functional Areas
- Snapshot model and diff model (`Core/Models`)
- Category classification, diff, and budget evaluation services (`Core/Services`)
- Build hook and snapshot capture (`Editor/Build`, `Editor/Application`)
- Snapshot persistence/indexing (`Editor/Infrastructure`)
- Addressables layout parsing from JSON (`Editor/Infrastructure/AddressablesBuildLayoutParser.cs`)
- Editor window workflow (`Editor/UI/BuildSizeGuardWindow.cs`)
- CLI/batch runner (`Editor/Cli/BuildSizeGuardBatchRunner.cs`)
- Report writers (Console, Markdown, JSON, XML, CSV)
- Editor tests for parser, diffing, budgets, CLI, import, settings providers

## 4. Feature Set
- Automatic snapshot capture on build completion via `IPostprocessBuildWithReport`
- Build result aware capture filtering (Succeeded/Failed/Cancelled/Unknown)
- Snapshot completeness classification policy
- Top-N contributor retention with grouped remainder rollups
- Grouped totals by category and by folder
- Addressables grouped totals (group, bundle, asset) parsed from layout JSON
- Deterministic snapshot IDs when Unity summary GUID is unavailable
- Diff computation (increases, decreases, new, removed, moved)
- Budget policies:
  - report total limit
  - report delta limit
  - report percent limit
  - output artifact total limit
  - output artifact delta limit
  - output artifact percent limit
  - per-category max limits
- Batch/CI runner with explicit exit codes
- Report export formats: JSON, Markdown, XML, CSV
- Latest passing snapshot index keyed by build target and build profile
- Snapshot import from `.buildreport` files

## 5. Installation
### 5.1 In This Repository
No additional installation is required. The module is already present at:
- `Assets/BuildSizeGuard`

Project settings asset exists at:
- `ProjectSettings/BuildSizeGuardSettings.asset`

### 5.2 Into Another Unity Project
Code-backed install method from this repo layout:
1. Copy `Assets/BuildSizeGuard` into the target project.
2. Open the project in Unity Editor.
3. Open the tool via menu `Tools/Build Size Guard/Open Window`.
4. Configure project settings under `Project/Build Size Guard`.

## 6. Quick Start
1. Open `Tools/Build Size Guard/Open Window`.
2. Build your player.
   - If auto capture is enabled, a snapshot is created after build completion.
3. In the window, run `Latest vs Previous` or choose explicit baseline/current and click `Compare`.
4. Review:
   - Summary (totals, delta, violations)
   - Grouped totals (`By Category`, `By Folder`, optional `By Addressables Group`)
   - Diff tables (`Increases`, `Decreases`, `New`, `Removed`)
5. Set or edit budgets in the Budgets section and save.
6. Export report from toolbar (`Markdown`, `JSON`, `XML`, `CSV`, or copy Markdown to clipboard).

## 7. Configuration and Settings
Settings class:
- `BuildSizeGuard.Editor.Settings.BuildSizeGuardSettings`
- File path attribute: `ProjectSettings/BuildSizeGuardSettings.asset`

### 7.1 Core Settings Fields
| Field | Code Default | Current Project Value | Behavior |
|---|---:|---:|---|
| `dataRootPath` | `BuildSizeGuardData` | `BuildSizeGuardData` | Root folder for snapshots/reports. Relative paths resolve from project root. |
| `autoCaptureSnapshots` | `true` | `true` | Master switch for post-build auto capture. |
| `captureSuccessfulBuildsOnly` (legacy) | `true` | `false` | Legacy migration field. Mirrors successful+failed toggles. |
| `captureSuccessfulBuilds` | `true` | `true` | Capture snapshots for successful builds. |
| `captureFailedBuilds` | `false` | `true` | Capture snapshots for failed/canceled builds. |
| `treatUnknownBuildResultAsUsable` | `false` | `true` | Affects Unknown result capture routing and completeness classification. |
| `topContributorLimit` | `200` | `200` | Max ranked contributors stored per snapshot. |
| `snapshotRetentionPerTarget` | `50` | `50` | Keep latest N snapshots per target. Older snapshots pruned on new capture/import. |
| `failOnViolationInBatchMode` | `true` | `true` | CLI default behavior when violations exist. |
| `defaultComparisonMetric` | `ReportTotal` | `ReportTotal` | Metric driving totals/deltas in compare UI. |
| `displayUnits` | `Auto` | `Auto` | Byte display units in UI/report formatting. |
| `budgetInputMode` | `Friendly` | `Friendly` | Budget input UX mode. |

### 7.2 Budget Policy Structure
Policy type: `BuildSizeGuard.Core.Models.BudgetPolicy`

Fields:
- `enabled`
- `maxTotalSizeEnabled` + `maxTotalSizeBytes`
- `maxDeltaIncreaseEnabled` + `maxDeltaIncreaseBytes`
- `maxPercentIncreaseEnabled` + `maxPercentIncrease`
- `maxOutputArtifactSizeEnabled` + `maxOutputArtifactSizeBytes`
- `maxOutputArtifactDeltaIncreaseEnabled` + `maxOutputArtifactDeltaIncreaseBytes`
- `maxOutputArtifactPercentIncreaseEnabled` + `maxOutputArtifactPercentIncrease`
- `categoryBudgets[]` (`category`, `maxSizeBytes`)
- `limitsMigrationCompleted`

Current project default policy (`ProjectSettings/BuildSizeGuardSettings.asset`):
- `enabled = true`
- `maxTotalSizeEnabled = true`
- `maxTotalSizeBytes = 3221225472` (3 GiB)
- Other default limits disabled (`Enabled=false`, value `0`)
- Category budgets include:
  - `code: 0`
  - `other: 0`

Current project target override policy:
- One entry for `StandaloneWindows`
- `enabled = true`
- All explicit size limits disabled/0

### 7.3 Category Budget Keys
Canonical categories from `SizeCategoryResolver` and `CategoryOptionsProvider`:
- `texture`
- `audio`
- `mesh`
- `shader`
- `code`
- `other`

## 8. Snapshot Capture and Completeness
### 8.1 Build Hook
Class: `BuildSizeGuardBuildProcessor : IPostprocessBuildWithReport`
- `callbackOrder = 1000`
- Capture decision uses:
  - `autoCaptureSnapshots`
  - `captureSuccessfulBuilds`
  - `captureFailedBuilds`
  - `treatUnknownBuildResultAsUsable`

Capture decision matrix (`ShouldCaptureSnapshot`):
- `Succeeded` -> `captureSuccessfulBuilds`
- `Failed` or `Cancelled` -> `captureFailedBuilds`
- `Unknown` ->
  - if `treatUnknownBuildResultAsUsable`: `captureSuccessfulBuilds`
  - else: `captureFailedBuilds`
- any other enum value -> `captureSuccessfulBuilds`

### 8.2 Completeness Policy
Class: `SnapshotCompletenessPolicy`

`isIncomplete` becomes:
- `false` when `buildResult == Succeeded`
- `true` when `buildResult == Failed` or `Cancelled`
- for `Unknown`:
  - `false` only if `treatUnknownBuildResultAsUsable == true` and `outputArtifactSizeBytes > 0`
  - otherwise `true`
- all other cases: `true`

### 8.3 Extractor Pipeline
Class: `BuildReportSnapshotExtractor`

Data source preference:
1. Packed assets (`report.packedAssets`) when available
2. Build report files (`GetFiles()` / `files`) fallback

Contributor handling:
- Contributors are normalized and aggregated deterministically by normalized key.
- Top contributors: first `topContributorLimit` sorted by descending size.
- Remainder grouped into:
  - `remainderGroupedTotals` (category)
  - `remainderGroupedTotalsByFolder` (first two path segments)
- If no contributors are found, extractor creates a fallback contributor from output path and total size.

Snapshot identity:
- Uses build summary GUID when present.
- Otherwise generates deterministic `det-<hash>` ID from build metadata + metrics.

Build metadata enrichment:
- `buildProfileId`, `buildProfileName` read via reflection (`summary.buildProfile` or `report.buildProfile` when present)
- `settingsFingerprint` is SHA-256 of selected build settings/features
- `environmentMetadata` captures first available values from CI variables:
  - `branch`: `BUILD_SOURCEBRANCHNAME` / `GITHUB_REF_NAME` / `CI_COMMIT_REF_NAME`
  - `commit`: `BUILD_SOURCEVERSION` / `GITHUB_SHA` / `CI_COMMIT_SHA`
  - `buildNumber`: `BUILD_BUILDNUMBER` / `GITHUB_RUN_NUMBER` / `CI_PIPELINE_ID`
  - `workflow`: `GITHUB_WORKFLOW` / `CI_PIPELINE_SOURCE`

## 9. Snapshot Schema and Storage
### 9.1 Schema
Model: `BuildSizeSnapshot`
- Current schema version constant: `"6"`

Important fields:
- Identity/metadata:
  - `schemaVersion`, `snapshotId`, `label`, `toolVersion`, `unityVersion`
  - `buildTarget`, `buildTargetGroup`, `buildProfileId`, `buildProfileName`
  - `buildOptions`, `detailedBuildReportEnabled`, `settingsFingerprint`
- Build state:
  - `buildResult`, `isIncomplete`, `outputPath`, `buildStartedUtc`, `buildEndedUtc`
- Metrics:
  - `reportTotalSizeBytes`, `outputArtifactSizeBytes`, `addressablesTotalBytes`
  - legacy mirror: `totalSizeBytes`
- Contributor sets:
  - `sourceContributorCount`, `topContributorLimit`, `remainderSizeBytes`
  - `contributors`
  - grouped remainder/category/folder lists
  - addressables grouped totals by group/bundle/asset
- Environment:
  - `environmentMetadata`

### 9.2 Data Directories
From `BuildSizeGuardPaths`:
- Data root default folder name: `BuildSizeGuardData`
- Snapshots folder: `<DataRoot>/snapshots`
- Reports folder: `<DataRoot>/reports`

Relative data root paths are resolved against Unity project root (`Application.dataPath/..`).

### 9.3 Snapshot File Naming and Ordering
Snapshot file pattern (`JsonSnapshotRepository`):
- `yyyyMMddTHHmmssfffZ_<Target>_<Label>_<SnapshotId>.json`

Repository ordering:
- Snapshot path listing sorted descending by path (ordinal)
- Snapshot objects sorted by `buildEndedUtc` descending, then `snapshotId` descending

### 9.4 Latest Passing Index
File:
- `<DataRoot>/latest_passing_snapshots.json`

Behavior:
- Keyed by normalized `buildTarget` + normalized `buildProfileId`
- Backward-compatible lookup fallback to empty profile entry when profile-specific key not found
- Updated only on batch runs that finish without violations

## 10. Category Resolution
Class: `SizeCategoryResolver`

Canonical output categories:
- `texture`, `audio`, `mesh`, `shader`, `code`, `other`

Resolution strategy:
1. Code-output heuristics first (`code`): managed outputs, IL2CPP artifacts, global metadata, platform-native build libraries
2. Extension mapping (`.png`, `.wav`, `.fbx`, `.shader`, etc.)
3. Name/path keyword fallback (`texture`, `audio`, `mesh`, `shader`)
4. Fallback to `other`

Important detail:
- Paths that look like project assets (`Assets/*`, `Packages/*`) are not auto-classified as code outputs, except known build-output patterns (for example Android `assets/bin/data/...`).

## 11. Diff and Budget Evaluation Semantics
### 11.1 Diffing
Class: `SnapshotDiffService`

Identity priority:
1. `guid` (if present)
2. `key`
3. `pathAtBuildTime`

Computed sections:
- `entries`
- `increases`
- `decreases`
- `newItems`
- `removedItems`
- `movedItems` (requires same GUID and changed path)

Percent rule:
- If baseline bytes `<= 0` and delta `> 0`, percent is `100%`.

Grouped totals in diff:
- Category baseline/current/delta
- Folder baseline/current/delta
- Addressables group/bundle/asset baseline/current/delta

### 11.2 Budget Evaluation
Class: `BudgetEvaluationService`

Violation codes:
- `REPORT_TOTAL_MAX`
- `REPORT_DELTA_MAX`
- `REPORT_PERCENT_MAX`
- `ARTIFACT_TOTAL_MAX`
- `ARTIFACT_DELTA_MAX`
- `ARTIFACT_PERCENT_MAX`
- `CATEGORY_MAX`

Category budget behavior:
- Evaluated only when `category` is non-empty and `maxSizeBytes > 0`
- Uses `diff.currentGroupedTotalsByCategory` when available
- Falls back to summing `diff.entries.currentSizeBytes` by category otherwise

Migration compatibility behavior:
- If `limitsMigrationCompleted == false`, enabled state can be inferred from non-zero budget values.

## 12. Addressables Layout Parsing
Class: `AddressablesBuildLayoutParser`

What it parses:
- Addressables layout JSON into grouped totals by:
  - group
  - bundle
  - asset

Lookup behavior:
- Primary expected filename: `buildlayout.json`
- Also accepts JSON files with addressables/layout naming patterns
- Search locations include output directory, ancestor/project-related directories, and recursive search up to depth 5
- Chooses most recently modified candidate

Parser behavior:
- Uses internal tolerant JSON reader (no dependency on external JSON package APIs)
- For group/bundle duplicates, keeps largest size per key
- For asset duplicates, accumulates size
- Total bytes fallback order:
  1. bundle sum
  2. group sum
  3. asset sum
- On missing/unreadable/invalid JSON, returns empty result (with warning log)

## 13. Editor Window Behavior
Main class: `BuildSizeGuardWindow`

Menu entry:
- `Tools/Build Size Guard/Open Window`

Toolbar actions:
- Refresh snapshots
- Open latest report
- Open reports folder
- Import `.buildreport`
- Export summary (`Markdown`, `JSON`, `XML`, `CSV`, `Copy to clipboard`)

Snapshots pane:
- Search tokens are AND-matched against:
  - target
  - label
  - output path
  - snapshot file path
  - build profile name
- Target filter dropdown
- Toggle `Show non-usable/incomplete`

Compare pane:
- Metric options:
  - `ReportTotal`
  - `OutputArtifact`
  - `AddressablesWhenPresent` (falls back to report total when addressables not available)
- Baseline/current selectors
- Actions:
  - `Swap`
  - `Compare`
  - `Latest vs Previous`
  - selector shortcuts (`Latest`, `Previous`)

Default selection logic:
- Current defaults to latest selectable snapshot
- Baseline defaults to previous snapshot for same target

Snapshot interactions:
- Double-click snapshot compares it against previous snapshot of same target
- Context menu:
  - Set as Baseline
  - Set as Current
  - Compare Baseline vs This
  - Reveal Snapshot File
  - Delete Snapshot

Budgets pane:
- In-window draft editing of default and per-target policies
- `Raw Bytes Mode` toggle
- `Show unavailable targets` toggle
- Actions:
  - Save
  - Save + Re-run Compare
  - Reload

Grouped totals tabs shown by UI:
- `By Category`
- `By Folder`
- `By Addressables Group` (only when group data exists)

Diff tables shown by UI:
- `Increases`
- `Decreases`
- `New`
- `Removed`

Moved entries:
- Included in diff model and report outputs
- Count appears in summary
- No dedicated `Moved` diff table is rendered in current window

Diff row interactions:
- Single click attempts to ping corresponding `Assets/` or `Packages/` object
- Context menu supports:
  - `Copy File Location`
  - `Copy GUID`

Change-over-time:
- Computed per target from consecutive snapshots
- Row count is configurable from 5 to 100 (default 20)
- Clicking a row applies that baseline/current pair and reruns compare

## 14. CLI / Batch Mode
Entry method:
- `BuildSizeGuard.Editor.Cli.BuildSizeGuardBatchRunner.Run`

Use with Unity `-executeMethod` in batch mode.

### 14.1 CLI Arguments
From `CliArgumentParser.Usage`:
- `-buildSizeGuard.baseline <path|latest|latestPassing>`
- `-buildSizeGuard.current <path|latest>`
- `-buildSizeGuard.baselineMatch <targetAndProfile|targetOnly|any>`
- `-buildSizeGuard.reportJson <path>`
- `-buildSizeGuard.reportMarkdown <path>`
- `-buildSizeGuard.reportXml <path>`
- `-buildSizeGuard.reportCsv <path>`
- `-buildSizeGuard.exportPrefix <path-prefix>`
- `-buildSizeGuard.failOnViolation <true|false>`

Defaults:
- `baseline = latest`
- `current = latest`
- `baselineMatch = targetAndProfile`

### 14.2 Baseline Resolution Logic
- `baseline=latestPassing`
  - Looks up latest passing index by target/profile
  - For `baselineMatch=targetOnly|any`, profile lookup is relaxed (empty profile)
- `baseline=latest`
  - Selects most recent matching historical snapshot excluding current path
  - If mode is `targetAndProfile` and no match is found, falls back to `targetOnly`
- explicit baseline path
  - loads exact specified snapshot file

If `current=latest` and `baseline=latest`, at least two matching snapshots are required.

### 14.3 Output Path Behavior
- Relative report paths are resolved against project root.
- `exportPrefix` auto-fills missing report outputs:
  - `<prefix>.json`
  - `<prefix>.md`
  - `<prefix>.xml`
  - `<prefix>.csv`
- If prefix already ends with known report extension, extension is stripped before suffixing.

### 14.4 Exit Codes
- `0` success
- `2` violations found and configured to fail
- `3` invalid CLI arguments
- `4` baseline resolution error
- `5` snapshot load error
- `6` report write error
- `7` runtime error

## 15. Report Outputs
Writers:
- `JsonReportWriter`
- `MarkdownReportWriter`
- `XmlReportWriter`
- `CsvReportWriter`
- `ConsoleReportWriter`

Common behavior:
- If output path is empty/whitespace, file writer returns without writing.
- Writes are atomic (`AtomicFileWriter` uses temp file + replace/move).

Content highlights:
- JSON: serialized full `GuardEvaluationResult`
- Markdown: summary + top sections + violations + grouped addressables deltas
- XML: structured summary/snapshots/top entries/violations/grouped deltas
- CSV: flat records for summary, top diffs, violations, grouped deltas
- Console: short summary for logs

## 16. Import Behavior
Import service: `BuildReportImportService`

Rules:
- Input path must exist
- Extension must be `.buildreport`
- Uses `InternalEditorUtility.LoadSerializedFileAndForget`
- Must contain a Unity `BuildReport` object

Import processing:
- Extract snapshot via same `BuildReportSnapshotExtractor`
- Apply completeness policy
- Save snapshot
- Prune per-target retention

Label normalization:
- Provided label used unless empty or `auto`
- Empty/`auto` falls back to file stem
- File stem `auto` becomes `import`

## 17. Data Layout Example
With default `dataRootPath = BuildSizeGuardData`:

```text
BuildSizeGuardData/
  latest_passing_snapshots.json
  snapshots/
    20260211T100000000Z_StandaloneWindows64_auto_<snapshotId>.json
    ...
  reports/
    <target>_<currentId>_vs_<baselineId>.md
    <target>_<currentId>_vs_<baselineId>.json
    <target>_<currentId>_vs_<baselineId>.xml
    <target>_<currentId>_vs_<baselineId>.csv
```

Current repository state observed:
- `BuildSizeGuardData/snapshots` exists
- `BuildSizeGuardData/reports` exists

## 18. Validation and Tests
Editor test assembly includes tests for:
- Addressables layout parsing
- Build report extraction
- Auto-capture decision logic
- Snapshot completeness policy
- Diff service
- Budget evaluation
- Snapshot repository and latest passing index
- CLI argument parsing and batch runner behavior
- Category/build target option providers
- Asset store readiness constraints

Additional helper script:
- `scripts/verify_clean_import.sh`
  - launches Unity in batch mode
  - scans log for BuildSizeGuard C# errors and warnings
  - default Unity path points to macOS Hub install for `6000.3.7f1`

## 19. Known Behavior Notes and Constraints
- Module is editor-only by assembly definition and Unity API usage.
- Snapshot/report keys and many stored paths are normalized to lowercase forward-slash format.
- Category budgets set to `0` are effectively inactive (`maxSizeBytes > 0` required).
- Incomplete snapshots are hidden by default in compare selection unless user enables `Show non-usable/incomplete`.
- Addressables bundle/asset deltas are captured in snapshot/diff/report models, but current grouped totals UI tab exposes Addressables group only.
- UI diff tables do not currently render a separate moved-items section even though moved entries are computed and reported.

## 20. License and Support
Build Size Guard includes a dedicated license file:
- `Assets/BuildSizeGuard/License.txt`

License file states:
- Commercial, per-seat, no redistribution terms
- Support contact: `kevin@smartindie.dev`
