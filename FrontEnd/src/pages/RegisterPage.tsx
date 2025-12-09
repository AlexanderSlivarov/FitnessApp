import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [gender, setGender] = useState<string>('0')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const formEl = (e.target as HTMLFormElement)
    if (!formEl.checkValidity()) {
      formEl.classList.add('was-validated')
      return
    }
    setLoading(true)
    try {
      const base = import.meta.env.VITE_AUTH_BASE_URL ?? import.meta.env.VITE_API_BASE_URL
      const res = await fetch(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password, firstName, lastName, phoneNumber, gender }).toString()
      })
      if (!res.ok) {
        const text = await res.text()
        setError(text || `Register failed (${res.status})`)
      } else {
        const data = await res.json().catch(()=>({message:'Registered'}))
        setMessage(data?.message ?? 'User registered successfully.')
        setTimeout(()=> navigate('/login'), 1200)
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-4" style={{maxWidth: 640}}>
      <div className="card shadow">
        <div className="card-header py-3">
          <h5 className="m-0 fw-bold text-primary">Create Your Account</h5>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="row gy-3 gx-4">
              <div className="col-12">
                <label className="form-label">Username</label>
                <input className="form-control form-control-lg" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} />
                <div className="invalid-feedback">Username must be at least 3 characters.</div>
              </div>
              <div className="col-12">
                <label className="form-label">Password</label>
                <input type="password" className="form-control form-control-lg" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                <div className="invalid-feedback">Password must be at least 6 characters.</div>
              </div>
              <div className="col-md-6">
                <label className="form-label">First name</label>
                <input className="form-control form-control-lg" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Last name</label>
                <input className="form-control form-control-lg" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input className="form-control" inputMode="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} pattern="^[+0-9\s-()]{7,}$" />
                <div className="invalid-feedback">Enter a valid phone number (min 7 digits).</div>
              </div>
              <div className="col-md-6">
                <label className="form-label d-block">Gender</label>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="gender" id="genderMale" value="0" checked={gender === '0'} onChange={e=>setGender(e.target.value)} />
                  <label className="form-check-label" htmlFor="genderMale">Male</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="gender" id="genderFemale" value="1" checked={gender === '1'} onChange={e=>setGender(e.target.value)} />
                  <label className="form-check-label" htmlFor="genderFemale">Female</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="gender" id="genderOther" value="2" checked={gender === '2'} onChange={e=>setGender(e.target.value)} />
                  <label className="form-check-label" htmlFor="genderOther">Other</label>
                </div>
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="terms" required />
                  <label className="form-check-label" htmlFor="terms">
                    I agree to the <a href="/terms" target="_blank" rel="noopener">terms and conditions</a>
                  </label>
                </div>
              </div>
            </div>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {message && <div className="alert alert-success mt-3">{message}</div>}
            <div className="mt-4">
              <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
          <div className="text-center mt-3">
            <span className="text-muted">Already have an account? </span>
            <a href="/login">Login</a>
          </div>
        </div>
      </div>
    </div>
  )
}
