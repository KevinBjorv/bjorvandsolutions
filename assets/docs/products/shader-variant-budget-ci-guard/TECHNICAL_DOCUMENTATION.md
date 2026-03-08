# Shader Variant Guard User Guide

This document covers the current, verified behavior of Shader Variant Budget & CI Guard.

Verification status:

- Written against the project state in this repository on 2026-03-07.
- Verified from source, tests, and a Unity 6000.3.7f1 EditMode run.
- The package test suite `ShaderVariantGuard.Editor.Tests` passed 77/77 tests in Unity 6000.3.7f1 during documentation work.

## What the tool is

Shader Variant Budget & CI Guard is an editor-only Unity tool for:

- capturing shader variant snapshots from `Editor.log`
- storing deterministic snapshot JSON files
- comparing a baseline snapshot against a current snapshot
- evaluating the diff against variant budgets
- exporting parser diagnostics
- gating CI through a batchmode entrypoint
- maintaining a `latestPassing` baseline index for automated workflows

It is not a runtime package. Everything in this tool runs in the Unity Editor or Unity batchmode.

## What the tool does not currently do

These points matter because they are easy to assume incorrectly:

- There is no runtime or in-game UI.
- There is no snapshot delete button in the editor window.
- There is no editor-window export for full compare reports. The window only exports diagnostics. Full JSON and Markdown reports are batchmode features.
- There is no target-specific budget policy editor in the Project Settings UI. The UI only edits the default policy block.
- There is no file picker for the path-based compare fields. You type or paste snapshot file paths manually.

## Where to open it

Main entry points:

- Editor window: `Tools/Shader Variant Guard/Open Window`
- Project settings: `Project/Shader Variant Guard`
- Batch entrypoint: `ShaderVariantGuard.Editor.Cli.ShaderVariantGuardBatchRunner.Run`

Helper scripts shipped with the repo:

- `scripts/run_shader_variant_guard_batch.sh`
- `scripts/run_editmode_tests.sh`
- `scripts/verify_clean_import.sh`
- `scripts/run_all_checks.sh`

Important script note:

- The helper scripts are Bash scripts.
- `scripts/common_unity.sh` defaults `UNITY_PATH` to a macOS Unity path.
- On Windows, run Unity directly from PowerShell or use Git Bash / WSL and set `UNITY_PATH` yourself.

## Default storage layout

Unless you change `Data Root Path`, the tool uses:

- `ShaderVariantGuardData/snapshots`
- `ShaderVariantGuardData/reports`
- `ShaderVariantGuardData/diagnostics`
- `ShaderVariantGuardData/latest_passing_snapshots.json`

Snapshot file names use this pattern:

```text
YYYYMMDDTHHmmssfffZ_<target>_<label>_<snapshotId>.json
```

The diagnostics export folder can be overridden independently from the main data root. If you leave it blank, the tool falls back to `ShaderVariantGuardData/diagnostics`.

## Core workflow

The tool follows the same pipeline in the editor and in CI:

1. Capture a snapshot from `Editor.log`.
2. Store the snapshot as JSON with totals, per-shader contributors, parser diagnostics, and metadata.
3. Compare a baseline snapshot against a current snapshot.
4. Apply ignore rules to the diff.
5. Evaluate global and per-shader budgets.
6. Show results in the window or emit reports in batchmode.
7. Optionally promote the current snapshot to the `latestPassing` index when the run passes.

## Snapshot capture behavior

### Manual capture

Use the `Capture Snapshot` button in the main window.

Manual capture:

- reads the current `Editor.log`
- uses label `manual`
- records the active build target
- records the active build profile id on Unity 6 projects when one is available
- saves the snapshot immediately
- refreshes the window list and selects the captured snapshot as the current snapshot

### Automatic capture

Auto capture happens after builds through `IPostprocessBuildWithReport`.

The relevant settings are:

- `Auto Capture Snapshots`
- `Capture Successful Builds`
- `Capture Failed Builds`

Actual post-build behavior:

