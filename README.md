# F1 App

A personal F1 tracking web app built with React/TypeScript and .NET/C#.

## Features

- Drivers Championship standings (any year, any round)
- Next race weekend info with countdown timers
- Circuit map and weekend weather forecast
- Race, sprint and qualifying results (any year, any round)
- Constructor Championship standings (any year, any round) (coming soon)
- Light/dark mode

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS  
**Backend:** .NET 9, C#, ASP.NET Core  
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

The app will open at `http://localhost:5173`.

## Project Structure

```
F1/
├── F1Client/       # React frontend
├── F1Web/          # ASP.NET Core API
├── F1Services/     # Business logic
├── F1Data/         # Data models & repositories
```