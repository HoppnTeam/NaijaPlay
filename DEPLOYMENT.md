# NaijaPlay Deployment Guide

This guide provides detailed instructions for deploying the NaijaPlay Fantasy Football application to GitHub and Vercel.

## Prerequisites

Before deploying, ensure you have:

1. A GitHub account
2. A Vercel account (linked to your GitHub account)
3. Access to all required environment variables
4. Node.js 18+ installed locally

## Pre-Deployment Checks

Run the comprehensive pre-deployment checks to ensure your project is ready:

```bash
npm run run-checks
```

This will:
- Run linting
- Check TypeScript types
- Run unit tests
- Verify the build process
- Check database tables
- Check for sensitive data

## Deployment Steps

### 1. Prepare Environment Variables

Create a clean `.env.example` file without sensitive values:

```bash
npm run prepare-deploy
```

### 2. Push to GitHub

```bash
# Initialize Git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Ready for deployment"

# Set main branch
git branch -M main

# Add remote repository
git remote add origin https://github.com/yourusername/naijaplay.git

# Push to GitHub
git push -u origin main
```

### 3. Deploy to Vercel

#### Option A: Manual Deployment

1. Log in to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure the following settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add all environment variables from `.env.example`
5. Deploy!

#### Option B: CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npm run deploy
```

#### Option C: GitHub Actions (CI/CD)

The repository includes a GitHub Actions workflow that automatically deploys:
- Production deployments when pushing to the main branch
- Preview deployments for pull requests

To set up:
1. Go to your GitHub repository settings
2. Navigate to Secrets and Variables > Actions
3. Add the following secrets:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID
   - All environment variables from `.env.example`

## Post-Deployment Verification

After deployment, verify your application is working correctly:

```bash
npm run verify-deployment
```

This script will:
1. Check if the home page loads correctly
2. Verify the health check API is responding
3. Ensure the login page is accessible

Additionally, manually verify:
1. Authentication flows work
2. API routes function properly
3. Database connections are established
4. Redis caching is working
5. Payment integration is functioning

## Database Setup

Before deployment, ensure your database is properly configured:

```bash
npm run check-database
```

This will verify that all required tables exist in your Supabase database.

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel
   - Verify all dependencies are installed
   - Ensure environment variables are set correctly

2. **API Routes Not Working**
   - Check Vercel logs for errors
   - Verify Supabase connection
   - Check environment variables

3. **Authentication Issues**
   - Verify Supabase URL and keys
   - Check redirect URLs in Supabase dashboard

### Getting Help

If you encounter issues:
1. Check Vercel documentation
2. Review Supabase documentation
3. Check Next.js deployment guides

## Maintenance

### Updating the Deployment

For future updates:
1. Make changes locally
2. Run checks: `npm run run-checks`
3. Commit and push to GitHub
4. Vercel will automatically deploy (if using GitHub integration or Actions)

### Monitoring

Consider setting up:
1. Vercel Analytics
2. Error tracking (e.g., Sentry)
3. Performance monitoring

## Security Considerations

1. Never commit sensitive environment variables
2. Regularly rotate API keys
3. Set up proper CORS policies
4. Configure security headers (already done in vercel.json)
5. Implement rate limiting for API routes (using Upstash Redis) 