- successful build -> captured only if `Capture Successful Builds` is enabled
- failed or canceled build -> captured only if `Capture Failed Builds` is enabled
- if auto capture is disabled, nothing is captured

There is no pre-build capture hook.

### What the parser reads

The parser reads `Editor.log` from Unity's discovered log path, unless `Editor.log Path Override` is set.

It recognizes these summary styles:

- `Shader 'MyShader' had 123 variants`
- `Compiled shader: MyShader, 123 variants`
- `variants for MyShader: 123`
- `total shader variants: 12345`

When a `total shader variants` line exists, the parser uses the latest summary block after the last total line, not the whole log history. This keeps older build summaries from polluting the current capture.

### Resilience while Unity is writing the log

Capture is designed to survive active `Editor.log` writes:

- it retries read attempts after sharing violations
- it can fall back to copying the log to a temporary snapshot file and parsing that copy
- diagnostics record whether capture used direct access or a snapshot copy

### Snapshot completeness

Snapshots are marked incomplete when the captured data does not reconcile cleanly. Current completeness checks include:

- missing snapshot data
- negative totals
- no per-shader contributors
- contributor totals not matching `totalVariants`
- a scanned log with no recognized patterns
- contributor data present while matched-line count is zero

Practical effect:

- incomplete snapshots are hidden by default in the window
- `Show Incomplete` reveals them
- batchmode fails with exit code `9` by default when baseline or current is incomplete
- incomplete current snapshots are never promoted to `latestPassing`, even if strict incomplete gating is disabled

## Editor window reference

The window has a header, a toolbar, a snapshot browser on the left, and analysis panels on the right.

### Header and toolbar

| Control | What it does |
| --- | --- |
| `Settings` | Opens `Project/Shader Variant Guard`. |
| `Capture Snapshot` | Captures a snapshot from `Editor.log`. |
| `Refresh Snapshots` | Reloads snapshot JSON files from disk. |
| `Latest vs Previous` | Compares the newest snapshot file against the previous snapshot file. This is global, not target-filtered. |

Important note about `Latest vs Previous`:

- it uses repository order, not the current UI filter
- it does not try to match target or build profile
- if you capture mixed targets or mixed profiles, explicit pair selection is safer

### Left pane: snapshot browser

| Control | What it does |
| --- | --- |
| `Search` | Token-based filter over snapshot id, label, target, build profile id, and source log path. |
| `Target` | Filters the list by build target. |
| `Show Incomplete` | Includes snapshots marked incomplete. This also affects which snapshots are available in compare selectors. |
| Snapshot row button | Selects that snapshot. |
| `Set as Baseline` | Sets the selected row as the baseline snapshot. |
| `Set as Current` | Sets the selected row as the current snapshot. |
| `Compare Selection` | Uses the selected row as current, auto-picks a baseline, and runs a compare. |

Snapshot row badges:

- `Selected`
- `Baseline`
- `Current`

Row text includes:

- build target
- label
- `[incomplete]` tag when applicable
- end time
- total variants
- snapshot id

### How `Compare Selection` chooses a baseline

The auto-baseline logic is deterministic. It tries, in order:

1. an older snapshot with the same target and same build profile
2. a newer snapshot with the same target and same build profile
3. an older snapshot with the same target
4. a newer snapshot with the same target
5. the first different snapshot if no target match exists

This is why `Compare Selection` is usually the fastest option when you are comparing neighboring captures of the same target or build profile.

### Right pane: compare controls

| Control | What it does |
| --- | --- |
| `Baseline` | Chooses the baseline snapshot from the available compare list. |
| `Current` | Chooses the current snapshot from the available compare list. |
| `Swap` | Swaps baseline and current selections. It does not auto-run compare. |
| `Compare Selected Pair` | Runs compare for the chosen baseline/current pair. |
| `Latest vs Previous` | Same action as the toolbar button. |
| `Advanced: Compare by Paths` | Shows text fields for manual snapshot paths. |
| `Baseline Path` | Path to a baseline snapshot JSON file. |
| `Current Path` | Path to a current snapshot JSON file. |
| `Compare Paths` | Loads the two files and compares them. |

