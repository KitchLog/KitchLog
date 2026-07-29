import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteRecipe, getRecipe } from '../api/recipes'
import categoryAppetizer from '../assets/category-appetizer.svg'
import categoryDessert from '../assets/category-dessert.svg'
import categoryMain from '../assets/category-main.svg'
import categoryOther from '../assets/category-other.svg'
import './RecipeDetails.css'

const CATEGORY_IMAGES = {
  Appetizer: categoryAppetizer,
  Main: categoryMain,
  Dessert: categoryDessert,
  Other: categoryOther,
}

const getCategoryImage = (category) => CATEGORY_IMAGES[category] || categoryOther

const formatIngredient = (ingredient) =>
  [ingredient.quantity, ingredient.unit, ingredient.name].filter(Boolean).join(' ')

function RecipeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const data = await getRecipe(id)
        setRecipe(data)
      } catch (fetchError) {
        setError(fetchError.status === 404 ? 'Recipe not found' : fetchError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecipe()
  }, [id])

  const handleDelete = async () => {
    const shouldDelete = window.confirm('Delete this recipe? This cannot be undone.')

    if (!shouldDelete) {
      return
    }

    setError('')
    setIsDeleting(true)

    try {
      await deleteRecipe(id)
      navigate('/')
    } catch (deleteError) {
      setError(deleteError.message)
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="recipe-details-page">
        <p className="details-status">Loading recipe details...</p>
      </main>
    )
  }

  if (error && !recipe) {
    return (
      <main className="recipe-details-page">
        <div className="details-status details-error">
          <h1>{error}</h1>
          <p>We could not find that recipe. It may have been deleted or the link may be wrong.</p>
          <Link to="/" className="primary-link">
            Back to recipes
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="recipe-details-page">
      <div className="details-topbar">
        <Link to="/">Back to recipes</Link>
      </div>

      {error && <p className="details-inline-error">{error}</p>}

      <section className="details-hero">
        <img
          src={recipe.image_url || getCategoryImage(recipe.category)}
          alt=""
          aria-hidden="true"
          onError={(event) => {
            event.currentTarget.src = getCategoryImage(recipe.category)
          }}
        />

        <div className="details-hero-copy">
          <p className="eyebrow">{recipe.category || 'Uncategorized'}</p>
          <h1>{recipe.title}</h1>
          <div className="details-meta">
            <span>Time: {recipe.cook_time || 'N/A'}</span>
            <span>Servings: {recipe.servings || 'N/A'}</span>
            <span>{recipe.favorite ? 'Favorite' : 'Not favorite'}</span>
          </div>
        </div>
      </section>

      <div className="details-actions">
        <Link to={`/recipes/${recipe.id}/edit`} className="primary-link">
          Edit Recipe
        </Link>
        <button type="button" className="danger-btn" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete Recipe'}
        </button>
      </div>

      <section className="details-section">
        <h2>Ingredients</h2>
        {recipe.ingredients?.length ? (
          <ul className="ingredient-details-list">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.id}>{formatIngredient(ingredient)}</li>
            ))}
          </ul>
        ) : (
          <p className="muted-text">No ingredients listed.</p>
        )}
      </section>

      <section className="details-section">
        <h2>Instructions</h2>
        {recipe.instructions ? (
          <div className="instruction-card">
            {recipe.instructions.split('\n').map((step, index) => (
              <p key={index}>{step}</p>
            ))}
          </div>
        ) : (
          <p className="muted-text">No instructions added yet.</p>
        )}
      </section>

      {recipe.source_url && (
        <section className="details-section">
          <h2>Source</h2>
          <a href={recipe.source_url} target="_blank" rel="noreferrer" className="source-link">
            {recipe.source_url}
          </a>
        </section>
      )}
    </main>
  )
}

export default RecipeDetails
