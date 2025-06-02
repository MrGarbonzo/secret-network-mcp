# GitHub Repository Setup for Automated Builds

## 🚀 Quick Setup Checklist

### 1. Create GitHub Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Secret Network MCP server"

# Add GitHub remote (replace with your repository)
git remote add origin https://github.com/yourusername/secret-network-mcp.git
git branch -M main
git push -u origin main
```

### 2. Enable GitHub Container Registry
1. Go to your repository **Settings**
2. Navigate to **Actions** → **General**
3. Under **Workflow permissions**, select:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**

### 3. Configure Package Visibility
1. Go to your repository **Settings**
2. Navigate to **Actions** → **General**
3. Under **Fork pull request workflows**, ensure actions can run

### 4. First Release Test
```bash
# Test the complete workflow
npm run release:prepare

# If successful, create your first release
git tag v0.1.0
git push origin v0.1.0
```

## 📋 Repository Settings Required

### Actions Permissions
- **Workflow permissions**: Read and write
- **Allow GitHub Actions**: Create and approve pull requests
- **Fork pull requests**: Allow actions to run

### Package Settings
- **Package visibility**: Public (for TEE VM access)
- **Package permissions**: Read access for deployment

## 🔧 Environment Variables (Optional)

For advanced configurations, you can set repository secrets:

### Repository Secrets (Settings → Secrets → Actions)
- `DOCKER_REGISTRY` - Custom registry URL (default: ghcr.io)
- `EXTRA_BUILD_ARGS` - Additional Docker build arguments

## 🎯 Testing the Setup

### Local Test
```bash
# 1. Verify everything builds
npm run deploy:test

# 2. Check GitHub Actions files
ls -la .github/workflows/
```

### GitHub Actions Test
```bash
# 1. Push to GitHub
git add .
git commit -m "Add GitHub Actions workflows"
git push origin main

# 2. Create test tag
git tag v0.1.0-test
git push origin v0.1.0-test

# 3. Check Actions tab in GitHub
# - Should see "Build and Publish Docker Image" running
# - Should see "Create Release" running
```

## 📊 Expected Workflow Results

### After Tag Push
1. **Build and Publish** workflow runs (~5-10 minutes)
   - Builds TypeScript
   - Runs tests
   - Builds Docker images (AMD64/ARM64)
   - Pushes to GitHub Container Registry

2. **Create Release** workflow runs (~1-2 minutes)
   - Downloads build artifacts
   - Creates GitHub release
   - Attaches docker-compose.yml with SHA256

### Build Outputs
- **Docker Image**: `ghcr.io/yourusername/secret-network-mcp:v0.1.0`
- **GitHub Release**: With deployment files
- **Release Assets**: 
  - `docker-compose.yml` (TEE VM ready)
  - `build-info.json` (build metadata)

## 🚨 Troubleshooting

### Common Issues

**Permission Denied on Package Push**
```bash
# Solution: Check repository settings
# Settings → Actions → General → Workflow permissions
# Select "Read and write permissions"
```

**Docker Build Fails**
```bash
# Solution: Test locally first
npm run docker:build:prod

# Check logs in Actions tab
```

**Release Creation Fails**
```bash
# Solution: Ensure tag follows v* pattern
git tag v1.0.0  # ✅ Correct
git tag 1.0.0   # ❌ Wrong
```

## 🔗 Next Steps

After successful setup:
1. **Monitor first build** in Actions tab
2. **Verify package** appears in repository packages
3. **Download docker-compose.yml** from release
4. **Deploy to TEE VM** using the deployment guide

## 📚 Related Documentation
- [Deployment Guide](./README.md)
- [TEE VM Template](./tee-vm-template.yml)
- [Docker Deployment Guide](../DOCKER_DEPLOYMENT.md)

---

Once setup is complete, you'll have a fully automated CI/CD pipeline following SecretNetwork best practices!
