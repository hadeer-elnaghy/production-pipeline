# 🚀 Production-Grade GitHub Actions CI/CD Pipeline

![CI - Code Quality & Security Scan](https://github.com/hadeer-elnaghy/production-pipeline/actions/workflows/01-ci-pr-checks.yml/badge.svg)
![CD - Build & Push](https://github.com/hadeer-elnaghy/production-pipeline/actions/workflows/02-cd-staging.yml/badge.svg)

An automated microservice CI/CD pipeline built with **GitHub Actions**, **Docker**, **Trivy Vulnerability Scanner**, and **Docker Hub**.

---

## 🛠️ Key Pipeline Features

- **Automated Pull Request Validation (CI):**
  - Node.js multi-version test matrix (Node 18.x & 20.x).
  - Security filesystem scanning using **Trivy** to catch CVE vulnerabilities before merging.
- **Continuous Staging Delivery (CD):**
  - Automated Docker multi-stage builds triggered on `main` branch merges.
  - Layer caching optimization (`type=gha`) for ultra-fast build times.
  - Image tagging strategy based on short Git commit SHAs and `staging`/`latest` pointers pushed to **Docker Hub**.
- **Production Gated Deployments:**
  - Manual dispatch trigger with runtime tag parameters.
  - Environment protection gates requiring manual approval before deployment execution.
  - Secret value masking and post-deployment health check script verification.

---

## 📁 Architecture Overview

```text
  [ Developer PR ]
         │
         ▼
 ┌───────────────────────────────────┐
 │ 1. CI: Matrix Tests + Trivy Scan  │
 └─────────────────┬─────────────────┘
                   │ (Merged to main)
                   ▼
 ┌───────────────────────────────────┐
 │ 2. CD: Build & Push to Docker Hub │
 └─────────────────┬─────────────────┘
                   │
                   ▼
 ┌───────────────────────────────────┐
 │ 3. CD: Gated Production Deploy    │
 └───────────────────────────────────┘
```

---

## 🚦 Local Setup & Run

1. Clone the repository:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/YOUR_REPO.git](https://github.com/YOUR_USERNAME/YOUR_REPO.git)
   cd YOUR_REPO
   ```

2. Run locally using Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Test the health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```