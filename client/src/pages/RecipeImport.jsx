import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { importRecipe } from '../api/recipes'
import './RecipeImport.css'

function RecipeImport() {
  const navigate = useNavigate()
  const [recipeURL, setRecipeURL] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleRecipeURLChange = (event) => {
    const { name, value } = event.target
    setRecipeURL(value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSaving(true)

    const payload = {
      source_url: recipeURL,
    }

    try {
      await importRecipe(payload)
    //   console.log("Recipe Imported") //for debugging
      navigate('/')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="recipe-import-page">
      <div className="form-topbar">
        <Link to="/">Back</Link>
      </div>

      <header className="form-header">
        <p className="eyebrow">Automatic entry</p>
        <h1>Import Recipe</h1>
        <p>Add recipe via pasted URL.</p>
      </header>

      <form className="recipe-form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        <section className='form-section'>
            <h2>Import URL</h2>

            <label>
                <span>Recipe URL</span>
                <input name="url" value={recipeURL} onChange={handleRecipeURLChange} required />
                <button type="submit" className="import-btn">
                  Import
                </button>
            </label>
        </section>
      </form>
    </main>
  )
}

export default RecipeImport
