# GitHub Actions Deployment Guide

This guide explains how to use the automated GitHub Actions workflows for building and deploying the Secret Network MCP server.

## 🚀 Automated Build Process

### Triggering Builds

The build process automatically triggers when you create a Git tag:

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

This will:
1. **Build** TypeScript code
2. **Test** the application
3. **Build** multi-architecture Docker images (AMD64/ARM64)
4. **Push** to GitHub Container Registry
5. **Create** GitHub release with deployment artifacts
6. **Generate** production docker-compose.yml with exact SHA256

### Build Outputs

Each successful build produces:

- **Docker Image**: `ghcr.io/yourusername/secret-network-mcp:v1.0.0`
- **SHA256 Digest**: For security verification
- **Release Assets**: 
  - `docker-compose.yml` - TEE VM ready deployment
  - `build-info.json` - Build metadata

## 📋 Deployment Workflow

### Step 1: Create GitHub Release
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Step 2: Download Release Assets
1. Go to your GitHub repository releases
2. Download `docker-compose.yml` from the latest release
3. This file contains the exact SHA256 digest for security

### Step 3: Deploy to TEE VM
1. Upload the `docker-compose.yml` to your TEE VM
2. Set environment variables through TEE VM's secure system:
   ```
   NETWORK=mainnet
   SECRET_CHAIN_ID=secret-4
   SECRET_CHAIN_URL=https://lcd.secret.express
   ```
3. Deploy: `docker-compose up -d`

## 🔐 Security Features

### SHA256 Verification
Every release includes exact SHA256 digests following SecretNetwork best practices:

```yaml
image: ghcr.io/username/secret-network-mcp:v1.0.0@sha256:abc123...
```

### Multi-Architecture Support
Images are built for:
- `linux/amd64` (Intel/AMD)
- `linux/arm64` (ARM processors)

### Reproducible Builds
- Built from tagged source code
- Exact dependency versions locked
- Build metadata included in releases

## 🔧 Manual Triggering

You can also trigger builds manually:

1. Go to your repository's **Actions** tab
2. Select **Build and Publish Docker Image**
3. Click **Run workflow**
4. Choose branch/tag and run

## 📊 Workflow Status

### Build and Publish Workflow
- **File**: `.github/workflows/docker-publish.yml`
- **Triggers**: Git tags (`v*`)
- **Outputs**: Docker images, build artifacts

### Release Workflow  
- **File**: `.github/workflows/release.yml`
- **Triggers**: Git tags (`v*`)
- **Outputs**: GitHub releases, deployment files

## 🚨 Troubleshooting

### Build Failures
1. Check **Actions** tab for error logs
2. Verify all tests pass locally: `npm run validate`
3. Ensure Docker builds locally: `npm run docker:build:prod`

### Registry Issues
1. Verify GitHub token permissions
2. Check package visibility settings
3. Ensure repository has `packages: write` permission

### TEE VM Deployment Issues
1. Verify exact image SHA256 in docker-compose.yml
2. Check environment variables are set correctly
3. Ensure TEE VM can access GitHub Container Registry

## 📖 Example Release Process

```bash
# 1. Prepare release
git checkout main
git pull origin main

# 2. Update version and changelog
npm version minor  # or patch/major

# 3. Create and push tag
git push origin main
git push origin --tags

# 4. Monitor GitHub Actions
# - Check Actions tab for build status
# - Verify release is created automatically

# 5. Download and deploy
# - Download docker-compose.yml from release
# - Upload to TEE VM
# - Deploy with docker-compose up -d
```

## 🔗 Related Files

- `.github/workflows/docker-publish.yml` - Main build workflow
- `.github/workflows/release.yml` - Release creation
- `deployment/tee-vm-template.yml` - TEE VM template
- `docker-compose.prod.yml` - Production base configuration

---

This automated pipeline ensures secure, reproducible deployments following blockchain industry best practices.
