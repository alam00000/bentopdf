# BentoPDF Version Management Guide

This guide explains how to manage versions and Docker tags for BentoPDF using our comprehensive version management system.

## 🎯 Overview

BentoPDF now supports **semantic versioning** with automated Docker builds and multiple tag strategies. This enables:

- **Deterministic builds** - Use exact versions in production
- **Easy rollbacks** - Switch versions with one command  
- **Production stability** - No more "latest" surprises
- **Professional releases** - Automated GitHub releases

## 🏷️ Version Tags Explained

Each release creates multiple Docker tags for maximum flexibility:

| Tag | Example | Use Case |
|-----|---------|----------|
| `bentopdf/bentopdf:1.0.0` | Specific version | Production deployments |
| `bentopdf/bentopdf:v1.0.0` | Version with prefix | Alternative naming |
| `bentopdf/bentopdf:latest` | Latest stable | Development, testing |
| `bentopdf/bentopdf:1.0` | Major.minor | Get latest patch |
| `bentopdf/bentopdf:1` | Major | Get latest minor.patch |

## 🚀 Quick Start

### 1. Setup (One-time)
```bash
# Run the setup script
./scripts/setup-versioning.sh

# Or manually create environment file
cp docker.env.example docker.env
```

### 2. Daily Workflow
```bash
# Make your changes
git add .
git commit -m "Add new feature"

# Push changes (builds latest)
git push origin main

# When ready for release
npm run version:release patch
git push origin v0.0.3
```

## 📋 Version Management Commands

### Check Current Version
```bash
npm run version:current
# Output: 0.0.2
```

### Increment Version
```bash
# Patch release (0.0.2 → 0.0.3)
npm run version:increment patch

# Minor release (0.0.2 → 0.1.0)  
npm run version:increment minor

# Major release (0.0.2 → 1.0.0)
npm run version:increment major
```

### Create Release
```bash
# Creates version bump + git tag
npm run version:release patch
# Output: 
# Updated version to 0.0.3
# Created git tag: v0.0.3
# 
# Next steps:
# 1. Push the tag: git push origin v0.0.3
# 2. Build and push Docker image: npm run docker:build -- --push
```

### Docker Operations
```bash
# Build Docker image locally
npm run docker:build

# Build and push to Docker Hub
npm run docker:push

# Show available Docker tags
npm run docker:tags
```

## 🐳 Docker Usage

### Using Specific Versions
```bash
# Production - use specific version
BENTOPDF_VERSION=1.0.0 docker compose up -d

# Development - use latest
BENTOPDF_VERSION=latest docker compose up -d

# Custom version
BENTOPDF_VERSION=v1.2.3 docker compose up -d
```

### Environment File
Create `docker.env`:
```bash
# Set your preferred version
BENTOPDF_VERSION=1.0.0
```

Then run:
```bash
docker compose up -d
```

### Check Version in Container
```bash
# From outside container
docker exec bentopdf cat /usr/share/nginx/html/version.txt

# From inside container
curl http://localhost:3000/version.txt
```

## 🔄 Complete Workflow Examples

### Scenario 1: Bug Fix
```bash
# 1. Fix the bug
git add .
git commit -m "Fix PDF merge issue"

# 2. Push changes
git push origin main
# Result: Builds bentopdf/bentopdf:latest

# 3. Create patch release
npm run version:release patch
git push origin v0.0.3
# Result: Builds versioned tags + GitHub release
```

### Scenario 2: New Feature
```bash
# 1. Add feature
git add .
git commit -m "Add PDF compression tool"

# 2. Push changes
git push origin main

# 3. Create minor release
npm run version:release minor
git push origin v0.1.0
```

### Scenario 3: Breaking Changes
```bash
# 1. Make breaking changes
git add .
git commit -m "BREAKING: Change API structure"

# 2. Push changes
git push origin main

# 3. Create major release
npm run version:release major
git push origin v1.0.0
```

## 🎯 Semantic Versioning Rules

### Patch (0.0.1 → 0.0.2)
- Bug fixes
- Small improvements
- Documentation updates
- **Backward compatible**

### Minor (0.0.1 → 0.1.0)
- New features
- New tools
- Enhancements
- **Backward compatible**

### Major (0.0.1 → 1.0.0)
- Breaking changes
- API changes
- Removed features
- **Not backward compatible**

## 🔧 Advanced Usage

### Manual Version Management
```bash
# Set specific version
node scripts/version.js set 2.1.0

# Check version
node scripts/version.js current

# Build with specific version
node scripts/version.js docker:build 2.1.0
```

### Git Tag Management
```bash
# List all tags
git tag -l

# Show tag details
git show v1.0.0

# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin --delete v1.0.0
```

### Docker Image Management
```bash
# List local images
docker images | grep bentopdf

# Remove old images
docker rmi bentopdf/bentopdf:0.0.1

# Pull specific version
docker pull bentopdf/bentopdf:1.0.0
```

## 🚨 Troubleshooting

### Common Issues

#### Version Script Not Working
```bash
# Check if file is executable
chmod +x scripts/version.js

# Check Node.js version
node --version
```

#### Docker Build Fails
```bash
# Check Docker is running
docker --version

# Clean build
docker build --no-cache -t bentopdf/bentopdf:test .
```

#### Version Not Updating
```bash
# Check package.json
cat package.json | grep version

# Force update
node scripts/version.js set 1.0.0
```

#### Git Tag Issues
```bash
# Check existing tags
git tag -l

# Delete problematic tag
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

### Getting Help

- Check [GitHub Issues](https://github.com/bentopdf/bentopdf/issues)
- Review [Docker Hub repository](https://hub.docker.com/r/bentopdf/bentopdf)
- Examine [GitHub Actions logs](https://github.com/bentopdf/bentopdf/actions)

## 📚 Best Practices

### For Maintainers
1. **Test before release** - Always test locally first
2. **Use semantic versioning** - Follow patch/minor/major rules
3. **Write good commit messages** - Be descriptive
4. **Create releases regularly** - Don't let versions pile up

### For Users
1. **Production** - Use specific versions (`1.0.0`)
2. **Staging** - Use major.minor (`1.0`)
3. **Development** - Use `latest`
4. **Rollbacks** - Keep previous versions available

## 🎉 Benefits Achieved

✅ **Deterministic Builds** - Exact versions ensure reproducibility  
✅ **Easy Rollbacks** - Switch versions with one command  
✅ **Production Stability** - No more "latest" surprises  
✅ **Professional Releases** - Automated GitHub releases  
✅ **Multi-platform Support** - AMD64 + ARM64 builds  
✅ **Developer Experience** - Simple CLI and automated CI/CD  

This version management system provides enterprise-grade Docker image management with complete control over releases and deployments! 🚀