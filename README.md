# The Culinary Knowledge Base

A personal, research-driven cookbook and laboratory notebook designed to document a lifetime of cooking, track experiments, and synthesize culinary knowledge. 

## Project Vision

This project is a personal mission to document every dish I have ever cooked. Beyond a static list of recipes, this application serves as a searchable database that tracks technique evolution, ingredient interactions, and experimental outcomes, improving my cooking craft through data-backed learning.

## Roadmap

### Phase 0: The Foundation (MVP)

* **Database Schema:** Implementation of core relational tables (`Recipes`, `Ingredients`, `Recipe_Ingredients` junction).
* **Cook Logs:** A chronological history of every cooking session, utilizing a `JSONB` column for flexible experimental metadata (alterations, technique changes, etc.).
* **Full-Text Search:** Basic search capabilities for recipes and ingredients.
* **Wiki Infrastructure:** Basic note-taking features for ingredients and recipes.

### Phase 1: Relational Normalization

* **Schema Migration:** Migrating the flexible `JSONB` logs into a structured 4-table schema (`Ingredients alterations`, `Techniques alteration`, `Equipment alteration`,) for deep analytical querying, and utilizing .md files for notation rather than text in the sql database
* **Ingredient Systematization:** Adding metadata for ingredient usage(eg. breading, braising, flavoring,), core properties (e.g., protein, fiber, starch), and food categories(soups, salads, main courses, etc. *this is extremely tbd rn*).
* **Deterministic Recommender:** A rules-based engine to suggest ingredient complements.

### Phase 2: Knowledge Synthesis & Safety

* **Hazard Detection:** An automated severity-based system to flag potential safety risks (e.g., food safety, chemical reactions, or ingredient interactions).
* **Non-Deterministic Recommender:** Integrating web-scraped data to suggest flavor pairings beyond basic rules.
* **Graph Visualization:** A visual representation of recipe hierarchies and ingredient dependencies.

### Phase 3: Advanced Optimization

* **Audit Logging:** Full history tracking ("Ctrl+Z") for recipe notes and alterations.
* **Performance:** Optimized indexing for high-speed retrieval of complex hierarchies.
* **Automated Migrations:** A version-controlled framework to evolve the schema as culinary knowledge grows.

## Technical Design Trade-offs

* **Why JSONB?** Initially selected for Phase 0 to facilitate rapid experimental iteration without the overhead of complex relational mapping.
* **Why Normalization?** Phase 1 will migrate data to a 4-table schema to ensure data integrity and enable complex cross-log analysis (e.g., comparing technique efficiency across years).

## Getting Started

*I dont have a getting started yet cause theres nothing to start with*