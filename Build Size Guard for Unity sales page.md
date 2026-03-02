# Build Size Guard for Unity  
## Stop Build Size Regressions Before They Ship

![Build Size Guard Cover](Build size guard cover image)

Build Size Guard is a Unity Editor tool that snapshots every build, compares it to a baseline, enforces size budgets, and fails CI when regressions exceed limits.

No more guessing why your build suddenly grew.  
No more shipping size explosions to production.

---

## 🚀 Buy Now

- **Unity Asset Store:** {{UNITY_ASSET_STORE_URL}}
- **Buy on itch.io:** {{ITCH_IO_PRODUCT_URL}}
- **Documentation:** /docs/build-size-guard
- **Full License:** /license
- **Support:** /support

---

## 🛒 itch.io Purchase Embed

<!-- Paste full-width itch.io embed here -->

---

## The Problem

Build size growth is silent.

A texture gets imported incorrectly.  
A mesh doubles in size.  
Addressables shift.  
A dependency changes compression.

And suddenly your APK jumps +40MB.

You only notice when:
- CI times spike
- Store upload fails
- Players complain
- Patch size balloons

Build Size Guard makes build size measurable, enforceable, and automated.

---

## 📊 See Exactly What Changed

![See Exactly What Changed](See exactly what changed)

Compare:
- Total size delta
- % increase
- Top contributors
- Category-level increases
- Newly added / removed content

You don’t get noise.  
You get ranked signal.

---

## 🔒 Enforce Budgets & Regression Rules

![Set Budgets and Regression Rules](Set budgets and regression rules)

Define hard limits:
- Total build size
- Artifact size on disk
- % growth limit
- Absolute delta cap
- Per-category budgets (Textures, Audio, Meshes, Shaders, Code)

If limits are exceeded:
- CI fails
- Exit codes are deterministic
- Reports are exported automatically

---

## ⚙ CI / Batchmode Ready

![CLI and Batch Mode](CLI and batch mode for CI pipelines + documentation image)

Run in batchmode:
- Deterministic output
- JSON export
- Markdown export
- Automated baseline comparison

Treat build size like a real metric.

---

## 📦 Snapshots & Comparisons

![Build Automatically Create Snapshots](Build automatically create snapshots)

Every build can:
- Create a snapshot
- Compare to latest passing baseline
- Store history
- Track regression trends

---

## Who This Is For

- Unity teams shipping to mobile
- Devs using CI/CD
- Studios tired of size surprises
- Projects using Addressables
- Anyone shipping patches

---

## Who This Is NOT For

- Devs who don’t track builds
- Projects that don’t care about size
- Runtime optimization tools (Editor-only)

---

## Frequently Asked Questions

### Does this modify my build?
No. It only reads BuildReport data and file sizes.

### Does it ship in the final build?
No. Editor-only.

### Does it support CI?
Yes. Batchmode runner with stable exit codes.

### Can I export reports?
Yes. JSON and Markdown supported.

---

## Final Call To Action

Stop shipping regressions.

- Unity Asset Store: {{UNITY_ASSET_STORE_URL}}
- itch.io: {{ITCH_IO_PRODUCT_URL}}
- Documentation: /docs/build-size-guard
- License: /license
- Support: /support