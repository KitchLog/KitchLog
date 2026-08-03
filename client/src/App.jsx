import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import RecipeDetails from './pages/RecipeDetails'
import CookingPlanDetails from './pages/CookingPlanDetails'
import GroceryList from './pages/GroceryList'
import RecipeForm from './pages/RecipeForm'
import CookingPlanForm from './pages/CookingPlanForm'
import RecipeImport from './pages/RecipeImport'
import Admin from './pages/Admin'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes/new" element={<RecipeForm />} />
        <Route path="/cooking-plans/new" element={<CookingPlanForm />} />
        <Route path="/recipes/import" element={<RecipeImport />} />
        <Route path="/recipes/:id" element={<RecipeDetails />} />
        <Route path="/cooking-plans/:id" element={<CookingPlanDetails />} />
        <Route path="/cooking-plans/:id/grocery-list" element={<GroceryList />} />
        <Route path="/recipes/:id/edit" element={<RecipeForm />} />
        <Route path="/cooking-plans/:id/edit" element={<CookingPlanForm />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
