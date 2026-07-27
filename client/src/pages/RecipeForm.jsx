import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createRecipe } from '../api/recipes'
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
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(emptyRecipe)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

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
      cook_time: recipe.cook_time ? Number(recipe.cook_time) : null,
      servings: recipe.servings ? Number(recipe.servings) : null,
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
      await createRecipe(payload)
      navigate('/')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="recipe-form-page">
      <div className="form-topbar">
        <Link to="/">Back</Link>
      </div>

      <header className="form-header">
        <p className="eyebrow">Manual entry</p>
        <h1>Add Recipe</h1>
        <p>Save the recipe details and at least one ingredient.</p>
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
                {RECIPE_CATEGORIES.map((category) => (
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
                type="number"
                min="0"
                value={recipe.cook_time}
                onChange={handleRecipeChange}
                placeholder="Minutes"
              />
            </label>

            <label>
              <span>Servings</span>
              <input
                name="servings"
                type="number"
                min="1"
                value={recipe.servings}
                onChange={handleRecipeChange}
                placeholder="4"
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
          <Link to="/" className="cancel-link">
            Cancel
          </Link>
          <button type="submit" className="save-btn" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Recipe'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default RecipeForm
