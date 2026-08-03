import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getRecipes } from "../api/recipes";
import {
  createCookingPlan,
  getCookingPlan,
  updateCookingPlan,
} from "../api/cookingPlans";
import categoryAll from "../assets/category-all.svg";
import categoryAppetizer from "../assets/category-appetizer.svg";
import categoryDessert from "../assets/category-dessert.svg";
import categoryMain from "../assets/category-main.svg";
import categoryOther from "../assets/category-other.svg";
import "./CookingPlanForm.css";

const CATEGORY_IMAGES = {
  All: categoryAll,
  Appetizer: categoryAppetizer,
  Main: categoryMain,
  Dessert: categoryDessert,
  Other: categoryOther,
}

const getCategoryImage = (category) => CATEGORY_IMAGES[category] || categoryOther

const emptyCookingPlan = {
  name: "",
  recipes: [],
};

function CookingPlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cookingPlan, setCookingPlan] = useState(emptyCookingPlan);
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState('')
  const isEditing = Boolean(id);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const loadCookingPlan = async () => {
      try {
        const data = await getCookingPlan(id);
        setCookingPlan({
          name: data.name || "",
          recipes: data.recipes || [],
        });
      } catch (fetchError) {
        setError(
          fetchError.status === 404
            ? "Cooking plan not found."
            : fetchError.message,
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCookingPlan();
  }, [id, isEditing]);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await getRecipes();
        setRecipes(data);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, [id, isEditing]);

  const handleCookingPlanChange = (event) => {
    const { name, value } = event.target;
    setCookingPlan((currentCookingPlan) => ({
      ...currentCookingPlan,
      [name]: value,
    }));
  };

  const addRecipe = (recipe) => {
    setCookingPlan((currentCookingPlan) => ({
      ...currentCookingPlan,
      recipes: [...currentCookingPlan.recipes, { ...recipe }],
    }));
  };

  const removeRecipe = (recipe) => {
    setCookingPlan((currentCookingPlan) => ({
      ...currentCookingPlan,
      recipes: currentCookingPlan.recipes.filter((r) => r.id !== recipe.id),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFormError("");
    setIsSaving(true);

    const payload = {
      ...cookingPlan,
      name: cookingPlan.name.trim(),
      recipes: cookingPlan.recipes,
    };

    if (!payload.name) {
      setFormError("Cooking plan title is required.");
      setIsSaving(false);
      return;
    }

    if (payload.recipes.length === 0) {
      setFormError("Add at least one recipe.");
      setIsSaving(false);
      return;
    }

    try {
      const savedCookingPlan = isEditing
        ? await updateCookingPlan(id, payload)
        : await createCookingPlan(payload);
      // navigate(`/cooking-plan/${savedCookingPlan.id}`);
      navigate(`/`);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="cooking-plan-form-page">
        <p className="form-status">Loading cooking plan...</p>
      </main>
    );
  }

  if (isEditing && error && cookingPlan.name === "") {
    return (
      <main className="cooking-plan-form-page">
        <div className="form-status form-error">
          <h1>{error}</h1>
          <Link className='back-link' to="/">Back to cooking plans</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cooking-plan-form-page">
      <div className="form-topbar">
        <Link className='back-link' to={isEditing ? `/cooking-plans/${id}` : "/"}>Back</Link>
      </div>

      <header className="form-header">
        <p className="eyebrow">
          {isEditing ? "Cooking Plan update" : "Manual entry"}
        </p>
        <h1>{isEditing ? "Edit Cooking Plan" : "Create Cooking Plan"}</h1>
        <p>
          {isEditing
            ? "Update the cooking plan details and recipes."
            : "Save the cooking plan details and at least one recipe."}
        </p>
      </header>

      <form className="cooking-plan-form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}
        {formError && <p className="form-error">{formError}</p>}

        <section className="form-section">
          <h2>Cooking Plan Details</h2>

          <label>
            <span>Title</span>
            <input
              name="name"
              value={cookingPlan.name}
              onChange={handleCookingPlanChange}
              required
            />
          </label>
        </section>

        <section className="form-section">
          <div className="section-heading-row">
            <h2>Recipes</h2>
            {/* <button type="button" className="secondary-btn" onClick={}>
              Add Recipe
            </button>
            <button type="button" className="secondary-btn" onClick={}>
              Import Recipe
            </button> */}
          </div>

          <div className="recipe-list">
            {!isLoading &&
              !error &&
              recipes.map((recipe) => (
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
                  <button
                    className={
                      cookingPlan.recipes.some((r) => r.id === recipe.id)
                        ? "add-or-remove-recipe-btn red"
                        : "add-or-remove-recipe-btn green"
                    }
                    type="button"
                    onClick={() =>
                      cookingPlan.recipes.some((r) => r.id === recipe.id)
                        ? removeRecipe(recipe)
                        : addRecipe(recipe)
                    }
                  >
                    {cookingPlan.recipes.some((r) => r.id === recipe.id)
                      ? "Remove recipe from plan"
                      : "Add recipe to plan"}
                  </button>
                </div>
              ))}
          </div>
        </section>

        <div className="form-actions">
          <Link
            to={isEditing ? `/cooking-plans/${id}` : "/"}
            className="cancel-link"
          >
            Cancel
          </Link>
          <button type="submit" className="save-btn" disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : isEditing
                ? "Update Cooking Plan"
                : "Save Cooking Plan"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default CookingPlanForm;
