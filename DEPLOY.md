# Arya Kuwar Portfolio — Deployment Guide
## Three paths: GitHub Pages · Netlify · VPS (nginx)

---

## File Structure

```
portfolio/
├── index.html          ← Main HTML (CSP meta tags baked in)
├── css/
│   └── style.css       ← All styles (zero inline styles in HTML)
├── js/
│   └── main.js         ← All JS (zero inline scripts in HTML)
├── _headers            ← Netlify HTTP headers (auto-applied)
├── nginx.conf          ← nginx config for VPS deployment
└── DEPLOY.md           ← This file
```

---

## OPTION 1 — GitHub Pages (Free, Easiest)

### Step 1 — Create the repository
```bash
# On GitHub: create a new repo named:
#   ArYa-KuWaR.github.io          (for username root URL)
#   OR any name for  ArYa-KuWaR.github.io/reponame

git init
git add .
git commit -m "feat: initial portfolio deploy"
git remote add origin https://github.com/ArYa-KuWaR/ArYa-KuWaR.github.io.git
git push -u origin main
```

### Step 2 — Enable GitHub Pages
1. Go to your repo → Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: **main** / root (`/`)
4. Click Save
5. Your site will be live at `https://arya-kuwar.github.io` within ~60 seconds

### Step 3 — Update the OG URL in index.html
Find this line and update it to your actual URL:
```html
<meta property="og:url" content="https://arya-kuwar.github.io">
```

### ⚠️ GitHub Pages Security Limitation
GitHub Pages **cannot set custom HTTP headers** — the CSP is delivered via the
`<meta>` tag in index.html instead, which still blocks XSS, framing, and injection.
This is the standard approach for Pages deployments.

To get full HTTP-level headers, use **Netlify** (Option 2) or **VPS** (Option 3).

---

## OPTION 2 — Netlify (Free tier, Full HTTP headers)

### Step 1 — Deploy
```bash
# Via drag-and-drop (fastest):
# Go to https://app.netlify.com → "Add new site" → "Deploy manually"
# Drag and drop the entire portfolio/ folder

# OR via CLI:
npm install -g netlify-cli
netlify login
netlify deploy --dir . --prod
```

### Step 2 — Custom domain (optional)
1. Netlify dashboard → Domain settings → Add custom domain
2. Follow DNS instructions for your registrar

### Step 3 — Verify headers
After deploy, run:
```
curl -I https://yoursite.netlify.app
```
You should see all headers from `_headers` in the response.

The `_headers` file in the root is **automatically picked up** by Netlify.
No extra configuration needed.

---

## OPTION 3 — VPS / Self-Hosted (nginx)

### Step 1 — Upload files
```bash
scp -r portfolio/ user@yourserver.com:/var/www/portfolio
```

### Step 2 — Install nginx + certbot
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 3 — Apply the nginx config
```bash
# Edit nginx.conf — replace 'yourdomain.com' with your actual domain
sudo cp portfolio/nginx.conf /etc/nginx/sites-available/portfolio
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t        # test config
sudo systemctl reload nginx
```

### Step 4 — Set file permissions
```bash
sudo chown -R www-data:www-data /var/www/portfolio
sudo chmod -R 755 /var/www/portfolio
sudo chmod 644 /var/www/portfolio/index.html
sudo chmod 644 /var/www/portfolio/css/style.css
sudo chmod 644 /var/www/portfolio/js/main.js
```

---

## OPTIONAL — Self-Host Fonts (Maximum Privacy / Zero CDN)

Google Fonts are loaded from `fonts.googleapis.com` and `fonts.gstatic.com`.
To eliminate all third-party requests:

### Step 1 — Download fonts
Visit https://gwfh.mranftl.com/fonts (Google Webfonts Helper) and download:
- **Share Tech Mono** — Regular (400)
- **Rajdhani** — Regular (400), SemiBold (600), Bold (700)
- **Orbitron** — Regular (400), Bold (700), Black (900)

Download as **woff2** format only (modern browsers).

