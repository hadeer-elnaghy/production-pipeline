const express = require('express');
const client = require('prom-client');
const winston = require('winston');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// 1. Configure Winston for Structured JSON Logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'simple-node-app' },
  transports: [new winston.transports.Console()]
});

// 2. Setup Prometheus Metrics Collection
const register = new client.Registry();
client.collectDefaultMetrics({ register }); // Default CPU, RAM, Event Loop metrics

// Custom Counter: HTTP Requests broken down by method, route, and status
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status']
});

// Custom Histogram: Response duration in seconds for latency tracking
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5]
});

register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDurationMicroseconds);

// 3. Correlation ID & Observability Middleware
app.use((req, res, next) => {
  const start = Date.now();
  // Assign or forward a unique Request ID for tracing logs across services
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-ID', req.requestId);

  res.on('finish', () => {
    const durationSeconds = (Date.now() - start) / 1000;
    const routeName = req.route ? req.route.path : req.path;

    // Record Prometheus Metrics
    httpRequestCounter.labels(req.method, routeName, res.statusCode.toString()).inc();
    httpRequestDurationMicroseconds.labels(req.method, routeName, res.statusCode.toString()).observe(durationSeconds);

    // Write Structured JSON Log
    logger.info({
      message: 'HTTP Request Handled',
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      durationMs: Math.round(durationSeconds * 1000)
    });
  });

  next();
});

// 4. Core Application Routes
app.get('/', (req, res) => {
  res.json({ message: 'Production DevOps Pipeline API', status: 'OK' });
});

// Endpoint to simulate work/latency
app.get('/api/slow', async (req, res) => {
  const delay = Math.floor(Math.random() * 300) + 100; // 100ms - 400ms delay
  await new Promise((resolve) => setTimeout(resolve, delay));
  res.json({ message: 'Slow response complete', latencyMs: delay });
});

// Endpoint to simulate unexpected 500 errors
app.get('/api/error', (req, res) => {
  logger.error({
    message: 'Simulated 500 Internal Error Triggered',
    requestId: req.requestId
  });
  res.status(500).json({ error: 'Internal Server Error simulated' });
});

// 5. Container Health Probes (K8s & Docker Compatible)
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'UP', check: 'liveness' });
});

app.get('/health/ready', (req, res) => {
  // Can be linked to DB connectivity checks in larger setups
  res.status(200).json({ status: 'READY', check: 'readiness' });
});

// 6. Prometheus Metrics Scrape Endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});


// Export app instance without starting the listener
module.exports = app;
