import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRecipes } from '../api/recipes'
import categoryAll from '../assets/category-all.svg'
import categoryAppetizer from '../assets/category-appetizer.svg'
import categoryDessert from '../assets/category-dessert.svg'
import categoryMain from '../assets/category-main.svg'
import categoryOther from '../assets/category-other.svg'
import cookingHero from '../assets/cooking-hero.svg'
import emptyRecipes from '../assets/empty-recipes.svg'
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
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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

  const categories = [
    ...DEFAULT_CATEGORIES,
    ...new Set(
      recipes
        .map((recipe) => recipe.category)
        .filter((category) => category && !DEFAULT_CATEGORIES.includes(category)),
    ),
  ]
  const normalizedSearch = search.trim().toLowerCase()
  const displayedRecipes = recipes.filter((recipe) => {
    const matchesCategory = activeCategory === 'All' || recipe.category === activeCategory
    const matchesSearch = (recipe.title || '').toLowerCase().includes(normalizedSearch)

    return matchesCategory && matchesSearch
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
            Add Manually
          </Link>
          <Link to="/recipes/import" className="import-recipe-btn">
            <span>+</span>
            Import Recipe
          </Link>
        </div>

        <img className="home-hero-image" src={cookingHero} alt="" aria-hidden="true" />
      </section>

      {!isLoading && !error && (
        <section className="recipe-controls" aria-label="Search and filter recipes">
          <label className="search-field">
            <span>Search recipes</span>
            <input
              type="text"
              placeholder="Search by recipe name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
          </div>
        </section>
      )}

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
            </Link>
          ))}
      </div>
    </div>
  )
}

export default Home
