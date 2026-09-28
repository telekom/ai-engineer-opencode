#!/usr/bin/env bun

/**
 * AIE publish script for GitHub Packages (https://npm.pkg.github.com).
 *
 * Mirrors packages/opencode/script/publish.ts but:
 *   - re-scopes every generated platform package to @telekom/<name> (GitHub
 *     Packages requires the scope to match the repo owner)
 *   - assembles the @telekom/opencode-ai wrapper that uses postinstall-aie.mjs
 *   - publishes to GitHub Packages instead of npmjs.org
 *   - skips Docker / AUR / Homebrew (those are upstream-only)
 *
 * This script only handles the npm-publish surface. The GitHub Release UI
 * (release notes + downloadable binary archives) is owned separately by
 * .github/workflows/aie-publish.yml, which runs side-by-side on `v*-aie` tag
 * pushes. Do not add release-asset uploads here.
 *
 * Required env:
 *   OPENCODE_VERSION  full version (e.g. 1.18.31-a.1 or 1.18.31-aie)
 *   OPENCODE_CHANNEL  npm dist-tag (e.g. "aie" for prereleases, "latest" for stable)
 *
 * Auth is provided by the .npmrc that actions/setup-node writes when given
 * registry-url: https://npm.pkg.github.com and scope: "@telekom". The calling
 * workflow step must export NODE_AUTH_TOKEN (set to secrets.GITHUB_TOKEN).
 */

import { $ } from "bun"
import { fileURLToPath } from "url"
import pkg from "../package.json"

const dir = fileURLToPath(new URL("..", import.meta.url))
process.chdir(dir)

const SCOPE = "@telekom"
const CHANNEL = process.env.OPENCODE_CHANNEL
const VERSION = process.env.OPENCODE_VERSION

if (!CHANNEL || !VERSION) {
  console.error("OPENCODE_CHANNEL and OPENCODE_VERSION are required")
  process.exit(1)
}

async function published(name: string, version: string) {
  return (await $`npm view ${name}@${version} version`.nothrow()).exitCode === 0
}

async function publish(packageDir: string, name: string, version: string) {
  if (process.platform !== "win32") await $`chmod -R 755 .`.cwd(packageDir)
  if (await published(name, version)) {
    console.log(`already published ${name}@${version}`)
    return
  }
  await $`bun pm pack`.cwd(packageDir)
  await $`npm publish *.tgz --access public --tag ${CHANNEL}`.cwd(packageDir)
}

// Re-scope every generated platform package in dist/* to @telekom/<name>.
const binaries: Record<string, string> = {}
for (const filepath of new Bun.Glob("*/package.json").scanSync({ cwd: "./dist" })) {
  const sub = await Bun.file(`./dist/${filepath}`).json()
  const scopedName = `${SCOPE}/${sub.name}`
  await Bun.file(`./dist/${filepath}`).write(JSON.stringify({ ...sub, name: scopedName }, null, 2))
  binaries[scopedName] = sub.version
}
console.log("binaries", binaries)
const version = Object.values(binaries)[0]

// Assemble the @telekom/opencode-ai wrapper package.
const wrapperDir = `./dist/${pkg.name}`
await $`mkdir -p ${wrapperDir}/bin`
await $`cp ./script/postinstall-aie.mjs ${wrapperDir}/postinstall-aie.mjs`
await Bun.file(`${wrapperDir}/LICENSE`).write(await Bun.file("../../LICENSE").text())

// Stub that surfaces a clear error if the postinstall script was skipped
// (e.g. --ignore-scripts or pnpm). postinstall-aie.mjs overwrites this.
await Bun.file(`${wrapperDir}/bin/opencode.exe`).write(
  [
    `echo "Error: ${SCOPE}/opencode-ai's postinstall script was not run." >&2`,
    'echo "" >&2',
    'echo "This occurs when using --ignore-scripts during installation, or when using a" >&2',
    'echo "package manager like pnpm that does not run postinstall scripts by default." >&2',
    'echo "" >&2',
    'echo "To fix this, run the postinstall script manually:" >&2',
    `echo "  cd node_modules/${SCOPE}/opencode-ai && node postinstall-aie.mjs" >&2`,
    'echo "" >&2',
    `echo "Or reinstall ${SCOPE}/opencode-ai without the --ignore-scripts flag." >&2`,
    "exit 1",
    "",
  ].join("\n"),
)

await Bun.file(`${wrapperDir}/package.json`).write(
  JSON.stringify(
    {
      name: `${SCOPE}/${pkg.name}-ai`,
      bin: {
        opencode: "./bin/opencode.exe",
      },
      scripts: {
        postinstall: "node ./postinstall-aie.mjs",
      },
      version,
      license: pkg.license,
      os: ["darwin", "linux", "win32"],
      cpu: ["arm64", "x64"],
      optionalDependencies: binaries,
    },
    null,
    2,
  ),
)

// Publish platform packages, then the wrapper.
await Promise.all(
  Object.entries(binaries).map(async ([name]) => {
    // build.ts creates dist/<unscoped-name>/, so strip the scope for the dir.
    await publish(`./dist/${name.replace(`${SCOPE}/`, "")}`, name, binaries[name])
  }),
)
await publish(wrapperDir, `${SCOPE}/${pkg.name}-ai`, version)

console.log(`Published ${SCOPE}/opencode-ai@${version} to GitHub Packages (tag: ${CHANNEL})`)
