# Contributing to This Blog Template

Thank you for your interest in contributing! This document provides guidelines for contributing to this blog template.

## 🤝 Ways to Contribute

### 1. Bug Reports

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, browser)
- Screenshots if applicable

### 2. Feature Requests

Have an idea? Open an issue describing:
- The feature you'd like to see
- Why it would be useful
- How it should work
- Examples from other projects (if any)

### 3. Documentation Improvements

Documentation can always be better! Contribute by:
- Fixing typos or unclear explanations
- Adding examples
- Translating to other languages
- Creating video tutorials

### 4. Code Contributions

#### Before You Start

1. **Check existing issues** - Someone might already be working on it
2. **Open an issue first** - Discuss major changes before coding
3. **Follow the code style** - Use the existing patterns
4. **Test your changes** - Ensure everything works

#### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/blog.git
cd blog

# Install dependencies
npm install

# Create a new branch
git checkout -b feature/your-feature-name

# Start development server
npm run dev

# Make your changes and test them
# Visit http://localhost:3000

# Run build to check for errors
npm run build
```

#### Code Style Guidelines

1. **TypeScript**: Use TypeScript for all new code
2. **Components**: Follow the existing component structure
3. **Naming**: Use descriptive names (camelCase for variables, PascalCase for components)
4. **Comments**: Add comments for complex logic
5. **Documentation**: Update relevant docs when changing features

#### Commit Messages

Use clear, descriptive commit messages:

```bash
# Good
git commit -m "Add dark mode toggle to navigation"
git commit -m "Fix image loading on mobile devices"
git commit -m "Update README with deployment instructions"

# Not so good
git commit -m "Fix bug"
git commit -m "Update"
git commit -m "Changes"
```

#### Pull Request Process

1. **Update documentation** - If you changed features, update the docs
2. **Test thoroughly** - Run `npm run build` and test locally
3. **Describe your changes** - Explain what and why in the PR description
4. **Link related issues** - Reference any related issues
5. **Be patient** - Reviews may take time

### 5. Community Support

Help others by:
- Answering questions in issues
- Sharing your blog built with this template
- Writing blog posts about using the template
- Sharing on social media

## 📋 What We're Looking For

### Priority Areas

- **Performance improvements** - Faster load times, better optimization
- **Accessibility** - WCAG compliance, screen reader support
- **Mobile experience** - Better responsive design
- **SEO enhancements** - Better search engine optimization
- **Documentation** - More examples, better explanations
- **Internationalization** - Multi-language support

### Nice to Have

- **New themes** - Additional color schemes
- **Integrations** - Support for more services
- **Components** - Reusable UI components
- **Tools** - CLI tools, scripts, helpers

## 🚫 What We Won't Accept

- Breaking changes without discussion
- Features that significantly increase complexity
- Dependencies that are unmaintained or insecure
- Code without documentation
- Changes that hurt performance or accessibility
- Personal/company-specific features

## 📝 Code of Conduct

### Our Standards

- **Be respectful** - Treat everyone with respect
- **Be constructive** - Provide helpful feedback
- **Be patient** - Everyone is learning
- **Be inclusive** - Welcome all contributors

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or insults
- Trolling or inflammatory comments
- Publishing others' private information
- Any other unprofessional conduct

## 🎯 Development Guidelines

### File Organization

```
blog/
├── app/              # Next.js app directory
│   ├── posts/       # Post page routes
│   ├── page.tsx     # Homepage
│   └── layout.tsx   # Root layout
├── components/      # React components
├── config/          # Configuration files
├── lib/            # Utility functions
├── posts/          # Markdown posts
└── public/         # Static assets
```

### Component Structure

```typescript
// Good component structure
import { FC } from 'react';

interface Props {
  title: string;
  description?: string;
}

export const MyComponent: FC<Props> = ({ title, description }) => {
  return (
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
};
```

### Configuration Changes

When modifying `config/theme.config.ts`:
1. Update the template file (`theme.config.template.ts`)
2. Update THEME_CONFIG.md documentation
3. Add examples if introducing new options
4. Ensure backward compatibility

### Adding New Features

1. **Keep it simple** - Don't over-engineer
2. **Make it optional** - Use feature flags when possible
3. **Document it** - Update all relevant docs
4. **Test it** - Ensure it works in dev and production
5. **Consider accessibility** - Follow WCAG guidelines

## 🧪 Testing

### Manual Testing

Before submitting a PR, test:

1. **Development mode**: `npm run dev`
   - Homepage loads correctly
   - Posts display properly
   - Navigation works
   - Features work as expected

2. **Production build**: `npm run build && npm start`
   - Build completes without errors
   - All pages are generated
   - Everything works as in dev mode

3. **Different devices**
   - Desktop (Chrome, Firefox, Safari)
   - Mobile (iOS Safari, Chrome Android)
   - Tablet

4. **Different scenarios**
   - With many posts
   - With long content
   - With images
   - With code blocks

### What to Check

- [ ] Build succeeds without errors
- [ ] No console errors or warnings
- [ ] All links work
- [ ] Images load correctly
- [ ] Responsive design works
- [ ] Dark mode works (if changed)
- [ ] SEO meta tags are correct
- [ ] RSS feed generates properly

## 📚 Documentation Standards

### Writing Style

- **Clear and concise** - Get to the point
- **Examples** - Show, don't just tell
- **Structure** - Use headings and lists
- **Complete** - Cover all scenarios
- **Accurate** - Test all examples

### Documentation Files

When to update each file:

- **README.md** - Overview, quick start, key features
- **POST_GUIDE.md** - Anything about writing posts
- **FORK_SETUP.md** - Setup and configuration
- **THEME_CONFIG.md** - Theme customization
- **IMAGE_GUIDE.md** - Image usage
- **DEPLOYMENT.md** - Deployment instructions

## 🌟 Recognition

Contributors will be:
- Listed in release notes
- Mentioned in the README (for significant contributions)
- Credited in commit messages

## 📬 Questions?

- **General questions**: Open a discussion
- **Bug reports**: Open an issue
- **Feature ideas**: Open an issue
- **Security concerns**: Email (see SECURITY.md if exists)

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing! Every contribution, no matter how small, helps make this project better. 🙏
