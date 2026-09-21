# NoLoginNotepad — Fast, Free Online Notepad (Ready for GitHub & Cloudflare)

A fast, distraction-free, 100% private online notepad with instant local IndexedDB autosaving, Markdown support, realistic notebook stationery, and offline PWA capabilities—without any accounts, logins, or tracking.

---

## 🚀 Quick Launch Guide (GitHub + Cloudflare Pages + Custom Domain)

### Step 1: Push Code to GitHub
1. Open your terminal or Git GUI in this project directory.
2. Initialize and push to your new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial launch: NoLoginNotepad with pSEO and Cloudflare optimization"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

### Step 2: Deploy to Cloudflare Pages
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left menu, go to **Workers & Pages** &rarr; **Create application** &rarr; **Pages** &rarr; **Connect to Git**.
3. Select your GitHub repository.
4. Set the build configurations:
   - **Framework preset:** `Next.js` (or `Next.js (Static HTML Export)`)
   - **Build command:** `npm run build`
   - **Build output directory:** `.next` (or `out` if using static export)
   - **Root directory:** `/` (default)
   - **Environment variable (optional):**
     - `NODE_VERSION`: `20`
5. Click **Save and Deploy**.
   > **Note on "bun.lock" issues:** The problematic `bun.lock` file has been completely removed and excluded in `.gitignore`, and `.npmrc` has been added. Cloudflare will now use clean Node.js / npm without any package manager conflicts.

### Step 3: Connect Your Custom Domain
1. In Cloudflare Pages, navigate to your project &rarr; **Custom domains**.
2. Click **Set up a custom domain**.
3. Enter your domain name (e.g. `yournotepad.com` or `pad.yourdomain.com`).
4. Cloudflare will automatically provision SSL/TLS certificates and route global CDN traffic with zero downtime.

---

## 🔒 Security & Anti-Theft Protections

1. **100% Client-Side Local Storage (IndexedDB + LocalStorage):**
   - No user notes or text are ever transmitted to any remote server or third-party database.
   - All content lives strictly in the user's browser storage.
2. **HTTP Security Headers (`_headers` and `next.config.ts`):**
   - `Content-Security-Policy`: Restricts unauthorized external scripts, protecting against XSS and data exfiltration.
   - `X-Frame-Options: SAMEORIGIN`: Protects against clickjacking and malicious iframe embedding.
   - `X-Content-Type-Options: nosniff`: Prevents MIME-type confusion attacks.
   - `Strict-Transport-Security (HSTS)`: Enforces encrypted HTTPS connections.
   - `Permissions-Policy`: Blocks camera, microphone, and geolocation exploitation.
3. **Fingerprint & Source Obfuscation:**
   - `poweredByHeader: false` prevents attackers from probing server framework versions.
   - `productionBrowserSourceMaps: false` hides raw source code mappings in production.

---

## 📈 Advanced Programmatic SEO (pSEO) & High-Search Keywords

NoLoginNotepad includes dedicated, statically generated high-volume keyword landing pages:

- `/online-notepad` (and `/online-notepad.html` or `.php`)
- `/notepad-no-login` (and `/notepad-no-login.html` or `.php`)
- `/markdown-notepad` (and `/markdown-notepad.html` or `.php`)
- `/distraction-free-editor` (and `/distraction-free-editor.html` or `.php`)
- `/offline-notepad` (and `/offline-notepad.html` or `.php`)
- `/ruled-paper-notepad` (and `/ruled-paper-notepad.html` or `.php`)
- `/quick-scratchpad` (and `/quick-scratchpad.html` or `.php`)
- `/free-text-editor` (and `/free-text-editor.html` or `.php`)

### URL Rewrites for `.html` and `.php`
Configured via `next.config.ts`:
- Visiting `/notepad.html`, `/index.html`, `/notepad.php`, or `/index.php` seamlessly routes to `/`.
- Visiting any `/:slug.html` or `/:slug.php` seamlessly serves the corresponding SEO landing page.

### Sitemap & Search Engine Indexing
- Dynamic sitemap generated at `/sitemap.xml`.
- Search crawler directives at `/robots.txt`.
- Schema.org JSON-LD structured data (`WebApplication` and `FAQPage`) on every page for rich Google Search snippet eligibility.

---

## 🧹 Privacy & Clean Data Control
- **Clean / Delete All History, Notes & Settings:** A one-click factory reset feature accessible via the Top Toolbar, Settings modal (Danger Zone), and Sidebar footer. It completely purges all IndexedDB stores, wipes browser localStorage cache, and resets preferences, with an optional one-click JSON backup before clearing.

---

## 📚 Complete Launch & SEO Blueprint
For in-depth deployment steps and a detailed checklist to rank on page 1 of Google and Bing, see [`LAUNCH_AND_SEO_GUIDE.md`](./LAUNCH_AND_SEO_GUIDE.md).
