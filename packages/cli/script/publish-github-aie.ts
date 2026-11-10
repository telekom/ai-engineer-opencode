#!/usr/bin/env bun

/**
 * AIE publish script for the v2 CLI.
 *
 * packages/cli/script/build.ts builds the platform binaries into dist/opencode-cli-<target>/ and
 * packages/cli/script/pack.ts assembles the launcher and packs every package into dist/npm.
 * This script only publishes those tarballs: it validates the set, then runs `npm publish`
 * per tarball with the launcher last (global installs resolve optionalDependencies at
 * install time, so the platform packages must be visible first).
 *
 * The registry is whatever the .npmrc of the publishing step points at: GitHub Packages
 * (https://npm.pkg.github.com), npmjs.com, or a custom registry. The calling workflow step
 * writes the .npmrc (actions/setup-node with registry-url and scope: "@telekom") and exports
 * NODE_AUTH_TOKEN.
 *
 * Required env:
 *   OPENCODE_VERSION  full version (e.g. 2.2.5-aie or 2.2.5)
 *   OPENCODE_CHANNEL  npm dist-tag (e.g. "latest" for stable, "aie"/"test" for prereleases)
 *
 * The GitHub Release UI (release notes + downloadable binary archives) is owned separately
 * by .github/workflows/aie-publish.yml. Do not add release-asset uploads here.
 */

import { $ } from "bun"
import path from "node:path"

process.chdir(path.resolve(import.meta.dir, "../../.."))

const LAUNCHER = "@telekom/opencode-cli"
const CHANNEL = process.env.OPENCODE_CHANNEL
const VERSION = process.env.OPENCODE_VERSION

if (!CHANNEL || !VERSION) {
  console.error("OPENCODE_CHANNEL and OPENCODE_VERSION are required")
  process.exit(1)
}

type Manifest = {
  name: string
  version: string
  optionalDependencies?: Record<string, string>
}

const npmDir = "./dist/npm"
const files = [...new Bun.Glob("*.tgz").scanSync({ cwd: npmDir })]
if (files.length === 0) throw new Error(`No tarballs found in ${npmDir}. Run "bun run build" and "bun run pack" first.`)

const items = await Promise.all(
  files
    .sort()
    .map(async (file) => {
      const tarball = path.join(npmDir, file)
      const manifest = JSON.parse(await $`tar -xzOf ${tarball} package/package.json`.text()) as Manifest
      return { tarball, manifest }
    }),
)
console.log("tarballs", items.map((item) => `${item.manifest.name}@${item.manifest.version}`))

const versions = new Set(items.map((item) => item.manifest.version))
if (versions.size > 1) throw new Error(`Tarball versions do not match: ${[...versions].join(", ")}`)
const version = versions.values().next().value
if (version !== VERSION) throw new Error(`Tarballs have version ${version}, expected ${VERSION}`)

const launcher = items.find((item) => item.manifest.name === LAUNCHER)
if (!launcher) throw new Error(`${LAUNCHER} is missing from ${npmDir}`)
for (const item of items) {
  if (!item.manifest.name.startsWith("@telekom/")) throw new Error(`Unexpected package ${item.manifest.name} in ${item.tarball}`)
}

// The launcher resolves its platform packages through optionalDependencies, so the versions
// must describe exactly the published set.
const binaries = new Map(
  items
    .filter((item) => item.manifest.name !== LAUNCHER)
    .map((item) => [item.manifest.name, item.manifest.version]),
)
for (const [name, expected] of Object.entries(launcher.manifest.optionalDependencies ?? {})) {
  const actual = binaries.get(name)
  if (actual !== expected) throw new Error(`${LAUNCHER} expects ${name}@${expected}, got ${actual ?? "nothing"}`)
}
if (binaries.size !== Object.keys(launcher.manifest.optionalDependencies ?? {}).length)
  throw new Error(`${LAUNCHER} is missing optionalDependencies entries for ${binaries.size} published packages`)

async function published(name: string, version: string) {
  return (await $`npm view ${name}@${version} version`.nothrow()).exitCode === 0
}

async function publish(item: { tarball: string; manifest: { name: string; version: string } }) {
  if (await published(item.manifest.name, item.manifest.version)) {
    console.log(`already published ${item.manifest.name}@${item.manifest.version}`)
    return
  }
  await $`npm publish ${item.tarball} --access public --tag ${CHANNEL}`
  console.log(`published ${item.manifest.name}@${item.manifest.version}`)
}

await Promise.all(items.filter((item) => item.manifest.name !== LAUNCHER).map(publish))
await publish(launcher)

console.log(`Published ${LAUNCHER}@${version} (tag: ${CHANNEL})`)
