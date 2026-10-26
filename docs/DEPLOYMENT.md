# Vercel Deployment Guide

This guide will help you deploy your blog to Vercel in just a few minutes.

## Prerequisites

- A GitHub account with this repository
- A Vercel account (free tier is sufficient)

## Deployment Steps

### Method 1: Vercel Dashboard (Recommended for First-Time Users)

1. **Push your code to GitHub** (if you haven't already)
   ```bash
   git add .
   git commit -m "Initial blog setup"
   git push origin main
   ```

2. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign up or log in (you can use your GitHub account)

3. **Import Your Repository**
   - Click "Add New Project" or "New Project"
   - Click "Import Git Repository"
   - Select this repository from the list
   - If you don't see it, click "Adjust GitHub App Permissions" to grant access

4. **Configure Your Project**
   - Vercel will auto-detect that this is a Next.js project
   - The default settings are already configured correctly:
     - **Framework Preset**: Next.js
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`
     - **Install Command**: `npm install`
   - You don't need to change anything!

5. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes for the build to complete
   - Your blog is now live! 🎉

6. **Get Your URL**
   - Vercel will provide you with a URL like: `your-blog-name.vercel.app`
   - You can customize this domain in the project settings

### Method 2: Vercel CLI (For Advanced Users)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
4. **Follow the prompts:**
   - Set up and deploy? **Yes**
   - Which scope? Choose your account
   - Link to existing project? **No**
   - What's your project name? Enter a name
   - In which directory is your code? **./` (press Enter)
   - Auto-detected settings? **Yes**

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Automatic Deployments

Once set up, Vercel will automatically:

- **Deploy on every push** to your main branch
- **Build preview deployments** for pull requests
- **Invalidate cache** and rebuild when you push new posts

### Adding New Blog Posts

1. Create a new `.md` file in the `posts/` directory:
   ```markdown
   ---
   title: "My New Post"
   date: "2025-01-20"
   excerpt: "A brief description"
   ---
   
   # Content here
   
   Your post content...
   ```

2. Commit and push:
   ```bash
   git add posts/my-new-post.md
   git commit -m "Add new blog post"
   git push
   ```

3. Vercel automatically detects the change and redeploys your blog!
   - Usually takes 1-2 minutes
   - You'll receive an email when deployment is complete

## Custom Domain (Optional)

1. **Go to your project settings** in Vercel
2. **Click "Domains"**
3. **Add your custom domain**
4. **Follow the DNS configuration instructions**
5. Vercel will automatically provision SSL certificates

Common domain providers:
- Namecheap
- GoDaddy
- Google Domains
- Cloudflare

## Environment Variables (If Needed)

If you need environment variables:

1. Go to your project settings in Vercel
2. Click "Environment Variables"
3. Add your variables for each environment:
   - Production
   - Preview
   - Development

## Troubleshooting

### Build Fails

1. **Check the build logs** in Vercel dashboard
2. **Test locally** with `npm run build`
3. **Common issues:**
   - Missing dependencies: Run `npm install`
   - TypeScript errors: Run `npm run lint`
   - Port conflicts: Make sure port 3000 is available

### Posts Not Showing

1. **Check file format**: Files must end with `.md`
2. **Check front matter**: Must include `title` and `date`
3. **Check file location**: Must be in `posts/` directory
4. **Rebuild**: Push a change to trigger a new deployment

### Slow Builds

- Vercel caches dependencies automatically
- First build may take longer
- Subsequent builds are faster (usually under 1 minute)

## Performance Tips

1. **Image Optimization**: Use Next.js Image component for photos
2. **Static Generation**: All pages are pre-rendered at build time
3. **Edge Network**: Vercel serves your blog from a global CDN
4. **Automatic Compression**: Vercel automatically compresses assets

## Analytics (Optional)

Enable Vercel Analytics for free:

1. Go to your project dashboard
2. Click "Analytics"
3. Enable Vercel Analytics
4. No code changes needed!

## Monitoring

Vercel provides:
- Real-time deployment status
- Build logs
- Error tracking
- Performance metrics

Access these in your project dashboard at [vercel.com](https://vercel.com).

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub Issues](https://github.com/kimmandoo/blog/issues)

---

**That's it!** Your blog is now live and will automatically deploy whenever you push new posts to GitHub. 🚀
