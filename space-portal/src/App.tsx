import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Flares from './pages/Flares';
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
        </Routes>
        
        
      </main>
      <footer>
        © {new Date().getFullYear()} SpacePortal
      </footer>
    </>
  );
}