Path compare notes:

- both fields must be set
- the files must exist and be valid snapshot JSON
- there is no browse button here
- the policy still comes from the current snapshot target/profile in Project Settings

### Right pane: results

#### Summary

The summary cards show:

- baseline total variants
- current total variants
- delta variants and percent delta
- budget counts as `Errors` and `Warnings`

These totals are post-filter totals, which means ignore rules have already been applied.

#### Budget Findings

The findings panel:

- shows blocking violations first
- shows warnings second
- shows one help box per finding

If nothing fired, the panel says `No warnings or violations.`

#### Diff Entries

The diff panel contains:

- `Search Shader`
- `Sort Mode`
- tabs: `Increases`, `Decreases`, `New`, `Removed`

Actual sort behavior:

- `Delta` sorts by absolute delta
- `Total` sorts by current total variants
- `Percent` sorts by absolute percent delta

Display limit behavior:

- `Display Entry Limit (UI Only)` only limits how many rows are shown in the window
- it does not trim stored snapshot data
- captured snapshot JSON still keeps all contributors

#### Diagnostics

The diagnostics panel contains:

- `Format` dropdown with `txt`, `JSON`, `Markdown`, `XML`, `CSV`
- `Export Diagnostics Snapshot`
- `Reveal Exported File`

Displayed fields:

- source log path
- parse mode
- patterns matched
- scanned lines
- matched lines
- unmatched lines
- parse fingerprint
- log last write time in UTC
- parser summary

Diagnostics source behavior:

- after a compare, diagnostics come from the current snapshot in the evaluation
- if you have captured a snapshot but have not compared anything yet, diagnostics come from the last captured snapshot

Export behavior:

- export file names use `diagnostics_<UTC timestamp>.<ext>`
- export goes to `Diagnostics Export Folder` if configured
- otherwise export goes to the default diagnostics folder under the data root
- `Reveal Exported File` stays disabled until an export succeeds and the file still exists

### Status section

The status panel at the bottom shows the latest operation result as an info, warning, or error message.

### Window state persistence

The window remembers state through `EditorPrefs`, including:

- selected snapshot ids
- compare selections
- foldouts
- searches and filters
- diagnostics export format
- split-pane ratio

## Project Settings reference

The settings UI is split into `Normal Settings` and `Advanced Settings (rarely changed)`.

Changes save automatically when fields change, and there is also a `Save Settings` button for an explicit save.

### Normal settings

| Setting | Default | Verified behavior |
| --- | --- | --- |
| `Data Root Path` | `ShaderVariantGuardData` | Root for snapshots, reports, and latest-passing index. Relative paths are project-relative. Absolute paths outside the project show a warning. |
| `Diagnostics Export Folder` | `ShaderVariantGuardData/diagnostics` | Export destination for diagnostics from the editor window. Relative paths are project-relative. Absolute paths outside the project show a warning. |
| `Browse...` | n/a | Opens an OS folder picker and stores the chosen path as an absolute path. |
| `Auto Capture Snapshots` | `true` | Enables post-build capture hook. |
| `Capture Successful Builds` | `true` | Captures after successful builds. |
| `Capture Failed Builds` | `false` | Captures after failed or canceled builds. |
| `Display Entry Limit (UI Only)` | `200` | Limits visible diff rows only. Presets run from `50` to `1000`. |
| `Snapshot Retention / Target` | `50` | Keeps this many snapshots per target and build profile before pruning. Presets run from `5` to `200`. |

Retention details:

- pruning is target-and-profile aware
- snapshots referenced by the latest-passing index are protected from pruning
- protected snapshots do not count against the unprotected retention quota

Guardrail in settings:

- if both `Capture Successful Builds` and `Capture Failed Builds` are turned off, a successful-build capture is restored on save so capture does not end up fully disabled

### Advanced settings

