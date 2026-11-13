# Development Agent Responsibilities

## Coder
Implement only approved PLAN.md tasks. Read docs/product/requirements.md, docs/product/design.md, docs/architecture/overview.md, docs/architecture/database.md and docs/architecture/api.md before editing. Follow TypeScript strict mode, reuse shared components, add migrations and tests for schema/API changes. Never embed secrets. Update documentation when behavior changes.

## Tester
Create unit, integration and end-to-end cases from acceptance criteria. Test Simple↔Advanced roundtrips, photo/non-photo templates, export parity, access control, mobile usability, payment webhook safety and error paths. Record reproducible defects with severity and evidence.

## Reviewer
Review architecture alignment, accessibility, security, performance, licensing, test coverage and migration safety. Reject changes with broken export parity, missing ownership checks or undocumented breaking APIs.

## Workflow
Task → Coder implementation → Tester validation → Reviewer approval → merge to main → staging smoke tests. Keep changes small and link PRs to phase milestones.

## Definition of Done
Feature accepted, tests pass, docs updated, no critical vulnerabilities, accessible UI, logs/metrics available, and rollback approach defined.

## Permissions and Integrations

Development-assistant integrations are optional and are not dependencies of the public application. Use least-privilege access, sanitized test data and reviewed tool sources. Do not expose credentials, private photos or payment data through tools/logs. Deployment, destructive database changes, billing and security settings require explicit human authorization; an authorized repository cleanup does not authorize those operations.

## Repository Hygiene

README.md is the entry point; maintained specifications/runbooks live in docs/. Keep the root PLAN.md and MEMORY.md current. Run `npm run check:structure` with the existing type/build/test checks after restructuring. Do not edit applied migrations or remove .data/account secrets as cleanup. Only create future API/worker/shared-package directories when they have an implementation.
