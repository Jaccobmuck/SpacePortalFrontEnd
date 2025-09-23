import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function NavBar() {
  return (
    <nav className="header">
      <div className="container inner">
        <Link to="/" className="brand">
          <img src={logo} alt="SpacePortal logo" width={28} height={28} />
          SpacePortal <span className="badge">alpha</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/flares" className="btn secondary">Flares</NavLink>
          <NavLink to="/login" className="btn secondary">Login</NavLink>
          <NavLink to="/register" className="btn">Register</NavLink>
        </div>
      </div>
    </nav>
  );
}
