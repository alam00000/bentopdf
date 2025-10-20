#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

function getCurrentVersion() {
  return packageJson.version;
}

function updateVersion(type) {
  const currentVersion = getCurrentVersion();
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  let newVersion;
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }
  
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  return newVersion;
}

function createGitTag(version) {
  const tagName = `v${version}`;
  
  try {
    // Check if tag already exists
    execSync(`git rev-parse "v${version}" >/dev/null 2>&1`, { stdio: 'ignore' });
    console.log(`✅ Tag v${version} already exists`);
    return tagName;
  } catch {
    // Tag doesn't exist, create it
    execSync(`git tag -a "v${version}" -m "Release v${version}"`, { stdio: 'inherit' });
    console.log(`✅ Created tag v${version}`);
    return tagName;
  }
}

function main() {
  const type = process.argv[2] || 'patch';
  
  if (!['major', 'minor', 'patch'].includes(type)) {
    console.error('❌ Invalid version type. Use: major, minor, or patch');
    process.exit(1);
  }
  
  console.log(`🚀 Releasing ${type} version...`);
  
  // 1. Update version in package.json
  const newVersion = updateVersion(type);
  console.log(`📦 Updated version to ${newVersion}`);
  
  // 2. Add and commit changes
  execSync('git add package.json', { stdio: 'inherit' });
  execSync(`git commit -m "Release v${newVersion}"`, { stdio: 'inherit' });
  console.log(`💾 Committed version change`);
  
  // 3. Create git tag
  const tagName = createGitTag(newVersion);
  
  // 4. Push everything to main
  console.log(`📤 Pushing to main...`);
  execSync('git push origin main', { stdio: 'inherit' });
  execSync(`git push origin ${tagName}`, { stdio: 'inherit' });
  
  console.log(`🎉 Release v${newVersion} complete!`);
  console.log(`📦 Docker image: bentopdf/bentopdf:${newVersion}`);
  console.log(`🏷️  GitHub release: https://github.com/AltuisticIsopod/bentopdf/releases/tag/${tagName}`);
}

main();


