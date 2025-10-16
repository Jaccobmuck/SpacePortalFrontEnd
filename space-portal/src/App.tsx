// React Router components for SPA routing
import { Routes, Route } from 'react-router-dom';

// Top navigation bar
import NavBar from './components/NavBar';

// Route components
import Home from './pages/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Flares from './pages/DONKI/Flare/Flares';
import Admin from './pages/Admin/Admin';

// App-level stylesheet
import './App.css';

export default function App() {
  // Render the global layout and route table
  return (
    <>
      {/* Global navigation */}
      <NavBar />

      {/* Main content area where routes render */}
      <main className="container">
        <Routes>
          {/* Home (landing) route */}
          <Route path="/" element={<Home />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Data pages */}
          <Route path="/flares" element={<Flares />} />

          {/* Admin tools */}
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* Simple footer with dynamic year */}
      <footer>
        © {new Date().getFullYear()} SpacePortal
      </footer>
    </>
  );
}
