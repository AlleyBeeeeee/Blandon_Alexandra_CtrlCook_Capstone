import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { initializeApp, setLogLevel } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
} from "firebase/firestore";
import { useMediaQuery } from "react-responsive";

// --- Global Constants & Utilities (MUST BE Defined) ---

// Firebase Configuration & Context
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
const firebaseConfig = JSON.parse(
  typeof __firebase_config !== "undefined" ? __firebase_config : "{}"
);
const initialAuthToken =
  typeof __initial_auth_token !== "undefined" ? __initial_auth_token : "";

// Context Setup
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

// --- Firebase and Auth Provider (Replacement for Redux Store) ---

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    // 1. Initialize Firebase
    if (Object.keys(firebaseConfig).length === 0) {
      console.error("Firebase config is missing.");
      return;
    }

    setLogLevel("error"); // Set log level
    const app = initializeApp(firebaseConfig);
    const authInstance = getAuth(app);
    const dbInstance = getFirestore(app);

    setAuth(authInstance);
    setDb(dbInstance);

    // 2. Handle initial authentication
    const setupAuth = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(authInstance, initialAuthToken);
        } else {
          // Fallback to anonymous sign-in if no custom token is available
          await signInAnonymously(authInstance);
        }
      } catch (error) {
        console.error("Authentication failed:", error);
      }
    };

    // 3. Set up Auth State Listener
    const unsubscribe = onAuthStateChanged(authInstance, (firebaseUser) => {
      // Create a user object that mimics the Redux store structure for easy replacement
      const userState = firebaseUser
        ? {
            uid: firebaseUser.uid,
            token: initialAuthToken || "anonymous-token", // Mock token for service calls
            isAuthenticated: true,
          }
        : null;

      setUser(userState);
      setAuthReady(true);
    });

    setupAuth();

    return () => unsubscribe();
  }, []);

  // Logout function
  const handleLogout = useCallback(() => {
    if (auth) {
      signOut(auth).catch(console.error);
    }
  }, [auth]);

  // Context value definition
  const contextValue = useMemo(
    () => ({
      user,
      db,
      authReady,
      isAuthenticated: !!user,
      logout: handleLogout,
      userId: user?.uid,
    }),
    [user, db, authReady, handleLogout]
  );

  if (!authReady) {
    return <div className="loading-screen">Authenticating user...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// --- Firebase Database Path Helpers ---

const FIREBASE_COLLECTION_PATH = "custom-recipes";

// Path for private user data
const getCollectionRef = (db, userId) => {
  if (!db || !userId) return null;
  // Path: /artifacts/{appId}/users/{userId}/{your_collection_name}
  return collection(
    db,
    `artifacts/${appId}/users/${userId}/${FIREBASE_COLLECTION_PATH}`
  );
};

const getDocRef = (db, userId, recipeId) => {
  if (!db || !userId || !recipeId) return null;
  // Path: /artifacts/{appId}/users/{userId}/{your_collection_name}/{documentId}
  return doc(
    db,
    `artifacts/${appId}/users/${userId}/${FIREBASE_COLLECTION_PATH}`,
    recipeId
  );
};

// --- Mock Recipe Service (Replacement for External API calls) ---

// External API Key (mocked)
const MOCK_EXTERNAL_API_KEY = "mock-key";

// Mock function to simulate searching an external recipe API
async function searchExternalRecipes(query) {
  // Mock API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockRecipes = [
    {
      id: 101,
      title: "Spicy Vegan Chili",
      image: "https://placehold.co/150x150/00796b/ffffff?text=Chili",
      sourceUrl: "mock://chili-source",
    },
    {
      id: 102,
      title: "Classic Beef Lasagna",
      image: "https://placehold.co/150x150/00796b/ffffff?text=Lasagna",
      sourceUrl: "mock://lasagna-source",
    },
    {
      id: 103,
      title: "Lemon Herb Salmon",
      image: "https://placehold.co/150x150/00796b/ffffff?text=Salmon",
      sourceUrl: "mock://salmon-source",
    },
  ];

  if (query.toLowerCase().includes("lemon")) {
    return [mockRecipes[2]];
  }
  if (
    query.toLowerCase().includes("pasta") ||
    query.toLowerCase().includes("lasagna")
  ) {
    return [mockRecipes[1]];
  }
  return mockRecipes;
}

