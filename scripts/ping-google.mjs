/**
 * Sitemap Validation & SEO Health Check Script
 *
 * Run after deployment to validate SEO artifacts are correct.
 * Usage: node scripts/ping-google.mjs
 *
 * Note: Google deprecated the sitemap ping API in June 2023.
 * The only way to request indexing now is through Google Search Console UI
 * or the Indexing API (requires setup). This script validates everything
 * is correct so Google can discover changes naturally.
 *
 * @see https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping
 */

const SITE_URL = 'https://kimmandoo.vercel.app';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

let hasErrors = false;

function error(msg) {
  hasErrors = true;
  console.log(`❌ ${msg}`);
}

async function validateSitemap() {
  console.log('🔎 Validating sitemap...');
  console.log(`   URL: ${SITEMAP_URL}\n`);

  try {
    const res = await fetch(SITEMAP_URL);
    const contentType = res.headers.get('content-type') || '';
    const body = await res.text();

    // Status
    if (res.status !== 200) {
      error(`Sitemap returned HTTP ${res.status} — Google will not process this.`);
      return;
    }
    console.log(`✅ HTTP ${res.status}`);

    // Content-Type
    if (contentType.includes('xml')) {
      console.log(`✅ Content-Type: ${contentType}`);
    } else {
      error(`Content-Type is "${contentType}" — expected application/xml. Google may reject this.`);
    }

    // XML structure
    if (!body.trimStart().startsWith('<?xml')) {
      error('Sitemap does not start with <?xml declaration.');
    }
    if (!body.includes('<urlset')) {
      error('Sitemap missing <urlset> root element.');
    }
    if (!body.includes('</urlset>')) {
      error('Sitemap missing closing </urlset> — XML may be truncated.');
    }

    // Count URLs
    const urlCount = (body.match(/<loc>/g) || []).length;
    console.log(`✅ ${urlCount} URLs found`);

    if (urlCount === 0) {
      error('Sitemap contains zero URLs!');
    }
    if (urlCount > 50000) {
      error(`Sitemap has ${urlCount} URLs — exceeds the 50,000 limit. Use a sitemap index.`);
    }

    // Size check (50MB limit)
    const sizeKB = body.length / 1024;
    console.log(`✅ Size: ${sizeKB.toFixed(1)} KB`);
    if (body.length > 50 * 1024 * 1024) {
      error('Sitemap exceeds 50MB limit.');
    }

    // Validate lastmod format (should be W3C Datetime)
    const lastmods = body.match(/<lastmod>([^<]+)<\/lastmod>/g) || [];
    let badDateCount = 0;
    for (const lm of lastmods) {
      const date = lm.replace(/<\/?lastmod>/g, '');
      if (isNaN(Date.parse(date))) {
        badDateCount++;
      }
    }
    if (badDateCount > 0) {
      error(`${badDateCount} URLs have invalid lastmod dates.`);
    } else {
      console.log(`✅ All ${lastmods.length} lastmod dates are valid`);
    }

    // Check for duplicate URLs
    const locs = (body.match(/<loc>([^<]+)<\/loc>/g) || []).map(l => l.replace(/<\/?loc>/g, ''));
    const uniqueLocs = new Set(locs);
    if (locs.length !== uniqueLocs.size) {
      error(`Sitemap has ${locs.length - uniqueLocs.size} duplicate URLs.`);
    } else {
      console.log('✅ No duplicate URLs');
    }

    // Verify all URLs belong to the same domain
    const foreignUrls = locs.filter(u => !u.startsWith(SITE_URL));
    if (foreignUrls.length > 0) {
      error(`${foreignUrls.length} URLs don't belong to ${SITE_URL}`);
    }

  } catch (err) {
    error(`Failed to fetch sitemap: ${err.message}`);
  }
}

