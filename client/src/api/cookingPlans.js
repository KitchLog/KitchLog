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

export const getCookingPlans = async () => {
  const response = await fetch(`${API_URL}/cooking-plans`)
  return handleResponse(response)
}

export const getCookingPlan = async (id) => {
  const response = await fetch(`${API_URL}/cooking-plans/${id}`)
  return handleResponse(response)
}

export const createCookingPlan = async (cookingPlan) => {
  const response = await fetch(`${API_URL}/cooking-plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cookingPlan),
  })

  return handleResponse(response)
}

export const updateCookingPlan = async (id, cookingPlan) => {
  const response = await fetch(`${API_URL}/cooking-plans/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cookingPlan),
  })

  return handleResponse(response)
}

export const deleteCookingPlan = async (id) => {
  const response = await fetch(`${API_URL}/cooking-plans/${id}`, {
    method: 'DELETE',
  })

  return handleResponse(response)
}
