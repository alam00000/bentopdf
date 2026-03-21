# 🚀 Release Process - Real-World Scenarios

## 📋 Common Release Scenarios

### **Scenario 1: I Just Finished a Feature and Want to Release**

**Situation:** You've completed a new feature, tested it locally, and want to release it.

**Current State:**

```bash
$ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  modified:   src/js/new-feature.js
  modified:   src/css/styles.css
  modified:   README.md

Untracked files:
  src/js/feature-helper.js
```

**Steps:**

```bash
# 1. Commit your feature changes
git add .
git commit -m "Add new PDF watermark feature"

# 2. Choose your release type and run
npm run release        # Patch: 1.0.0 → 1.0.1 (bug fixes, small improvements)
npm run release:minor  # Minor: 1.0.0 → 1.1.0 (new features, backward compatible)
npm run release:major  # Major: 1.0.0 → 2.0.0 (breaking changes)
```

**What Happens:**

- ✅ Your feature commit stays as-is
- ✅ Version gets bumped in `package.json` and `chart/Chart.yaml`
- ✅ New release commit is created
- ✅ Git tag is created (e.g., `v1.0.1`)
- ✅ Everything gets pushed to GitHub
- ✅ Docker image gets built and published

---

### **Scenario 2: I Have Uncommitted Changes and Want to Release**

**Situation:** You have local changes but haven't committed them yet.

**Current State:**

```bash
$ git status
Changes not staged for commit:
  modified:   package.json
  modified:   src/js/main.js
  modified:   README.md
```

**❌ This Will Fail:**

```bash
npm run release
# Error: Your local changes would be overwritten by merge
```

**✅ Solution Options:**

**Option A: Commit Everything First (Recommended)**

```bash
git add .
git commit -m "Add new features and improvements"
npm run release
```

**Option B: Stash Changes Temporarily**

```bash
git stash
npm run release
git stash pop  # Restore your changes after release
```

**Option C: Commit Only What's Needed**

```bash
git add package.json src/js/main.js
git commit -m "Add core improvements"
npm run release
git add README.md
git commit -m "Update documentation"
```

---

### **Scenario 3: I Want to Release a Hotfix**

**Situation:** There's a critical bug in production that needs immediate fixing.

**Steps:**

```bash
# 1. Fix the bug
git add src/js/bug-fix.js
git commit -m "Fix critical PDF rendering issue"

# 2. Release as patch (bug fix)
npm run release
# This creates: 1.0.0 → 1.0.1
```

**Result:**

- ✅ Bug fix gets released immediately
- ✅ Docker image with fix is available
- ✅ Users can pull the fixed version

---

### **Scenario 4: I Want to Release a Major Update**

**Situation:** You've added significant new features that might break existing functionality.

**Steps:**

```bash
# 1. Commit all your changes
git add .
git commit -m "Add major PDF editing features and API changes"

# 2. Release as major version
npm run release:major
# This creates: 1.0.0 → 2.0.0
```

**Result:**

- ✅ Major version bump indicates breaking changes
- ✅ Users know to check compatibility
- ✅ Both old and new versions available

---

### **Scenario 5: I Want to Release Multiple Features at Once**

**Situation:** You've been working on multiple features and want to release them together.

**Steps:**

```bash
# 1. Commit all features
git add .
git commit -m "Add multiple PDF tools: watermark, encryption, and compression"

# 2. Choose appropriate release type
npm run release:minor  # For new features (1.0.0 → 1.1.0)
# OR
npm run release:major  # For breaking changes (1.0.0 → 2.0.0)
```

---

### **Scenario 6: I Want to Test the Release Process**

**Situation:** You want to test the release system without affecting production.

**Steps:**

```bash
# 1. Make a small test change
echo "// Test comment" >> src/js/main.js
git add src/js/main.js
git commit -m "Test release process"

# 2. Run patch release
npm run release
# This creates: 1.0.0 → 1.0.1

# 3. Verify everything works
# Check GitHub Actions, Docker Hub, etc.

# 4. If you want to undo the test release
git tag -d v1.0.1
git push origin :refs/tags/v1.0.1
git reset --hard HEAD~1
```

---

## 🎯 **Release Type Guidelines**

| Scenario            | Command                 | Version Change  | When to Use                          |
| ------------------- | ----------------------- | --------------- | ------------------------------------ |
| **Bug Fix**         | `npm run release`       | `1.0.0 → 1.0.1` | Fixing bugs, small improvements      |
| **New Feature**     | `npm run release:minor` | `1.0.0 → 1.1.0` | Adding features, backward compatible |
| **Breaking Change** | `npm run release:major` | `1.0.0 → 2.0.0` | API changes, major rewrites          |

---

## 🔄 **What Happens After You Run a Release Command**

### **Immediate Actions (Local):**

1. **Version Update**: `package.json` version gets bumped
2. **Git Commit**: New commit created with "Release vX.X.X"
3. **Git Tag**: Tag created (e.g., `v1.0.1`)
4. **Git Push**: Everything pushed to GitHub

### **Automatic Actions (GitHub):**

1. **GitHub Actions Triggered**: Workflow starts building Docker image
2. **Docker Build**: Multi-architecture image created
3. **Docker Push**: Images pushed to Docker Hub with tags:
   - `bentopdfteam/bentopdf:latest`
   - `bentopdfteam/bentopdf:1.0.1`
   - `bentopdfteam/bentopdf:v1.0.1`

### **End Result:**

Users can immediately pull your new version:

```bash
docker pull bentopdfteam/bentopdf:1.0.1
```

---

## 🚨 **Before You Release - Prerequisites**

### **1. Docker Hub Credentials Setup**

You need to add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_TOKEN`: Your Docker Hub access token

### **2. Get Docker Hub Token**

1. Go to [Docker Hub](https://hub.docker.com)
2. Account Settings → Security → New Access Token
3. Set permissions to "Read, Write, Delete"
4. Copy the token and add it to GitHub Secrets

---

## 🔧 **Troubleshooting Common Issues**

### **❌ "Your local changes would be overwritten by merge"**

**Problem:** You have uncommitted changes
**Solution:**

```bash
git add .
git commit -m "Your commit message"
npm run release
```

### **❌ "Permission denied" in GitHub Actions**

**Problem:** Missing Docker Hub credentials
**Solution:** Add `DOCKER_USERNAME` and `DOCKER_TOKEN` to GitHub Secrets

### **❌ "Tag already exists"**

**Problem:** You've run the same release before
**Solution:** This is normal! The script will skip creating duplicate tags

### **❌ GitHub Actions fails**

**Problem:** Various build issues
**Solution:**

1. Check Actions tab for detailed logs
2. Verify Docker Hub credentials
3. Check Dockerfile for syntax errors

---

## 🧪 **Testing Your Release System**

### **Quick Test:**

```bash
# Make a small change
echo "// Test" >> src/js/main.js
git add src/js/main.js
git commit -m "Test release"
npm run release
```

### **Verify Results:**

1. **GitHub Actions**: Check Actions tab for successful build
2. **Docker Hub**: Verify images are published
3. **Git Tags**: `git tag --list` should show new tag
4. **Version**: `cat package.json | grep version` should show updated version

### **Undo Test Release:**

```bash
git tag -d v1.0.1
git push origin :refs/tags/v1.0.1
git reset --hard HEAD~1
```

---

## 🎉 **That's It!**

Your release system is now ready! Just follow the scenarios above based on your situation and run the appropriate `npm run release` command.