| Setting | Default | Verified behavior |
| --- | --- | --- |
| `Editor.log Path Override` | empty | Overrides auto-discovery. Relative paths are allowed but warned against. Missing absolute paths are warned about. |
| `Parser Tail Line Count (0 = full file)` | `50000` | `0` scans the full file. Very high values over `200000` show a warning. |
| `Fail On Violation In BatchMode` | `true` | Default batchmode exit behavior when blocking violations exist. CLI can override with `-shaderVariantGuard.failOnViolation`. |
| `Treat Warnings As Violations` | `false` | Changes batchmode exit behavior so warnings can fail the run when fail-on-violation is active. This does not convert warnings into blocking findings in the stored evaluation data. |

## Budget policy behavior

### Policy blocks available in Project Settings

The Project Settings UI edits the default policy block and exposes:

- `Enabled`
- hard caps
- warning thresholds
- per-shader caps
- ignore rules
- allow rules

There is no UI for editing `targetPolicies`.

### Hard caps

Hard caps create blocking violations:

- `Max Total Variants`
- `Max Delta Variants`
- `Max Percent Delta`

### Warning thresholds

Warning thresholds create warning findings:

- `Warning Total Variants`
- `Warning Delta Variants`
- `Warning Percent Delta`

Warnings do not fail CI unless:

- `Treat Warnings As Violations` is enabled in Project Settings, and
- the effective batchmode fail-on-violation behavior is enabled

### Per-shader caps

Per-shader caps check the current snapshot's per-shader totals.

Important consequences:

- unchanged shaders can still violate a per-shader cap
- decreased shaders can still violate a per-shader cap if they are still above the cap

Buttons in this section:

- `Add Per-Shader Cap`
- `Remove Per-Shader Cap`

### Ignore rules

Ignore rules match shader names by:

- `exact`
- `contains`
- `regex`

Buttons in this section:

- `Add Ignore Rule`
- `Remove Rule`

Actual ignore behavior:

- matching shaders are removed from the filtered diff
- their baseline and current totals are subtracted from the compared totals
- they are skipped for per-shader cap evaluation

### Allow rules

Buttons in this section:

- `Add Allow Rule`
- `Remove Rule`

Current verified behavior of allow rules:

- they are checked during per-shader cap evaluation
- if a per-shader cap's shader name matches an allow rule, that per-shader cap is skipped
- they do not restore shaders removed by ignore rules
- they do not affect global total or delta thresholds

If you were expecting allow rules to behave like an include list for the whole diff, that is not how the current implementation works.

## Budgets-as-code JSON

Batchmode supports an external budget file through `-shaderVariantGuard.budgets <path>`.

JSON shape:

- top-level `schemaVersion`
- `defaultPolicy`
- `targetPolicies`

Policy resolution order is strict:

1. exact `buildTarget` + `buildProfileId`
2. target-only policy with an empty `buildProfileId`
3. `defaultPolicy`

Minimal example:

```json
{
  "schemaVersion": "1",
  "defaultPolicy": {
    "buildTarget": "",
    "buildProfileId": "",
    "enabled": true,
    "maxDeltaVariantsEnabled": true,
    "maxDeltaVariants": 500,
    "warningDeltaVariantsEnabled": true,
    "warningDeltaVariants": 250,
    "perShaderCaps": [
      {
        "shaderName": "Shader Graphs/MyHeavyShader",
        "enabled": true,
        "maxVariants": 1200
      }
    ],
    "ignoreShaderRules": [
      {
        "enabled": true,
        "matchMode": "contains",
        "value": "Hidden/Internal"
      }
    ],
    "allowShaderRules": [
      {
        "enabled": true,
        "matchMode": "exact",
        "value": "Shader Graphs/MyHeavyShader"
      }
    ]
  },
  "targetPolicies": [
    {
      "buildTarget": "StandaloneWindows64",
      "buildProfileId": "",
      "enabled": true,
      "maxDeltaVariantsEnabled": true,
      "maxDeltaVariants": 700
    }
  ]
}
```

The repository sample lives at `docs/samples/sample_budget_policy.json`.

## Batchmode and CI reference

### CLI arguments

