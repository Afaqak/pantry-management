"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Container,
  Snackbar,
  Alert,
  Modal,
  CircularProgress,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestaurantMenu as RestaurantMenuIcon,
} from "@mui/icons-material";
import { db, auth } from "@/utils/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Select, { MultiValue } from "react-select";
import { model } from "@/utils/generative-ai";

interface Recipe {
  id?: string;
  userId: string;
  title: string;
  ingredients: string;
  instructions: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
}

interface SelectedProductOption {
  value: Product;
  label: string;
}

const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    SelectedProductOption[]
  >([]);
  const [recipeDetails, setRecipeDetails] = useState<Recipe | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [recipe, setRecipe] = useState("");
  const [user, setUser] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>({
    id: "",
    title: "",
    ingredients: "",
    instructions: "",
    userId: "",
    createdAt: "",
  });

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchRecipes(currentUser.uid);
        fetchProducts(currentUser.uid);
      }
    });
  }, []);

  const fetchRecipes = async (userId: string) => {
    const q = query(collection(db, "recipes"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const recipesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Recipe),
    }));
    setRecipes(recipesList);
  };

  const fetchProducts = async (userId: string) => {
    const q = query(collection(db, "products"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const productsList = querySnapshot.docs.map((doc) => ({
      ...(doc.data() as Product),
    }));
    setProducts(productsList);
  };

  const handleGenerateRecipe = async () => {
    try {
      setIsGenerating(true);
      if (!selectedProducts || selectedProducts.length === 0) {
        setSnackbarMessage("Select products to make a recipe!");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setIsGenerating(false);
        return;
      }

      const selectedProductsNames = selectedProducts
        .map((product) => product.label)
        .join(", ");

      const prompt = `Generate a recipe using the following products: ${selectedProductsNames}.
      In the first line, give me a title for the recipe as well.
      Choose the products you think are right for the recipe.
      Provide a detailed recipe with ingredients and instructions.
      give me text without # and *
      and keep it short`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();

      console.log(response, text, "RES_TEXT");

      const lines = text.split("\n");
      const title = lines[0];
      const findIngredientsIndex = lines.findIndex((line) =>
        line.toLowerCase().includes("ingredients")
      );
      const findInstructionsIndex = lines.findIndex((line) =>
        line.toLowerCase().includes("instructions")
      );

      const ingredients = lines
        .slice(findIngredientsIndex + 1, findInstructionsIndex)
        .join("\n");
      const instructions = lines.slice(findInstructionsIndex + 1).join("\n");
      const newRecipe: Recipe = {
        userId: user.uid,
        title: title || "Generated Recipe Title",
        ingredients: ingredients.trim(),
        instructions: instructions.trim(),
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, "recipes"), newRecipe);
      setRecipe(text);
      setSnackbarMessage("Recipe generated and saved successfully!");
      setSnackbarSeverity("success");
      fetchRecipes(user.uid);
    } catch (error) {
      setSnackbarMessage("Error generating recipe!");
      setSnackbarSeverity("error");
    } finally {
      setIsGenerating(false);
      setSnackbarOpen(true);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      await deleteDoc(doc(db, "recipes", recipeId));
      setSnackbarMessage("Recipe deleted successfully!");
      setSnackbarSeverity("success");
      fetchRecipes(user.uid);
    } catch (error) {
      setSnackbarMessage("Error deleting recipe!");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleOpenModal = (recipe: Recipe) => {
    setRecipeDetails(recipe);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleOpenEditModal = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleUpdateRecipe = async () => {
    try {
      if (currentRecipe.id) {
        const recipeRef = doc(db, "recipes", currentRecipe.id);
        await updateDoc(recipeRef, {
          title: currentRecipe.title,
          ingredients: currentRecipe.ingredients,
          instructions: currentRecipe.instructions,
        });
        setSnackbarMessage("Recipe updated successfully!");
        setSnackbarSeverity("success");
        fetchRecipes(user.uid);
        handleCloseEditModal();
      }
    } catch (error) {
      setSnackbarMessage("Error updating recipe!");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleChangeSelect = (selected: any) => {
    setSelectedProducts(selected);
  };

  const handleChangeCurrentRecipe =
    (field: keyof Recipe) => (event: ChangeEvent<HTMLInputElement>) => {
      setCurrentRecipe({ ...currentRecipe, [field]: event.target.value });
    };

  return (
    <Container sx={{ padding: "100px 0px" }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          className="w-full"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <div className="flex gap-2 items-center mb-8">
        <RestaurantMenuIcon className="w-10 h-10" />
        <h1 className="text-4xl font-bold">Recipes</h1>
      </div>
      <div className="mb-4">
        <Select
          isMulti
          options={products.map((product) => ({
            value: product,
            label: product.name,
          }))}
          onChange={handleChangeSelect}
          placeholder="Select products..."
        />
      </div>

      <div className="flex justify-end mb-4">
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateRecipe}
          disabled={isGenerating}
          className="bg-green-500 hover:bg-green-700 text-white"
        >
          {isGenerating ? "Generating..." : "Get Recipe Suggestion"}
        </Button>
      </div>
      {recipe && (
        <Box className="mt-4 p-4 overflow-auto h-96 mb-4 border border-gray-300 rounded-lg bg-gray-100">
          <Box className="flex items-center mb-2">
            <RestaurantMenuIcon className="text-green-500 mr-2" />
            <Typography variant="h6" className="text-gray-600 sticky top-0">
              Generated Recipe:
            </Typography>
          </Box>
          <div
            className="whitespace-pre-wrap bg-white p-2 border border-gray-200 rounded"
            dangerouslySetInnerHTML={{ __html: recipe }}
          />
        </Box>
      )}

      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <Box
            key={recipe.id}
            className="p-4 border border-gray-300 rounded-lg bg-gray-100 shadow-md flex flex-col justify-between"
          >
            <Box>
              <Typography variant="h6" className="text-gray-600">
                {recipe.title?.slice(3)}
              </Typography>
              <Typography variant="subtitle2" className="text-gray-500">
                Ingredients:
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-700 line-clamp-4 whitespace-pre-wrap"
              >
                {recipe.ingredients}
              </Typography>
              <Typography variant="subtitle2" className="text-gray-500">
                Instructions:
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-700 line-clamp-4 whitespace-pre-wrap"
              >
                {recipe.instructions}
              </Typography>
            </Box>
            <Box className="flex justify-end mt-4 space-x-2">
              <IconButton
                color="primary"
                onClick={() => handleOpenEditModal(recipe)}
              >
                <EditIcon className="text-green-500" />
              </IconButton>
              <IconButton
                color="secondary"
                onClick={() => handleDeleteRecipe(recipe.id as string)}
              >
                <DeleteIcon className="text-red-500" />
              </IconButton>
              <IconButton
                color="primary"
                onClick={() => handleOpenModal(recipe)}
              >
                <RestaurantMenuIcon className="text-yellow-500"/>
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="recipe-modal-title"
        aria-describedby="recipe-modal-description"
      >
        <Box className="absolute overflow-auto h-96 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 border border-gray-300 rounded-lg w-96">
          {recipeDetails && (
            <>
              <Typography
                id="recipe-modal-title"
                variant="h6"
                className="text-gray-600 mb-2"
              >
                {recipeDetails.title?.slice(3)}
              </Typography>
              <Typography
                id="recipe-modal-description"
                className="text-gray-700 whitespace-pre-wrap"
              >
                <strong>Ingredients:</strong> {recipeDetails.ingredients}
              </Typography>
              <Typography className="text-gray-700 whitespace-pre-wrap">
                <strong>Instructions:</strong> {recipeDetails.instructions}
              </Typography>
            </>
          )}
        </Box>
      </Modal>

      <Modal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        aria-labelledby="edit-recipe-modal-title"
        aria-describedby="edit-recipe-modal-description"
      >
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 border border-gray-300 rounded-lg w-96">
          <Typography
            id="edit-recipe-modal-title"
            variant="h6"
            className="text-gray-600 mb-2"
          >
            Edit Recipe
          </Typography>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            margin="normal"
            value={currentRecipe.title}
            onChange={handleChangeCurrentRecipe("title")}
          />
          <TextField
            label="Ingredients"
            variant="outlined"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={currentRecipe.ingredients}
            onChange={handleChangeCurrentRecipe("ingredients")}
          />
          <TextField
            label="Instructions"
            variant="outlined"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={currentRecipe.instructions}
            onChange={handleChangeCurrentRecipe("instructions")}
          />
          <Box className="flex justify-end mt-4">
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateRecipe}
              className="bg-green-500 hover:bg-green-700 text-white"
            >
              Update Recipe
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default RecipesPage;
