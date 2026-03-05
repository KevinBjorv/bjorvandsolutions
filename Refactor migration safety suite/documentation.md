# Refactor Migration Safety Suite — Full Documentation

## Scope
This document is the definitive usage reference for the Unity package implemented in this repository. It covers editor UI controls, data formats, batch/CI usage, operational constraints, and all outputs.

## Access Paths
- Unity menu: `Tools/Refactor Migration Safety Suite/Open Window` opens the RMSS window.
- Unity menu: `Tools/Refactor Migration Safety Suite/Open Project Settings` opens Project Settings at `Project/Refactor Migration Safety Suite`.
- Batch entrypoint method:
  - `RefactorMigrationSafetySuite.Batch.RMSSBatchEntryPoint.Run`
  - Use with `-executeMethod` in Unity batchmode.

## UI Window: RMSS
- Window title: `RMSS`
- Minimum size: `760 x 420`
- Tab order: `Audit`, `Coverage Scan`, `Reserialize`, `Cleanup`, `Settings`
- Tab switcher: Toolbar across top.

## Audit Tab (Manual mappings, risk checks, diff import)

### Controls (buttons and inputs)
- `Git Diff Import` section
  - Diff text area
  - `Diff File` text field
  - `Browse Diff File` opens file panel
  - `Preview Diff Import` runs parser on provided diff text or file
  - `Append Candidates` appends new, non-duplicate candidate mappings from last preview
  - `Replace Manual Mappings` replaces current mappings with preview candidates
  - Preview summary block displays:
    - Candidate mappings count
    - Parsed files count
    - Ignored hunks count
    - Warning list
- `Manual Rename Mappings`
  - `Add Mapping` adds a blank row
  - `Clear All` clears all rows
  - `Import JSON` imports mappings from file
  - `Export JSON` exports current valid mappings
  - Per-row fields:
    - `Type Name`
    - `Old Name`
    - `New Name`
  - `Remove Row` for row-level delete
- `Run Audit` executes audit pass

### Audit behavior
- Uses script index from `MonoScript` assets under `Assets` to validate mappings against project code.
- Excludes package tooling scripts and internal test/sample sources according to indexing rules.
- Mapping normalization trims whitespace and drops invalid/duplicate entries.
- Checks performed:
  - Type resolution by `Type Name` (exact and simple-name matching).
  - Reported risks:
    - High: missing type
    - High: ambiguous type name across scripts
    - High: new field missing on target type
    - High: target field exists but is not serializable under current rules
    - High: target missing `[FormerlySerializedAs("old")]`
    - Medium: same legacy field mapped for multiple different resolved types
    - Medium: same legacy token is still active serialized field on unresolved mapped type
    - Low: case-only rename (`oldName` -> `OldName`) warning only
- Remediation helper message is shown when missing `FormerlySerializedAs` is detected on any high-risk item.
- Audit results are cleared when mappings change, preventing stale reports.

### Diff import behavior
- Diff input supports pasted unified diff text or file path input.
- Parsing is conservative:
  - Only same-file field rename hunks are considered.
  - Candidates require one removed and one added field declaration with same field type.
  - Field declarations are simplified parse of C# serializable-member-like lines.
  - Unsupported or ambiguous hunks are skipped and reported.

## Coverage Tab

### Controls
- `Run Coverage Scan`
- `Export Coverage JSON`
- `Export Coverage CSV`

### Coverage behavior
- Requires manual mappings with all rows valid (`Type`, `Old`, `New` non-empty).
- Requires Unity `Project Settings -> Editor -> Asset Serialization Mode = Force Text`.
- Scans supported assets using token matching of legacy field names in YAML keys.
- Supported scope:
  - Scene assets (`.unity`)  
  - Prefab assets (`.prefab`)  
  - Standalone `ScriptableObject` assets (`.asset` with exactly one SO object)
  - Embedded ScriptableObject parent assets (`.asset` with multiple SO objects)
