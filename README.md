# 🚀 Enterprise Node.js DevSecOps & Observability Pipeline

![CI - Code Quality & Security Scan](https://github.com/hadeer-elnaghy/production-pipeline/actions/workflows/01-ci-pr-checks.yml/badge.svg)
![CD - Build & Push](https://github.com/hadeer-elnaghy/production-pipeline/actions/workflows/02-cd-staging.yml/badge.svg)

An end-to-end containerized Node.js microservice architecture featuring automated **GitHub Actions CI/CD pipelines**, **Trivy security vulnerability scanning**, **Winston structured JSON logging**, **Prometheus metrics extraction**, and **Grafana observability dashboards**.

---

## 🛠️ Key Pipeline & Infrastructure Features

- **Automated Quality & Vulnerability Gates (CI):**
  - Multi-version testing matrix (Node 18.x & 20.x).
  - Continuous filesystem scanning via **Trivy** to block high/critical CVEs.
- **Continuous Staging Delivery (CD):**
  - Optimized multi-stage Docker builds triggered on `main` branch pushes.
  - BuildKit layer caching (`type=gha`) for fast image compilation.
  - Automated deployment strategy pushing versioned SHA and `latest` tags to **Docker Hub**.
- **Observability & Telemetry Stack:**
  - **Prometheus Metric Collection:** Scrapes application metrics via `prom-client` at `GET /metrics`.
  - **Grafana Monitoring Dashboard:** Real-time visibility into HTTP throughput, memory utilization (RSS/V8 Heap), service uptime, status codes, event loop lag, and $p_{95}$ response latency.
  - **Structured JSON Logging:** Integrated `winston` logging engine appending unique `X-Request-ID` correlation identifiers for request tracing.
- **Production Resilience:**
  - Liveness (`/health/live`) and Readiness (`/health/ready`) probe endpoints.
  - Graceful process termination (`SIGTERM`/`SIGINT`) handling active connection drains.

---

## 📁 End-to-End Architecture Flow

```text
 ┌────────────────┐       Scrapes /metrics        ┌─────────────────┐
 │ Node.js Express│ ◄───────────────────────────  │   Prometheus    │
 │ (Winston/Prom) │                               └────────┬────────┘
 └───────┬────────┘                                        │ PromQL
         │                                                 ▼
         │ Logs (JSON + Correlation ID)           ┌─────────────────┐
         └──────────────────────────────────────> │     Grafana     │
                                                  │   Dashboards    │
                                                  └─────────────────┘

 ─────── CI/CD DEPLOYMENT PIPELINE ─────────────────────────────────

 [ Developer PR ] ──> [ CI: Test + Trivy ] ──> [ Merge Main ] ──> [ CD: Push Docker Hub ]