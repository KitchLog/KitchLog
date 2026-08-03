import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resetDatabase } from '../api/reset'
import './Admin.css'

function Admin() {
  const [isResetting, setIsResetting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async () => {
    const shouldReset = window.confirm(
      'Reset the database to its default demo data? This deletes every recipe and cooking plan and cannot be undone.',
    )

    if (!shouldReset) {
      return
    }

    setError('')
    setSuccess(false)
    setIsResetting(true)

    try {
      await resetDatabase()
      setSuccess(true)
    } catch (resetError) {
      setError(resetError.message)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <main className="admin-page">
      <div className="form-topbar">
        <Link className="back-link" to="/">Back to Home</Link>
      </div>

      <header className="form-header">
        <p className="eyebrow">Admin</p>
        <h1>Reset Database</h1>
        <p>
          Resets the database to its default demo data (a few sample recipes and a cooking plan).
          Intended for testing and grading only &mdash; this deletes all current data.
        </p>
      </header>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="admin-success">Database has been reset to its default state.</p>}

      <button type="button" className="danger-btn" onClick={handleReset} disabled={isResetting}>
        {isResetting ? 'Resetting...' : 'Reset Demo Data'}
      </button>
    </main>
  )
}

export default Admin
