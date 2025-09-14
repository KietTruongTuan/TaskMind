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

The easiest way to build + test a development server is using Docker. On main directory, run 

```sh
docker compose up --build
```

This will build an image for a development server. Then run the created image with 

```sh
docker compose up -d
```

The started container should support live updating of code. So no need to restart the container for code changes to takes effect. But in case you really need to stop the container

```sh 
docker compose down
```

This command gracefully shut down the container with the development server in it. Preserving the updates to physical memory (if any)

### 2. Alternative: Run Development Server from Source

- Clone the code repository from **Github**

- Prepare FE environment: In the main directory, run `pnpm install` (Make sure you have `pnpm` installed)

- Prepare BE environment: The BE is implemented in Django, it is highly recommended to install it with a python virtual environment
	- Create a Python virtual environment `python -m venv <your_enviroment_name>`
	- Activate it with
		- `.\venv\Scripts\activate` (Windows)
		- `source venv/bin/activate` (macOS/Linux)
	- Then install the required packages: `pip install -r requirements.txt`

- Run the application with
	- `pnpm dev:fe` -> run the front end
	- `pnpm dev:be` -> run the back end
	  Or
	- `pnpm dev` -> run both



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

---

## 🧪 E2E Testing

## TODO: adds a description of how to run e2e tests, get test results

---

## 📦 Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Sass, Radix UI, Framer Motion
- **Backend:** Django (Python 3.10+)
- **Testing:** Jest, React Testing Library, Cucumber.js, Playwright
- **Styling & Tokens:** Style Dictionary
- **Containerization:** Docker, Docker Compose
- **Package Manager:** pnpm
