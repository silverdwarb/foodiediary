-- Create the ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_ingredient_lower
ON ingredients(LOWER(name));

-- Create the recipes table
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL
    );

-- Create the join table for the many-to-many relationship
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
    amount TEXT,
    PRIMARY KEY (recipe_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS recipe_notes (
    recipe_id INTEGER PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS cook_logs (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    cook_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    Alterations JSONB,
    session_notes TEXT
);

-- comment out the below later cause ur an idiot <this guy is an idiot it didnt take more than three seconds
/*insert INTO ingredients (name) Values
('salt'),
('pepper'),
('rice');*/
/*
INSERT INTO cook_logs (recipe_id, rating, alterations, session_notes)
VALUES (
    1, 
    5, 
    '{"ingredient_sub": "honey instead of sugar", "equipment": "cast-iron skillet"}', 
    'The crust was much better this time.'
);

SELECT id, recipe_id, alterations 
FROM cook_logs;*/


