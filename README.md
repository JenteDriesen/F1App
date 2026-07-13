# F1 App

A personal Formula 1 web application built with React and ASP.NET Core. The backend aggregates, processes and caches data from external APIs before exposing it through its own REST API.

## Features

- Drivers and Constructors Championship standings (any year, any round)
- Race, sprint and qualifying results (any year, any round)
- Next race weekend info with session schedule, circuit map and last year's podium
- Per-session weather forecasts for the race weekend
- Server-side caching to reduce external API requests
- Light/dark mode

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS  
**Backend:** .NET 9, C#, ASP.NET Core Web API, IMemoryCache 
**Data:** Ergast F1 API, Open-Meteo weather API, OpenStreetMap

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)
- [.NET 9 SDK](https://dotnet.microsoft.com/)

### Run locally

From the `F1` root folder:

```bash
npm install
npm run dev
```

This starts both the React frontend and the ASP.NET Core backend.
The application will be available at http://localhost:5173.

## Project Structure
The application follows a layered architecture, separating the frontend, API, business logic and data access into dedicated projects.

```
F1/
├── F1Client/       # React frontend
├── F1Web/          # ASP.NET Core API
├── F1Services/     # Business logic
├── F1Data/         # Data models & repositories
```