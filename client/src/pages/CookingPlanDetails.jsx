import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getCookingPlan,
  deleteCookingPlan,
} from "../api/cookingPlans";
import categoryAll from "../assets/category-all.svg";
import categoryAppetizer from "../assets/category-appetizer.svg";
import categoryDessert from "../assets/category-dessert.svg";
import categoryMain from "../assets/category-main.svg";
import categoryOther from "../assets/category-other.svg";
import cookingPlanImage from "../assets/cooking-plan.png"
import "./CookingPlanDetails.css";

const CATEGORY_IMAGES = {
  All: categoryAll,
  Appetizer: categoryAppetizer,
  Main: categoryMain,
  Dessert: categoryDessert,
  Other: categoryOther,
}

const getCategoryImage = (category) => CATEGORY_IMAGES[category] || categoryOther

const emptyCookingPlan = {
  id: '',
  name: "",
  recipes: [],
};

function CookingPlanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cookingPlan, setCookingPlan] = useState(emptyCookingPlan);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    const loadCookingPlan = async () => {
      try {
        const data = await getCookingPlan(id);
        setCookingPlan({
          id: data.id || "",
          name: data.name || "",
          recipes: data.recipes || [],
        });
      } catch (fetchError) {
        setDetailsError(
          fetchError.status === 404
            ? "Cooking plan not found."
            : fetchError.message,
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCookingPlan();
  }, [id]);

  const handleDeleteCookingPlan = async (planID) => {
      setError("");
  
      const shouldDelete = window.confirm('Delete this cooking plan? This cannot be undone.')
  
      if (!shouldDelete) {
        return
      }
  
      if (!planID) {
        setError("Cooking plan id is required.");
        return;
      }
  
      try {
        await deleteCookingPlan(planID)
        navigate(`/?tab=cooking-plans`);
      } catch (saveError) {
        setError(saveError.message);
      }
    };

  if (isLoading) {
    return (
      <main className="cooking-plan-details-page">
        <p className="details-status">Loading cooking plan...</p>
      </main>
    );
  }

  if (detailsError && cookingPlan.name === "") {
    return (
      <main className="cooking-plan-details-page">
        <div className="details-status details-error">
          <h1>{detailsError}</h1>
          <Link className='back-link' to="/?tab=cooking-plans">Back to cooking plans</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cooking-plan-details-page">

        <div className="details-topbar">
        <Link className='back-link' to="/?tab=cooking-plans">Back</Link>
        </div>


        <section className="details-hero">
        <img
            src={cookingPlanImage}
            alt=""
            aria-hidden="true"
        />

        <div className="details-hero-copy">
            <h1>{cookingPlan.name}</h1>
            <div className="details-meta">
            <span># of Recipes: {cookingPlan.recipes.length || 'N/A'}</span>
            </div>
        </div>
        </section>

        <div  className="cooking-plan-details">
        {error && <p className="details-error">{error}</p>}
        {detailsError && <p className="details-error">{detailsError}</p>}

        <div className="details-actions">
            <Link
            to={`/cooking-plans/${cookingPlan.id}/edit`}
            className="edit-link"
            >
            Edit Plan
            </Link>
            <button type="button" className="delete-btn" onClick={() => handleDeleteCookingPlan(cookingPlan.id)}>
            Delete Plan
            </button>
        </div>

        <section className="details-section">
            <div className="section-heading-row">
            <h2>Recipes</h2>
            </div>

            <div className="recipe-list">
            {cookingPlan.recipes.map((recipe) => (
                <div key={recipe.id} className="recipe-row">
                    <div className="recipe-image">
                    <img
                        src={
                        recipe.image_url || getCategoryImage(recipe.category)
                        }
                        alt=""
                        aria-hidden="true"
                        onError={(event) => {
                        event.currentTarget.src = getCategoryImage(
                            recipe.category,
                        );
                        }}
                    />
                    </div>
                    <div className="recipe-info">
                    <h3>{recipe.title}</h3>
                    <p>{recipe.category || "Uncategorized"}</p>
                    </div>
                    <div className="recipe-meta">
                    <span className="cook-time">
                        Time: {recipe.cook_time || "N/A"}
                    </span>
                    <span>Servings: {recipe.servings || "N/A"}</span>
                    </div>
                </div>
                ))}
            </div>
        </section>
      </div>
    </main>
  );
}

export default CookingPlanDetails;
