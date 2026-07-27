const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error || 'Something went wrong. Please try again.')
  }

  return data
}

export const getRecipes = async () => {
  const response = await fetch(`${API_URL}/recipes`)
  return handleResponse(response)
}

export const createRecipe = async (recipe) => {
  const response = await fetch(`${API_URL}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(recipe),
  })

  return handleResponse(response)
}
