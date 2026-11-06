import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
const app = new Hono();

// ── Cross-origin embedding for public static assets ──
// secureHeaders() defaults Cross-Origin-Resource-Policy to same-origin, which
// makes browsers refuse to paint our files inside pages on other domains. Sites
// that link here scrape the right og:image URL but still render a broken image,
// because the block happens at display time, not fetch time. These assets are
// public, so opt them into cross-origin embedding; HTML and /api keep the
// stricter default.
//
// Registered before secureHeaders() so this runs last on the way out and wins.
const EMBEDDABLE_ASSET = /\.(?:avif|gif|ico|jpe?g|png|svg|webmanifest|webp)$/i;

app.use('*', async (c, next) => {
    await next();
    if (EMBEDDABLE_ASSET.test(c.req.path)) {
        c.res.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
});

// ── Security headers ──
app.use('*', secureHeaders());

// ── CORS: restrict to known origins ──
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3001'];

app.use('*', cors({
    origin: (origin) => {
        if (!origin) return allowedOrigins[0]; // same-origin requests
        return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    },
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 86400,
}));

app.post('/api/generate-character', (c) => c.json({
    error: 'Hero creation now runs in your browser. Refresh the game to use your photo.',
}, 410));

app.get('/health', (c) => c.json({ status: 'ok' }));

// ── index.html with request-derived absolute URLs ──
// The og:/twitter: preview tags need absolute URLs, but the deployed domain
// isn't known at build time. Template the real origin in at serve time so
// link previews are correct on any domain (Railway default, custom, etc.).
const FALLBACK_ORIGIN = 'https://selfiethespire.com';
let indexTemplate: string | null = null;

function serveIndex(c: Context) {
    try {
        if (indexTemplate === null) {
            // Same base as serveStatic's root: paths resolve from server/
            indexTemplate = readFileSync('../dist/index.html', 'utf8');
        }
        const proto = c.req.header('x-forwarded-proto')?.split(',')[0]?.trim() || 'https';
        const host = c.req.header('host');
        const html = host
            ? indexTemplate.replaceAll(FALLBACK_ORIGIN, `${proto}://${host}`)
            : indexTemplate;
        c.header('Cache-Control', 'no-cache');
        return c.html(html);
    } catch {
        // dist not built (dev mode) — vite serves the client itself
        return c.notFound();
    }
}

// Serve the built client in production
app.get('/', serveIndex);
app.get('/index.html', serveIndex);
app.use('/*', serveStatic({ root: '../dist' }));
app.get('/*', serveIndex);

const port = parseInt(process.env.PORT || '3001', 10);

serve({ fetch: app.fetch, port }, (info) => {
    console.log(`Server running on http://localhost:${info.port}`);
});
