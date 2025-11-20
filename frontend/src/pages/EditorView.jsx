import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  createCustomRecipe,
  updateCustomRecipe,
  getCustomRecipeById,
  getExternalRecipeDetails,
  deleteCustomRecipe,
} from "../services/recipeService";

// Custom UI component for confirmation, replacing window.confirm
const CustomConfirm = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
      <p className="text-lg font-semibold mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Delete Anyway
        </button>
      </div>
    </div>
  </div>
);

const EditorView = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // Determine if we are editing an existing custom recipe or creating a new one from search results
  const isEditingExisting = !!id && user && !location.state?.originalId;
  const isNewRecipe = !!location.state?.originalId && !isEditingExisting;

  // New state for the component
  const [recipeData, setRecipeData] = useState({
    title: location.state?.recipe?.title || "",
    originalApiId: location.state?.originalId || null,
    customInstructions: "",
    customIngredients: [], // Start as an array
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(isNewRecipe);
  const [newIngredient, setNewIngredient] = useState("");
  const [editTitle, setEditTitle] = useState(recipeData.title);
  const [message, setMessage] = useState(""); // General messages (success/error)
  const [showConfirm, setShowConfirm] = useState(false); // State for custom confirmation

  // Helper to safely parse stringified ingredients/instructions from the external API
  const parseContent = (content) => {
    if (!content) return "";
    // Check if it looks like a JSON array/object or contains list markers, and clean it up
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => item.original || item.name || item)
          .join("\n");
      }
    } catch (e) {
      // If parsing fails, it's plain text (which is good)
    }
    // Remove common list/newline formatting if it's not JSON
    return content
      .replace(/(\r\n|\n|\r|\\n)/g, " ")
      .replace(/(\. )/g, ". \n\n")
      .trim();
  };

  // 1. Data Fetching Effect
  const fetchData = async () => {
    if (!user || !user.token) {
      setIsLoading(false);
      navigate("/login", { replace: true });
      return;
    }

    try {
      setIsLoading(true);
      let data = null;

      if (isEditingExisting) {
        // Fetch existing custom recipe
        data = await getCustomRecipeById(id);
      } else if (isNewRecipe) {
        // Fetch external recipe details to start a new custom recipe
        data = await getExternalRecipeDetails(location.state.originalId);
      }

      if (data) {
        const ingredients =
          data.customIngredients || data.extendedIngredients || [];
        const instructions = data.customInstructions || data.instructions || "";

        const ingredientList = ingredients.map(
          (ing) => ing.original || ing.name || ing
        );
        const instructionText = parseContent(instructions);

        setRecipeData({
          title: data.title || recipeData.title,
          originalApiId:
            data.originalApiId || location.state.originalId || null,
          customInstructions: instructionText,
          customIngredients: ingredientList,
        });
        setEditTitle(data.title || recipeData.title);
      }
    } catch (error) {
      setMessage("Failed to load recipe data.");
      console.error("Fetch data error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, user]);

  // Handle Input Changes
  const handleInstructionsChange = (e) => {
    setRecipeData((prev) => ({
      ...prev,
      customInstructions: e.target.value,
    }));
  };

  // Handle Ingredient Addition
  const handleAddIngredient = () => {
    const trimmedIngredient = newIngredient.trim();
    if (trimmedIngredient) {
      setRecipeData((prev) => ({
        ...prev,
        customIngredients: [...prev.customIngredients, trimmedIngredient],
      }));
      setNewIngredient("");
    }
  };

  // Handle Ingredient Deletion
  const handleDeleteIngredient = (index) => {
    if (!isEditMode) return; // Only allow deletion in edit mode
    setRecipeData((prev) => ({
      ...prev,
      customIngredients: prev.customIngredients.filter((_, i) => i !== index),
    }));
  };

  // Handle Recipe Save/Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.token) return navigate("/login");

    const recipeToSave = {
      title: editTitle.trim(),
      customInstructions: recipeData.customInstructions.trim(),
      customIngredients: recipeData.customIngredients,
      originalApiId: recipeData.originalApiId,
    };

    if (!recipeToSave.title) {
      setMessage("Recipe title is required.");
      return;
    }

    try {
      let result;
      if (isEditingExisting) {
        // Update existing recipe
        result = await updateCustomRecipe(id, recipeToSave);
        setMessage("Recipe updated successfully!");
      } else {
        // Create new recipe
        result = await createCustomRecipe(recipeToSave);
        setMessage("Recipe saved successfully!");
        // Redirect to the new recipe's editor view (read-only mode)
        navigate(`/editor/${result._id}`, { replace: true });
      }

      // After successful save/update, switch to view mode
      setIsEditMode(false);
      // Wait a moment for message to show, then clear and navigate if needed
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      setMessage(`Failed to save recipe: ${error.message || error.toString()}`);
      console.error("Save error:", error);
    }
  };

  // Handle Recipe Deletion
  const handleDelete = async () => {
    if (!isEditingExisting || !user || !user.token) return;
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setShowConfirm(false);
    try {
      await deleteCustomRecipe(id);
      setMessage("Recipe deleted successfully!");
      navigate("/cookbook", { replace: true });
    } catch (error) {
      setMessage(
        `Failed to delete recipe: ${error.message || error.toString()}`
      );
      console.error("Delete error:", error);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading recipe details...</div>;
  }

  // Determine the primary button text based on mode
  const primaryButtonText = isEditingExisting
    ? "Save Changes"
    : "Save New Recipe";

  return (
    <div className="editor-container">
      {showConfirm && (
        <CustomConfirm
          message="Are you sure you want to delete this custom recipe? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="header-section">
          {isEditMode ? (
            <input
              type="text"
              className="recipe-title-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Enter Recipe Title"
              required
            />
          ) : (
            <h1 className="recipe-title">{recipeData.title}</h1>
          )}
        </div>

        {message && (
          <p
            className={`message ${
              message.includes("Failed") ? "error" : "success"
            }`}
          >
            {message}
          </p>
        )}

        <section className="recipe-section ingredients-section">
          <h2 className="section-title">Ingredients</h2>
          {/* Display Mode */}
          {!isEditMode && (
            <div className="ingredients-display">
              {recipeData.customIngredients.map((ingredient, index) => (
                <span key={index} className="ingredient-tag">
                  {ingredient}
                </span>
              ))}
              {recipeData.customIngredients.length === 0 && (
                <p className="text-gray-500">No ingredients listed.</p>
              )}
            </div>
          )}

          {/* Edit Mode */}
          {isEditMode && (
            <div className="ingredients-edit">
              <div className="current-ingredients">
                {recipeData.customIngredients.map((ingredient, index) => (
                  <div key={index} className="ingredient-chip editable">
                    <span>{ingredient}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteIngredient(index)}
                      className="delete-btn"
                      aria-label="Remove ingredient"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {recipeData.customIngredients.length === 0 && (
                  <p className="text-gray-500 italic">
                    Add your first ingredient below.
                  </p>
                )}
              </div>

              {/* Add New Ingredient Form */}
              <div className="add-ingredient-form">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Add new ingredient (e.g., 1 cup flour)"
                />
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="save-btn"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="recipe-section instructions-section">
          <h2 className="section-title">Instructions</h2>
          {/* Instructions Input/Display */}
          {isEditMode ? (
            <textarea
              className="instructions-textarea"
              value={recipeData.customInstructions}
              onChange={handleInstructionsChange}
              placeholder="Enter your recipe instructions here. Use double newlines for paragraph breaks."
              rows="10"
            />
          ) : (
            <div className="instructions-display view-mode">
              {/* This displays the instructions while preserving basic newline formatting */}
              {recipeData.customInstructions.split("\n").map((line, index) => (
                // Use a paragraph for each line, preserving double newlines as gaps
                <p key={index} className="instruction-line">
                  {line}
                </p>
              ))}
              {recipeData.customInstructions.length === 0 && (
                <p className="text-gray-500">
                  No cooking instructions provided.
                </p>
              )}
            </div>
          )}
        </section>

        {/* Action Buttons: Edit vs. Save/Cancel */}
        <div className="action-buttons-group">
          {isEditMode ? (
            <>
              <button type="submit" className="save-btn">
                {primaryButtonText}
              </button>
              <button
                type="button"
                onClick={() => {
                  // Revert to view mode and reload original data to discard changes
                  setIsEditMode(false);
                  fetchData();
                  setMessage("Changes canceled.");
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {/* Only show 'Edit Recipe' if it's an existing custom recipe or a new recipe from external source */}
              {(isEditingExisting || isNewRecipe) && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditMode(true);
                    setMessage("");
                  }}
                  className="edit-btn"
                >
                  Edit Recipe
                </button>
              )}
              {isEditingExisting && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="delete-btn-red"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default EditorView;
