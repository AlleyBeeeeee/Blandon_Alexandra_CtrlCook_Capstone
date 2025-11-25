import axios from "axios";

const SPOONACULAR_BASE_URL = "https://api.spoonacular.com/recipes";

// @route   GET /api/spoonacular/search?query=
export const searchRecipes = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ msg: "Please include a search query" });
  }

  try {
    const response = await axios.get(`${SPOONACULAR_BASE_URL}/complexSearch`, {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
        query: query,
        number: 10,
        addRecipeInformation: true,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error("Spoonacular API Error:", err.message);
    res.status(500).send("Failed to fetch recipes from external API.");
  }
};

// @route   GET /api/spoonacular/:id
export const getRecipeDetails = async (req, res) => {
  try {
    const response = await axios.get(
      `${SPOONACULAR_BASE_URL}/${req.params.id}/information`,
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          includeNutrition: false,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Spoonacular API Error:", err.message);
    res.status(500).send("Failed to fetch recipe details from external API.");
  }
};
