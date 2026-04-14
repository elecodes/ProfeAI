# ADR 012: Automated Contributor Onboarding System

## Status
Accepted

## Context
As ProfeAI grows, we need to ensure that new contributors can easily understand how to submit issues and pull requests while maintaining project standards. Previously, there was no structured way to guide contributors, and the `.github` configuration was disorganized (including a nested `.github` folder that GitHub did not recognize).

## Decision
We will implement an automated onboarding system within the `.github` directory:

1.  **Structure Reorganization**: Move all configuration to the top-level `.github` folder.
2.  **Issue Templates**: Use `.github/ISSUE_TEMPLATE/*.yml` to provide structured forms for reporting bugs or proposing features (e.g., `beginner-contribution.yml`).
3.  **PR Template**: Use `.github/PULL_REQUEST_TEMPLATE.md` to provide a checklist for all new pull requests.
4.  **Welcome Automation**: Implement a GitHub Action (`welcome-contributor.yml`) that automatically greets new contributors and provides links to the contribution guidelines.

## Consequences
-   **Improved Quality**: Standardized issue and PR descriptions reduce maintainer overhead.
-   **Better Experience**: Contributors get immediate feedback and clear instructions.
-   **Observability**: Maintainers can quickly categorize contributions based on the structured templates.
-   **Maintenance**: The `.github` folder must be kept clean; nested configurations should be avoided as they are not natively supported by GitHub.
