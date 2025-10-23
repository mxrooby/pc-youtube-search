# PC YouTube Search (Vite + React + Tailwind)

Starter project that shows static featured videos and performs YouTube searches (via YouTube Data API v3).

## Setup

1. Install dependencies
```
npm install
```

2. Development
- Frontend only (exposes key): create `.env.local` with:
```
VITE_YOUTUBE_API_KEY=YOUR_KEY_HERE
```
then:
```
npm run dev
```

- With proxy (recommended):
  - Create `.env` for the proxy folder (root) with:
```
YOUTUBE_API_KEY=YOUR_KEY_HERE
```
  - Run proxy:
```
npm run start:proxy
```
  - In frontend `.env.local` set:
```
VITE_API_PROXY=http://localhost:4000/api/search
```
  - Then run `npm run dev` in the project root.
