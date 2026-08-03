import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRecipes, updateRecipeFavorite } from '../api/recipes'
import { getCookingPlans, deleteCookingPlan } from '../api/cookingPlans'
import categoryAll from '../assets/category-all.svg'
import categoryAppetizer from '../assets/category-appetizer.svg'
import categoryDessert from '../assets/category-dessert.svg'
import categoryMain from '../assets/category-main.svg'
import categoryOther from '../assets/category-other.svg'
import cookingHero from '../assets/cooking-hero.svg'
import emptyRecipes from '../assets/empty-recipes.svg'
import emptyCookingPlans from '../assets/empty-cooking-plans.svg'
import cookingPlanImage from '../assets/cooking-plan.png'
import { DEFAULT_CATEGORIES } from '../constants/categories'
import './Home.css'

const CATEGORY_IMAGES = {
  All: categoryAll,
  Appetizer: categoryAppetizer,
  Main: categoryMain,
  Dessert: categoryDessert,
  Other: categoryOther,
}

const getCategoryImage = (category) => CATEGORY_IMAGES[category] || categoryOther

function Home() {
  const [recipes, setRecipes] = useState([])
  const [cookingPlans, setCookingPlans] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [pendingFavoriteIds, setPendingFavoriteIds] = useState(new Set())
  const [recipeSearch, setRecipeSearch] = useState('')
  const [cookingPlanSearch, setCookingPlanSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [favoriteError, setFavoriteError] = useState('')
  const [activeTab, setActiveTab] = useState('recipes')

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await getRecipes()
        setRecipes(data)
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecipes()
  }, [])

  useEffect(() => {
    const loadCookingPlans = async () => {
      try {
        const data = await getCookingPlans()
        setCookingPlans(data)
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadCookingPlans()
  }, [])

  const handleToggleFavorite = async (event, recipe) => {
    event.preventDefault()
    event.stopPropagation()

    if (pendingFavoriteIds.has(recipe.id)) {
      return
    }

    const nextFavorite = !recipe.favorite

    setFavoriteError('')
    setPendingFavoriteIds((previous) => new Set(previous).add(recipe.id))
    setRecipes((previous) =>
      previous.map((r) => (r.id === recipe.id ? { ...r, favorite: nextFavorite } : r)),
    )

    try {
      await updateRecipeFavorite(recipe.id, nextFavorite)
    } catch (toggleError) {
      setFavoriteError(toggleError.message)
      setRecipes((previous) =>
        previous.map((r) => (r.id === recipe.id ? { ...r, favorite: recipe.favorite } : r)),
      )
    } finally {
      setPendingFavoriteIds((previous) => {
        const next = new Set(previous)
        next.delete(recipe.id)
        return next
      })
    }
  }

  const handleDeleteCookingPlan = async (event, id) => {
      event.preventDefault();
      event.stopPropagation()
      setError("");

      const shouldDelete = window.confirm('Delete this cooking plan? This cannot be undone.')

      if (!shouldDelete) {
        return
      }
  
      if (!id) {
        setError("Cooking plan id is required.");
        return;
      }
  
      try {
        await deleteCookingPlan(id)
        setCookingPlans(plans => plans.filter(p => p.id !== id))
        // navigate(`/cooking-plan/${savedCookingPlan.id}`);
        // navigate(`/`);
      } catch (saveError) {
        setError(saveError.message);
      }
    };

  const categories = [
    ...DEFAULT_CATEGORIES,
    ...new Set(
      recipes
        .map((recipe) => recipe.category)
        .filter((category) => category && !DEFAULT_CATEGORIES.includes(category)),
    ),
  ]
  const normalizedRecipeSearch = recipeSearch.trim().toLowerCase()
  const normalizedCookingPlanSearch = cookingPlanSearch.trim().toLowerCase()
  const displayedRecipes = recipes.filter((recipe) => {
    const matchesCategory = activeCategory === 'All' || recipe.category === activeCategory
    const matchesSearch = (recipe.title || '').toLowerCase().includes(normalizedRecipeSearch)
    const matchesFavorite = !showFavoritesOnly || recipe.favorite
    return matchesCategory && matchesSearch && matchesFavorite
  })
  const displayedCookingPlans = cookingPlans.filter((cookingPlan) => {
    const matchesSearch = (cookingPlan.name || '').toLowerCase().includes(normalizedCookingPlanSearch)
    return matchesSearch
  })

  return (
    <div id="home">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">Recipe manager</p>
          <h1>KitchLog</h1>
          <p className="home-subtitle">
            Keep your recipes organized, easy to scan, and ready for your next grocery run.
          </p>
        </div>

        <div className='buttons'>
          <Link to="/recipes/new" className="add-recipe-btn">
            <span>+</span>
            Add Recipe
          </Link>
          <Link to="/recipes/import" className="import-recipe-btn">
            <span>+</span>
            Import Recipe
          </Link>
        </div>

        <img className="home-hero-image" src={cookingHero} alt="" aria-hidden="true" />
      </section>

      <div className='tab-buttons'>
        <button
          className= {activeTab === "recipes" ? "tab-btn tabActive" : "tab-btn"}
          type="button"
          onClick={() => setActiveTab('recipes')}
        >
          Recipes
        </button>
        <button
          className= {activeTab === "cooking-plans" ? "tab-btn tabActive" : "tab-btn"}
          type="button"
          onClick={() => setActiveTab('cooking-plans')}
        >
          Cooking Plans
        </button>
      </div>

      {!isLoading && !error && activeTab === 'recipes' && (
        <div className='tab-content'>
          <section className="recipe-controls" aria-label="Search and filter recipes">
            <label className="search-field">
              <input
                type="text"
                placeholder="Search by recipe name"
                value={recipeSearch}
                onChange={(event) => setRecipeSearch(event.target.value)}
              />
            </label>

            <div className="filter-bar" aria-label="Filter recipes by category">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`filter-pill ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  <img src={getCategoryImage(category)} alt="" aria-hidden="true" />
                  {category}
                </button>
              ))}
              <button
                type="button"
                className={`filter-pill favorite-filter-pill ${showFavoritesOnly ? 'active' : ''}`}
                onClick={() => setShowFavoritesOnly((value) => !value)}
                aria-pressed={showFavoritesOnly}
              >
                {showFavoritesOnly ? '★' : '☆'} Favorites only
              </button>
            </div>
          </section>

          {favoriteError && <p className="inline-error">{favoriteError}</p>}

          <div className="recipe-list">
            {isLoading && <p className="status-card">Loading your recipe box...</p>}

            {!isLoading && error && (
              <div className="status-card error-state">
                <h2>Could not load recipes</h2>
                <p>{error}</p>
              </div>
            )}

            {!isLoading && !error && recipes.length === 0 && (
              <div className="status-card empty-state">
                <img className="empty-state-image" src={emptyRecipes} alt="" aria-hidden="true" />
                <h2>Your recipe box is empty</h2>
                <div className='buttons'>
                  <Link to="/recipes/new" className="empty-action">
                    Add your first recipe manually
                  </Link>
                  <Link to="/recipes/import" className="empty-action">
                    Import your first recipe
                  </Link>
                </div>
              </div>
            )}

            {!isLoading &&
              !error &&
              recipes.length > 0 &&
              displayedRecipes.length === 0 && (
                <div className="status-card empty-state">
                  <h2>No recipes found</h2>
                  <p>Try another keyword or category to keep browsing your saved recipes.</p>
                </div>
              )}

            {!isLoading &&
              !error &&
              displayedRecipes.map((recipe) => (
                <Link key={recipe.id} to={`/recipes/${recipe.id}`} className="recipe-row">
                  <div className="recipe-image">
                    <img
                      src={recipe.image_url || getCategoryImage(recipe.category)}
                      alt=""
                      aria-hidden="true"
                      onError={(event) => {
                        event.currentTarget.src = getCategoryImage(recipe.category)
                      }}
                    />
                  </div>
                  <div className="recipe-info">
                    <h3>{recipe.title}</h3>
                    <p>{recipe.category || 'Uncategorized'}</p>
                  </div>
                  <div className="recipe-meta">
                    <span className="cook-time">Time: {recipe.cook_time || 'N/A'}</span>
                    <span>Servings: {recipe.servings || 'N/A'}</span>
                  </div>
                  <button
                    type="button"
                    className={`favorite-btn ${recipe.favorite ? 'active' : ''}`}
                    onClick={(event) => handleToggleFavorite(event, recipe)}
                    disabled={pendingFavoriteIds.has(recipe.id)}
                    aria-pressed={recipe.favorite}
                    aria-label={recipe.favorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {recipe.favorite ? '★' : '☆'}
                  </button>
                </Link>
              ))}
          </div>
        </div>
      )}

      {!isLoading && !error && activeTab === 'cooking-plans' && (
        <div className='tab-content'>
          <section className="cooking-plan-controls" aria-label="Search & Create cooking plans">
            <label className="search-field">
              <input
                type="text"
                placeholder="Search by cooking plan name"
                value={cookingPlanSearch}
                onChange={(event) => setCookingPlanSearch(event.target.value)}
              />
            </label>
            <Link to="/cooking-plans/new" className="add-cooking-plan-btn" style={{"marginTop": 0}}>
                    Create cooking plan
            </Link>
          </section>

          <div className="cooking-plan-list">
            {isLoading && <p className="status-card">Loading your cooking plans...</p>}

            {!isLoading && error && (
              <div className="status-card error-state">
                <h2>Could not load cooking plans</h2>
                <p>{error}</p>
              </div>
            )}

            {!isLoading && !error && cookingPlans.length === 0 && (
              <div className="status-card empty-state">
                <img className="empty-state-image" src={emptyCookingPlans} alt="" aria-hidden="true" />
                <h2>Your cooking plan box is empty</h2>
                <div className='buttons'>
                  <Link to="/cooking-plans/new" className="add-cooking-plan-btn">
                    Create your first cooking plan
                  </Link>
                </div>
              </div>
            )}

            {!isLoading &&
              !error &&
              cookingPlans.length > 0 &&
              displayedCookingPlans.length === 0 && (
                <div className="status-card empty-state">
                  <h2>No cooking plans found</h2>
                  <p>Try another keyword to keep browsing your saved cooking plans.</p>
                </div>
              )}

            {!isLoading &&
              !error &&
              displayedCookingPlans.map((cookingPlan) => (
                <Link key={cookingPlan.id} to={`/cooking-plans/${cookingPlan.id}`} className="cooking-plan-row">
                  <div className="cooking-plan-image">
                    <img
                      src={cookingPlanImage}
                      alt=""
                      aria-hidden="true"
                    />
                  </div>
                  <div className="cooking-plan-info">
                    <h3>{cookingPlan.name}</h3>
                  </div>
                  <div className="cooking-plan-meta">
                    <span className="plan-recipes-count"># of Recipes: {cookingPlan.recipes.length || 'N/A'}</span>
                  </div>
                  <button
                    className="delete-cooking-plan-btn red"
                    type="button"
                    onClick={(event) => handleDeleteCookingPlan(event, cookingPlan.id)}
                  >
                    Delete
                  </button>
                </Link>
              ))}
          </div>
        </div>
      )}

  
    </div>
  )
}

export default Home
