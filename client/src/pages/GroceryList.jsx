import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { generateGroceryList, getGroceryList, updateGroceryItem } from '../api/cookingPlans'
import './GroceryList.css'

const formatGroceryItem = (item) => [item.quantity, item.unit, item.name].filter(Boolean).join(' ')

function GroceryList() {
  const { id } = useParams()
  const [plan, setPlan] = useState(null)
  const [groceryItems, setGroceryItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [pendingItemIds, setPendingItemIds] = useState(new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    const loadGroceryList = async () => {
      try {
        const data = await getGroceryList(id)
        setPlan(data.plan)
        setGroceryItems(data.grocery_items)
      } catch (fetchError) {
        setError(fetchError.status === 404 ? 'Cooking plan not found' : fetchError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadGroceryList()
  }, [id])

  const handleGenerate = async () => {
    setError('')
    setIsGenerating(true)

    try {
      const data = await generateGroceryList(id)
      setPlan(data.plan)
      setGroceryItems(data.grocery_items)
    } catch (generateError) {
      setError(generateError.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleToggle = async (item) => {
    const nextChecked = !item.checked

    setPendingItemIds((previous) => new Set(previous).add(item.id))
    setGroceryItems((previous) =>
      previous.map((groceryItem) =>
        groceryItem.id === item.id ? { ...groceryItem, checked: nextChecked } : groceryItem,
      ),
    )

    try {
      await updateGroceryItem(id, item.id, nextChecked)
    } catch (updateError) {
      setError(updateError.message)
      setGroceryItems((previous) =>
        previous.map((groceryItem) =>
          groceryItem.id === item.id ? { ...groceryItem, checked: item.checked } : groceryItem,
        ),
      )
    } finally {
      setPendingItemIds((previous) => {
        const next = new Set(previous)
        next.delete(item.id)
        return next
      })
    }
  }

  if (isLoading) {
    return (
      <main className="grocery-list-page">
        <p className="details-status">Loading grocery list...</p>
      </main>
    )
  }

  if (error && !plan) {
    return (
      <main className="grocery-list-page">
        <div className="details-status details-error">
          <h1>{error}</h1>
          <p>We could not find that cooking plan. It may have been deleted or the link may be wrong.</p>
          <Link className="back-link" to="/?tab=cooking-plans">
            Back to cooking plans
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="grocery-list-page">
      <div className="details-topbar">
        <Link className="back-link" to={`/cooking-plans/${id}`}>
          Back to cooking plan
        </Link>
      </div>

      {error && <p className="details-inline-error">{error}</p>}

      <header className="grocery-list-header">
        <div>
          <p className="eyebrow">Grocery List</p>
          <h1>{plan.name}</h1>
        </div>
        <div className="grocery-list-actions">
          <button type="button" className="primary-link" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Regenerating...' : 'Regenerate List'}
          </button>
          <p className="regenerate-note">Use after changing recipes. Checked items will reset.</p>
        </div>
      </header>

      {groceryItems.length === 0 ? (
        <div className="details-status empty-state">
          <h2>No grocery items yet</h2>
          <p>Add recipes to this cooking plan, then refresh to generate the grocery list.</p>
          <button type="button" className="primary-link" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Grocery List'}
          </button>
        </div>
      ) : (
        <ul className="grocery-item-list">
          {groceryItems.map((item) => (
            <li key={item.id} className={item.checked ? 'checked' : ''}>
              <label className="grocery-item-row">
                <input
                  type="checkbox"
                  checked={item.checked}
                  disabled={pendingItemIds.has(item.id)}
                  onChange={() => handleToggle(item)}
                />
                <span>{formatGroceryItem(item)}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default GroceryList