- Tracks and reports unreadable assets.
- Output report fields shown:
  - Candidate assets
  - Scanned assets
  - Unreadable assets
  - Supported scope complete flag
  - Affected assets
  - Legacy token occurrence count
- Per-field summary ordered by:
  1) highest total occurrences, 2) highest affected asset count, 3) type name, 4) legacy field.
- Per-hit list includes asset path, occurrence count, asset kind, and type.

## Reserialize Tab (Guided, previewed reserialize)

### Controls
- `Scope` dropdown (`Coverage Results`, `Folder`, `Selection`)
- `Folder` object field (only when `Folder` scope selected)
- `Create Backup` toggle
- `Build Preview`
- `Run Reserialize`

### Scope behavior
- Coverage Results:
  - Seeds from current coverage report hits.
  - Requires a coverage report to be present.
- Folder:
  - Recursively enumerates supported assets below selected folder.
- Selection:
  - Seeds from Project-window selection only.
  - Folder selections are expanded into child assets; unsupported items become skipped.

### Preview and run behavior
- Preview always shown after build, including:
  - Source label
  - Asset count
  - Skipped inputs
  - Warnings
- `Run Reserialize` is disabled until preview has at least one asset.
- Re-serialize per-asset by type:
  - Scenes: open/save via scene API
  - Prefabs: load and save prefab contents
  - ScriptableObjects/others: `AssetDatabase.ForceReserializeAssets`
- Progress updates expose:
  - Current stage
  - Current asset path
  - Completed/total step progress
- Cancellation is supported through Unity progress bar while backing up and while processing.

### Backup behavior
- Backup folder:
  - Base path from settings (`backupDirectory`) with defaults and path validation.
  - Invalid configured path is rejected if under `Assets` or `Packages`.
  - When invalid, runtime falls back to `<project>/Logs/rmss-backups/<timestamp>` with warning output.
- Backed up content:
  - Each target asset and its `.meta`.
  - Directory structure is mirrored relative to project root.
  - Writes `restore-instructions.txt` with safe restore procedure.

## Cleanup Tab

### Controls
- `Evaluate Cleanup Proof`
- `Export Cleanup JSON`
- `Export Cleanup CSV`

### Cleanup behavior
- Evaluates whether mappings are safe to remove from legacy attribute path.
- Depends on coverage report and valid mappings.
- Returns:
  - `IsSafeToRemoveLegacyMappings` boolean
  - `IsSupportedScopeComplete`
  - `RemainingLegacyTokenOccurrences`
  - Human-readable `ScopeSummary`
  - `Notes[]`
- Unsafe states:
  - No coverage report
  - Remaining legacy tokens
  - Incomplete scope (unreadable supported assets)
- Safe only if coverage is clean and complete.

## Settings Tab

### Controls
- `Enable Verbose Logging` toggle
- `Create Backups By Default` toggle
- `Default Export Directory` text field
- `Backup Directory` text field
- `Save Project Settings`
- `Open Project Settings Page`

### Settings storage and rules
- Stored in `ProjectSettings/RefactorMigrationSafetySuiteSettings.asset` via `ScriptableSingleton`.
- `Default Export Directory` and `Backup Directory` resolve:
  - Relative paths are relative to project root.
  - Backup path cannot be inside `Assets/` or `Packages/`.
- Defaults:
  - `defaultExportDirectory = Logs`
  - `backupDirectory = Logs`
  - `enableVerboseLogging = true`
  - `createBackupsByDefault = true`

## Settings Page (Project Settings provider)
- Path: `Project/Refactor Migration Safety Suite`
- Same toggles as window settings tab:
  - `Enable Verbose Logging`
  - `Create Backups By Default`
  - `Default Export Directory`
  - `Backup Directory`
- `Save Settings` button persists settings.

## Data formats

### Rename mapping JSON schema
- Shared by Audit tab import/export and batch mode.
- Current schema version: `1`
- Structure (Unity serialized field names):
  - `schemaVersion`
  - `mappings` (array of mapping objects)
