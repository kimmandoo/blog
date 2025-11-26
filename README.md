# Minimal Modern Blog

A clean, minimal blog built with Next.js, Tailwind CSS, and deployed on Vercel. Write posts in Markdown and they automatically appear on your blog.

## ✨ Features

- 📝 **Markdown Support**: Write posts in simple Markdown files
- 🎨 **Minimal Design**: Clean white-black aesthetic
- ⚡ **Auto-Deploy**: Push to GitHub and Vercel automatically deploys
- 📱 **Responsive**: Looks great on all devices
- 🌙 **Dark Mode**: Automatic dark mode support
- 🚀 **Fast**: Built with Next.js for optimal performance

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

### Customization

- **Site Title**: Edit `app/layout.tsx` to change metadata
- **Styles**: Modify `app/globals.css` for custom colors
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

