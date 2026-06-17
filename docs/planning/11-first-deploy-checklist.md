# First Public Deployment Checklist

This document details the checklist and requirements for deploying the current in-memory MVP of the Legal Prospecting application.

## 1. Zero External Dependencies & Variables

- **Environment Variables**: The current application has **zero** environment variable requirements (`.env` or similar). All seed data is stored in-memory inside `src/data/prospects.ts` and resolved by client-side logic.
- **Database Connection**: There is no database or Prisma engine running in this build.
- **Auth Provider**: There is no active identity provider (Clerk, custom cookies, etc.) configured yet.

Hence, the app can be built and deployed without configuring any secrets or environment keys on the host provider.

---

## 2. Deployment Steps

You can deploy this Next.js App Router application to platforms like **Vercel** or **Netlify** using these steps:

### Vercel (Recommended)
1. Commit all files to a GitHub/GitLab/Bitbucket repository.
2. Log in to [Vercel](https://vercel.com) and import the repository.
3. Vercel will auto-detect **Next.js** as the framework.
4. Leave the **Build Command** (`next build`), **Output Directory** (`.next`), and **Install Command** (`npm install`) on their default settings.
5. Leave the **Environment Variables** panel empty.
6. Click **Deploy**.

### Netlify
1. Log in to Netlify and select **Import an existing project** from your Git provider.
2. Set the build command to `npm run build` and publish directory to `.next`.
3. Click **Deploy**.

---

## 3. Pre-flight Verification Checklist (Run by Human)

Before triggering a public git push or build, ensure the following commands run successfully on your local machine:

- [ ] **Run Unit Tests**:
  ```bash
  npm run test
  ```
  All tests in `src/utils/prospectMatcher.test.ts` should pass.

- [ ] **Run Production Build**:
  ```bash
  npm run build
  ```
  Ensure Next.js compilation completes without errors, and no TypeScript or ESLint warnings block the build.

- [ ] **Check Client-side Functionality**:
  ```bash
  npm run dev
  ```
  Open `http://localhost:3000` and:
  - Search `19103` (verify sample prospects load).
  - Try saving/unsaving prospects (verify counter badge updates and emerald border renders).
  - Expand/collapse details (verify ARIA attributes update and UI toggles successfully).
  - Search an invalid/empty ZIP (verify error messaging renders properly).
