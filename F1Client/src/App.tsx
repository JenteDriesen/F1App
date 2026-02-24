import './App.css'
import Dashboard from './pages/Dashboard'
import { Routes, Route } from 'react-router-dom';
import DriversStandingsPage from './pages/DriversStandingsPage';
import CountDown from './pages/CountDownPage';
import NavBar from './components/navbar';

function App() {

  return (
    <>
      <NavBar />
      <div className="container mt-3">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/DriversStandings" element={<DriversStandingsPage />} />
          <Route path="/NextRace" element={<CountDown />} />
        </Routes>
      </div>
    </>
  )
}

export default App
