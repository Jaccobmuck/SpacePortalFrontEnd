// Navigation links from React Router
import { Link, NavLink } from 'react-router-dom';

// Brand logo asset
import logo from '../assets/logo.png';

export default function NavBar() {
  // Render a semantic <nav> with brand and primary links
  return (
    <nav className="header">
      <div className="container inner">
        {/* Brand */}
        <Link to="/" className="brand">
          <img src={logo} alt="SpacePortal logo" width={28} height={28} />
          SpacePortal <span className="badge">alpha</span>
        </Link>

        {/* Primary navigation */}
        <div className="nav-links">
          <NavLink to="/flares" className="btn secondary">
            Flares
          </NavLink>
          <NavLink to="/account" className="btn secondary">
            Account
          </NavLink>
          <NavLink to="/login" className="btn secondary">
            Login
          </NavLink>
          <NavLink to="/register" className="btn">
            Register
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