- Mapping entry fields:
  - `typeName`
  - `oldName`
  - `newName`

Example:
```json
{
  "schemaVersion": 1,
  "mappings": [
    {
      "typeName": "MyCompany.CharacterState",
      "oldName": "oldHealth",
      "newName": "currentHealth"
    }
  ]
}
```

### Export reports
- Audit export
  - JSON: full `AuditReport` model (generated date, input mappings, risks, risk counts).
  - CSV: `TypeName,FieldName,Severity,Message`
- Coverage export
  - JSON: full `CoverageReport` model.
  - CSV sections:
    - Metric lines (`CandidateAssetCount`, `ScannedAssetCount`, unreadable count, `AffectedAssetCount`, `TotalLegacyTokenOccurrences`, `IsSupportedScopeComplete`)
    - Warnings
    - Unreadable asset paths
    - Per-field summary rows
    - Per-asset hit rows
- Cleanup export
  - JSON: full `CleanupReport` model.
  - CSV: single-row summary plus notes.

## Batch mode

### Command entry
- `Unity -batchmode ... -executeMethod RefactorMigrationSafetySuite.Batch.RMSSBatchEntryPoint.Run`
- Supported commands:
  - `audit`
  - `coverage`
  - `cleanup`
- Command can be positional (`coverage`) or `--command cleanup`.

### Options
- `--mappingsJson <path>`
  - Required for `coverage` and `cleanup`.
  - Optional for `audit`.
- `--jsonOut <path>`
  - Optional; writes report to given path.
- `--failOnRisk <true|false>`
  - Only affects `audit`.
  - Non-zero exit if high risk found and true.
- `--failOnCoverage <true|false>`
  - For `coverage`: fail if legacy tokens remain.
  - For `cleanup`: fail if cleanup proof is not safe.

### Exit codes
- `0` success
- `1` parse/input/setup error (including mapping load errors and exceptions)
- `2` audit high-risk failure when `--failOnRisk true`
- `3` coverage/cleanup failure when coverage failure condition is enabled

### Batch examples
- Audit:
  - `-executeMethod RefactorMigrationSafetySuite.Batch.RMSSBatchEntryPoint.Run audit --mappingsJson <path> --jsonOut <path> --failOnRisk true`
- Coverage:
  - `... coverage --mappingsJson <path> --jsonOut <path> --failOnCoverage true`
- Cleanup:
  - `... cleanup --mappingsJson <path> --jsonOut <path> --failOnCoverage true`

## Validation gates and scripts
- `scripts/run-batch-audit.sh`
- `scripts/run-batch-coverage.sh`
- `scripts/run-batch-cleanup.sh`
- `scripts/run-window-smoke-headful.sh`
- All scripts invoke the same batch entrypoint and write logs to `Logs/`.
- Unity batch mode and non-graphics flags used in CI style scripts.

## Practical workflow (recommended order)
1. Build or import mappings (manual rows or git diff import).
2. `Export JSON` mappings for reuse and CI traceability.
3. Run `Run Audit`; resolve high/medium risks before changing scope.
4. Ensure Force Text serialization if required.
5. Run `Run Coverage Scan`.
6. If scope includes `.asset` ScriptableObjects, confirm `Embedded ScriptableObject (Parent Asset)` coverage lines and warnings.
7. Optionally enable backup and build a `Reserialize` preview.
8. Run `Run Reserialize`.
9. Run `Evaluate Cleanup Proof` and review notes.
10. Run `Cleanup` exports for compliance reporting before removing legacy fields/attributes.

## Known hard constraints
- Coverage and cleanup depend on `Force Text`.
- Audit excludes non-UnityEngine.Object scripts and internal RMSS/test tooling content by index policy.
- Coverage scan is token-based and can flag ambiguous collisions at the same field token level.
- `Reserialize` handles only supported asset types in scope; unsupported items are skipped and shown as skipped inputs.
- Project-window selection scope ignores non-asset selections.
