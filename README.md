# TaskMind

- This project focuses on the research, analysis, design, and implementation of a goal management system that leverages artificial intelligence to automatically break down objectives into manageable tasks. The system allows users to input high-level goals, which the AI then analyzes and decomposes into specific steps and actionable items. These are further organized into tasks, enabling users to easily track, manage, and execute their objectives in a structured and efficient manner.

- TaskMind is a full-stack web application built with a **monorepo setup**, combining:

- **Frontend (FE):** [Next.js](https://nextjs.org/) with TypeScript  
- **Backend (BE):** [Django](https://www.djangoproject.com/)  
- **Package Manager:** [pnpm](https://pnpm.io/)  
- **Testing:** Jest (unit tests) + Cucumber (E2E)  
- **Containerization:** Docker & Docker Compose  

---

## 📂 Project Structure

```

capstone/  
├── BE/ # Backend - Django apps (accounts, goals, tasks)  
├── FE/ # Frontend - Next.js app  
│ └── web-ui/ # UI implementation  
├── e2e/ # End-to-end tests (Cucumber + Playwright)  
├── reports/ # Test reports  
├── docker-compose.yml  
├── Dockerfile  
├── package.json  
└── pnpm-lock.yaml

````

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (>= 20)  
- [pnpm](https://pnpm.io/) (>= 10)  
- [Python](https://www.python.org/) (>= 3.10)  
- [Docker](https://www.docker.com/) (optional, for containerized setup)

### 2. Run Development Server using Docker

The easiest way to build + test a development server is uisng On main directory, run 

```
pnpm dev:docker
```

This will 

---

## 🛠️ Available Scripts

From the root (`package.json`):
- `pnpm dev` → run FE + BE concurrently
- `pnpm build` → build frontend
- `pnpm build:tokens` → build style tokens via Style Dictionary
- `pnpm start` → start production frontend server
- `pnpm lint` → lint FE code
- `pnpm eslint --fix` → auto-fix lint issues

**Testing**
- `pnpm test:unit` → run unit tests with Jest
- `pnpm test:e2e` → run end-to-end tests with Cucumber

**Docker**
- `pnpm docker:dev` → build & run with Docker Compose

---

## 🧪 Testing

## TODO: adds a description of how to run tests, get test results

---

## 📦 Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Sass, Radix UI, Framer Motion
- **Backend:** Django (Python 3.10+)
- **Testing:** Jest, React Testing Library, Cucumber.js, Playwright
- **Styling & Tokens:** Style Dictionary
- **Containerization:** Docker, Docker Compose
- **Package Manager:** pnpm

---

## 📝 Environment Variables

Create a `.env.docker` file for Docker builds and `.env` files for local development if needed.

Example:

```
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DATABASE_URL=postgres://user:pass@db:5432/taskmind
```