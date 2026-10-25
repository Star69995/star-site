// Generates the static, crawler-readable view of the site from projects.json and the
// links API (the same sources script.js uses at runtime). Run by the GitHub Action in
// .github/workflows/seo.yml - no need to run it by hand. Node 18+, no dependencies.
//
// Writes: llms.txt, sitemap.xml, robots.txt, and the block between the SEO markers
// in index.html (JSON-LD + <noscript> list).

const fs = require('fs');

const SITE = 'https://star69995.github.io/star-site/';
const API = 'https://star-projects-home.star69995.workers.dev';
const EXCLUDED_NAMES = ['האתר של סטאר']; // keep in sync with script.js

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const abs = p => SITE + encodeURI(p);

async function getJson(url) {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    return res.json();
}

async function loadExternal(skipNames) {
    const data = await getJson(`${API}/api/links`);
    const sections = (data.sections ?? [])
        .map(s => ({
            name: s.name,
            links: s.links.filter(l => !EXCLUDED_NAMES.includes(l.name) && !skipNames.includes(l.name)),
        }))
        .filter(s => s.links.length);
    // Same fallback as the page: the target site's own description when none was typed in.
    await Promise.all(sections.flatMap(s => s.links).filter(l => !l.description).map(async l => {
        try {
            const t = await getJson(`${API}/api/thumbnail?url=${encodeURIComponent(l.url)}`);
            l.description = t.description || '';
        } catch { /* leave empty */ }
    }));
    return sections;
}

async function main() {
    const local = JSON.parse(fs.readFileSync('projects.json', 'utf8'));
    const groups = [
        { name: 'עבודות JavaScript', items: local['js-projects'].map(p => ({ name: p.title, description: p.description, url: abs(p.path) })) },
        { name: 'עבודות HTML ו-CSS', items: local['css-projects'].map(p => ({ name: p.title, description: p.description, url: abs(p.path) })) },
    ];

    // If the API is down, keep the previous external list rather than dropping it.
    let external = null;
    try {
        external = await loadExternal(local['js-projects'].map(p => p.title));
    } catch (e) {
        console.warn('Links API unavailable:', e.message);
        if (fs.existsSync('.seo-external.json')) external = JSON.parse(fs.readFileSync('.seo-external.json', 'utf8'));
    }
    if (external) {
        fs.writeFileSync('.seo-external.json', JSON.stringify(external, null, 2) + '\n');
        groups.unshift(...external.map(s => ({
            name: s.name,
            items: s.links.map(l => ({ name: l.name, description: l.description, url: l.url })),
        })));
    }

    // llms.txt
    const llms = [
        '# האתר של סטאר',
        '',
        '> תיק העבודות של סטאר - פרויקטי קוד, עיצוב וחוויית משתמש.',
        '',
        ...groups.flatMap(g => [
            `## ${g.name}`,
            '',
            ...g.items.map(i => `- [${i.name}](${i.url})${i.description ? `: ${i.description.replace(/\s+/g, ' ').trim()}` : ''}`),
            '',
        ]),
    ].join('\n');
    fs.writeFileSync('llms.txt', llms);

    // sitemap.xml (only pages on this site)
    const urls = [SITE, ...groups.flatMap(g => g.items.map(i => i.url)).filter(u => u.startsWith(SITE) && u !== SITE)];
    fs.writeFileSync('sitemap.xml',
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        urls.map(u => `  <url><loc>${esc(u)}</loc></url>`).join('\n') + '\n</urlset>\n');

    fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);

    // index.html block
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'האתר של סטאר - פרויקטים',
        itemListElement: groups.flatMap(g => g.items).map((i, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: i.name,
            url: i.url,
            ...(i.description ? { description: i.description } : {}),
        })),
    };
    const noscript = '<noscript>\n' + groups.map(g =>
        `<h2>${esc(g.name)}</h2>\n<ul>\n` +
        g.items.map(i => `<li><a href="${esc(i.url)}">${esc(i.name)}</a>${i.description ? ' - ' + esc(i.description) : ''}</li>`).join('\n') +
        '\n</ul>').join('\n') + '\n</noscript>';

    let html = fs.readFileSync('index.html', 'utf8');
    const replaceBlock = (name, body) => {
        const re = new RegExp(`(<!-- ${name}:start -->)[\\s\\S]*?(<!-- ${name}:end -->)`);
        if (!re.test(html)) throw new Error(`marker ${name} missing in index.html`);
        html = html.replace(re, (_, a, b) => `${a}\n${body}\n${b}`);
    };
    replaceBlock('seo-head', `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2).replace(/</g, '\\u003c')}\n</script>\n<link rel="alternate" type="text/plain" href="llms.txt">`);
    replaceBlock('seo-body', noscript);
    fs.writeFileSync('index.html', html);
}

main().catch(e => { console.error(e); process.exit(1); });
