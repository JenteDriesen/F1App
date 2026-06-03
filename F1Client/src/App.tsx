import './App.css'
import Dashboard from './pages/Dashboard'
import { Routes, Route } from 'react-router-dom';
import DriversStandingsPage from './pages/DriversStandingsPage';
import NextWeekendInfoPage from './pages/NextWeekendInfoPage';
import ResultPage from './pages/ResultPage';
import NavBar from './components/navbar';

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-800">
      <NavBar />
      <div className="pt-16 px-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/DriversStandings" element={<DriversStandingsPage />} />
          <Route path="/NextRace" element={<NextWeekendInfoPage />} />
          <Route path="/Results" element={<ResultPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
