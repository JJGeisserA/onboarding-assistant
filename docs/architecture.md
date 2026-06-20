# System Architecture Overview

## High-Level Overview

The platform follows a microservices architecture split into three layers:

1. **Frontend** — React single-page application served via CDN
2. **API Gateway** — Routes requests to the appropriate microservice
3. **Microservices** — Independent services owning their own data

All inter-service communication uses REST for synchronous calls and a message queue (RabbitMQ) for asynchronous events.

## Key Services

### Auth Service
Handles authentication and authorization. Issues JWT tokens valid for 1 hour. Refresh tokens are stored in Redis and expire after 7 days.
- Owns the `users` table
- Tech stack: Python / FastAPI

### Order Service
Manages the full order lifecycle from creation to fulfillment.
- Owns the `orders` and `order_items` tables
- Publishes events to the `order.created` and `order.updated` queues
- Tech stack: Node.js / Express

### Notification Service
Listens to queue events and sends emails and push notifications. Uses SendGrid for email.
- Subscribes to: `order.created`, `order.updated`, `user.registered`
- Tech stack: Python / Celery

### Inventory Service
Tracks product stock levels. All stock decrements happen synchronously via REST to prevent overselling.
- Tech stack: Go

## Database Strategy

Each service owns its own PostgreSQL database. Cross-service data joins are forbidden. If service A needs data from service B, it either calls B's API or subscribes to B's events and maintains a local read model.

## Branching Strategy

- `main` — production-ready code, protected branch
- `develop` — integration branch, all feature branches merge here first
- `feature/{ticket-id}-short-description` — one branch per ticket

**Always branch from `develop`, never from `main`.**

Pull requests require at least one approval from a senior engineer before merging.

## Deployment

CI/CD runs on GitHub Actions. Merging to `develop` triggers a deploy to the staging environment. Merging to `main` triggers a production deploy after manual approval in the GitHub Actions UI.

Container images are pushed to AWS ECR and deployed to ECS Fargate.

## Monitoring

- **Logs**: CloudWatch Logs, structured JSON format
- **Metrics**: Datadog dashboards — ask your team lead for access
- **Alerts**: PagerDuty for P1/P2 incidents
- **Tracing**: AWS X-Ray for distributed traces across services
