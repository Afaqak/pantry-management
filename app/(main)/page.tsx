"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Modal,
  Box,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
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
import { model } from "@/utils/generative-ai";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  quantity: number;
  category: string;
  price: number;
  userId?: string;
}

const MainPage: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [user, setUser] = useState<any | null>(null);
  const [recipe, setRecipe] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchProducts(currentUser.uid);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, products]);

  const fetchProducts = async (userId: string) => {
    const q = query(collection(db, "products"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const productsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Product, "id">),
    }));
    setProducts(productsList);
  };

  const handleAddProduct = async () => {
    try {
      const productData = { ...newProduct, userId: user?.uid };
      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        setSnackbarMessage("Product updated successfully!");
      } else {
        await addDoc(collection(db, "products"), productData);
        setSnackbarMessage("Product added successfully!");
      }
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setNewProduct({});
      setEditingProduct(null);
      setModalOpen(false);
      if (user?.uid) fetchProducts(user.uid);
    } catch (error) {
      setSnackbarMessage("Error adding/updating product!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleEditProduct = (product: Product) => {
    setNewProduct(product);
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, "products", productId));
      setSnackbarMessage("Product deleted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      if (user?.uid) fetchProducts(user.uid);
    } catch (error) {
      setSnackbarMessage("Error deleting product!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleOpenModal = () => {
    setNewProduct({});
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const getRecipeFromPrompt = async () => {
    try {
      setIsGenerating(true);
      const selectedProducts = products
        .map((product) => product.name)
        .join(", ");

      const prompt = `Generate a recipe using the following products: ${selectedProducts}.
      In the first line give me a title for the recipe as well.
      Choose the products you think are right for the recipe.
      Provide a detailed recipe with ingredients and instructions.`;

      const result = await model.generateContent(prompt);

      const response = await result.response;
      const text = await response.text();

      setRecipe(text);
    } catch (err) {
      console.log(err);
    } finally {
      setIsGenerating(false);
    }
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
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <h1 className="text-4xl font-bold my-4">Welcome Back 🖐️</h1>
      {user && (
        <Box className="flex mt-4 mb-8">
          <Typography variant="h6" className="text-gray-600">
            {user.email}
          </Typography>
        </Box>
      )}
      <Box className="flex justify-between my-4">
        <TextField
          variant="outlined"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
          className="bg-green-500 hover:bg-green-700 text-white"
        >
          Add Product
        </Button>
      </Box>
      <TableContainer component={Paper} className="my-8">
        <Table>
          <TableHead className="bg-green-500">
            <TableRow>
              <TableCell className="text-white">Name</TableCell>
              <TableCell className="text-white">Quantity</TableCell>
              <TableCell className="text-white">Category</TableCell>
              <TableCell className="text-white">Price</TableCell>
              <TableCell className="text-white">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditProduct(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteProduct(product.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-green-500 shadow-lg p-8 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h2>
          <TextField
            fullWidth
            label="Product Name"
            variant="outlined"
            value={newProduct.name || ""}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            className="my-2"
          />
          <TextField
            fullWidth
            label="Quantity"
            variant="outlined"
            value={newProduct.quantity || ""}
            onChange={(e) =>
              setNewProduct({ ...newProduct, quantity: +e.target.value })
            }
            className="my-2"
          />
          <TextField
            fullWidth
            label="Category"
            variant="outlined"
            value={newProduct.category || ""}
            onChange={(e) =>
              setNewProduct({ ...newProduct, category: e.target.value })
            }
            className="my-2"
          />
          <TextField
            fullWidth
            label="Price"
            variant="outlined"
            value={newProduct.price || ""}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: +e.target.value })
            }
            className="my-2"
          />
          <Box className="flex justify-end mt-4">
            <Button onClick={handleCloseModal} className="mr-2">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddProduct}
              className="bg-green-500 text-white"
            >
              {editingProduct ? "Update" : "Add"}
            </Button>
          </Box>
        </Box>
      </Modal>
      <Box className="flex justify-end my-4">
        <Button
          variant="contained"
          color="primary"
          onClick={getRecipeFromPrompt}
          className="bg-green-500 hover:bg-green-700 text-white"
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Get Recipe Suggestion"}
        </Button>
      </Box>
      {recipe && (
        <Box className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-100">
          <Box className="flex items-center mb-2">
            <RestaurantMenuIcon className="text-green-500 mr-2" />
            <Typography variant="h6" className="text-gray-600">
              Generated Recipe:
            </Typography>
          </Box>
          <div
            className="whitespace-pre-wrap bg-white p-2 border border-gray-200 rounded"
            dangerouslySetInnerHTML={{ __html: recipe }}
          />
        </Box>
      )}
    </Container>
  );
};

export default MainPage;
