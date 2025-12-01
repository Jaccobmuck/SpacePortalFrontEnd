// Home page: hero section, calls-to-action, and carousel
import { Link, NavLink } from 'react-router-dom';
import Carousel from '../components/Carousel';

export default function Home() {
    return (
        <section className="hero">
            <h1>Welcome to SpacePortal</h1>
            <p>Your hub for space-weather alerts and activity.</p>
            {/* Removed inappropriate placeholder text */}

            {/* Calls to action */}
            <div className="grid-cta">
                <Link to="/login" className="card">
                    <h3 style={{ marginTop: 0 }}>Login</h3>
                    <p className="helper">Access your dashboard and alerts.</p>
                    <span className="btn" style={{ marginTop: 8, display: 'inline-block' }}>Go to Login</span>
                </Link>

                <Link to="/register" className="card">
                    <h3 style={{ marginTop: 0 }}>Register</h3>
                    <p className="helper">Create an account to subscribe to events.</p>
                    <span className="btn" style={{ marginTop: 8, display: 'inline-block' }}>Create Account</span>
                </Link>

                <Link to="/flares" className="card">
                    <h3 style={{ marginTop: 0 }}>Flares</h3>
                    <p className="helper">See recent and historical solar flares.</p>
                    <span className="btn" style={{ marginTop: 8, display: 'inline-block' }}>View Flares</span>
                </Link>
            </div>

            {/* Hero carousel - auto-fetching APOD recent entries directly */}
            <Carousel
                showArrows={false}
                intervalMs={6500}
                apod={{ limit: 5 }}
            />
        </section>
    );
}