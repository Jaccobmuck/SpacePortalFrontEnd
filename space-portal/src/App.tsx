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
import UserInfo from './pages/User/UserInfo';
import RequireAdmin from './components/RequireAdmin';
import About from './pages/About';
import Contact from './pages/Contact';

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
          <Route path="/account" element={<UserInfo />} />

          {/* Data pages */}
          <Route path="/flares" element={<Flares />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin tools (protected) */}
          <Route
            path="/admin"
            element={
              <RequireAdmin requiredRole="Admin">
                <Admin />
              </RequireAdmin>
            }
          />
        </Routes>
      </main>

      {/* Simple footer with dynamic year */}
      <footer>
        © {new Date().getFullYear()} SpacePortal
      </footer>
    </>
  );
}