// Mock function to simulate fetching external recipe details
async function getExternalRecipeDetails(id) {
  // Mock API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const detailsMap = {
    101: {
      title: "Spicy Vegan Chili",
      originalApiId: 101,
      customInstructions: "Simmer for 45 minutes.",
      customIngredients: ["1 onion", "2 cans beans", "1 chili pepper"],
    },
    102: {
      title: "Classic Beef Lasagna",
      originalApiId: 102,
      customInstructions: "Bake at 375 for 30 minutes.",
      customIngredients: ["1 lb ground beef", "1 box pasta", "mozzarella"],
    },
    103: {
      title: "Lemon Herb Salmon",
      originalApiId: 103,
      customInstructions: "Bake for 15 minutes at 400F.",
      customIngredients: ["2 salmon fillets", "1 lemon", "1 tbsp herbs"],
    },
  };

  const data = detailsMap[id];

  if (!data) {
    throw new Error("Recipe not found in mock API.");
  }

  return data;
}

// --- Firebase Service Implementation (The real data persistence) ---

// 1. Create a new custom recipe
async function createCustomRecipe(db, userId, recipeData) {
  const colRef = getCollectionRef(db, userId);
  if (!colRef) throw new Error("Database not ready or user not logged in.");

  const docRef = await addDoc(colRef, {
    ...recipeData,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return { id: docRef.id, ...recipeData };
}

// 2. Update an existing custom recipe
async function updateCustomRecipe(db, userId, recipeId, recipeData) {
  const docRef = getDocRef(db, userId, recipeId);
  if (!docRef) throw new Error("Document reference not ready.");

  await updateDoc(docRef, {
    ...recipeData,
    updatedAt: Date.now(),
  });
  return { id: recipeId, ...recipeData };
}

// 3. Get a single custom recipe by ID
async function getCustomRecipeById(db, userId, recipeId) {
  const docRef = getDocRef(db, userId, recipeId);
  if (!docRef) throw new Error("Document reference not ready.");

  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("Recipe not found.");
  }
}

// 4. Delete a custom recipe
async function deleteCustomRecipe(db, userId, recipeId) {
  const docRef = getDocRef(db, userId, recipeId);
  if (!docRef) throw new Error("Document reference not ready.");

  await deleteDoc(docRef);
}

// --- UI Components (Refactored from snippets) ---

// Navbar Component
function Navbar() {
  const { isAuthenticated, logout, userId } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // Helper to shorten the UID for display
  const displayUserId = userId
    ? `${userId.substring(0, 4)}...${userId.substring(userId.length - 4)}`
    : "Guest";

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/search">Ctrl+Cook</Link>
      </div>

      <div className="nav-right">
        {/* User Info */}
        <span className="user-id">User: {displayUserId}</span>

        {/* search link visible for public recipe searching */}
        <Link to="/search">Search</Link>
        {/* conditionally renders links based on the authentication state */}
        {isAuthenticated ? (
          <>
            {/* link to the user's protected cookbook view */}
            <Link to="/cookbook">My Cookbook</Link>
            {/* button to trigger the logout function */}
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          // if not logged in, show a link to the login/register view
          <Link to="/login">Login / Register</Link>
        )}
      </div>
    </nav>
  );
}

