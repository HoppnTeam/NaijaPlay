# NaijaPlay Deployment Checklist

## GitHub Repository Setup

1. [ ] Initialize Git repository (if not already done)
   ```bash
   git init
   ```

2. [ ] Create a .gitignore file (already exists)
   - Ensure it includes `.env*`, `.env.local`, and other sensitive files

3. [ ] Create a new GitHub repository
   - Go to GitHub.com and create a new repository
   - Follow GitHub instructions to push your existing repository

4. [ ] Push code to GitHub
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/naijaplay.git
   git push -u origin main
   ```

## Environment Variables

1. [ ] Remove sensitive data from .env.local before pushing to GitHub
   - Create a clean .env.example file with placeholders

2. [ ] Prepare environment variables for Vercel:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN
   - NEXT_PUBLIC_APP_URL
   - PAYSTACK_SECRET_KEY
   - NEXT_PUBLIC_MAX_TEAM_BUDGET
   - NEXT_PUBLIC_API_FOOTBALL_KEY
   - API_FOOTBALL_KEY
   - SUPABASE_ENV (set to "production" for deployment)

## Vercel Deployment

1. [ ] Sign up/login to Vercel (https://vercel.com)

2. [ ] Import your GitHub repository
   - Connect your GitHub account
   - Select the NaijaPlay repository

3. [ ] Configure project settings
   - Set the framework preset to Next.js
   - Configure the build settings if needed

4. [ ] Add environment variables
   - Add all environment variables from the list above
   - Mark variables with NEXT_PUBLIC_ prefix as public

5. [ ] Deploy the project
   - Click "Deploy" and wait for the build to complete

## Post-Deployment

1. [ ] Verify the deployment
   - Test all major features
   - Check authentication flows
   - Verify API endpoints

2. [ ] Set up custom domain (optional)
   - Configure DNS settings
   - Add domain in Vercel dashboard

3. [ ] Set up monitoring and analytics
   - Consider adding Vercel Analytics
   - Set up error monitoring

## Database Setup

1. [ ] Ensure Supabase production database is properly configured
   - Check all tables exist
   - Verify Row Level Security policies
   - Check database indexes for performance

2. [ ] Run any pending migrations
   ```bash
   npm run supabase:prod
   # Run any migration commands if needed
   ```

## Final Checks

1. [ ] Test the application on the deployed URL
2. [ ] Verify authentication flows work correctly
3. [ ] Check that API routes are functioning
4. [ ] Test payment integration with Paystack
5. [ ] Verify Redis integration for caching and rate limiting 