import {Link, NavLink} from 'react-router-dom';
import Carousel from '../components/Carousel';

export default function Home(){
    return(
        
        <section className="hero">
            <h1>Welcome to SpacePortal</h1>
            <p>Your hub for space-weather alerts and activity.</p>
            {/* Removed inappropriate placeholder text */}
           
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

            <Carousel
                showArrows={false}
                intervalMs={7000}
                images={[
                    'https://images.immediate.co.uk/production/volatile/sites/3/2024/05/How-many-Pokemon-are-there-6434211.jpg',
                    './images/leafon.jpg',
                    './images/poreon.png',
                    'https://external-preview.redd.it/2Rn-yHuX9XJDHp1dt-5q9qfUTH0VqWqQZKdcvCbsueY.jpg?width=1080&crop=smart&auto=webp&s=49516e07e15a2e5b79a305de41799edd013fa5c6'
                ]}
            />

        </section>
    );
}