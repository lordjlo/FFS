# Research Findings: FFS Kate

## Popular Gym Websites Analysis
*   **BetterMe**: Focus on personalization, body-part specific videos, and habit tracking.
*   **MyFitnessPal**: Strong on logging reps, sets, weights, and food.
*   **Peloton/Equinox**: Premium aesthetic, high-quality video integration.

## B.L.A.S.T. Framework Details
*   **Blueprint**: Vision and Data Schema (in progress).
*   **Link**: API Connectivity (pending).
*   **Architect**: 3-Layer Build (pending).
*   **Stylize**: Premium UI/UX (pending).
*   **Trigger**: Deployment (pending).

## Architecture Pivot: Supabase
*   **Relational Benefits**: Better for linking Workout -> Exercise -> Logs with SQL joins.
*   **Security**: RLS (Row Level Security) is critical for client privacy.
*   **Auth**: Built-in support for Magic Links and Google.

## Integration Discoveries
*   **Google Sheets API**: Can use `google-spreadsheet` npm package for easy access.
*   **YouTube**: Using IFrame API for private/unlisted video embedding ensures better performance and payment control.
