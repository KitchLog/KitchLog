import { Link } from 'react-router-dom'
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

function RecipeRow({ recipe, to, action }) {
  const content = (
    <>
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
      {action}
    </>
  )

  if (to) {
    return (
      <Link to={to} className="recipe-row">
        {content}
      </Link>
    )
  }

  return <div className="recipe-row">{content}</div>
}

export default RecipeRow
