# Workflow Tracker API

## Interactive Docs

The API is built with **Django Ninja**. Full schema, request/response models, and a live test interface are available via Swagger UI once the server is running:

**[http://127.0.0.1:8000/api/docs](http://127.0.0.1:8000/api/docs)**

---

## Base URL

```
http://127.0.0.1:8000/api/applications/
```

---

## Authentication

No authentication is required. All endpoints are currently open.

---

## Application Lifecycle

Every application moves through a strict state machine. Understanding this is essential before calling the action endpoints.

```
Draft ──[submit]──► Submitted ──[start-review]──► Under Review
                                                        │
                                        ┌───────────────┼───────────────┐
                                        ▼               ▼               ▼
                                     Approved        Rejected    Need More Info
                                                                       │
                                                                  [submit]
                                                                       │
                                                                       ▼
                                                                  Submitted
```

**Rules that aren't obvious from the schema alone:**

- `Draft` and `Need More Information` are the only editable states, all other statuses are locked.
- When a reviewer sets status to `Rejected` or `Need More Information`, a `reviewer_comment` is mandatory.
- `Need More Information` re-enters the review cycle on re-submission, it is not a terminal state.
- `tracking_number` is auto-generated on creation (`APP-{YEAR}-{6_CHAR_HASH}`) and is the public-facing identifier. Use `/track/{tracking_number}/` for applicant-facing lookups rather than the internal `/{id}/` endpoint.