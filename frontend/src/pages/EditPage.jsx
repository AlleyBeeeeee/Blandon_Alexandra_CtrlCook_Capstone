import { useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useRecipeEditor } from "../hooks/useRecipeEditor";

const parseContent = (content) => {
  if (!content) return "";
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.map((i) => i.original || i.name || i).join("\n");
    }
  } catch (e) {}
  return content
    .replace(/(\r\n|\r)/g, "")
    .replace(/\\n/g, "\n")
    .trim();
};

const EditPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const {
    recipeData,
    isLoading,
    isEditMode,
    newIngredient,
    message,
    showConfirm,
    lastDeletedIngredient,
    isEditingExisting,
    isNewFromExternal,
    isCreatingBlank,
    primaryButtonText,
    handleInstructionsChange,
    setNewIngredient,
    handleNewIngredientAdd,
    handleIngredientDelete,
    handleIngredientUndo,
    handleCustomRecipeSubmit,
    handleDelete,
    handleConfirmDelete,
    handleCancelConfirm,
    handleCancelEdit,
    handleStartEdit,
    CustomConfirm,
  } = useRecipeEditor(id, location.state, user);

  if (isLoading) {
    return (
      <div className="container edit-page__message">Loading recipe...</div>
    );
  }

  if (
    !isNewFromExternal &&
    !isCreatingBlank &&
    !recipeData.title &&
    !isLoading
  ) {
    return (
      <div className="container edit-page__empty-state">
        This recipe does not exist or you lack permission.
      </div>
    );
  }

  return (
    <div className="edit-page container">
      {showConfirm && (
        <CustomConfirm
          message="Are you sure you want to delete this recipe? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelConfirm}
        />
      )}

      {message && (
        <div
          className={`edit-page__message ${
            message.includes("success") || message.includes("restored")
              ? "edit-page__message--success"
              : "edit-page__message--error"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleCustomRecipeSubmit} className="edit-page__form">
        <h2 className="edit-page__title">
          {isEditingExisting
            ? "Edit Recipe"
            : isCreatingBlank
            ? "Create New Recipe"
            : "Customize & Save Recipe"}
        </h2>

        {/* Display recipe image */}
        {recipeData.image && (
          <div className="edit-page__image-container">
            <img
              src={recipeData.image}
              alt={recipeData.title}
              className="edit-page__image"
            />
          </div>
        )}

        {/* Ingredients */}
        <div className="edit-page__section">
          <p className="edit-page__section-title">Ingredients</p>
          <ul className="edit-page__ingredient-list">
            {recipeData.customIngredients.map((ingredient, index) => (
              <li key={index} className="edit-page__ingredient-item">
                <p>{ingredient}</p>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => handleIngredientDelete(index)}
                    className="edit-page__button--delete-item"
                  >
                    &times;
                  </button>
                )}
              </li>
            ))}
          </ul>

          {isEditMode && (
            <div className="edit-page__edit-controls-group">
              <input
                className="edit-page__add-ingredient-input"
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="Add new ingredient"
              />

              <button
                type="button"
                className="edit-page__button--add"
                onClick={handleNewIngredientAdd}
              >
                Add Ingredient
              </button>

              {lastDeletedIngredient && (
                <button
                  type="button"
                  className="edit-page__button--undo"
                  onClick={handleIngredientUndo}
                >
                  Undo: {lastDeletedIngredient}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="edit-page__section">
          <p className="edit-page__section-title">Instructions</p>

          {isEditMode ? (
            <textarea
              value={recipeData.customInstructions}
              onChange={(e) => handleInstructionsChange(e.target.value)}
              placeholder="Enter instructions..."
              className="edit-page__instructions-input"
            />
          ) : (
            <div className="edit-page__instructions-view">
              {parseContent(recipeData.customInstructions)
                .split("\n")
                .map((line, i) => (
                  <p key={i} className="edit-page__instruction-line">
                    {line}
                  </p>
                ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="edit-page__action-buttons-group">
          {isEditMode ? (
            <>
              <button
                type="submit"
                className="edit-page__button--save"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : primaryButtonText}
              </button>

              <button
                type="button"
                className="edit-page__button--cancel"
                onClick={handleCancelEdit}
                disabled={isLoading}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="edit-page__button--edit"
                onClick={handleStartEdit}
              >
                Edit Recipe
              </button>

              {isEditingExisting && !showConfirm ? (
                <button
                  type="button"
                  className="edit-page__button--delete"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              ) : (
                isEditingExisting &&
                showConfirm && (
                  <button
                    type="button"
                    className="edit-page__button--confirm-delete"
                    onClick={handleConfirmDelete}
                  >
                    Click to Confirm Delete
                  </button>
                )
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default EditPage;
