<!--
SPDX-FileCopyrightText: 2026 Deutsche Telekom AG

SPDX-License-Identifier: CC0-1.0
-->

# opencode – T-Systems AI Engineer fork

> **Official documentation:** the original opencode README with all product documentation, installation and usage instructions is maintained upstream at
> **[https://github.com/anomalyco/opencode/blob/dev/README.md](https://github.com/anomalyco/opencode/blob/dev/README.md)**.
> An unchanged copy is kept on the [`dev`](../../tree/dev) branch of this fork.

[![REUSE Compliance Check](../../actions/workflows/reuse-compliance.yml/badge.svg)](../../actions/workflows/reuse-compliance.yml)

## About

opencode is an open source AI coding agent for the terminal, desktop and IDE.

This repository is the T-Systems **AI Engineer (AIE)** fork of [opencode](https://github.com/anomalyco/opencode). The upstream code is kept untouched on the `dev` branch; all AIE changes live on the `aie` branch (the default branch of this repository) and are documented below.

## Changes to the official Repository

All changes to the upstream project made in this fork are listed here. Please add a row for every change you make on the `aie` branch.

| Date | Change | Where | Reason |
|---|---|---|---|
| 2026-09-21 | REUSE compliance setup from [telekom/reuse-template](https://github.com/telekom/reuse-template): `REUSE.toml`, license texts in `LICENSES/`, REUSE Compliance Check workflow, SPDX header in `.gitignore` | `REUSE.toml`, `LICENSES/`, `.github/workflows/reuse-compliance.yml`, `.gitignore` | Deutsche Telekom OSPO open source publishing requirements |
| 2026-09-21 | Replaced the upstream README with this fork README (link to the official README, change log, Code of Conduct and Licensing sections) | `README.md` | Document fork changes and licensing |
| 2026-09-21 | Added OSS Review Toolkit repository configuration excluding the Remotion marketing videos under `artifacts/` and the GitHub Action source under `github/` from the analysis | `.ort.yml` | Neither is part of the shipped software; needed for the OSPO SBOM |
| 2026-09-21 | Added Contributor Covenant Code of Conduct from the reuse-template | `CODE_OF_CONDUCT.md` | Upstream has no code of conduct file |
| 2026-09-21 | Removed the upstream `CONTRIBUTING.md` and `SECURITY.md`; they describe the upstream project's processes and do not apply to this fork | `CONTRIBUTING.md`, `SECURITY.md` | Avoid misleading contributors; T-Systems processes apply |
| 2026-09-24 | In `findBinary()`, added a `@telekom` scoped candidate lookup at `node_modules/@telekom/<name>/bin/<binary>` so the wrapper resolves binaries installed under the AIE scope | `packages/opencode/bin/opencode` | Resolve AIE-scoped binaries installed under `@telekom` |
| 2026-09-24 | Added AIE postinstall script that detects platform/arch, locates the platform-specific binary from `@telekom/opencode-<platform>-<arch>[...]` packages (incl. linux musl/baseline variants), symlinks it into `bin/opencode.exe`, and emits a clear error stub if postinstall is skipped | `packages/opencode/script/postinstall-aie.mjs` | Wire the `@telekom/opencode-ai` wrapper to the correct platform binary on install |
| 2026-09-24 | Made the installation module AIE-aware: added `isAieScope()` to detect `@telekom/opencode-ai` global installs via npm/bun/pnpm, added `NpmRegistryResponse` schema with `dist-tags`, in `method()` check for the AIE-scoped package before the upstream name, in `latest()` read `@telekom:registry` from npm config and resolve the version from `dist-tags`, in `upgrade()` install `${pkgName}@${target}` (AIE-scoped or upstream) for npm/pnpm/bun | `packages/opencode/src/installation/index.ts` | Detect and upgrade AIE-scoped installs; read from the GitHub Packages registry |
| 2026-09-24 | Added the `aie` branch to the `push` trigger so the test suite runs on the AIE branch | `.github/workflows/test.yml` | Keep CI running on the AIE branch |
| 2026-09-24 | Added the `aie` branch to the `push` and `pull_request` triggers | `.github/workflows/typecheck.yml` | Keep typecheck running on the AIE branch |
| 2026-09-24 | Added AIE publish script that re-scopes every generated platform package in `dist/*` to `@telekom/<name>`, assembles the `@telekom/opencode-ai` wrapper (using `postinstall-aie.mjs` and `optionalDependencies`), and publishes all tarballs to GitHub Packages with the active dist-tag | `packages/opencode/script/publish-github-aie.ts` | Publish `@telekom`-scoped packages to GitHub Packages |
| 2026-09-28 | Split npm publishing into a new `aie-package` workflow: resolves the AIE version (prerelease auto-increment on the merge request to `aie` branch / stable on `v*-aie` tags), builds all platform binaries, configures npm for GitHub Packages, runs `publish-github-aie.ts`, and pushes the prerelease tag | `.github/workflows/aie-package.yml` | Separate the npm-publish surface from the GitHub Release UI surface |
| 2026-09-28 | Added `aie-publish` GitHub workflow: this own only the GitHub Release UI (release notes + downloadable binary archives); Simplified version resolution to read the tag, and added a draft-release creation step plus a final un-draft step using `softprops/action-gh-release@v2` that attaches `dist/*.zip` and `dist/*.tar.gz` | `.github/workflows/aie-publish.yml` | Clarify ownership: the Release UI is separate from npm publish, publish the AIE distribution to GitHub Packages under the `@telekom` scope |
| 2026-09-30 | Remove `notify-discord` GitHub workflow: Removed this file | `.github/workflows/notify-discord.yml` | Sends the release information to discord upstream |

## Code of Conduct

This project has adopted the [Contributor Covenant](https://www.contributor-covenant.org/) in version 2.1 as our code of conduct, using the file from [telekom/reuse-template](https://github.com/telekom/reuse-template). Please see the details in our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). All contributors must abide by the code of conduct.

By participating in this project, you agree to abide by its [Code of Conduct](./CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright (c) 2026 Deutsche Telekom AG

This repository is a fork of [https://github.com/anomalyco/opencode](https://github.com/anomalyco/opencode). The original work is Copyright (c) 2025 opencode / 2026 Anomaly Innovations Inc. and licensed under the [MIT](./LICENSE) license. Changes made by Deutsche Telekom AG are documented in the section above and are licensed under the same license.

All content in this repository is licensed under at least one of the licenses found in [./LICENSES](./LICENSES); you may not use this file, or any other file in this repository, except in compliance with the Licenses.
You may obtain a copy of the Licenses by reviewing the files found in the [./LICENSES](./LICENSES) folder.

Unless required by applicable law or agreed to in writing, software distributed under the Licenses is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See in the [./LICENSES](./LICENSES) folder for the specific language governing permissions and limitations under the Licenses.

This project follows the [REUSE standard for software licensing](https://reuse.software/).
Each file contains copyright and license information, and license texts can be found in the [./LICENSES](./LICENSES) folder. For more information visit https://reuse.software/.
You can find a guide for developers at https://telekom.github.io/reuse-template/.