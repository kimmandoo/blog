# Minimal Modern Blog

A clean, minimal blog built with Next.js, Tailwind CSS, and deployed on Vercel. Write posts in Markdown and they automatically appear on your blog.

**Perfect for developers who want a simple, fast blog without the complexity.**

## ✨ Features

- 📝 **Markdown Support**: Write posts in simple Markdown files with GFM, math equations (KaTeX), and Mermaid diagrams
- 🎨 **Minimal Archive Design**: Shared top navigation, underline category tabs, and restrained monochrome typography
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

### Blog browsing

- Home, PS, and article pages share a slim top header with the site name, 글/PS navigation, and theme controls. Archives use fine separators and title-first rows with excerpts and metadata beneath. Home and PS have a separate right-hand profile sidebar on desktop; below 1024px it moves underneath the archive, never covering the posts. Article pages retain their focused reading layout.
- Body text, branding, and list titles use IBM Plex Sans KR (400/500/600); article titles and section headings use Noto Serif KR (400/600). Both are self-hosted through `next/font/google`, use `display: swap`, and disable eager preloading of Korean font subsets. The initial build requires access to Google Fonts; readers load the generated font assets from the blog itself.
- Search matches titles, excerpts, categories, and tags, ignoring surrounding whitespace and letter case. Clear the field with its clear button, Escape, or the empty-state reset action.
- Changing the search starts at the first result page. Pagination links retain the query in `q` together with category/tag filters, so linked result pages survive a reload.
- Home categories sit in a separate card below the profile sidebar, with published-post counts and a highlighted current selection. They form a vertical list on desktop, three columns on tablet, and two columns on mobile; no horizontal scrolling is required. A mobile “카테고리 선택” link jumps directly to the card. Category changes retain the current search and tag filter while resetting pagination. Tags remain collapsible.
- Removing a selected category or tag preserves the other active filter. Pagination shows nearby pages and endpoints rather than an unbounded row of buttons.
- Light, dark, and system theme controls live in the shared header. Social links and a back-to-top link live in the footer. PS language tabs wrap onto additional lines instead of scrolling horizontally.
- `components/ProfileSidebar.tsx` holds the profile and action sections, with social destinations from `config/theme.config.ts`. It includes GitHub, LinkedIn, Medium, and an RSS subscription link; add further profile actions in this component.
- Social links, RSS, and back-to-top actions use inline SVG icons with accessible names, native title tooltips, visible keyboard focus, and 44px square hit targets. Text labels remain for the 글/PS navigation.
- PS notes use explicit `language` frontmatter. Existing notes are classified as C++; adding a published note with `language: python` creates its language tab automatically. Language and tag filters compose and survive reloads. See [PS authoring](docs/POST_GUIDE.md#ps-language-archive).

### Search metadata

- Search (`q`), category, tag, and pagination variants remain crawlable but use `noindex, follow` and canonicalize to the unfiltered archive. Blank searches remain indexable. PS language/tag filters follow the same policy.
- Home, PS, and article pages emit their own canonical and Open Graph/Twitter metadata. All article sharing images use the themed 1200×630 `/og` card rather than inline screenshots. Home and PS archives pass their own titles and descriptions to the same renderer; `seo.openGraph.defaultImage` can still override the archive image.
- Sharing cards match the light blog palette: off-white background, charcoal typography, fine dividers, category, date, and up to three tags. Long Korean/Latin titles and descriptions are width-bounded with ellipses. OG images use a bundled [IBM Plex Sans KR Medium](https://github.com/google/fonts/tree/main/ofl/ibmplexsanskr) font, loaded once on the server without a Korean-font CDN dependency; its OFL license is included in `public/fonts/OFL.txt`.
- Website search structured data targets `?q=`. Both normal articles and PS details render Article and Breadcrumb JSON-LD on the server, escaping `<` so post text cannot terminate the script. Modification dates are not fabricated from publication dates.
- Duplicate PS URLs under `/posts/` permanently redirect to their canonical `/coding-test/` URLs; those redirects are pre-rendered. The sitemap includes canonical pages only. `robots.txt`, the sitemap, and RSS remain publicly fetchable.
- Changes take effect after deployment and search-engine recrawling. Search Console submission, index inclusion, and ranking are external to the application and are not guaranteed by metadata changes.



## 🍴 Fork This Blog

**Want your own blog?** Fork this repository and make it yours in 5 minutes!

👉 **See the complete setup guide:** [FORK_SETUP.md](docs/FORK_SETUP.md)

### Quick Fork Steps:

1. Click the "Fork" button above
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/blog.git`
3. Install dependencies: `npm install`
4. Update configuration: Edit `config/theme.config.ts` with your info
5. Deploy to Vercel: [vercel.com](https://vercel.com) → Import your repo → Deploy

**Done!** 🎉 Your blog is live.

## 📚 Documentation

- **[FORK_SETUP.md](docs/FORK_SETUP.md)** - Complete guide to fork and customize this blog
- **[POST_GUIDE.md](docs/POST_GUIDE.md)** - How to write posts with all frontmatter options
- **[THEME_CONFIG.md](docs/THEME_CONFIG.md)** - Customize colors, fonts, and layout
- **[IMAGE_GUIDE.md](docs/IMAGE_GUIDE.md)** - Adding and optimizing images
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment instructions (English)
- **[DEPLOYMENT-KO.md](docs/DEPLOYMENT-KO.md)** - 배포 가이드 (한국어)
- **[AndroidCS guides](docs/ANDROIDCS_CONTENT_ORGANIZATION.md)** - Content organization, with [usage](docs/ANDROIDCS_GUIDE.md) and [examples](docs/ANDROIDCS_EXAMPLES.md)
- **[Documentation archive](docs/archive/)** - Preserved historical UI and implementation reports; these describe past changes, not necessarily current behavior

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

**See [POST_GUIDE.md](docs/POST_GUIDE.md) for complete documentation on:**
- All available frontmatter fields
- Markdown features (code blocks, tables, math, diagrams)
- Images and media
- Best practices

### Required Fields

- **`title`** (string): The post title
- **`date`** (string): Publication date in `YYYY-MM-DD` or `YYYY-MM-DD HH:mm` format

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

**See [IMAGE_GUIDE.md](docs/IMAGE_GUIDE.md) for complete image documentation.**

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and click "New Project"
3. Import your GitHub repository
4. Click "Deploy" (Vercel auto-configures Next.js)

**Done!** Your blog auto-deploys on every push to GitHub.

**See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for other deployment options.**

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

See [THEME_CONFIG.md](docs/THEME_CONFIG.md) for complete configuration options.

### Customization

- **Theme Config**: All settings in `config/theme.config.ts` (colors, features, text, etc.)
- **Styles**: Modify `app/globals.css` for custom CSS
- **Homepage**: Edit `app/page.tsx` for layout changes
- **Post Template**: Edit `app/posts/[slug]/page.tsx`

### Adding More Pages

Create new pages by adding files to the `app/` directory:

```

**See [FORK_SETUP.md](docs/FORK_SETUP.md) for complete configuration instructions** including:
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

**See [THEME_CONFIG.md](docs/THEME_CONFIG.md) for all customization options.**

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

GitHub Discussions-based comments with Giscus. See [FORK_SETUP.md](docs/FORK_SETUP.md) for setup.

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
app/
  about/
    page.tsx    # Creates /about page
```

## 📁 Project Structure

```
blog/
├── app/                      # Next.js app directory (routing)
│   ├── posts/[...slug]/     # Dynamic post pages
│   ├── page.tsx             # Homepage
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── PostList.tsx         # Post listing component
│   ├── Comments.tsx         # Giscus comments
│   ├── TableOfContents.tsx  # TOC component
│   └── ...                  # Other components
├── config/                  # Configuration files
│   ├── theme.config.ts      # Main configuration (customize this!)
│   └── theme.config.template.ts  # Template for reference
├── lib/                     # Utility functions
│   ├── posts.ts            # Post processing logic
│   ├── rss.ts              # RSS feed generation
│   └── readingTime.ts      # Reading time calculation
├── posts/                   # Your blog posts (*.md files)
│   ├── samples/            # Example posts and templates
│   └── your-post.md        # Your posts go here
├── public/                  # Static assets
│   ├── images/             # Images for posts
│   ├── favicon.ico         # Site favicon
│   └── ...                 # Other static files
├── docs/                    # Setup, authoring, deployment, and AndroidCS guides
│   └── archive/             # Historical UI and implementation reports
├── rust/                    # Preserved Rust learning drafts and source material
├── scripts/                 # Repository maintenance and diagnostic scripts
├── tests/                   # Automated regression tests
├── README.md               # This file
└── package.json            # Dependencies
```

Guides live in `docs/`; historical reports are retained in `docs/archive/` rather than deleted. Rust drafts remain in `rust/`, separate from published blog posts. Generated Next.js output and local tool logs are ignored, and unused starter SVG assets have been removed from `public/`.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Markdown**: [gray-matter](https://github.com/jonschlinkert/gray-matter) + [remark](https://github.com/remarkjs/remark) + [rehype](https://github.com/rehypejs/rehype)
- **Syntax Highlighting**: [rehype-highlight](https://github.com/rehypejs/rehype-highlight)
- **Math**: [KaTeX](https://katex.org/) via rehype-katex
- **Diagrams**: [Mermaid](https://mermaid.js.org/)
- **Comments**: [Giscus](https://giscus.app/) (optional)
- **Hosting**: [Vercel](https://vercel.com/) (or any Node.js host)
- **Language**: TypeScript

## 📖 Complete Documentation

| Document | Description |
|----------|-------------|
| **[FORK_SETUP.md](docs/FORK_SETUP.md)** | Complete guide to fork and customize this blog |
| **[POST_GUIDE.md](docs/POST_GUIDE.md)** | How to write posts with all features |
| **[THEME_CONFIG.md](docs/THEME_CONFIG.md)** | Customize colors, fonts, layout |
| **[IMAGE_GUIDE.md](docs/IMAGE_GUIDE.md)** | Adding and optimizing images |
| **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** | Deployment instructions (English) |
| **[DEPLOYMENT-KO.md](docs/DEPLOYMENT-KO.md)** | 배포 가이드 (한국어) |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | How to contribute to this project |

## 🎯 Quick Reference

### Essential Files to Customize After Forking

1. **`config/theme.config.ts`** - Your blog settings (REQUIRED)
   - Site title, description, tagline
   - Site URL (for SEO)
   - Social links
   - Analytics (optional)

2. **`posts/`** - Your blog posts
   - Remove sample posts
   - Add your own `.md` files

3. **`public/images/`** - Your images
   - Add favicon
   - Add logo/avatar
   - Add post images

### Common Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:3000)

# Production
npm run build           # Build for production
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint
```

### Quick Post Template

```markdown
---
title: "Your Post Title"
date: "2025-01-20"
excerpt: "Brief description"
category: "Category Name"
tags: ["tag1", "tag2"]
---

# Your content here...
```

### Getting Help

- 📖 **Check documentation** - Most questions are answered in the guides
- 🐛 **Report bugs** - [Open an issue](https://github.com/kimmandoo/blog/issues)
- 💬 **Discussions** - [Ask questions](https://github.com/kimmandoo/blog/discussions)
- 🤝 **Contributing** - See [CONTRIBUTING.md](CONTRIBUTING.md)

## 🌟 Example Blogs

Using this template? Let us know! We'd love to feature your blog here.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - feel free to use this template for your own blog!

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vercel](https://vercel.com/) - Hosting
- And many other open source projects

---

**Ready to start blogging?** Fork this repository and make it your own! 🚀

Built with ❤️ by developers, for developers.

