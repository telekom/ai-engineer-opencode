#!/usr/bin/env node

/**
 * AIE Postinstall script for @telekom/opencode-ai package
 * This script finds the correct platform-specific binary from @telekom scoped packages
 */

import fs from "fs"
import path from "path"
import os from "os"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// AIE package scope (published under @telekom on GitHub Packages)
const PACKAGE_SCOPE = "@telekom"

function detectPlatformAndArch() {
  // Map platform names
  let platform
  switch (os.platform()) {
    case "darwin":
      platform = "darwin"
      break
    case "linux":
      platform = "linux"
      break
    case "win32":
      platform = "windows"
      break
    default:
      platform = os.platform()
      break
  }

  // Map architecture names
  let arch
  switch (os.arch()) {
    case "x64":
      arch = "x64"
      break
    case "arm64":
      arch = "arm64"
      break
    case "arm":
      arch = "arm"
      break
    default:
      arch = os.arch()
      break
  }

  return { platform, arch }
}

function findBinary() {
  const { platform, arch } = detectPlatformAndArch()
  
  // Try different package variants in order of preference
  const variants = [
    `${PACKAGE_SCOPE}/opencode-${platform}-${arch}`,
    `${PACKAGE_SCOPE}/opencode-${platform}-${arch}-baseline`,
  ]
  
  // For Linux, also try musl variants
  if (platform === "linux") {
    variants.push(
      `${PACKAGE_SCOPE}/opencode-${platform}-${arch}-musl`,
      `${PACKAGE_SCOPE}/opencode-${platform}-${arch}-baseline-musl`
    )
  }

  // The platform package ships the binary as "opencode" (mac/linux) or "opencode.exe" (windows).
  const sourceName = platform === "windows" ? "opencode.exe" : "opencode"
  // The wrapper's "bin" field points at ./bin/opencode.exe on every platform, so the
  // symlink target is always "opencode.exe" (a filename, not a Windows-only marker).
  const targetName = "opencode.exe"

  for (const packageName of variants) {
    const packageDir = path.join(__dirname, "node_modules", packageName)
    const packageJsonPath = path.join(packageDir, "package.json")
    const binaryPath = path.join(packageDir, "bin", sourceName)

    if (!fs.existsSync(packageJsonPath)) continue
    if (!fs.existsSync(binaryPath)) continue

    console.log(`Found binary in package: ${packageName}`)
    return { binaryPath, targetName }
  }

  throw new Error(`Could not find any suitable binary package for ${platform}-${arch}. Tried: ${variants.join(", ")}`)
}

function prepareBinDirectory(targetName) {
  const binDir = path.join(__dirname, "bin")
  const targetPath = path.join(binDir, targetName)

  // Ensure bin directory exists
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true })
  }

  // Remove existing binary/symlink if it exists
  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath)
  }

  return { binDir, targetPath }
}

function symlinkBinary(sourcePath, targetName) {
  const { targetPath } = prepareBinDirectory(targetName)

  fs.symlinkSync(sourcePath, targetPath)
  console.log(`opencode binary symlinked: ${targetPath} -> ${sourcePath}`)

  // Verify the file exists after operation
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Failed to symlink binary to ${targetPath}`)
  }
}

async function main() {
  try {
    const { binaryPath, targetName } = findBinary()
    symlinkBinary(binaryPath, targetName)
    console.log("✅ opencode installed successfully!")
  } catch (error) {
    console.error(`Failed to setup opencode binary: ${error.message}`)
    // Don't fail the install - user might want to set up manually
    process.exit(0)
  }
}

main()
