# Ah-Slap! — MVP Architecture & Design Guide

This document explains the architectural design of the **Ah-Slap!** MVP skeleton, why each technology choice was made in alignment with `HLD.docx`, the specific bugs and team-workflow traps resolved in this structure, and the step-by-step Ubuntu server deployment and 6-day team execution plan.

---

## 1. System Architecture Overview

Both local development and the Ubuntu faculty server use the **exact same single-origin request model**: the browser loads the React SPA from `/` and calls relative `/api/...` endpoints. Never hardcode `localhost` or server IP addresses inside React components.

```mermaid
flowchart LR
    Browser["Client Browser (Technion Wi-Fi / VPN)"] -- "HTTP Port 80" --> Nginx

    subgraph Ubuntu["Faculty Ubuntu Server (Main Server)"]
        Nginx["Nginx Reverse Proxy (:80)"]
        Static["/var/www/ah-slap/html (Compiled React SPA)"]
        Node["Node.js + Express 5 API (127.0.0.1:3001 via PM2)"]
        PG[("PostgreSQL 16 (127.0.0.1:5432)")]

        Nginx -- "GET /*" --> Static
        Nginx -- " /api/* " --> Node
        Node -- "pg Pool (SQL)" --> PG
    end
```

### Why This Design Fits Your HLD & Future Sprints
1. **Direct Match with HLD Section 2.2 (Deployment Diagram):** The Web Server (Nginx serving React), Application Server (Node.js/Express), and Database (PostgreSQL) all reside inside your Main Server execution environment, while keeping PostgreSQL (`5432`) and Node.js (`3001`) bound strictly to `127.0.0.1` so they are never exposed directly to the network.
2. **Zero-Diff Local vs. Production Routing:**
   - **Locally:** `client/vite.config.ts` proxies `/api` to `http://127.0.0.1:3001`.
   - **On Ubuntu:** `deploy/nginx-ahslap.conf` proxies `/api/` to `http://127.0.0.1:3001`.
   - **Post-MVP:** If you later add a domain name or HTTPS certificate via Certbot on Nginx, **zero lines of frontend or backend code change**.
3. **Clean Separation of `app.ts` vs. `index.ts`:**
   - `server/src/app.ts` builds the Express application, mounts routes, and registers global error handling without opening a network port.
   - `server/src/index.ts` starts the HTTP listener.
   - Integration tests (`server/tests/*.test.ts`) import `app` directly into Supertest with zero risk of port collisions.

---

## 2. Database Choice: Self-Hosted PostgreSQL

**Selected Database:** **PostgreSQL**, hosted directly on your Ubuntu faculty server and accessed via `pg` (`node-postgres`).

### Why PostgreSQL Wins Over Firebase, MySQL, and SQLite
- **Relational Domain Model:** *Ah-Slap!* links `users`, `communities`, `community_memberships` (`pending` / `approved` / `banned` / `admin`), `ride_offers`, `ride_requests`, and `complaints`. Foreign keys and relational constraints guarantee data integrity automatically.
- **Concurrency & Race-Condition Safety (HLD Risk 5):** When two riders simultaneously try to claim the last seat on an offered ride, PostgreSQL ACID transactions (`BEGIN` ... `SELECT ... FOR UPDATE` ... `COMMIT`) prevent double-booking—something file-locked databases like SQLite or client-driven NoSQL setups struggle with.
- **Geospatial Readiness (HLD Risk 1):** Post-MVP, enabling PostgreSQL's **PostGIS** extension gives you radius and route-proximity queries directly in SQL without migrating databases.
- **Zero Cost & Campus Network Autonomy:** Unlike Firebase (which HLD Section 2.1 already rejected for chat due to Google vendor lock-in and read/write billing spikes), local PostgreSQL requires no external internet/cloud firewall rules and costs nothing.

| Option | Verdict | Key Pros | Key Cons for *Ah-Slap!* |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | **Chosen** | Free on Ubuntu; ACID row locking (Risk 5); PostGIS for future route matching (Risk 1); matches HLD 2.2 | Needs simple SQL schema files (`db/init.sql`) |
| **Firebase** | Rejected | Fast cloud setup; built-in auth | Poor fit for relational joins & multi-filter ride feeds; vendor lock-in & usage cost spikes; external cloud dependency |
| **MySQL** | Viable runner-up | Familiar SQL; free to self-host | Weaker spatial ecosystem than PostGIS; fewer rich types (`JSONB`, native arrays) |
| **SQLite** | Rejected | Single local file | Database-level write locking conflicts with concurrent ride matching (Risk 5) |

---

## 3. Key Fixes & Engineering Decisions in This Skeleton

Compared to a naive starter setup, this skeleton resolves **8 concrete bugs and team-workflow traps**:

1. **Aligned Express 5 Runtime & TypeScript Types (`server/package.json` + `server/src/app.ts`)**
   - Pairing `express@4` with `@types/express@5` causes `TS2769` return-type errors and leaves rejected promises in `async` route handlers uncaught (crashing Node 22).
   - **Fix:** Uses `express@^5.1.0` alongside `@types/express@^5.0.1` plus a centralized error-handling middleware in `app.ts`. Express 5 automatically catches rejected promises in `async` handlers and routes them cleanly to the error middleware.
