# SpacePortal Frontend

SpacePortal is a React-based frontend for viewing space-weather data (solar flares, NASA APOD) and user dashboards. This repo integrates with the SpacePortalBackEnd API.

## Prerequisites
- Node.js LTS (>= 18)
- npm (bundled with Node)
- A running SpacePortalBackEnd (ASP.NET Core) instance

## Getting Started

1) Clone both repos
- Backend (ASP.NET Core)
- Frontend (this repo)

2) Environment configuration
- Copy the example env file and set your backend base URL:
```powershell
Copy-Item .env.example .env
notepad .env
```
- Set REACT_APP_API_BASE_URL to your backend origin (no trailing slash), e.g.:
```
REACT_APP_API_BASE_URL=https://localhost:7178
```

3) Install dependencies
```powershell
npm install
```

4) Start the app
```powershell
npm start
```
- Default dev server will open on http://localhost:3000 (Create React App).
- The app reads the backend URL from REACT_APP_API_BASE_URL.

## Pointing to your backend

- All API calls are centralized in:
  - src/lib/api.ts
- The base URL is resolved from:
  - process.env.REACT_APP_API_BASE_URL
- Do not hardcode API URLs; update .env instead.

Example .env.example included:
```
REACT_APP_API_BASE_URL=https://localhost:7178
```

If you change .env, restart the dev server.

## Key Pages and Features

- Home (src/pages/Home.tsx)
  - Hero + CTA cards
  - APOD carousel fetching directly from /api/apod/recent

- Solar Flares (src/pages/DONKI/Flare/Flares.tsx)
  - Fetches events from /api/event/getevent
  - Filter by flare class (A/B/C/M/X)
  - Pagination and expandable details

- Shared API client (src/lib/api.ts)
  - Centralized fetch with JWT header injection
  - DTO normalization (e.g., APOD)

## Backend Endpoints (expected)

- APOD
  - GET /api/apod/today
  - GET /api/apod/{date}
  - GET /api/apod/recent?limit=30

- Events
  - GET /api/event/getevent

Ensure your backend implements these routes or adjust the frontend calls accordingly.

## CORS and Dev Proxy (optional)

Option A: Backend CORS
- Allow the frontend origin (http://localhost:3000) in backend CORS config.

Option B: CRA Proxy
- You can add a proxy field to package.json to avoid CORS during local dev:
```
{
  "proxy": "https://localhost:7178"
}
```
- Then you can keep REACT_APP_API_BASE_URL default and call relative /api paths.

Note: For HTTPS localhost, trust the dev certificate (dotnet dev-certs https --trust) or your browser will block requests.

## Troubleshooting

- “Image unavailable” in carousel:
  - Verify /api/apod/recent returns items with mediaType === "image" and valid url.
  - Check console/network for 404/500 or CORS errors.
  - Confirm REACT_APP_API_BASE_URL is set correctly and has no trailing slash.

- API calls failing:
  - Backend not running or wrong port/host.
  - Mixed content: frontend http vs backend https (or vice versa).
  - Certificate not trusted (HTTPS).

- Env changes not applied:
  - Restart the dev server after editing .env.

## Scripts

- npm start: Run dev server
- npm build: Production build
- npm test: Run unit tests (if configured)

## Project Structure (selected)

- src/pages/Home.tsx
- src/pages/DONKI/Flare/Flares.tsx
- src/components/Carousel.tsx
- src/components/SpaceEventItem.tsx
- src/lib/api.ts

## Contributing

- Add/update .env.example when new env vars are introduced.
- Keep API URLs centralized in src/lib/api.ts.
- Document new pages/components in this README.