async function validateRobots() {
  console.log('\n🤖 Validating robots.txt...');

  try {
    const res = await fetch(`${SITE_URL}/robots.txt`);
    const body = await res.text();

    if (res.status !== 200) {
      error(`robots.txt returned HTTP ${res.status}`);
      return;
    }

    // Check Sitemap directive
    if (body.includes(`Sitemap: ${SITEMAP_URL}`)) {
      console.log('✅ Sitemap directive present and correct');
    } else if (body.includes('Sitemap:')) {
      const sitemapLine = body.split('\n').find(l => l.startsWith('Sitemap:'));
      error(`Sitemap directive points to wrong URL: ${sitemapLine}`);
    } else {
      error('No Sitemap directive found in robots.txt');
    }

    // Check for accidental blocking
    const lines = body.split('\n').map(l => l.trim());
    const disallowRoot = lines.some(l => l === 'Disallow: /');
    if (disallowRoot) {
      error('robots.txt has "Disallow: /" — this blocks ALL crawlers!');
    } else {
      console.log('✅ No blanket Disallow rules');
    }

    // Check Googlebot is allowed
    const hasGooglebot = body.toLowerCase().includes('googlebot');
    if (hasGooglebot) {
      console.log('✅ Googlebot-specific rules present');
    }

  } catch (err) {
    error(`Failed to fetch robots.txt: ${err.message}`);
  }
}

async function validateSamplePages() {
  console.log('\n📄 Validating sample pages...');

  const pagesToCheck = [
    { url: SITE_URL, label: 'Homepage' },
    { url: `${SITE_URL}/sitemap.xml`, label: 'Sitemap' },
  ];

  for (const { url, label } of pagesToCheck) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      
      if (res.status !== 200) {
        error(`${label} (${url}) returned HTTP ${res.status}`);
        continue;
      }

      const body = await res.text();

      // Check for meta noindex
      const hasMetaNoindex = body.match(/<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i);
      if (hasMetaNoindex) {
        error(`${label} has <meta name="robots" content="noindex">!`);
      }

      // Check for X-Robots-Tag header (only a problem for content pages)
      const xRobotsTag = res.headers.get('x-robots-tag');
      if (xRobotsTag?.includes('noindex') && label !== 'Sitemap') {
        error(`${label} has X-Robots-Tag: noindex header`);
      }

      // Check canonical
      if (label === 'Homepage') {
        const canonical = body.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
        if (canonical) {
          console.log(`✅ ${label}: canonical → ${canonical[1]}`);
        } else {
          console.log(`⚠️  ${label}: no canonical link found`);
        }
      }

      // Check for JSON-LD
      if (body.includes('application/ld+json')) {
        console.log(`✅ ${label}: JSON-LD structured data present`);
      }

    } catch (err) {
      error(`${label} check failed: ${err.message}`);
    }
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  SEO Health Check — ' + new Date().toISOString());
  console.log('  Site: ' + SITE_URL);
  console.log('═══════════════════════════════════════════════\n');

  await validateSitemap();
  await validateRobots();
  await validateSamplePages();

  console.log('\n═══════════════════════════════════════════════');
  if (hasErrors) {
    console.log('⚠️  Issues found. Fix the above errors for better SEO.');
  } else {
    console.log('✅ All checks passed!');
  }
  console.log('═══════════════════════════════════════════════');

  console.log('\n📌 Manual steps for Google Search Console:');
  console.log('   1. Open: https://search.google.com/search-console');
  console.log('   2. Go to "Sitemaps" → Delete old entry → Re-submit sitemap');
  console.log('   3. Go to "URL Inspection" → Paste each key URL');
  console.log('   4. Click "Request Indexing" for each important page');
  console.log('   5. Check "Pages" report for "Discovered - not indexed" errors');
  console.log('');
  console.log('💡 Tip: After deploying this update, re-submit the sitemap');
  console.log('   in Search Console. The new structured data (JSON-LD) and');
  console.log('   improved robots.txt should help Google crawl your site.\n');
}

main();
