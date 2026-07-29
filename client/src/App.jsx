import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import RecipeForm from './pages/RecipeForm'
import RecipeImport from './pages/RecipeImport'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes/new" element={<RecipeForm />} />
        <Route path="/recipes/import" element={<RecipeImport />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
