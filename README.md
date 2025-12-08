# Minimal Modern Blog

A clean, minimal blog built with Next.js, Tailwind CSS, and deployed on Vercel. Write posts in Markdown and they automatically appear on your blog.

**Perfect for developers who want a simple, fast blog without the complexity.**

## ✨ Features

- 📝 **Markdown Support**: Write posts in simple Markdown files with GFM, math equations (KaTeX), and Mermaid diagrams
- 🎨 **Minimal Design**: Clean white-black aesthetic with customizable themes
- ⚡ **Auto-Deploy**: Push to GitHub and Vercel automatically deploys
- 📱 **Responsive**: Looks great on all devices
- 🌙 **Dark Mode**: Automatic dark mode support
- 🚀 **Fast**: Built with Next.js 15 for optimal performance
- 📡 **RSS Feed**: Built-in RSS feed at `/feed.xml`
- 💬 **Comments**: Optional Giscus integration (GitHub Discussions)
- 📊 **Analytics**: Optional Google Analytics integration
- 🏷️ **Categories & Tags**: Organize posts with beautiful badges
- 🎯 **SEO Ready**: Automatic sitemap, Open Graph, Twitter Cards
- 📖 **Reading Progress**: Progress bar and time estimate
- 🔍 **Search & Filter**: Easy content discovery

## 🍴 Fork This Blog

**Want your own blog?** Fork this repository and make it yours in 5 minutes!

👉 **See the complete setup guide:** [FORK_SETUP.md](FORK_SETUP.md)

### Quick Fork Steps:

1. Click the "Fork" button above
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/blog.git`
3. Install dependencies: `npm install`
4. Update configuration: Edit `config/theme.config.ts` with your info
5. Deploy to Vercel: [vercel.com](https://vercel.com) → Import your repo → Deploy

**Done!** 🎉 Your blog is live.

## 📚 Documentation

- **[FORK_SETUP.md](FORK_SETUP.md)** - Complete guide to fork and customize this blog
- **[POST_GUIDE.md](POST_GUIDE.md)** - How to write posts with all frontmatter options
- **[THEME_CONFIG.md](THEME_CONFIG.md)** - Customize colors, fonts, and layout
- **[IMAGE_GUIDE.md](IMAGE_GUIDE.md)** - Adding and optimizing images
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment instructions (English)
- **[DEPLOYMENT-KO.md](DEPLOYMENT-KO.md)** - 배포 가이드 (한국어)

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Open Your Browser

Visit [http://localhost:3000](http://localhost:3000)

## ✍️ Writing Posts

### Create a New Post

Create a `.md` file in `posts/` directory:

```bash
touch posts/my-first-post.md
```

### Add Content

```markdown
---
title: "My First Post"
date: "2025-01-20"
excerpt: "This is a short description of my post"
category: "Tutorial"
tags: ["nextjs", "blogging"]
---

# My First Post

Your content goes here. You can use **Markdown** formatting!

## Subheading

More content...
```

**See [POST_GUIDE.md](POST_GUIDE.md) for complete documentation on:**
- All available frontmatter fields
- Markdown features (code blocks, tables, math, diagrams)
- Images and media
- Best practices

### Required Fields

- **`title`** (string): The post title
- **`date`** (string): Publication date in `YYYY-MM-DD` format

### Optional Fields

- **`excerpt`** (string): Brief description (for SEO and post list)
- **`category`** (string): Single category for organization
- **`tags`** (array): Tags for detailed categorization
- **`draft`** (boolean): Set to `true` to hide the post

## 🖼️ Adding Images

Save images in `public/images/` and reference them:

```markdown
![Image description](/images/your-image.jpg)
```

**See [IMAGE_GUIDE.md](IMAGE_GUIDE.md) for complete image documentation.**

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and click "New Project"
3. Import your GitHub repository
4. Click "Deploy" (Vercel auto-configures Next.js)

**Done!** Your blog auto-deploys on every push to GitHub.

**See [DEPLOYMENT.md](DEPLOYMENT.md) for other deployment options.**

## ⚙️ Configuration

### Essential Settings (After Forking)

Edit `config/theme.config.ts` with your information:

```typescript
// 1. Site Information (Required)
site: {
  title: 'Your Blog Name',
  description: 'Your blog description',
  tagline: 'Your tagline',
}