| Argument | Default | Meaning |
| --- | --- | --- |
| `-shaderVariantGuard.baseline <path|latest|latestPassing>` | `latest` | Baseline snapshot source. |
| `-shaderVariantGuard.current <path|latest>` | `latest` | Current snapshot source. |
| `-shaderVariantGuard.baselineMatch <targetAndProfile|targetOnly|any>` | `targetAndProfile` | Baseline resolution mode. |
| `-shaderVariantGuard.budgets <path>` | empty | External budget JSON file. |
| `-shaderVariantGuard.latestPassingIndex <path>` | empty | Override path for latest-passing index storage. |
| `-shaderVariantGuard.reportJson <path>` | empty | Write JSON report to this path. |
| `-shaderVariantGuard.reportMarkdown <path>` | empty | Write Markdown report to this path. |
| `-shaderVariantGuard.exportPrefix <path-prefix>` | empty | If `reportJson` or `reportMarkdown` are not set, writes `<prefix>.json` and `<prefix>.md`. |
| `-shaderVariantGuard.failOnViolation <true|false>` | Project setting | Overrides batch fail-on-violation behavior. |
| `-shaderVariantGuard.failOnIncompleteSnapshot <true|false>` | `true` | Fails if baseline or current is incomplete. |
| `-shaderVariantGuard.updateLatestPassing <true|false>` | `true` | Controls whether passing runs promote current to latest-passing. |
| `-shaderVariantGuard.bootstrapLatestPassing <true|false>` | `false` | Seeds `latestPassing` from current if no latest-passing baseline exists. |

Path resolution rule:

- relative CLI paths are resolved against the Unity project root, not the current working directory

### `latestPassing` behavior

`latestPassing` uses the latest-passing index file.

Important rules:

- `targetAndProfile` requires an exact target + build profile match
- `targetOnly` allows target-only fallback
- `any` matters most when resolving `latest` against raw snapshot history; for `latestPassing`, lookup is still target-based and behaves like a target-level fallback
- `bootstrapLatestPassing true` seeds a missing latest-passing baseline from the current snapshot
- promotion only happens when the evaluation has no blocking violations and, if `Treat Warnings As Violations` is enabled, no warnings
- incomplete current snapshots are never promoted

### Exit codes

| Exit code | Meaning |
| --- | --- |
| `0` | Success |
| `2` | Blocking violation |
| `3` | Invalid arguments |
| `4` | Baseline resolution error |
| `5` | Snapshot load error |
| `6` | Report write error |
| `7` | Runtime error |
| `8` | Budget policy load or parse error |
| `9` | Incomplete snapshot gating error |

### Report outputs

Batchmode always writes a console summary to the Unity log.

Optional report writers:

- JSON report: raw serialized evaluation result with `diff`, `violations`, `diagnostics`, `baselineSource`, `policySource`, and `latestPassingIndexPath`
- Markdown report: summary, execution context, diagnostics, blocking violations, warnings, and top increases

Report writer notes:

- Markdown `Budget status` is based on blocking violations in the evaluation result
- warning-promotion affects batch exit codes, but warnings remain warnings in the evaluation data

## Verified command examples

### Example 1: local editor workflow

1. Open `Project/Shader Variant Guard`.
2. Set `Data Root Path` and budgets if needed.
3. Open `Tools/Shader Variant Guard/Open Window`.
4. Build once for your target.
5. Click `Capture Snapshot`.
6. Build again.
7. Click `Capture Snapshot` again.
8. Click `Latest vs Previous`, or select a row and use `Compare Selection`.

### Example 2: compare two explicit snapshot files in the window

Use `Advanced: Compare by Paths` and paste two snapshot JSON paths such as:

```text
ShaderVariantGuardData/snapshots/20260307T130000000Z_StandaloneWindows64_manual_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.json
ShaderVariantGuardData/snapshots/20260307T131500000Z_StandaloneWindows64_manual_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.json
```

Then click `Compare Paths`.

This is useful when:

- the snapshots are not adjacent in history
- `Latest vs Previous` would compare the wrong target
- you want to compare files copied in from another machine or branch

