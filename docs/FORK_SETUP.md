# Fork Setup Guide

Complete step-by-step guide to fork this blog and make it your own.

## 🚀 Quick Start (5 Minutes)

### Step 1: Fork the Repository

1. Click the **"Fork"** button at the top right of this repository
2. Choose your GitHub account as the destination
3. Wait for GitHub to create your copy

### Step 2: Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/blog.git
cd blog
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to see your blog!

### Step 5: Customize Configuration

Edit `config/theme.config.ts` with your information (see detailed guide below).

### Step 6: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Click "Deploy"

Done! Your blog is now live. 🎉

---

## 📝 Detailed Setup Guide

### 1. Essential Configuration

After forking, you **must** update these settings in `config/theme.config.ts`:

#### Site Information

```typescript
site: {
  title: 'Your Blog Name',           // Change to your blog name
  description: 'Your blog description', // Change to your description
  tagline: 'Your tagline',            // Change to your tagline
}
```

#### SEO Settings (Critical!)

```typescript
seo: {
  siteUrl: 'https://yourdomain.com',  // Change to YOUR domain!
  
  openGraph: {
    locale: 'en_US',  // Change to your locale (en_US, ko_KR, ja_JP, etc.)
    siteName: 'Your Blog Name',  // Same as site.title
    defaultImage: '/images/og-default.jpg',  // Your default OG image
  },
  
  twitter: {
    card: 'summary_large_image',
    site: '@yourtwitterhandle',    // Your Twitter handle (optional)
    creator: '@yourtwitterhandle', // Your Twitter handle (optional)
  }
}
```

#### Social Links (Optional)

```typescript
socialLinks: {
  github: 'https://github.com/yourusername',      // Your GitHub profile
  linkedin: 'https://linkedin.com/in/yourusername', // Your LinkedIn (optional)
  medium: 'https://medium.com/@yourusername',     // Your Medium (optional)
}
```

**Note:** Remove any social links you don't want to display by setting them to empty string `''` or removing the line.

### 2. Optional Features Setup

#### Google Analytics (Recommended)

Track your blog's visitors:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)
4. Update `config/theme.config.ts`:

```typescript
seo: {
  googleAnalytics: {
    enabled: true,
    measurementId: 'G-XXXXXXXXXX',  // Paste your ID here
  }
}
```

#### Google Search Console (Recommended)

Get your blog indexed on Google:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (your blog URL)
3. Choose "HTML tag" verification method
4. Copy the verification code (the `content` value)
5. Update `config/theme.config.ts`:

```typescript
seo: {
  googleSearchConsole: {
    enabled: true,
    verificationCode: 'your-verification-code-here',
  }
}
```

#### Comments with Giscus (Optional)

Enable comments on your posts using GitHub Discussions:

**Prerequisites:**
- Your repository must be public
- GitHub Discussions must be enabled

**Setup:**

1. Enable GitHub Discussions:
   - Go to your repository → Settings → Features
   - Check "Discussions"