2. **Standardized `camelCase` JSON Contract (`server/src/types/user.ts` & `client/src/services/api.ts`)**
   - Mixing PostgreSQL `snake_case` (`full_name`) with frontend `camelCase` (`fullName`) causes `undefined` UI bugs during integration.
   - **Fix:** All API request and response interfaces (`UserDto`, `RegisterUserRequest`, `LoginUserRequest`) strictly use `camelCase`. SQL queries alias columns explicitly (`SELECT full_name AS "fullName", created_at AS "createdAt"`).
3. **Working `ts-jest` + Clean `dist/` Builds (`server/jest.config.js` & `server/tsconfig.json`)**
   - Without `jest.config.js`, Jest fails to parse TypeScript `import` statements; meanwhile putting `tests/` outside `src/` normally triggers `TS6059` (`File is not under rootDir`).
   - **Fix:** `server/jest.config.js` configures `ts-jest` with `rootDir: '.'` for test execution while `server/tsconfig.json` keeps `rootDir: "src"` and excludes `*.test.ts` so `npm run build` outputs a clean `dist/index.js`. `health.test.ts` also closes `pool.end()` in `afterAll` so Jest never hangs.
4. **Real PostgreSQL Service Container & Lockfile Safety in GitHub Actions (`.github/workflows/ci.yml`)**
   - **Fix:** Spins up `postgres:16` in CI, runs `npm run db:init` (`server/src/scripts/initDb.ts`, which works identically on Windows, macOS, and Linux without needing `psql` in `PATH`), runs Supertest against a real test database, triggers on both `push` and `pull_request` to `develop`/`main` (per HLD 2.3), and falls back gracefully to `npm install` until `package-lock.json` is committed.
5. **Vitest + React Testing Library for Vite (`client/vite.config.ts`)**
   - Configuring legacy Jest with Vite ESM + TypeScript JSX is brittle. **Vitest** shares `vite.config.ts` natively while providing the exact same `describe` / `it` / `expect` + `@testing-library/jest-dom` syntax specified in HLD Section 2.3.
6. **Shared `/var/www/ah-slap` Server Layout Instead of `/home/<username>` (`deploy/`)**
   - Deploying inside one student's `/home/<username>` breaks Nginx with `403 Forbidden` when Ubuntu `umask` restricts directory permissions on rebuilds, and blocks other teammates from pulling code or restarting the app under their own SSH accounts.
   - **Fix:** Keeps the repo in `/var/www/ah-slap/repo` and publishes static builds to `/var/www/ah-slap/html` (`chmod -R 755`) under a shared Linux group.
7. **Database Ownership Safety**
   - Creating the DB with `CREATE DATABASE ahslap_db OWNER ahslap_user;` guarantees `ahslap_user` owns the `public` schema and tables even if an admin command is ever run as `postgres`.
8. **Explicit Ubuntu Firewall (`ufw`) Check**
   - Opens port `80` (`Nginx HTTP`) so faculty Wi-Fi/VPN clients are not silently blocked by Ubuntu's firewall.

---

## 4. MVP Scope Design & Post-MVP Evolution

### Current 6-Day MVP Scope (User Story 15: Tasks C1 & C2)
- **Task C1 (`RegisterPage.tsx` + `POST /api/users`):** Validates user details (`fullName`, `email`, `phone`, optional `password`), inserts into `users`, and handles duplicate emails (`409 Conflict`).
- **Task C2 (`LoginPage.tsx` + `POST /api/users/login`):** Verifies the user's credentials against PostgreSQL and redirects to `/dashboard` (`DashboardPage.tsx`).
- **Password Recommendation (~5 extra lines):** `bcryptjs` is already pre-installed in `server/package.json`. Hashing a password on registration (`bcrypt.hash(password, 10)`) and verifying it on login (`bcrypt.compare(password, row.password_hash)`) takes ~10 minutes, requires **no JWTs, cookies, or session middleware yet**, and satisfies Task C2's HLD acceptance criterion (*"verifies the credentials"*).

### How This Evolves Next Sprint Without Refactoring
- When you add full authentication post-MVP, only `server/src/routes/users.ts` (issuing a JWT/cookie) and a new `server/src/middleware/auth.ts` file need to be added—your database table, React pages, Nginx proxy, and CI pipeline stay untouched.

---

## 5. Step-by-Step Ubuntu Faculty Server Setup Guide

### Step 1: Connect Over Faculty Wi-Fi or Technion VPN
```bash
ssh <your-username>@<server-ip-or-hostname>
```

### Step 2: Install System Packages, Node.js 22 LTS, PostgreSQL, Nginx, and PM2
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx postgresql postgresql-contrib curl ufw

# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Verify versions
node -v && npm -v && psql --version && nginx -v
```

### Step 3: Create the PostgreSQL User & Database (With Proper Ownership)
```bash
sudo -u postgres psql
```
Inside the `psql` prompt (replace `CHOOSE_STRONG_PASSWORD`):
```sql
CREATE USER ahslap_user WITH PASSWORD 'CHOOSE_STRONG_PASSWORD';
CREATE DATABASE ahslap_db OWNER ahslap_user;
\q
```

### Step 4: Create a Shared Team Directory in `/var/www/ah-slap`
So multiple DevOps teammates can deploy without `/home/<user>` permission conflicts:
```bash
sudo groupadd -f ahslap
sudo usermod -aG ahslap $USER
# (Repeat `sudo usermod -aG ahslap <teammate-username>` for any other teammate who deploys)

sudo mkdir -p /var/www/ah-slap/html
sudo chown -R $USER:ahslap /var/www/ah-slap
sudo chmod -R 2775 /var/www/ah-slap
```
*(Log out with `exit` and SSH back in once so your new `ahslap` group membership takes effect.)*

### Step 5: Clone Repository, Configure `.env`, and Run Initial Build
```bash
git clone <your-github-repo-url> /var/www/ah-slap/repo
cd /var/www/ah-slap/repo

cp server/.env.example server/.env
nano server/.env
# Set DATABASE_URL=postgres://ahslap_user:CHOOSE_STRONG_PASSWORD@127.0.0.1:5432/ahslap_db
# Save in nano: Ctrl+O, Enter, Ctrl+X

chmod +x deploy/deploy.sh
./deploy/deploy.sh main
```

### Step 6: Persist PM2 Across Server Reboots
```bash
pm2 save
pm2 startup
# Copy and run the single `sudo env PATH=...` command that PM2 prints
```

### Step 7: Configure Nginx & Open Firewall Port 80
```bash
sudo cp /var/www/ah-slap/repo/deploy/nginx-ahslap.conf /etc/nginx/sites-available/ahslap
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/ahslap /etc/nginx/sites-enabled/ahslap

sudo nginx -t
sudo systemctl restart nginx

# Ensure SSH and HTTP (Port 80) are allowed if UFW is active
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx HTTP'
sudo ufw status
```

### Step 8: Test From Any Laptop on Faculty Wi-Fi or VPN
1. Open `http://<server-ip-or-hostname>/api/health` → expect `{"status":"ok","db":"connected"}`.
2. Open `http://<server-ip-or-hostname>` → expect the **Ah-Slap! — Log In** page.

### Future Redeploys (1 Command!)
Whenever new PRs are merged into `develop` or `main`:
```bash
/var/www/ah-slap/repo/deploy/deploy.sh main
```

---

## 6. 6-Day Work Division for 8 Teammates (4 Pairs)

| Day | Pair A: DevOps & Ubuntu Server | Pair B: Backend & PostgreSQL | Pair C: Frontend Pages & Styling | Pair D: API Integration & Automated Tests |
| :--- | :--- | :--- | :--- | :--- |
| **Day 1** | Create GitHub repo (`main` + `develop`); run `npm install` in `server/` & `client/`, commit lockfiles, verify green CI; test SSH into Ubuntu server | Set up local PostgreSQL; verify `npm run db:init` & `GET /api/health`; agree with Pair D on password vs. email-only MVP check | Run Vite locally; design shared form styles in `index.css` or CSS modules for auth cards | Create GitHub Issues for C1, C2, Dashboard, Server Setup; verify `npm test` works in `server/` and `client/` |
| **Day 2** | Complete Ubuntu setup Steps 1–8; **get `/api/health` and skeleton UI live on campus Wi-Fi** | Implement `POST /api/users` (Task C1) with validation, lowercase email normalization, and `23505` duplicate check | Build `RegisterPage.tsx` UI & client-side input validation (Task C1) | Implement `registerUser` & `loginUser` inside `client/src/services/api.ts` |
| **Day 3** | Enable GitHub branch protection on `main` & `develop` (require PR review + green CI) | Implement `POST /api/users/login` (Task C2) and manually verify with `curl` | Build `LoginPage.tsx` (Task C2) and `DashboardPage.tsx` welcome + logout UI | Write Supertest integration tests for `POST /api/users` and `POST /api/users/login` |
| **Day 4** | Review PRs into `develop` and run `./deploy/deploy.sh develop` on Ubuntu server | Fix backend review feedback & edge cases | Connect `RegisterPage` & `LoginPage` forms to `api.ts` (loading + error banners) | Connect `sessionStorage` user state + `/dashboard` redirect/logout + Vitest form tests |
| **Day 5** | Redeploy updated `develop`; verify `pm2 logs` and Nginx behavior | Bug fixes *(Optional stretch: seeded `GET /api/communities` endpoint)* | Responsive/UI polish *(Optional stretch: display read-only communities list on Dashboard)* | Full end-to-end QA from multiple laptops & phones on Technion Wi-Fi / VPN |
| **Day 6** | **Code freeze:** PR `develop` → `main`, run `./deploy/deploy.sh main`, tag `v0.1.0-mvp` | Final check of DB seed script & `README.md` | Final visual verification on live server URL | Rehearse live course demo (`Register → Login → Dashboard → Logout`) |
