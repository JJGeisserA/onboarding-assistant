# Team Processes & Engineering Practices

## Sprints

We run 2-week sprints. The sprint cycle is:
- **Monday (Sprint start)**: Sprint planning — 1 hour
- **Daily**: Standup at 9:30 AM via Zoom, 15 minutes max
- **Friday of week 2**: Sprint review + retrospective

Story points use Fibonacci scale (1, 2, 3, 5, 8). If a ticket is larger than 8 points, it must be broken down.

## Ticket Workflow

Tickets live in Jira under the `ENG` project. Statuses:
1. **Backlog** — not yet scheduled
2. **To Do** — scheduled for current sprint
3. **In Progress** — developer is actively working on it
4. **In Review** — PR open, waiting for review
5. **QA** — being tested by QA engineer
6. **Done** — merged to develop and verified in staging

Move your ticket to **In Progress** when you start coding, and to **In Review** when you open a PR. Do not leave tickets in Backlog while actively working on them.

## Pull Request Guidelines

- PR titles must reference the ticket: `ENG-1234: Add order cancellation endpoint`
- Keep PRs small — ideally under 400 lines changed
- Always include a description explaining the "why", not just the "what"
- Add screenshots for any UI changes
- Respond to review comments within 24 hours
- Do not merge your own PR — always wait for an approval

## Code Review Expectations

Reviewers should focus on:
- Correctness and edge cases
- Security (SQL injection, auth checks, input validation)
- Test coverage
- Naming clarity

Leave comments as suggestions, not demands. Use the "Request changes" status sparingly — prefer starting a conversation first.

## Testing Requirements

All new features must include:
- Unit tests for business logic (minimum 80% coverage on new code)
- Integration tests for API endpoints
- No PR will be approved without tests unless the change is documentation-only

Run tests locally before opening a PR:
```bash
npm test          # frontend
pytest            # backend
```

## Incident Response

If you discover a production issue:
1. Post in the `#incidents` Slack channel immediately
2. Tag `@oncall-engineer` — do not DM individuals
3. Do not attempt a hotfix without informing the team
4. After resolution, a postmortem is required for P1 incidents

## Communication Norms

- **Slack**: Primary async communication. Expect responses within 2–4 hours during work hours.
- **Email**: Used for external communication only — not internal.
- **Zoom**: For meetings and pairing sessions. Camera on is encouraged but not required.
- **#eng-general**: General engineering discussion
- **#deploys**: Automated deploy notifications
- **#help**: Ask any question here — no such thing as a dumb question for new engineers
