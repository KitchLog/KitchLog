import { useState } from 'react'
import './Home.css'

const FILTERS = ['All', 'Soup', 'Main', 'Dessert', 'Favorites']

function Home() {
  const [recipes] = useState([])
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Favorites' ? recipe.favorite : recipe.category.includes(activeFilter))
    return matchesSearch && matchesFilter
  })

  return (
    <div id="home">
      <header className="home-header">
        <h1>KitchLog</h1>
        <button type="button" className="add-recipe-btn">
          + Add New Recipe
        </button>
      </header>

      <nav className="home-nav">
        <span>🏠 Home</span>
        <span>🛒 My Grocery</span>
      </nav>

      <input
        type="text"
        className="search-bar"
        placeholder="Search Recipes...."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filter-pills">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`pill ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="recipe-list">
        {filteredRecipes.length === 0 ? (
          <p className="empty-state">No recipe added yet.</p>
        ) : (
          filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="recipe-row">
              <div className="recipe-image">Image for food</div>
              <div className="recipe-info">
                <h3>{recipe.title}</h3>
                <p>{recipe.category}</p>
              </div>
              <div className="recipe-meta">
                <span className={`heart ${recipe.favorite ? 'filled' : ''}`}>♥</span>
                <span className="cook-time">{recipe.cook_time} min</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Home
