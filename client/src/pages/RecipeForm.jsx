import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createRecipe, getRecipe, updateRecipe } from '../api/recipes'
import categoryOther from '../assets/category-other.svg'
import { RECIPE_CATEGORIES } from '../constants/categories'
import './RecipeForm.css'

const emptyIngredient = { name: '', quantity: '', unit: '' }
const emptyRecipe = {
  title: '',
  category: '',
  cook_time: '',
  servings: '',
  instructions: '',
  source_url: '',
  image_url: '',
  ingredients: [{ ...emptyIngredient }],
}

function RecipeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(emptyRecipe)
  const [isLoading, setIsLoading] = useState(Boolean(id))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const isEditing = Boolean(id)

  useEffect(() => {
    if (!isEditing) {
      return
    }

    const loadRecipe = async () => {
      try {
        const data = await getRecipe(id)
        setRecipe({
          title: data.title || '',
          category: data.category || '',
          cook_time: data.cook_time || '',
          servings: data.servings || '',
          instructions: data.instructions || '',
          source_url: data.source_url || '',
          image_url: data.image_url || '',
          ingredients: data.ingredients?.length
            ? data.ingredients.map((ingredient) => ({
                name: ingredient.name || '',
                quantity: ingredient.quantity || '',
                unit: ingredient.unit || '',
              }))
            : [{ ...emptyIngredient }],
        })
      } catch (fetchError) {
        setError(fetchError.status === 404 ? 'Recipe not found.' : fetchError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecipe()
  }, [id, isEditing])

  const handleRecipeChange = (event) => {
    const { name, value } = event.target
    setRecipe((currentRecipe) => ({
      ...currentRecipe,
      [name]: value,
    }))
  }

  const handleIngredientChange = (index, event) => {
    const { name, value } = event.target

    setRecipe((currentRecipe) => ({
      ...currentRecipe,
      ingredients: currentRecipe.ingredients.map((ingredient, ingredientIndex) =>
        ingredientIndex === index ? { ...ingredient, [name]: value } : ingredient,
      ),
    }))
  }

  const addIngredient = () => {
    setRecipe((currentRecipe) => ({
      ...currentRecipe,
      ingredients: [...currentRecipe.ingredients, { ...emptyIngredient }],
    }))
  }

  const removeIngredient = (index) => {
    setRecipe((currentRecipe) => ({
      ...currentRecipe,
      ingredients:
        currentRecipe.ingredients.length === 1
          ? currentRecipe.ingredients
          : currentRecipe.ingredients.filter((ingredient, ingredientIndex) => ingredientIndex !== index),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSaving(true)

    const payload = {
      ...recipe,
      title: recipe.title.trim(),
      category: recipe.category.trim() || null,
      cook_time: recipe.cook_time.trim() || null,
      servings: recipe.servings.trim() || null,
      instructions: recipe.instructions.trim() || null,
      source_url: recipe.source_url.trim() || null,
      image_url: recipe.image_url.trim() || null,
      ingredients: recipe.ingredients
        .map((ingredient) => ({
          name: ingredient.name.trim(),
          quantity: ingredient.quantity.trim() || null,
          unit: ingredient.unit.trim() || null,
        }))
        .filter((ingredient) => ingredient.name),
    }

    if (!payload.title) {
      setError('Recipe title is required.')
      setIsSaving(false)
      return
    }

    if (payload.ingredients.length === 0) {
      setError('Add at least one ingredient.')
      setIsSaving(false)
      return
    }

    try {
      const savedRecipe = isEditing ? await updateRecipe(id, payload) : await createRecipe(payload)
      navigate(`/recipes/${savedRecipe.id}`)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const categoryOptions =
    recipe.category && !RECIPE_CATEGORIES.includes(recipe.category)
      ? [...RECIPE_CATEGORIES, recipe.category]
      : RECIPE_CATEGORIES

  if (isLoading) {
    return (
      <main className="recipe-form-page">
        <p className="form-status">Loading recipe...</p>
      </main>
    )
  }

  if (isEditing && error && recipe.title === '') {
    return (
      <main className="recipe-form-page">
        <div className="form-status form-error">
          <h1>{error}</h1>
          <Link to="/">Back to recipes</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="recipe-form-page">
      <div className="form-topbar">
        <Link className='back-link' to={isEditing ? `/recipes/${id}` : '/'}>Back</Link>
      </div>

      <header className="form-header">
        <p className="eyebrow">{isEditing ? 'Recipe update' : 'Manual entry'}</p>
        <h1>{isEditing ? 'Edit Recipe' : 'Add Recipe'}</h1>
        <p>
          {isEditing
            ? 'Update the recipe details and ingredients.'
            : 'Save the recipe details and at least one ingredient.'}
        </p>
      </header>

      <form className="recipe-form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        <section className="form-section">
          <h2>Recipe Details</h2>

          <label>
            <span>Title</span>
            <input name="title" value={recipe.title} onChange={handleRecipeChange} required />
          </label>

          <div className="form-grid">
            <label>
              <span>Category</span>
              <select
                name="category"
                value={recipe.category}
                onChange={handleRecipeChange}
              >
                <option value="">Select category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Cook time</span>
              <input
                name="cook_time"
                value={recipe.cook_time}
                onChange={handleRecipeChange}
                placeholder="40 min"
              />
              <small className="field-note neutral">Include the unit, like 40 min or 1.5-2 hours.</small>
            </label>

            <label>
              <span>Servings</span>
              <input
                name="servings"
                value={recipe.servings}
                onChange={handleRecipeChange}
                placeholder="4-6 people"
              />
            </label>
          </div>

          <label>
            <span>Recipe Image URL</span>
            <input
              name="image_url"
              type="url"
              value={recipe.image_url}
              onChange={handleRecipeChange}
              placeholder="Optional image link"
            />
          </label>

          <div className="image-preview-card">
            <img src={recipe.image_url || categoryOther} alt="" aria-hidden="true" />
            <p>{recipe.image_url ? 'Image preview' : 'Image placeholder'}</p>
          </div>

          <label>
            <span>Source URL</span>
            <input
              name="source_url"
              type="url"
              value={recipe.source_url}
              onChange={handleRecipeChange}
              placeholder="Optional"
            />
            <small className="field-note">
              This saves the original recipe link only. It does not auto-import recipe details.
            </small>
          </label>

          <label>
            <span>Instructions</span>
            <textarea
              name="instructions"
              rows="6"
              value={recipe.instructions}
              onChange={handleRecipeChange}
              placeholder="Write the cooking steps here"
            />
          </label>
        </section>

        <section className="form-section">
          <div className="section-heading-row">
            <h2>Ingredients</h2>
            <button type="button" className="secondary-btn" onClick={addIngredient}>
              Add ingredient
            </button>
          </div>

          <div className="ingredient-list">
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-row">
                <label>
                  <span>Name</span>
                  <input
                    name="name"
                    value={ingredient.name}
                    onChange={(event) => handleIngredientChange(index, event)}
                    placeholder="Flour"
                  />
                </label>

                <label>
                  <span>Quantity</span>
                  <input
                    name="quantity"
                    value={ingredient.quantity || ''}
                    onChange={(event) => handleIngredientChange(index, event)}
                    placeholder="2"
                  />
                </label>

                <label>
                  <span>Unit</span>
                  <input
                    name="unit"
                    value={ingredient.unit || ''}
                    onChange={(event) => handleIngredientChange(index, event)}
                    placeholder="cups"
                  />
                </label>

                <button type="button" className="remove-btn" onClick={() => removeIngredient(index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="form-actions">
          <Link to={isEditing ? `/recipes/${id}` : '/'} className="cancel-link">
            Cancel
          </Link>
          <button type="submit" className="save-btn" disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditing ? 'Update Recipe' : 'Save Recipe'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default RecipeForm
