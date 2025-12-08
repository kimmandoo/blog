# Minimal Modern Blog

A clean, minimal blog built with Next.js, Tailwind CSS, and deployed on Vercel. Write posts in Markdown and they automatically appear on your blog.

## ✨ Features

- 📝 **Markdown Support**: Write posts in simple Markdown files
- 🎨 **Minimal Design**: Clean white-black aesthetic
- ⚡ **Auto-Deploy**: Push to GitHub and Vercel automatically deploys
- 📱 **Responsive**: Looks great on all devices
- 🌙 **Dark Mode**: Automatic dark mode support
- 🚀 **Fast**: Built with Next.js for optimal performance
- 📡 **RSS Feed**: Subscribe to posts via RSS at `/feed.xml`

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000)** in your browser

### Writing Blog Posts

1. Create a new `.md` file in the `posts/` directory
2. Add front matter with title, date, and excerpt:

```markdown
---
title: "Your Post Title"
date: "2025-01-15"
excerpt: "A brief description of your post"
---

# Your Content Here

Write your post content using Markdown...
```

3. Save the file - it will automatically appear on your blog!

### Front Matter Fields

- `title` (required): The post title
- `date` (required): Publication date in YYYY-MM-DD format
- `excerpt` (optional): Short description shown on the homepage
- `category` (optional): Post category
- `tags` (optional): Array of tags

### Adding Images to Posts

You can easily add images to your blog posts:

1. **Save images** in the `public/images/` directory
2. **Reference in markdown**:
   ```markdown
   ![Image description](/images/your-image.jpg)
   ```

**Example:**
```markdown
# My Post with Images

Here's an image:

![Beautiful landscape](/images/posts/landscape.jpg)

Images automatically get rounded corners and shadow effects!
```

For a complete guide on using images (including external URLs, sizing, and best practices), see [IMAGE_GUIDE.md](IMAGE_GUIDE.md).

## 📦 Deploy to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js and configure everything
6. Click "Deploy"

That's it! Your blog is now live and will auto-deploy on every push to GitHub.

### Method 2: Via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts to link your project

## 🔧 Configuration

### Quick Start for Forking

After forking this repository, update these key settings in `config/theme.config.ts`:

1. **Site Information** (Required):
```typescript
site: {
  title: 'Your Blog Name',
  description: 'Your blog description',
  tagline: 'Your tagline',
}
```

2. **SEO Settings** (Required):
```typescript
seo: {
  siteUrl: 'https://yourdomain.com',  // Your actual domain
  openGraph: {
    locale: 'en_US',  // or 'ko_KR', 'ja_JP', etc.
    siteName: 'Your Blog Name',
    defaultImage: '/og-image.jpg',  // Your default OG image
  }
}
```

3. **Social Links** (Optional):
```typescript
socialLinks: {
  github: 'https://github.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourusername',
  medium: 'https://yourusername.medium.com',
}
```

4. **Analytics** (Optional):
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
app/
  about/
    page.tsx    # Creates /about page
  contact/
    page.tsx    # Creates /contact page
```

### RSS Feed

Your blog automatically generates an RSS feed at `/feed.xml`. Readers can subscribe to your blog using any RSS reader by adding:

```
https://yourdomain.com/feed.xml
```

The RSS feed includes:
- Post titles and links
- Publication dates
- Post excerpts
- Tags as categories
- Automatic updates when you publish new posts

**Configuration**: Edit `config/theme.config.ts` to customize RSS settings:
```typescript
rss: {
  enabled: true,        // Enable/disable RSS feed
  maxItems: 50,        // Max posts in feed (0 = all)
  cacheMaxAge: 3600,   // Cache duration in seconds
}
```

### Reading Progress Indicator

Posts include an enhanced reading progress indicator with:
- **Top Progress Bar**: Ultra-thin bar showing reading progress
- **Floating Indicator**: Circular progress widget (bottom-right) with:
  - Real-time percentage
  - Time remaining calculation
  - Hover tooltip with detailed info

**Configuration**: Edit `config/theme.config.ts` to customize:
```typescript
readingProgress: {
  enabled: true,                    // Enable/disable feature
  showTopBar: true,                 // Show top progress bar
  showFloatingIndicator: true,      // Show floating indicator
  floatingIndicatorThreshold: 100,  // Show after scrolling (px)
  hideWhenCompleteThreshold: 99,    // Hide when % complete
}
```

**Customize Text**: Change language/text in `config/theme.config.ts`:
```typescript
text: {
  readingProgress: {
    minutesRemaining: '분 남음',  // Minutes remaining text
    readingComplete: '읽기 완료!',  // Complete text
    minutesRead: '분',            // Minutes unit
  }
}
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

