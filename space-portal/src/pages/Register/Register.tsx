// Registration page: create a new account
import React, { useState } from 'react';
import './Register.css';
import { api, RegisterRequest, RegisterResponse } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	// Removed role selection
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState('');
	const navigate = useNavigate();

	// Submit handler: client-side validation then backend request
	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError('');
		setSuccess('');
		if (!username.trim()) {
			setError('Username is required');
			return;
		}
		if (password.length < 6) {
			setError('Password must be at least 6 characters');
			return;
		}
		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}
		setLoading(true);
		try {
			const payload: RegisterRequest = { displayName: username, password };
			const resp: RegisterResponse = await api.register(payload);
			const message = resp?.message || 'User registered successfully';
			setSuccess(`${message}. Redirecting to login...`);
			setUsername('');
			setPassword('');
			setConfirmPassword('');
			// Give user time to read the success (2s)
			setTimeout(() => {
				navigate('/login');
			}, 2000);
		} catch (err: any) {
			setError(err.message || 'Registration failed');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="register-container">
			<form className="register-form" onSubmit={handleSubmit}>
				<h2 className="register-title">Register</h2>
				<div className="register-field">
					<label htmlFor="username">Username</label>
					<input
						type="text"
						id="username"
						value={username}
						onChange={e => setUsername(e.target.value)}
						required
						placeholder="Enter your username"
					/>
				</div>
				<div className="register-field">
					<label htmlFor="password">Password</label>
					<input
						type={showPassword ? 'text' : 'password'}
						id="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						required
						placeholder="Enter your password"
					/>
					<button
						type="button"
						className="show-password-btn"
						onClick={() => setShowPassword((s: boolean) => !s)}
					>
						{showPassword ? 'Hide' : 'Show'}
					</button>
				</div>
				<div className="register-field">
					<label htmlFor="confirmPassword">Confirm Password</label>
					<input
						type={showPassword ? 'text' : 'password'}
						id="confirmPassword"
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
						required
						placeholder="Confirm your password"
					/>
				</div>
				{error && <div className="register-error">{error}</div>}
				{success && <div className="register-success">{success}</div>}
				<button className="register-submit" type="submit" disabled={loading || !username || !password || !confirmPassword}>
					{loading ? 'Registering...' : 'Register'}
				</button>
				<div className="register-footer">
					<span>Already have an account?</span>
					<a href="/login" className="register-link">
						Login
					</a>
				</div>
			</form>
		</div>
	);
}
