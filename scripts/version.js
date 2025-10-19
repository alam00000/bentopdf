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

function updateVersion(newVersion) {
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`Updated version to ${newVersion}`);
}

function incrementVersion(type = 'patch') {
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
  
  updateVersion(newVersion);
  return newVersion;
}

function createGitTag(version) {
  const tagName = `v${version}`;
  try {
    execSync(`git tag -a ${tagName} -m "Release ${tagName}"`, { stdio: 'inherit' });
    console.log(`Created git tag: ${tagName}`);
    return tagName;
  } catch (error) {
    console.error(`Error creating git tag: ${error.message}`);
    return null;
  }
}

function buildDockerImage(version, push = false) {
  const imageName = 'bentopdf/bentopdf';
  const tags = [
    `${imageName}:${version}`,
    `${imageName}:v${version}`,
    `${imageName}:latest`
  ];
  
  console.log('Building Docker image...');
  
  // Build with all tags
  const tagArgs = tags.map(tag => `-t ${tag}`).join(' ');
  const buildCmd = `docker build --build-arg VERSION=${version} ${tagArgs} .`;
  
  try {
    execSync(buildCmd, { stdio: 'inherit' });
    console.log('Docker image built successfully');
    
    if (push) {
      console.log('Pushing Docker images...');
      tags.forEach(tag => {
        try {
          execSync(`docker push ${tag}`, { stdio: 'inherit' });
          console.log(`Pushed: ${tag}`);
        } catch (error) {
          console.error(`Error pushing ${tag}: ${error.message}`);
        }
      });
    }
    
    return tags;
  } catch (error) {
    console.error(`Error building Docker image: ${error.message}`);
    return null;
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'current':
      console.log(getCurrentVersion());
      break;
      
    case 'set':
      if (args[1]) {
        updateVersion(args[1]);
      } else {
        console.error('Please provide a version number');
        process.exit(1);
      }
      break;
      
    case 'increment':
      const type = args[1] || 'patch';
      const newVersion = incrementVersion(type);
      console.log(`Incremented ${type} version to ${newVersion}`);
      break;
      
    case 'release':
      const versionType = args[1] || 'patch';
      const version = incrementVersion(versionType);
      const tagName = createGitTag(version);
      
      if (tagName) {
        console.log(`\nRelease ${version} created successfully!`);
        console.log(`Git tag: ${tagName}`);
        console.log('\nNext steps:');
        console.log('1. Push the tag: git push origin ' + tagName);
        console.log('2. Build and push Docker image: npm run docker:build -- --push');
      }
      break;
      
    case 'docker:build':
      const buildVersion = args[1] || getCurrentVersion();
      const push = args.includes('--push');
      buildDockerImage(buildVersion, push);
      break;
      
    case 'docker:tags':
      const currentVersion = getCurrentVersion();
      console.log('Available Docker tags:');
      console.log(`- bentopdf/bentopdf:${currentVersion}`);
      console.log(`- bentopdf/bentopdf:v${currentVersion}`);
      console.log('- bentopdf/bentopdf:latest');
      break;
      
    default:
      console.log(`
BentoPDF Version Management Script

Usage: node scripts/version.js <command> [options]

Commands:
  current                    Show current version
  set <version>             Set specific version
  increment [type]          Increment version (patch|minor|major)
  release [type]            Create release (increment + git tag)
  docker:build [version]    Build Docker image with version
  docker:tags               Show available Docker tags

Options:
  --push                    Push Docker images after building

Examples:
  node scripts/version.js current
  node scripts/version.js increment minor
  node scripts/version.js release patch
  node scripts/version.js docker:build --push
      `);
  }
}

// Run main function if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  getCurrentVersion,
  updateVersion,
  incrementVersion,
  createGitTag,
  buildDockerImage
};
