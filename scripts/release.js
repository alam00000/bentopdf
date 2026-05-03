#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const chartYamlPath = path.join(__dirname, '../chart/Chart.yaml');

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
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n'
  );
  return newVersion;
}

function updateHelmChart(newAppVersion) {
  const chartYaml = fs.readFileSync(chartYamlPath, 'utf8');

  const appVersionMatch = chartYaml.match(
    /^appVersion:\s*['"]?([^'"\n]+)['"]?/m
  );
  const chartVersionMatch = chartYaml.match(/^version:\s*([^\s\n]+)/m);
  if (!appVersionMatch || !chartVersionMatch) {
    throw new Error('Could not parse version fields in chart/Chart.yaml');
  }

  const [chartMajor, chartMinor, chartPatch] = chartVersionMatch[1]
    .split('.')
    .map(Number);
  const newChartVersion = `${chartMajor}.${chartMinor}.${chartPatch + 1}`;

  const updated = chartYaml
    .replace(/^version:\s*[^\s\n]+/m, `version: ${newChartVersion}`)
    .replace(
      /^appVersion:\s*['"]?[^'"\n]+['"]?/m,
      `appVersion: '${newAppVersion}'`
    );

  fs.writeFileSync(chartYamlPath, updated);
  return { chartVersion: newChartVersion, appVersion: newAppVersion };
}

function createGitTag(version) {
  const tagName = `v${version}`;

  try {
    // Check if tag already exists
    execSync(`git rev-parse "v${version}" >/dev/null 2>&1`, {
      stdio: 'ignore',
    });
    console.log(`✅ Tag v${version} already exists`);
    return tagName;
  } catch {
    // Tag doesn't exist, create it
    execSync(`git tag -a "v${version}" -m "Release v${version}"`, {
      stdio: 'inherit',
    });
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

  // 2. Bump Helm chart appVersion + chart version
  const chart = updateHelmChart(newVersion);
  console.log(
    `⚓ Updated chart version to ${chart.chartVersion}, appVersion to ${chart.appVersion}`
  );

  // 3. Add and commit changes
  execSync('git add package.json chart/Chart.yaml', {
    stdio: 'inherit',
  });
  execSync(`git commit -m "Release v${newVersion}"`, { stdio: 'inherit' });
  console.log(`💾 Committed version change`);

  // 3. Create git tag
  const tagName = createGitTag(newVersion);

  // 4. Build and package the distribution files
  console.log(`📦 Building and packaging distribution files...`);
  execSync('npm run package', { stdio: 'inherit' });
  console.log(`📦 Distribution files packaged successfully`);

  // 5. Push everything to main
  console.log(`📤 Pushing to main...`);
  execSync('git push origin main', { stdio: 'inherit' });
  execSync(`git push origin ${tagName}`, { stdio: 'inherit' });

  console.log(`🎉 Release v${newVersion} complete!`);
  console.log(`📦 Docker image: bentopdfteam/bentopdf:${newVersion}`);
  console.log(`📦 Distribution: dist-${newVersion}.zip`);
  console.log(`📦 Distribution (simple): dist-simple-${newVersion}.zip`);
  console.log(
    `🏷️  GitHub release: https://github.com/alam00000/bentopdf/releases/tag/${tagName}`
  );
}

main();
