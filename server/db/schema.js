const schema = `
  DROP TABLE IF EXISTS grocery_items;
  DROP TABLE IF EXISTS plan_recipes;
  DROP TABLE IF EXISTS cooking_plans;
  DROP TABLE IF EXISTS ingredients;
  DROP TABLE IF EXISTS recipes;

  CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    cook_time INTEGER,
    instructions TEXT,
    source_url VARCHAR(255),
    favorite BOOLEAN DEFAULT FALSE
  );

  CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity VARCHAR(50),
    unit VARCHAR(50)
  );

  CREATE TABLE cooking_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
  );

  CREATE TABLE plan_recipes (
    plan_id INTEGER NOT NULL REFERENCES cooking_plans(id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, recipe_id)
  );

  CREATE TABLE grocery_items (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL REFERENCES cooking_plans(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity VARCHAR(50),
    unit VARCHAR(50),
    checked BOOLEAN DEFAULT FALSE
  );
`;

export default schema;