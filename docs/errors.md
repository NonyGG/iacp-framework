# Error System

## Overview

The Error System provides a structured, trackable, and categorized error handling framework for institutional agent communication.

## Components

### InstitutionalError
Base error class with institutional context.

- `errorId` — Unique error identifier
- `code` — Machine-readable error code
- `message` — Human-readable description
- `category` — VALIDATION, PROTOCOL, TRANSPORT, ROUTING, SERIALIZATION, INTERNAL, SECURITY, TIMEOUT
- `severity` — FATAL (0) through INFO (5)
- `context` — Key-value store for related data
- `cause` — Original error that caused this one

Methods:
- `withContext(key, value)` — Add context
- `withCause(cause)` — Set causal error

### ErrorTracker
Collects and summarizes errors for analysis.

- `track(error)` — Record an error
- `recent(count)` — Get recent errors
- `byCategory(category)` — Filter by category
- `bySeverity(severity)` — Filter by severity
- `summary()` — Aggregate statistics

### ErrorFactory
Convenient factory methods for common error types.

- `validation(code, msg, ctx)` — Validation errors (LOW)
- `protocol(code, msg, ctx)` — Protocol errors (HIGH)
- `transport(code, msg, ctx)` — Transport errors (HIGH)
- `routing(code, msg, ctx)` — Routing errors (MEDIUM)
- `security(code, msg, ctx)` — Security errors (CRITICAL)
- `internal(code, msg, ctx)` — Internal errors (CRITICAL)
- `timeout(code, msg, ctx)` — Timeout errors (MEDIUM)

## Usage

```javascript
const { InstitutionalError, ErrorFactory, ErrorTracker } = require('iacp-framework/core');
throw ErrorFactory.validation('INVALID_MSG', 'Missing required field', 'message.core');
const tracker = new ErrorTracker();
tracker.track(err);
tracker.summary();
```