### Example 3: direct Windows batchmode invocation

```powershell
& "C:\Program Files\Unity\Hub\Editor\6000.3.7f1\Editor\Unity.exe" `
  -batchmode -nographics `
  -projectPath "C:\Users\kevin\Documents\Shader Variant Budget & CI Guard" `
  -executeMethod ShaderVariantGuard.Editor.Cli.ShaderVariantGuardBatchRunner.Run `
  -shaderVariantGuard.baseline latestPassing `
  -shaderVariantGuard.current latest `
  -shaderVariantGuard.baselineMatch targetAndProfile `
  -shaderVariantGuard.budgets docs/samples/sample_budget_policy.json `
  -shaderVariantGuard.latestPassingIndex ShaderVariantGuardData/latest_passing_snapshots.json `
  -shaderVariantGuard.failOnViolation true `
  -shaderVariantGuard.failOnIncompleteSnapshot true `
  -shaderVariantGuard.updateLatestPassing true `
  -shaderVariantGuard.bootstrapLatestPassing false `
  -shaderVariantGuard.exportPrefix ShaderVariantGuardData/reports/ci_guard `
  -logFile Temp/ShaderVariantGuard.Batch.log `
  -quit
```

### Example 4: helper script invocation in Bash

```bash
UNITY_PATH="/Applications/Unity/Hub/Editor/6000.3.7f1/Unity.app/Contents/MacOS/Unity" \
SHADER_VARIANT_GUARD_BOOTSTRAP_LATEST_PASSING=true \
SHADER_VARIANT_GUARD_FAIL_ON_INCOMPLETE_SNAPSHOT=true \
./scripts/run_shader_variant_guard_batch.sh \
  "$(pwd)" \
  /tmp/shadervariantguard-batch.log \
  docs/samples/sample_budget_policy.json
```

Verified behavior of this helper:

- runs the batch runner execute method
- uses `baseline latestPassing`
- uses `current latest`
- uses `baselineMatch targetAndProfile`
- writes report files under `ShaderVariantGuardData/reports/ci_guard`
- passes through extra CLI args after the optional budgets path

## Troubleshooting

### No snapshots appear in the browser

Check these first:

- you have actually captured at least one snapshot
- `Search` or `Target` is not filtering everything out
- `Show Incomplete` is enabled if the capture was marked incomplete

### `Compare Selection` is disabled

That button needs:

- a selected snapshot that is currently visible in the compare set
- at least one other snapshot available for auto-baseline selection

### Capture succeeds but the snapshot is incomplete

Inspect the diagnostics panel. Common causes are:

- the parser did not match any recognized log lines
- the wrong `Editor.log` was read
- the log tail window was too small
- contributor totals did not add up to the reported total

Useful settings to inspect:

- `Editor.log Path Override`
- `Parser Tail Line Count (0 = full file)`

### `latestPassing` cannot be resolved in CI

This usually means one of these:

- the latest-passing index file does not exist yet
- the index exists but does not contain a matching target/profile
- the stored index entry points to a snapshot file that no longer exists

Fixes:

- seed intentionally with `-shaderVariantGuard.bootstrapLatestPassing true`
- use `-shaderVariantGuard.latestPassingIndex <path>` to isolate state per branch or job
- use `targetOnly` only if exact profile matching is too strict for your workflow

### Warnings are visible but CI still exits successfully

That is expected unless both of these are true:

- `Treat Warnings As Violations` is enabled in Project Settings
- effective fail-on-violation behavior is enabled

### `Reveal Exported File` is disabled

That button only enables after:

- a diagnostics export succeeds, and
- the exported file still exists at the remembered path

## Related files

- `Assets/Shader Variant Budget & CI Guard/Documentation/QuickStart.md`
- `Assets/Shader Variant Budget & CI Guard/Documentation/README.md`
- `docs/ARCHITECTURE.md`
- `docs/CI.md`
- `docs/samples/sample_budget_policy.json`
- `docs/samples/baseline_workflow.md`
