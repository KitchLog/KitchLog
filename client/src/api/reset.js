const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(data?.error || 'Something went wrong. Please try again.')
    error.status = response.status
    throw error
  }

  return data
}

export const resetDatabase = async () => {
  const response = await fetch(`${API_URL}/reset`, { method: 'POST' })
  return handleResponse(response)
}
