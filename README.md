# KitchLog

CodePath WEB103 Final Project

Designed and developed by: Sanvi Singh, Omar Alim Mohamed, Yumejichi Fujita, Viet Thai Nguyen

🔗 Link to deployed app:

## About

### Description and Purpose

KitchLog is a full-stack web application that helps users organize recipes and simplify grocery shopping. Users can save recipes from different websites by adding a recipe link or entering recipe details manually. They can then select one or more recipes they want to cook, and the app automatically generates a combined grocery list based on the selected recipes, reducing the time spent planning meals and shopping.

The goal of KitchLog is to make cooking more organized and convenient by keeping recipes and grocery lists in one place. It also solves the common problem of losing track of recipes you've found online. Instead of searching the internet again and trying to remember the keywords or website you used, users can save recipes once and easily access them whenever they want to cook them again.


### Inspiration

Many people, including ourselves, save recipes from different websites and blogs, making them difficult to keep organized. We often find ourselves searching for the same recipe again because we can't remember where we originally found it, or we don't remember the recipe anymore. Creating a grocery list for multiple recipes can also be repetitive and time-consuming.

We wanted to build an application that solves these everyday problems by allowing users to save recipes in one place and automatically generate a grocery list based on the dishes they plan to cook. Our goal is to make cooking preparation more organized, convenient, and efficient.


## Tech Stack

Frontend: React, React Router, Vite, CSS

Backend: Node.js, Express, PostgreSQL, pg, dotenv, CORS

## Features

### ✅ Recipe Management

Browse saved recipes and manually create new recipes. Users can enter a title, category, cook time, servings, instructions, optional source URL, optional image URL, and one or more ingredients.

[gif goes here]

### ✅ Recipe Import from URL

Paste a recipe link and have the app automatically extract and populate the recipe's ingredients and instructions, so you don't have to enter them manually.

[gif goes here]

### Favorite recipes

Mark recipes as favorites for quick and easy access.

[gif goes here]

### ✅ Cooking Plan

Select one or more recipes you want to cook and organize them into a cooking plan.

[gif goes here]

### Automatic Grocery List

Automatically generate a combined grocery list by merging the ingredients from the selected recipes in a cooking plan.

[gif goes here]

### ✅ Recipe Search & Filter

Search recipes by name and filter them by category on the home page.

[gif goes here]

### Recipe Details Page

View a recipe's ingredients, cooking instructions, original recipe link, and other details on a dedicated page.

[gif goes here]


### [ADDITIONAL FEATURES GO HERE - ADD ALL FEATURES HERE IN THE FORMAT ABOVE; you will check these off and add gifs as you complete them]

### Grocery Checklist

Users can mark grocery list items as purchased or unpurchased while shopping, making it easier to keep track of what they still need to buy.

[gif goes here]

### Recipe Import from Image *(might implement)*

Upload a photo of a recipe and have the app use AI to automatically extract and populate the ingredients and instructions.

[gif goes here]

### AI Nutrition Analysis *(might implement)*

Estimate calories and basic nutrition information for a recipe using an AI API.

[gif goes here]

### User Authentication *(might implement)*

Allow users to create an account, log in, and securely access their own recipes and grocery lists.

[gif goes here]


## Installation Instructions

### Backend

1. Go to the backend folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `server/.env` file and add your database connection string:
   ```bash
   DATABASE_URL=your_postgresql_connection_string
   ```

4. Seed the database if needed:
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend

1. Go to the frontend folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Optional: create a `client/.env` file if your backend API is not running at `http://localhost:3000/api`:
   ```bash
   VITE_API_URL=http://localhost:3000/api
   ```

4. Start the frontend:
   ```bash
   npm run dev
   ```
