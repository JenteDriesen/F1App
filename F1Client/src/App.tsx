import './App.css'
import Dashboard from './pages/Dashboard'
import { Routes, Route } from 'react-router-dom';
import DriversStandingsPage from './pages/DriversStandingsPage';
import ConstructorsStandingsPage from './pages/ConstructorsStandingsPage';
import NextWeekendInfoPage from './pages/NextWeekendInfoPage';
import ResultPage from './pages/ResultPage';
import NavBar from './components/navbar';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const splash = document.getElementById("splash");
    if (splash) {
      splash.style.opacity = "0";
      setTimeout(() => splash.remove(), 200);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-800">
      <NavBar />
      <div className="pt-14 px-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/DriversStandings" element={<DriversStandingsPage />} />
          <Route path="/ConstructorsStandings" element={<ConstructorsStandingsPage />} />
          <Route path="/NextRace" element={<NextWeekendInfoPage />} />
          <Route path="/Results" element={<ResultPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
