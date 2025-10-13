import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Flares from './pages/DONKI/Flare/Flares';
import Admin from './pages/Admin/Admin';
import './App.css';

export default function App() {
  return (
    <>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/flares" element={<Flares />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        
        
      </main>
      <footer>
        © {new Date().getFullYear()} SpacePortal
      </footer>
    </>
  );
}
