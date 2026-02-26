import './App.css'
import Dashboard from './pages/Dashboard'
import { Routes, Route } from 'react-router-dom';
import DriversStandingsPage from './pages/DriversStandingsPage';
import NextWeekendInfoPage from './pages/NextWeekendInfoPage';
import NavBar from './components/navbar';

function App() {

  return (
    <>
      <NavBar />
      <div className="container mt-3">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/DriversStandings" element={<DriversStandingsPage />} />
          <Route path="/NextRace" element={<NextWeekendInfoPage />} />
        </Routes>
      </div>
    </>
  )
}

export default App
