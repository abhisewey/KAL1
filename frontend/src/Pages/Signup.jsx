import React, { useState } from 'react'

export default function Signup() {
	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [imageFile, setImageFile] = useState(null)
	const [imagePreview, setImagePreview] = useState(null)
	const [errors, setErrors] = useState({})
	const [submitting, setSubmitting] = useState(false)
	const [message, setMessage] = useState(null)

	function handleImageChange(e) {
		const file = e.target.files && e.target.files[0]
		if (!file) {
			setImageFile(null)
			setImagePreview(null)
			return
		}
		// Basic client-side validation for image type/size (optional)
		if (!file.type.startsWith('image/')) {
			setErrors((s) => ({ ...s, image: 'Please select an image file.' }))
			return
		}
		setErrors((s) => ({ ...s, image: null }))
		setImageFile(file)
		setImagePreview(URL.createObjectURL(file))
	}

	function validate() {
		const e = {}
		if (!username.trim()) e.username = 'Username is required.'
		if (!email.trim()) e.email = 'Email is required.'
		// simple email check
		if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Enter a valid email.'
		if (!password) e.password = 'Password is required.'
		if (password && password.length < 6) e.password = 'Password must be at least 6 characters.'
		if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match.'
		return e
	}

	async function handleSubmit(e) {
		e.preventDefault()
		setMessage(null)
		const eobj = validate()
		setErrors(eobj)
		if (Object.keys(eobj).length) return

		setSubmitting(true)
		try {
			const form = new FormData()
			form.append('username', username)
			form.append('email', email)
			form.append('password', password)
			if (imageFile) form.append('profilePicture', imageFile)

			// Submit to your backend signup endpoint. Adjust URL if needed.
			const res = await fetch('/api/signup', {
				method: 'POST',
				body: form,
			})
			if (res.ok) {
				setMessage('Signup successful. You can now log in.')
				// clear form
				setUsername('')
				setEmail('')
				setPassword('')
				setConfirmPassword('')
				setImageFile(null)
				setImagePreview(null)
				setErrors({})
			} else {
				let text = 'Signup failed.'
				try {
					const json = await res.json()
					text = json.message || text
				} catch (_) {}
				setMessage(text)
			}
		} catch (err) {
			setMessage('Network error. Please try again.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div style={{ maxWidth: 520, margin: '24px auto', padding: 20 }}>
			<h2 style={{ marginBottom: 16 }}>Sign Up</h2>
			{message && (
				<div style={{ marginBottom: 12, color: message.includes('successful') ? 'green' : 'crimson' }}>
					{message}
				</div>
			)}
			<form onSubmit={handleSubmit} encType="multipart/form-data">
				<div style={{ marginBottom: 12 }}>
					<label style={{ display: 'block', marginBottom: 6 }}>Username</label>
					<input
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						type="text"
						name="username"
						style={{ width: '100%', padding: '8px 10px' }}
					/>
					{errors.username && <div style={{ color: 'crimson', marginTop: 6 }}>{errors.username}</div>}
				</div>

				<div style={{ marginBottom: 12 }}>
					<label style={{ display: 'block', marginBottom: 6 }}>Email</label>
					<input
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						type="email"
						name="email"
						style={{ width: '100%', padding: '8px 10px' }}
					/>
					{errors.email && <div style={{ color: 'crimson', marginTop: 6 }}>{errors.email}</div>}
				</div>

				<div style={{ marginBottom: 12 }}>
					<label style={{ display: 'block', marginBottom: 6 }}>Password</label>
					<input
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						type="password"
						name="password"
						style={{ width: '100%', padding: '8px 10px' }}
					/>
					{errors.password && <div style={{ color: 'crimson', marginTop: 6 }}>{errors.password}</div>}
				</div>

				<div style={{ marginBottom: 12 }}>
					<label style={{ display: 'block', marginBottom: 6 }}>Confirm Password</label>
					<input
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						type="password"
						name="confirmPassword"
						style={{ width: '100%', padding: '8px 10px' }}
					/>
					{errors.confirmPassword && <div style={{ color: 'crimson', marginTop: 6 }}>{errors.confirmPassword}</div>}
				</div>

				<div style={{ marginBottom: 12 }}>
					<label style={{ display: 'block', marginBottom: 6 }}>Profile Picture (optional)</label>
					<input onChange={handleImageChange} type="file" accept="image/*" name="profilePicture" />
					{errors.image && <div style={{ color: 'crimson', marginTop: 6 }}>{errors.image}</div>}
					{imagePreview && (
						<div style={{ marginTop: 10 }}>
							<img src={imagePreview} alt="preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
						</div>
					)}
				</div>

				<div>
					<button type="submit" disabled={submitting} style={{ padding: '8px 16px' }}>
						{submitting ? 'Creating account…' : 'Sign Up'}
					</button>
				</div>
			</form>
			<div style={{ marginTop: 12 }}>
				Already have an account? <a href="/">Log in</a>
			</div>
		</div>
	)
}