// 2. SEO Settings (Required)
seo: {
  siteUrl: 'https://yourdomain.com',  // YOUR domain
  openGraph: {
    locale: 'en_US',  // Your locale
    siteName: 'Your Blog Name',
  }
}

// 3. Social Links (Optional)
socialLinks: {
  github: 'https://github.com/yourusername',
  linkedin: '',  // Optional
  medium: '',    // Optional
}
```typescript
seo: {
  googleAnalytics: {
    enabled: true,
    measurementId: 'G-XXXXXXXXXX',  // Your GA4 ID
  }
}
```

5. **Comments** (Optional):
```typescript
comments: {
  enabled: true,
  giscus: {
    repo: 'yourusername/your-repo',
    repoId: 'YOUR_REPO_ID',
    // ... other Giscus settings
  }
}
```

See [THEME_CONFIG.md](THEME_CONFIG.md) for complete configuration options.

### Customization

- **Theme Config**: All settings in `config/theme.config.ts` (colors, features, text, etc.)
- **Styles**: Modify `app/globals.css` for custom CSS
- **Homepage**: Edit `app/page.tsx` for layout changes
- **Post Template**: Edit `app/posts/[slug]/page.tsx`

### Adding More Pages

Create new pages by adding files to the `app/` directory:

```

**See [FORK_SETUP.md](FORK_SETUP.md) for complete configuration instructions** including:
- Google Analytics setup
- Google Search Console setup
- Giscus comments integration
- Google AdSense setup
- Customizing colors, fonts, and layout

### Template Configuration File

A template configuration file is available at `config/theme.config.template.ts` with all options documented. Use it as a reference when customizing your blog.

## 🎨 Customization

### Colors and Theme

Edit `config/theme.config.ts`:

```typescript
colors: {
  light: {
    background: {
      primary: 'from-white via-gray-50 to-gray-100',
    },
    accent: {
      primary: 'bg-black text-white',
    }
  }
}
```

### Typography

```typescript
typography: {
  fontSize: {
    title: 'text-4xl',   // Larger titles
    body: 'text-lg',     // Larger body text
  }
}
```

### Post Content Width

```typescript
spacing: {
  postWidth: 'max-w-5xl',  // Wider posts
}
```

**See [THEME_CONFIG.md](THEME_CONFIG.md) for all customization options.**

## 🌟 Advanced Features

### RSS Feed

Automatic RSS feed at `/feed.xml` - configure in `config/theme.config.ts`:

```typescript
rss: {
  enabled: true,
  maxItems: 50,
  cacheMaxAge: 3600,
}
```

### Reading Progress

Visual reading progress with:
- Top progress bar
- Floating circular indicator
- Time remaining estimate

Configure in `config/theme.config.ts`.

### Comments

GitHub Discussions-based comments with Giscus. See [FORK_SETUP.md](FORK_SETUP.md) for setup.

### Categories and Tags

Automatic category and tag collection from posts. Add to post frontmatter:

```markdown
---
category: "Tutorial"
tags: ["nextjs", "react"]
---
```

### Adding Pages

Create new pages in `app/` directory:
```

## 📁 Project Structure

```
blog/
├── app/                 # Next.js app directory
│   ├── posts/[slug]/   # Dynamic post pages
│   ├── page.tsx        # Homepage
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
├── posts/              # Your blog posts (*.md)
├── lib/
│   └── posts.ts        # Post processing utilities
├── public/             # Static assets
└── package.json
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Markdown**: [gray-matter](https://github.com/jonschlinkert/gray-matter) + [remark](https://github.com/remarkjs/remark)
- **Hosting**: [Vercel](https://vercel.com/)
- **Language**: TypeScript

## 📝 Example Posts

Check out the example posts in the `posts/` directory to see how to structure your content.

## 🤝 Contributing

Feel free to open issues or submit pull requests!

## 📄 License

MIT

---

Built with ❤️ using Next.js and Vercel

