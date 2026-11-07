# REST API Reference - Phase 1 Foundation

All endpoints are hosted with the global `/api` prefix.

---

## 1. Health Check

### `GET /api/health`
Returns telemetry on runtime state, memory consumption, and database connectivity.

#### Response Headers
- `Content-Type`: `application/json; charset=utf-8`

#### Status Codes
- `200 OK`: Server is operational (database connected or configured).

#### Example Response Body
```json
{
  "status": "degraded",
  "service": "autonomous-business-finance-backend",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-11-07T04:57:32.794Z",
  "uptimeSeconds": 42,
  "memory": {
    "heapUsedMB": 18.24,
    "heapTotalMB": 19.94,
    "rssMB": 69.52
  },
  "database": {
    "status": "unconfigured",
    "details": "DATABASE_URL environment variable is missing"
  }
}
```

---

## 2. Error Handling Demonstration

### `GET /api/health/error-demo`
Deliberately throws a `BadRequestException` to demonstrate that unhandled or HTTP exceptions are properly captured and formatted by `GlobalHttpExceptionFilter`.

#### Status Codes
- `400 Bad Request`

#### Response Body
```json
{
  "statusCode": 400,
  "timestamp": "2026-11-07T04:58:11.671Z",
  "path": "/api/health/error-demo",
  "method": "GET",
  "message": "Demonstration of GlobalHttpExceptionFilter handling validation or client errors.",
  "error": "Bad Request"
}
```
