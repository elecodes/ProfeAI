# ADR 007: Automated Content Update Strategy

## Context
The ProfeAI application requires fresh lesson content every 14 days to keep users engaged. This content is generated using Google Gemini AI and stored in Firestore. Initial implementations faced two main challenges:
1.  **Deployment Path Errors**: GitHub Actions failed because script and credential paths didn't align with the monorepo structure.
2.  **Quota Constraints**: On the Gemini free tier, `gemini-2.0-flash` often hits "Per Minute" rate limits (429 errors) and is restricted to specific models.

## Decision
We implemented a robust update script (`backend/scripts/refresh-content.ts`) with the following characteristics:

1.  **Path Resilience**: The script correctly handles monorepo paths and service account credentials, working both locally and within GitHub Actions.
2.  **Free Tier Compatible**: The script now uses `gemini-flash-latest` (free tier model) instead of paid `gemini-2.0-flash`. This ensures the script works without consuming paid quota.
3.  **Model Format**: Uses `googleai/` prefix to match genkit format.
4.  **Backup & Restore**: Before updating content, the script creates a backup in `lessons/*_general_backup`. Users can restore previous content using `--restore` flag.
5.  **GitHub Action Automation**: A scheduled workflow (`.github/workflows/auto-update-lessons.yml`) ensures this runs every 14 days or on manual demand.

### Usage

```bash
# Update content + create backup (default)
npx tsx scripts/refresh-content.ts

# Only create backup (no update)
npx tsx scripts/refresh-content.ts --backup

# Restore from backup
npx tsx scripts/refresh-content.ts --restore
```

## Consequences
*   **Cost**: The script now runs on the free tier, costing $0 for content generation.
*   **Reliability**: The free tier has strict rate limits (15 RPM). The script handles this with retry logic.
*   **Backup Safety**: Users can always restore previous content if the new content is unsatisfactory.
*   **Maintenance**: Developers should periodically check that the free tier models are still available.
