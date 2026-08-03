# Milestone 5

This document should be completed and submitted during **Unit 9** of this course. You **must** check off all completed tasks in this document in order to receive credit for your work.

## Checklist

This unit, be sure to complete all tasks listed below. To complete a task, place an `x` between the brackets.

- [x] Deploy your project on Render
  - [x] In `readme.md`, add the link to your deployed project
- [x] Update the status of issues in your project board as you complete them
- [x] In `readme.md`, check off the features you have completed in this unit by adding a ✅ emoji in front of their title
  - [x] Under each feature you have completed, **include a GIF** showing feature functionality
- [x] In this document, complete the **Reflection** section below
- [x] 🚩🚩🚩**Complete the Final Project Feature Checklist section below**, detailing each feature you completed in the project (ONLY include features you implemented, not features you planned)
- [x] 🚩🚩🚩**Record a GIF showing a complete run-through of your app** that displays all the components included in the **Final Project Feature Checklist** below
  - [x] Include this GIF in the **Final Demo GIF** section below

## Final Project Feature Checklist

Complete the checklist below detailing each baseline, custom, and stretch feature you completed in your project. This checklist will help graders look for each feature in the GIF you submit.

### Baseline Features

👉🏾👉🏾👉🏾 Check off each completed feature below.

- [x] The project includes an Express backend app and a React frontend app
- [x] The project includes these backend-specific features:
  - [x] At least one of each of the following database relationships in Postgres
    - [x] one-to-many (`recipes` → `ingredients`, `cooking_plans` → `grocery_items`)
    - [x] many-to-many with a join table (`cooking_plans` ↔ `recipes` via `plan_recipes`)
  - [x] A well-designed RESTful API that:
    - [x] supports all four main request types for a single entity (ex. tasks in a to-do list app): GET, POST, PATCH, and DELETE
      - [x] the user can **view** items, such as tasks
      - [x] the user can **create** a new item, such as a task
      - [x] the user can **update** an existing item by changing some or all of its values, such as changing the title of task
      - [x] the user can **delete** an existing item, such as a task
    - [x] Routes follow proper naming conventions
  - [x] The web app includes the ability to reset the database to its default state (an unlinked `/admin` page in the deployed app has a "Reset Demo Data" button that calls `POST /api/reset`, which recreates the schema and re-seeds default recipes and a cooking plan)
- [x] The project includes these frontend-specific features:
  - [x] At least one redirection, where users are able to navigate to a new page with a new URL within the app
  - [x] At least one interaction that the user can initiate and complete on the same page without navigating to a new page
  - [x] Dynamic frontend routes created with React Router
  - [x] Hierarchically designed React components
    - [x] Components broken down into categories, including Page and Component types (`client/src/pages/` for routed pages, `client/src/components/RecipeRow.jsx` as a reusable component)
    - [x] Corresponding container components and presenter components as appropriate (`RecipeRow` is a presenter driven entirely by props; `Home.jsx` is the container that fetches recipe data and favorite state and passes it down)
- [x] The project includes dynamic routes for both frontend and backend apps
- [x] The project is deployed on Render with all pages and features that are visible to the user are working as intended

### Custom Features

👉🏾👉🏾👉🏾 Check off each completed feature below.

- [x] The project gracefully handles errors
- [ ] The project includes a one-to-one database relationship
- [ ] The project includes a slide-out pane or modal as appropriate for your use case that pops up and covers the page content without navigating away from the current page
- [ ] The project includes a unique field within the join table
- [x] The project includes a custom non-RESTful route with corresponding controller actions (`POST /api/recipes/import`, `POST /api/cooking-plans/:id/grocery-list/generate`)
- [x] The user can filter or sort items based on particular criteria as appropriate for your use case (search, category filter, and favorites-only filter on the home page)
- [x] Data is automatically generated in response to a certain event or user action (the grocery list is automatically generated/regenerated whenever a cooking plan's recipes are created, updated, or a linked recipe is edited/deleted)
- [x] Data submitted via a POST or PATCH request is validated before the database is updated (e.g. recipe title and at least one ingredient are required, grocery item `checked` must be boolean, PATCH rejects unknown fields)
  - [ ] *To receive full credit, please be sure to demonstrate in your walkthrough that for certain inputs, the item will NOT be successfully created or updated.*

### Stretch Features

👉🏾👉🏾👉🏾 Check off each completed feature below.

- [ ] A subset of pages require the user to log in before accessing the content
  - [ ] Users can log in and log out via GitHub OAuth with Passport.js
- [ ] Restrict available user options dynamically, such as restricting available purchases based on a user's currency
- [ ] Show a spinner while a page or page element is loading
- [x] Disable buttons and inputs during the form submission process
- [ ] Disable buttons after they have been clicked
  - *At least 75% of buttons in your app must exhibit this behavior to receive full credit*
- [ ] Users can upload images to the app and have them be stored on a cloud service
  - *A user profile picture does **NOT** count for this rubric item **only if** the app also includes "Login via GitHub" functionality.*
  - *Adding a photo via a URL does **NOT** count for this rubric item (for example, if the user provides a URL with an image to attach it to the post).*
  - *Selecting a photo from a list of provided photos does **NOT** count for this rubric item.*
- [ ] 🍞 [Toast messages](https://www.patternfly.org/v3/pattern-library/communication/toast-notifications/index.html) deliver simple feedback in response to user events

## Final Demo GIF

🔗 ![Here's a GIF walkthrough of the final project](../images/walkthrough_demo.gif)

## Reflection

### 1. What went well during this unit?

We closed out the remaining core user flows: favorite recipes, the cooking plan details page, and the grocery list frontend (including the checklist for marking items as purchased) all shipped this unit. By the end of the unit every planned feature had both a working backend endpoint and a connected frontend page, and the app was deployed end-to-end on Render.

### 2. What were some challenges your group faced in this unit?

The trickiest piece was keeping the grocery list in sync with the rest of the data: whenever a recipe inside a cooking plan was edited or deleted, we had to regenerate that plan's grocery list so quantities and ingredients stayed accurate, and merging duplicate ingredients across recipes (different units, quantities written as fractions vs. decimals) took some careful parsing logic. Coordinating multiple people across frontend/backend issues without blocking each other was also an ongoing challenge we managed by splitting features into separate backend and frontend issues, as we started doing in Milestone 4.

### 3. What were some of the highlights or achievements that you are most proud of in this project?

We're proud of recipe import from URL, which parses an external recipe page straight into a saved recipe with ingredients instead of making the user retype everything, and of cooking plans, which let a user group several recipes together for the meal or a week. Combined with the automatic grocery list, which takes ingredients across every recipe in a cooking plan, merges duplicates, and produces one clean checklist a user can shop from, these three features directly solve the problem that inspired KitchLog in the first place — no more re-searching for a recipe you saved somewhere and no more manually combining ingredient lists by hand.

### 4. Reflecting on your web development journey so far, how have you grown since the beginning of the course?

We went from wireframes and an ERD on paper to a deployed full-stack app with a real Postgres schema (one-to-many and many-to-many relationships), a RESTful Express API with transactional writes, and a React frontend with client-side routing and optimistic UI updates (favoriting, grocery checklist toggles). Working through real bugs, like keeping derived data (the grocery list) consistent as source data changes, taught us more about state management and data integrity than any single lecture could have.

### 5. Looking ahead, what are your goals related to web development, and what steps do you plan to take to achieve them?

We'd like to keep building on what we didn't get to this round, like authentication and cloud image uploads, either as a v2 of KitchLog or in future projects, and get more comfortable with deployment/DevOps concerns beyond a single Render deploy. 