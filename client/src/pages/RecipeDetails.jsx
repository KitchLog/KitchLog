import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteRecipe, getRecipe, updateRecipeFavorite } from '../api/recipes'
import { getCookingPlans, updateCookingPlan } from '../api/cookingPlans'
import './RecipeDetails.css'

import categoryAppetizer from '../assets/category-appetizer.svg'
import categoryDessert from '../assets/category-dessert.svg'
import categoryMain from '../assets/category-main.svg'
import categoryOther from '../assets/category-other.svg'



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
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [error, setError] = useState('')
  const [planError, setPlanError] = useState('')
  const [isPlanMenuOpen, setIsPlanMenuOpen] = useState(false)
  const [cookingPlans, setCookingPlans] = useState([])
  const [pendingPlanId, setPendingPlanId] = useState(null)

  const planMenuRef = useRef(null)

  
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
  
  useEffect(() => {
    const loadCookingPlans = async () => {
      try {
        const data = await getCookingPlans()
        setCookingPlans(data)
      } catch (fetchError) {
        setPlanError(fetchError.message)
      }
    }
    
    loadCookingPlans()
  }, [])

  useEffect(() => {
    if (!isPlanMenuOpen) {
      return
    }

    const handlePointerDown = (event) => {
      if (planMenuRef.current && !planMenuRef.current.contains(event.target)) {
        setIsPlanMenuOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsPlanMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPlanMenuOpen])

  const planContainsRecipe = (plan) =>
    (plan.recipes || []).some((planRecipe) => planRecipe.id === recipe?.id)

  const togglePlan = async (plan) => {
    if (pendingPlanId) {
      return
    }

    setPlanError('')
    setPendingPlanId(plan.id)

    const currentIds = (plan.recipes || []).map((planRecipe) => planRecipe.id)
    const nextIds = planContainsRecipe(plan)
      ? currentIds.filter((recipeId) => recipeId !== recipe.id)
      : [...currentIds, recipe.id]

    try {
      const updatedPlan = await updateCookingPlan(plan.id, { recipeIds: nextIds })
      setCookingPlans((plans) =>
        plans.map((currentPlan) => (currentPlan.id === plan.id ? updatedPlan : currentPlan)),
      )
    } catch (updateError) {
      setPlanError(updateError.message)
    } finally {
      setPendingPlanId(null)
    }
  }

  const handleToggleFavorite = async () => {
    if (isTogglingFavorite) {
      return
    }

    const nextFavorite = !recipe.favorite

    setError('')
    setIsTogglingFavorite(true)
    setRecipe((currentRecipe) => ({ ...currentRecipe, favorite: nextFavorite }))

    try {
      await updateRecipeFavorite(id, nextFavorite)
    } catch (favoriteError) {
      setError(favoriteError.message)
      setRecipe((currentRecipe) => ({ ...currentRecipe, favorite: !nextFavorite }))
    } finally {
      setIsTogglingFavorite(false)
    }
  }

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
          <Link to="/" className="back-link">
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="recipe-details-page">
      <div className="details-topbar">
        <Link className='back-link' to="/">Back to Home</Link>
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
            <button
              type="button"
              className={`favorite-pill ${recipe.favorite ? 'active' : ''}`}
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
              aria-pressed={recipe.favorite}
            >
              {recipe.favorite ? '★ Favorited' : '☆ Add to favorites'}
            </button>
          </div>
        </div>
      </section>

      <div className="details-actions">
        <div className='left-actions' ref={planMenuRef}>
          <button
            type="button"
            className="primary-link add-recipe-to-plan-btn"
            onClick={() => setIsPlanMenuOpen((isOpen) => !isOpen)}
            aria-expanded={isPlanMenuOpen}
            aria-haspopup="true"
          >
            Add Recipe to Cooking Plan
          </button>

          {isPlanMenuOpen && (
            <div className="plan-menu" role="menu">
              {planError && <p className="plan-menu-error">{planError}</p>}

              {cookingPlans.length === 0 ? (
                <p className="plan-menu-empty">No cooking plans yet.</p>
              ) : (
                cookingPlans.map((plan) => {
                  const isInPlan = planContainsRecipe(plan)

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      role="menuitemcheckbox"
                      aria-checked={isInPlan}
                      className="plan-menu-item"
                      onClick={() => togglePlan(plan)}
                      disabled={pendingPlanId !== null}
                    >
                      <span className="plan-menu-tick" aria-hidden="true">
                        {isInPlan ? '✓' : ''}
                      </span>
                      <span className="plan-menu-name">{plan.name}</span>
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>
        <div className='right-actions'>
          <Link to={`/recipes/${recipe.id}/edit`} className="primary-link">
            Edit Recipe
          </Link>
          <button type="button" className="danger-btn" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Recipe'}
          </button>
        </div>
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
