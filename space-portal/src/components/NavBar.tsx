// Navigation links from React Router
import { Link, NavLink, useLocation } from 'react-router-dom';

// Brand logo asset
import logo from '../assets/logo.png';
import './NavBar.css';
import { api } from '../lib/api';
import { useState, useEffect, useRef } from 'react';

function getLoginStatus() {
  return Boolean(api.getToken());
}

export default function NavBar() {
  // Track login state based on presence of a JWT in storage
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(getLoginStatus());
  const location = useLocation();
  const [servicesOpen, setServicesOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Sync across tabs/windows when the token changes
    const onStorage = (e: StorageEvent) => {
      if (e.key === api.tokenStorageKey) {
        setIsLoggedIn(getLoginStatus());
      }
    };
    const onAuthChanged = () => setIsLoggedIn(getLoginStatus());
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth:changed' as any, onAuthChanged);
    // Also refresh once on mount in case something changed pre-render
    setIsLoggedIn(getLoginStatus());
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth:changed' as any, onAuthChanged);
    };
  }, []);

  // Also react to route changes; useful if some flows navigate immediately after auth changes
  useEffect(() => {
    setIsLoggedIn(getLoginStatus());
  }, [location]);
  // Close services menu on navigation to keep UI tidy
  useEffect(() => {
    setServicesOpen(false);
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, [location]);

  // Helpers to manage dropdown open/close with delayed hide
  const openServices = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setServicesOpen(true);
  };
  const cancelCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  const closeServicesWithDelay = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      setServicesOpen(false);
      closeTimerRef.current = null;
    }, 2000);
  };
  const toggleServices = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (servicesOpen) {
      setServicesOpen(false);
    } else {
      openServices();
    }
  };

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
          <details
            className="menu"
            open={servicesOpen}
            onMouseEnter={cancelCloseTimer}
            onMouseLeave={closeServicesWithDelay}
          >
            <summary className="btn secondary" onClick={toggleServices}>Services</summary>
            <ul className="menu-list" onMouseEnter={cancelCloseTimer} onMouseLeave={closeServicesWithDelay}>
              <li>
                <NavLink to="/flares" className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`} onClick={() => setServicesOpen(false)}>
                  DONKI Flares
                </NavLink>
              </li>
              {/* Future items can be added here */}
            </ul>
          </details>
          <NavLink to="/about" className="btn secondary">
            About
          </NavLink>
          <NavLink to="/contact" className="btn secondary">
            Contact
          </NavLink>
          {isLoggedIn && (
            <NavLink to="/account" className="btn secondary">
              Account
            </NavLink>
          )}
          {!isLoggedIn && (
            <>
              <NavLink to="/login" className="btn secondary">
                Login
              </NavLink>
              <NavLink to="/register" className="btn">
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
