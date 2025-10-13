# Supabase Edge Functions CI/CD Setup

This guide explains how to set up automatic deployment of Supabase Edge Functions on git commits, similar to how Vercel deploys your Next.js app.

## Overview

The workflow automatically deploys Edge Functions when:
- You push to the `main` branch
- Changes are detected in `supabase/functions/**`
- You manually trigger the workflow

## Setup Steps

### 1. Get Supabase Access Token

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click your profile icon → **Access Tokens**
3. Click **Generate New Token**
4. Name it: `GitHub Actions CI/CD`
5. Copy the token (you won't see it again!)

### 2. Get Supabase Project ID

1. Go to your project in Supabase Dashboard
2. Click **Settings** → **General**
3. Copy the **Reference ID** (looks like: `abcdefghijklmnop`)

### 3. Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these two secrets:

```
Name: SUPABASE_ACCESS_TOKEN
Value: [paste your access token]

Name: SUPABASE_PROJECT_ID
Value: [paste your project reference ID]
```

### 4. Verify Workflow File

The workflow file should be at `.github/workflows/deploy-supabase.yml`

### 5. Test the Deployment

#### Option A: Push a change
```bash
# Make a change to an edge function
echo "// Updated" >> supabase/functions/analyze-figure/index.ts

# Commit and push
git add .
git commit -m "Update edge function"
git push origin main
```

#### Option B: Manual trigger
1. Go to **Actions** tab in GitHub
2. Select **Deploy Supabase Edge Functions**
3. Click **Run workflow**

### 6. Monitor Deployment

1. Go to **Actions** tab in GitHub
2. Click on the latest workflow run
3. Watch the deployment logs in real-time

## Workflow Features

### Automatic Deployment
- ✅ Deploys only when Edge Functions change
- ✅ Skips deployment if only other files changed
- ✅ Runs on every push to `main` branch

### Manual Deployment
- ✅ Can be triggered manually via GitHub Actions UI
- ✅ Useful for redeploying without code changes

### Smart Path Filtering
```yaml
paths:
  - 'supabase/functions/**'
  - '.github/workflows/deploy-supabase.yml'
```
Only triggers when relevant files change.

## Advanced Configuration

### Deploy Specific Functions Only

Edit `.github/workflows/deploy-supabase.yml`:

```yaml
- name: Deploy Edge Functions
  run: |
    supabase link --project-ref $SUPABASE_PROJECT_ID
    
    # Deploy only specific functions
    supabase functions deploy analyze-figure --no-verify-jwt
    supabase functions deploy another-function --no-verify-jwt
```

### Add Environment Variables

If your functions need secrets:

1. Add secrets to GitHub (same as step 3)
2. Update workflow to set them:

```yaml
- name: Deploy Edge Functions
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
    SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
    CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
  run: |
    supabase link --project-ref $SUPABASE_PROJECT_ID
    
    # Set secrets for functions
    supabase secrets set CLAUDE_API_KEY=$CLAUDE_API_KEY
    
    # Deploy functions
    supabase functions deploy --no-verify-jwt
```

### Deploy to Multiple Environments

Create separate workflows for staging/production:

**.github/workflows/deploy-supabase-staging.yml**
```yaml
on:
  push:
    branches:
      - develop
env:
  SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_STAGING_PROJECT_ID }}
```

**.github/workflows/deploy-supabase-production.yml**
```yaml
on:
  push:
    branches:
      - main
env:
  SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PRODUCTION_PROJECT_ID }}
```

### Add Slack/Discord Notifications

Add notification step:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Edge Functions deployment ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Troubleshooting

### Error: "Project not found"
- Verify `SUPABASE_PROJECT_ID` is correct
- Check access token has proper permissions

### Error: "Authentication failed"
- Regenerate access token
- Update `SUPABASE_ACCESS_TOKEN` secret

### Functions not updating
- Check if path filter matches your changes
- Verify workflow is enabled in GitHub Actions
- Check workflow logs for errors

### Manual rollback
```bash
# Locally, deploy previous version
git checkout <previous-commit>
supabase functions deploy analyze-figure --no-verify-jwt
git checkout main
```

## Comparison with Vercel

| Feature | Vercel (Next.js) | Supabase (Edge Functions) |
|---------|------------------|---------------------------|
| **Auto-deploy on push** | ✅ Built-in | ✅ Via GitHub Actions |
| **Preview deployments** | ✅ Automatic | ⚠️ Manual setup needed |
| **Environment variables** | ✅ Dashboard UI | ✅ CLI + Secrets |
| **Rollback** | ✅ One-click | ⚠️ Manual via CLI |
| **Deploy logs** | ✅ Dashboard | ✅ GitHub Actions |
| **Branch deployments** | ✅ Automatic | ✅ Via workflow config |

## Best Practices

1. **Test locally first**
   ```bash
   supabase functions serve analyze-figure
   ```

2. **Use staging environment**
   - Deploy to staging on `develop` branch
   - Deploy to production on `main` branch

3. **Version your functions**
   - Tag releases: `git tag v1.0.0`
   - Reference in deployment logs

4. **Monitor function logs**
   ```bash
   supabase functions logs analyze-figure
   ```

5. **Set up alerts**
   - Configure error notifications
   - Monitor function performance

## Next Steps

- [ ] Set up preview deployments for PRs
- [ ] Add automated tests before deployment
- [ ] Configure monitoring and alerts
- [ ] Set up staging environment
- [ ] Document rollback procedures

## Resources

- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