2. Install Giscus app:
   - Visit [https://github.com/apps/giscus](https://github.com/apps/giscus)
   - Click "Install"
   - Grant access to your blog repository

3. Configure Giscus:
   - Go to [https://giscus.app](https://giscus.app)
   - Enter your repository: `yourusername/blog`
   - Choose your preferences:
     - **Page ↔️ Discussions Mapping**: "pathname" (recommended)
     - **Discussion Category**: "General" or create a new one
     - **Theme**: "preferred_color_scheme" (auto dark/light mode)
   - Copy the configuration values

4. Update `config/theme.config.ts`:

```typescript
comments: {
  enabled: true,
  giscus: {
    repo: 'yourusername/blog',        // Your repo
    repoId: 'R_kgDOxxxxxx',           // From giscus.app
    category: 'General',               // Your chosen category
    categoryId: 'DIC_kwDOxxxxxx',     // From giscus.app
    mapping: 'pathname',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'top',
    theme: 'preferred_color_scheme',
    lang: 'en',  // Change to your language (en, ko, ja, etc.)
  }
}
```

To disable comments, set `enabled: false`.

#### Google AdSense (Optional)

Monetize your blog with ads:

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Create an account and get approved
3. Copy your client ID (format: `ca-pub-XXXXXXXXXX`)
4. Update `config/theme.config.ts`:

```typescript
seo: {
  googleAdsense: {
    enabled: true,
    clientId: 'ca-pub-XXXXXXXXXX',  // Your AdSense client ID
  }
}
```

### 3. Content Customization

#### Remove Sample Posts

Delete the example posts:

```bash
rm -rf posts/samples/
```

Or keep them as references and mark them as drafts:

```markdown
---
title: "Sample Post"
draft: true
---
```

#### Add Your First Post

Create your first post:

```bash
touch posts/my-first-post.md
```

Add content:

```markdown
---
title: "My First Post"
date: "2025-01-20"
excerpt: "This is my first blog post!"
category: "Personal"
tags: ["introduction", "blogging"]
---

# My First Post

Welcome to my blog! This is where I'll share my thoughts...
```

See [POST_GUIDE.md](POST_GUIDE.md) for detailed post writing instructions.

#### Update About/Author Information

If you want to add an about page:

```bash
mkdir -p app/about
touch app/about/page.tsx
```

Example content:

```typescript
export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">About Me</h1>
      <p className="text-lg mb-4">
        Hi! I'm [Your Name], and this is my blog where I write about...
      </p>
    </div>
  );
}
```

### 4. Styling Customization

#### Change Colors

Edit `config/theme.config.ts`:

```typescript
colors: {
  light: {
    background: {
      primary: 'from-white via-gray-50 to-gray-100',  // Background gradient
    },
    accent: {
      primary: 'bg-black text-white',  // Change accent color
    }
  },
  dark: {
    // Dark mode colors
  }
}
```

#### Change Typography

```typescript
typography: {
  fontFamily: {
    sans: 'Your Font, sans-serif',
  },
  fontSize: {
    title: 'text-4xl',  // Larger titles
    body: 'text-lg',    // Larger body text
  }
}
```

#### Customize Post Content Width

```typescript
spacing: {
  postWidth: 'max-w-5xl',  // Options: max-w-2xl, max-w-3xl, max-w-4xl, max-w-5xl, max-w-6xl, max-w-7xl
}
```

See [THEME_CONFIG.md](THEME_CONFIG.md) for all customization options.

### 5. Images and Branding

#### Add Your Logo/Avatar

1. Add your image to `public/images/`:
   ```bash
   cp /path/to/your/logo.png public/images/logo.png
   ```

2. Update the default Open Graph image in `config/theme.config.ts`:
   ```typescript
   seo: {
     openGraph: {
       defaultImage: '/images/logo.png',
     }
   }
   ```

#### Add Favicon

Replace the default favicon:

```bash
# Add your favicon to public/
cp /path/to/favicon.ico public/favicon.ico
```

You can also add multiple favicon formats:
- `public/favicon.ico` (16x16, 32x32)
- `public/favicon-16x16.png`
- `public/favicon-32x32.png`
- `public/apple-touch-icon.png` (180x180)

### 6. Deployment

#### Deploy to Vercel (Recommended)

**Method 1: Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your blog repository
5. Click "Deploy" (no configuration needed!)

**Method 2: Vercel CLI**

```bash
npm i -g vercel
vercel login
vercel
```

#### Custom Domain

After deploying to Vercel:

1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

#### Deploy to Other Platforms

This blog can also be deployed to:

- **Netlify**: Connect GitHub repo, build command: `npm run build`, publish directory: `.next`
- **Cloudflare Pages**: Same as Netlify
- **Self-hosted**: Run `npm run build && npm start`

### 7. Maintenance and Updates

#### Keep Your Fork Updated

To get updates from the original repository:

```bash
# Add original repo as upstream (one-time)
git remote add upstream https://github.com/kimmandoo/blog.git

# Get updates
git fetch upstream
git merge upstream/main

# Or rebase
git rebase upstream/main

# Push to your fork
git push origin main
```

#### Regular Tasks

1. **Write posts regularly** - Consistency is key!
2. **Update dependencies** - Run `npm update` monthly
3. **Check analytics** - Monitor what content resonates
4. **Backup content** - Your posts are in git, so they're safe!
5. **Engage with readers** - Respond to comments

## 🎨 Advanced Customization

### Add Custom Components

Create new components in `components/`:

```typescript
// components/Newsletter.tsx
export default function Newsletter() {
  return (
    <div className="bg-gray-100 p-8 rounded-lg">
      <h3 className="text-2xl font-bold mb-4">Subscribe</h3>
      <input type="email" placeholder="Your email" />
      <button>Subscribe</button>
    </div>
  );
}
```

Use in posts or pages.

### Change Homepage Layout

Edit `app/page.tsx` to customize the homepage layout.

### Add New Pages

Create new pages by adding folders in `app/`:

```bash
mkdir -p app/projects
touch app/projects/page.tsx
```

This creates a `/projects` page.

### Integrate Analytics Services

Besides Google Analytics, you can integrate:

- **Plausible Analytics**
- **Umami**
- **Fathom**

Add their scripts in `app/layout.tsx`.

## 🔒 Security Best Practices

1. **Never commit secrets** - Use environment variables for API keys
2. **Review dependencies** - Run `npm audit` regularly
3. **Keep updated** - Update Next.js and dependencies
4. **Use HTTPS** - Vercel provides this automatically
5. **Enable 2FA** - On GitHub and Vercel accounts

## 🆘 Troubleshooting

### Build Fails

```bash
# Check for errors
npm run build

# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Posts Not Showing

1. Check `draft: false` in front matter
2. Verify file is in `posts/` directory
3. Check file has `.md` extension
4. Ensure front matter has `title` and `date`

### Styling Issues

1. Clear browser cache
2. Run `npm run dev` and check console
3. Verify Tailwind classes are correct
4. Check `config/theme.config.ts` for typos

### Deployment Issues on Vercel

1. Check build logs in Vercel dashboard
2. Ensure `package.json` has correct scripts
3. Verify Node.js version compatibility
4. Check environment variables

## 📚 Additional Resources

- [POST_GUIDE.md](POST_GUIDE.md) - Complete post writing guide
- [THEME_CONFIG.md](THEME_CONFIG.md) - Theming and customization
- [IMAGE_GUIDE.md](IMAGE_GUIDE.md) - Image usage guide
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Markdown Guide](https://www.markdownguide.org/)

## ❓ Getting Help

- **Check existing documentation** - Most questions are answered here
- **Search Issues** - Someone may have had the same problem
- **Open an Issue** - On the original repository
- **Ask the Community** - In GitHub Discussions

## ✅ Post-Setup Checklist

Use this checklist after forking:

- [ ] Updated `site.title`, `site.description`, `site.tagline`
- [ ] Changed `seo.siteUrl` to your domain
- [ ] Updated `seo.openGraph.siteName` and `seo.openGraph.locale`
- [ ] Added your social links (or removed unused ones)
- [ ] Set up Google Analytics (optional)
- [ ] Set up Google Search Console (optional)
- [ ] Configured Giscus comments (optional)
- [ ] Removed or marked sample posts as drafts
- [ ] Created your first blog post
- [ ] Added your logo/favicon
- [ ] Tested locally with `npm run dev`
- [ ] Deployed to Vercel
- [ ] Connected custom domain (optional)
- [ ] Verified all features work on live site

## 🎉 Congratulations!

Your blog is now set up and ready to go. Start writing and sharing your thoughts with the world!

---

**Need help?** Open an issue on GitHub or check the documentation files.

**Want to contribute?** PRs are welcome!
