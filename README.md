# 🚀 Enterprise Node.js DevSecOps & Observability Pipeline

![CI - Code Quality & Security Scan](https://github.com/hadeer-elnaghy/production-pipeline/actions/workflows/01-ci-pr-checks.yml/badge.svg)
![CD - Build & Push](https://github.com/hadeer-elnaghy/production-pipeline/actions/workflows/02-cd-staging.yml/badge.svg)

An end-to-end containerized Node.js microservice architecture featuring automated **GitHub Actions CI/CD pipelines**, **Trivy security vulnerability scanning**, **Winston structured JSON logging**, **Elasticsearch centralized log storage**, **Prometheus metrics extraction**, and **Grafana observability dashboards**.

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
  - **Elasticsearch Log Ingestion:** Centralized log store indexing structured `winston-elasticsearch` transports for rapid search and historical querying.
  - **Grafana Monitoring Dashboard:** Unified observability UI displaying side-by-side HTTP throughput, memory utilization (RSS/V8 Heap), status code breakdowns, $p_{95}$ request latency, and real-time Elasticsearch application log streams.
  - **Structured JSON Logging:** Integrated `winston` logging engine appending unique `X-Request-ID` correlation identifiers for request tracing.
- **Production Resilience:**
  - Liveness (`/health/live`) and Readiness (`/health/ready`) probe endpoints.
  - Graceful process termination (`SIGTERM`/`SIGINT`) handling active connection drains.

---

## 📁 End-to-End Architecture Flow

```text
                               Scrapes /metrics       ┌─────────────────┐
 ┌────────────────┐ ◄──────────────────────────────── │   Prometheus    │
 │ Node.js Express│                                   └────────┬────────┘
 │ (Winston/Prom) │                                            │ PromQL
 └───────┬────────┘                                            ▼
         │ Logs (Winston Transport)   ┌───────────────┐   ┌─────────────────┐
         └──────────────────────────> │ Elasticsearch │──>│     Grafana     │
                                      │ (Log Storage) │   │   Dashboards    │
                                      └───────────────┘   └─────────────────┘

 ─────── CI/CD DEPLOYMENT PIPELINE ─────────────────────────────────

 [ Developer PR ] ──> [ CI: Test + Trivy ] ──> [ Merge Main ] ──> [ CD: Push Docker Hub ]