### Step 2 — Place fonts
```
portfolio/
└── assets/
    └── fonts/
        ├── ShareTechMono-Regular.woff2
        ├── Rajdhani-Regular.woff2
        ├── Rajdhani-SemiBold.woff2
        ├── Rajdhani-Bold.woff2
        ├── Orbitron-Regular.woff2
        ├── Orbitron-Bold.woff2
        └── Orbitron-Black.woff2
```

### Step 3 — Replace Google Fonts link in index.html
Remove these lines:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?..." rel="stylesheet">
```

Add this instead (before `<link rel="stylesheet" href="css/style.css">`):
```html
<link rel="stylesheet" href="css/fonts.css">
```

### Step 4 — Create css/fonts.css
```css
@font-face {
  font-family: 'Share Tech Mono';
  src: url('../assets/fonts/ShareTechMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Rajdhani';
  src: url('../assets/fonts/Rajdhani-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Rajdhani';
  src: url('../assets/fonts/Rajdhani-SemiBold.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Rajdhani';
  src: url('../assets/fonts/Rajdhani-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Orbitron';
  src: url('../assets/fonts/Orbitron-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Orbitron';
  src: url('../assets/fonts/Orbitron-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Orbitron';
  src: url('../assets/fonts/Orbitron-Black.woff2') format('woff2');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}
```

### Step 5 — Update CSP (index.html + _headers + nginx.conf)
Remove `https://fonts.googleapis.com` from `style-src`
Remove `https://fonts.gstatic.com` from `font-src`

Updated CSP becomes fully self-contained:
```
default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self';
img-src 'self' data:; connect-src 'none'; frame-ancestors 'none';
base-uri 'self'; form-action 'none'; object-src 'none'; upgrade-insecure-requests;
```

---

## Post-Deploy Security Verification Checklist

Run these after deployment:

### 1. Security Headers
```
https://securityheaders.com/?q=https://yourdomain.com
```
Target score: **A+**

### 2. SSL/TLS Grade
```
https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```
Target grade: **A+**

### 3. CSP Validator
```
https://csp-evaluator.withgoogle.com/
```
Paste your CSP string. Should show no HIGH severity issues.

### 4. Observatory by Mozilla
```
https://observatory.mozilla.org/analyze/yourdomain.com
```
Target score: **A+**

### 5. Manual header check
```bash
curl -I https://yourdomain.com
```
Verify these are present:
- [x] Content-Security-Policy
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Strict-Transport-Security
- [x] Referrer-Policy
- [x] Permissions-Policy

### 6. PageSpeed (performance)
```
https://pagespeed.web.dev/report?url=https://yourdomain.com
```
Target: **90+** on mobile and desktop

---

## Updating the Site

### Add a writeup link
In `index.html`, find the `writeup-links` div in the CTF section:
```html
<a href="https://github.com/ArYa-KuWaR/your-writeup-repo"
   target="_blank"
   rel="noopener noreferrer"
   class="writeup-link">→ Challenge Name</a>
```

### Add a new project
Copy any `<article class="project-card reveal">` block in the projects section
and update the name, description, tags, and GitHub link.

### Push updates (GitHub Pages)
```bash
git add .
git commit -m "update: add new writeup links"
git push
```
GitHub Pages auto-rebuilds within ~30 seconds.

---

## Security Notes for the Paranoid (i.e., You)

1. **Never add `eval()`, `innerHTML`, or `document.write`** to main.js —
   the current CSP will block it, but don't add it anyway.

2. **If you ever add a contact form**, use a third-party service like Formspree
   or EmailJS and update `connect-src` in the CSP accordingly. Never handle
   form submissions server-side on the same origin without CSRF protection.

3. **If you add Google Analytics / any tracking**: update `script-src` and
   `connect-src`. Be aware this relaxes the CSP.

4. **Phone number scraping**: your `tel:+917843062962` link is visible in HTML.
   This is intentional — remove it if you start receiving spam calls.

5. **Dependency zero**: this site has zero npm dependencies, zero build tools,
   zero runtime frameworks. The attack surface is intentionally minimal.
   A static site with no backend is the most secure kind.