// MyCookbook Component
function MyCookbook() {
  const { user, db, userId } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Firestore listener setup using onSnapshot
  useEffect(() => {
    if (!db || !userId) {
      setRecipes([]);
      setIsLoading(false);
      return;
    }

    const colRef = getCollectionRef(db, userId);
    if (!colRef) return;

    setIsLoading(true);
    // Real-time listener for custom recipes
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const fetchedRecipes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by last updated, descending
        fetchedRecipes.sort((a, b) => b.updatedAt - a.updatedAt);
        setRecipes(fetchedRecipes);
        setIsLoading(false);
      },
      (error) => {
        console.error("Firestore listen failed:", error);
        setMessage("Failed to load recipes.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [db, userId]);

  // handles the delete operation for a recipe
  const handleDeleteRecipe = async (recipeId) => {
    if (!user || !db || !userId) return;

    // Use custom modal replacement for alert() and confirm()
    if (!window.confirm("Are you sure you want to delete this custom recipe?"))
      return;

    try {
      await deleteCustomRecipe(db, userId, recipeId);
      setMessage("Recipe deleted successfully!");
      // The onSnapshot listener will automatically update the recipes state
      setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
    } catch (error) {
      console.error("Delete failed:", error);
      setMessage("Failed to delete recipe.");
    }
  };

  if (!user) {
    return <h2 className="text-xl mt-8">Please log in to view MyCookBook.</h2>;
  }

  if (isLoading) {
    return <h2 className="text-xl mt-8">Loading your cookbook...</h2>;
  }

  return (
    <div className="container cookbook-view">
      <h2 className="page-title">
        My Custom Cookbook ({recipes.length} recipes)
      </h2>
      {message && <p className="success-message">{message}</p>}

      {recipes.length === 0 ? (
        <p className="empty-state">You haven't saved any custom recipes yet.</p>
      ) : (
        <div className="cookbook-list">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <h4>{recipe.title}</h4>
              <p>Ingredients: {recipe.customIngredients.length}</p>
              <div className="card-actions">
                <Link to={`/editor/${recipe.id}`} className="edit-link">
                  View/Edit
                </Link>
                <button
                  onClick={() => handleDeleteRecipe(recipe.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// SearchView Component
const SearchView = () => {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    if (!query) return;

    setLoading(true);
    try {
      // Call the mock external API service
      const results = await searchExternalRecipes(query);
      setRecipes(results);
      if (results.length === 0) {
        setError("No recipes found for your query.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      setError("Failed to fetch recipes from external source.");
      setRecipes([]);
    }
    setLoading(false);
  };

  return (
    <div className="container search-view">
      <h2 className="page-title">Recipe Search</h2>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for ingredients or dishes"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {recipes.length > 0 && (
        <div className="search-results">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              {/* Image check before rendering */}
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/150x150/00796b/ffffff?text=No+Image";
                  }}
                />
              )}

              <h4>{recipe.title}</h4>

              <Link
                to={`/editor/new?originalId=${recipe.id}`}
                state={{
                  originalId: recipe.id,
                }}
                className="customize-link"
              >
                Customize and Save
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// EditorView Component
const EditorView = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, db, userId } = useAuth();

  // Determine modes
  const isEditingExisting = !!id && id !== "new" && user;
  const originalApiId =
    new URLSearchParams(location.search).get("originalId") ||
    location.state?.originalId ||
    null;
  const isNewRecipe = id === "new" && originalApiId;

  const [recipeData, setRecipeData] = useState({
    title: "",
    originalApiId: originalApiId,
    customInstructions: "",
    customIngredients: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(isNewRecipe || false);
  const [newIngredient, setNewIngredient] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = useCallback(async () => {
    if (!db || !userId) {
      navigate("/login");
      return;
    }
    setIsLoading(true);
    setMessage("");

    try {
      if (isEditingExisting) {
        // Mode 1: Editing an existing custom recipe
        const existingRecipe = await getCustomRecipeById(db, userId, id);
        setRecipeData(existingRecipe);
        // If editing an existing recipe, start in view mode
        setIsEditMode(false);
      } else if (isNewRecipe) {
        // Mode 2: Creating a new recipe from an external source
        const externalData = await getExternalRecipeDetails(originalApiId);
        setRecipeData((prev) => ({
          ...prev,
          title: externalData.title,
          customInstructions: externalData.customInstructions,
          customIngredients: externalData.customIngredients,
        }));
        // If creating from external, start in edit mode
        setIsEditMode(true);
      } else {
        // Mode 3: Trying to edit without an ID or external link (e.g., direct /editor access)
        setRecipeData({
          title: "New Custom Recipe",
          originalApiId: null,
          customInstructions: "",
          customIngredients: [],
        });
        setIsEditMode(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [db, userId, id, originalApiId, isEditingExisting, isNewRecipe, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler for adding a new ingredient
  const handleAddIngredient = () => {
    if (newIngredient.trim() === "") return;
    setRecipeData((prev) => ({
      ...prev,
      customIngredients: [...prev.customIngredients, newIngredient.trim()],
    }));
    setNewIngredient("");
  };

  // Handler for removing an ingredient
  const handleRemoveIngredient = (index) => {
    setRecipeData((prev) => ({
      ...prev,
      customIngredients: prev.customIngredients.filter((_, i) => i !== index),
    }));
  };

  // Handle Save/Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !db || !userId) {
      setMessage("You must be logged in to save recipes.");
      return;
    }

    if (!recipeData.title.trim()) {
      setMessage("Recipe title cannot be empty.");
      return;
    }

    setMessage("Saving...");

    try {
      let savedRecipe;
      if (isEditingExisting) {
        savedRecipe = await updateCustomRecipe(db, userId, id, recipeData);
        setMessage("Recipe updated successfully!");
        // Switch back to view mode after successful update
        setIsEditMode(false);
      } else {
        // Create New
        savedRecipe = await createCustomRecipe(db, userId, recipeData);
        setMessage("Recipe created successfully!");
        // Redirect to the new recipe's permanent editor URL
        navigate(`/editor/${savedRecipe.id}`, { replace: true });
        // The useEffect will refetch with the new ID
      }
      setTimeout(() => setMessage(""), 3000); // Clear message
    } catch (error) {
      console.error("Save failed:", error);
      setMessage(`Save failed: ${error.message}`);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!isEditingExisting || !db || !userId) return;

    // Use custom modal replacement for alert() and confirm()
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this recipe?"
      )
    )
      return;

    try {
      await deleteCustomRecipe(db, userId, id);
      navigate("/cookbook", {
        state: { message: "Recipe deleted successfully!" },
      });
    } catch (error) {
      console.error("Delete failed:", error);
      setMessage("Failed to delete recipe.");
    }
  };

  if (!user) {
    return (
      <div className="container">
        <h2 className="page-title">Please log in to edit recipes.</h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container">
        <h2 className="page-title">Loading recipe editor...</h2>
      </div>
    );
  }

  const currentTitle = recipeData.title;

  return (
    <div className="container editor-view">
      <h2 className="page-title">
        {isEditingExisting
          ? "Edit Custom Recipe"
          : isNewRecipe
          ? "Customize New Recipe"
          : "New Recipe"}
      </h2>
      {message && (
        <p
          className={
            message.startsWith("Error") ? "error-message" : "success-message"
          }
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-section">
          <label htmlFor="title" className="label-title">
            Recipe Title
          </label>
          <input
            id="title"
            type="text"
            value={currentTitle}
            onChange={(e) =>
              setRecipeData((prev) => ({ ...prev, title: e.target.value }))
            }
            readOnly={!isEditMode}
            className="input-title"
          />
        </div>

        <div className="form-section">
          <label htmlFor="instructions" className="label-title">
            Custom Instructions
          </label>
          <textarea
            id="instructions"
            value={recipeData.customInstructions}
            onChange={(e) =>
              setRecipeData((prev) => ({
                ...prev,
                customInstructions: e.target.value,
              }))
            }
            readOnly={!isEditMode}
            className="textarea-instructions"
            rows="6"
            placeholder="Add your own cooking steps and notes here..."
          />
        </div>

        <div className="form-section ingredient-list-section">
          <label className="label-title">Ingredients</label>
          <ul className="ingredient-list">
            {recipeData.customIngredients.map((ingredient, index) => (
              <li key={index} className="ingredient-item">
                <span>{ingredient}</span>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="remove-ingredient-btn"
                    aria-label="Remove ingredient"
                  >
                    &times;
                  </button>
                )}
              </li>
            ))}
          </ul>

          {isEditMode && (
            <div className="add-ingredient-form">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="Add new ingredient"
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="add-btn"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons-group">
          {isEditMode ? (
            <>
              <button type="submit" className="save-btn">
                {isEditingExisting ? "Update Recipe" : "Save New Recipe"}
              </button>
              <button
                type="button"
                onClick={() => {
                  // Revert to view mode or navigate home if it was a new creation attempt
                  if (isEditingExisting) {
                    setIsEditMode(false);
                    fetchData(); // Reload original data
                  } else {
                    navigate("/search");
                  }
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="edit-btn"
              >
                Edit Recipe
              </button>
              {isEditingExisting && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="delete-btn-lg" // Larger delete button for non-edit mode
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

// Placeholder components
const Home = () => (
  <div className="container home-view">
    <h1 className="main-title">Welcome to Ctrl+Cook</h1>
    <p className="subtitle">
      Search for external recipes, customize them, and save them to your private
      cookbook!
    </p>
    <div className="action-links">
      <Link to="/search" className="action-button primary">
        Start Searching
      </Link>
      <Link to="/cookbook" className="action-button secondary">
        View My Cookbook
      </Link>
    </div>
  </div>
);

const LoginView = () => (
  <div className="container login-view">
    <h2 className="page-title">Login / Register</h2>
    <p className="description">
      Authentication is handled automatically by the Canvas environment for this
      demo. Your account is already logged in with a unique ID for persistence.
      <br />
      If you were to see a full login screen, it would appear here!
    </p>
    <Link to="/search" className="action-button primary mt-4">
      Continue to App
    </Link>
  </div>
);

// Main Application Component
const App = () => {
  return (
    <Router>
      <div id="app-root">
        <Navbar />
        <main className="container-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchView />} />
            <Route path="/cookbook" element={<MyCookbook />} />
            <Route path="/editor/:id" element={<EditorView />} />
            <Route path="/editor/new" element={<EditorView />} />
            <Route path="/login" element={<LoginView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

// Final Export wrapped in AuthProvider
export default function RecipeManagerApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
