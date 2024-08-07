"use client";
import React, { useState, useEffect, useRef } from "react";
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
  Box,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
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
import ImageModal from "@/components/modals/image-modal";
import ProductModal from "@/components/modals/product-modal";
import SoldProductModal from "@/components/modals/sold-product-modal";
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
  const [imageModalOpen, setImageModalOpen] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const [soldProductModalOpen, setSoldProductModalOpen] =
    useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const [user, setUser] = useState<any | null>(null);
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

  const handleOpenImageModal = () => {
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
  };

  const handleGenerateProductFromImage = async (imageFile: string) => {
    if (!imageFile) return;

    try {
      setIsGenerating(true);
      const base64Image = imageFile.split(",")[1];

      if (base64Image) {
        await generateProduct(base64Image, "image/png");
      }

      setIsGenerating(false);
    } catch (err) {
      setIsGenerating(false);
      console.error(err);
    }
  };

  const generateProduct = async (base64Image: string, mimeType: string) => {
    const prompt = `
    Generate information about the product based on the given image. Provide the following details:
    Product Name
    Category
    generate a feasible Price
    quantity
    give the output like example
    apple
    fruit
    2.99
    29
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = await response.text();
    console.log(text, "TEXT_IMAGE");
    console.log(text.split("\n"));

    const splittedText = text.split("\n");

    await addDoc(collection(db, "products"), {
      category: splittedText[1],
      name: splittedText[0],
      quantity: splittedText[3],
      price: splittedText[2],
      userId: user.uid,
    });
    fetchProducts(user.uid);
  };

  const handleOpenSoldProductModal = (product: Product) => {
    setCurrentProduct(product);
    setSoldProductModalOpen(true);
  };

  const handleSellProduct = async (productId: string, quantity: number) => {
    if (!currentProduct) return;
    console.log(quantity, currentProduct?.quantity);
    if (+quantity < 0 || +quantity > +currentProduct?.quantity) {
      setSnackbarMessage(
        "quantity must be greater than 0 and not greater than original quantity!"
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    console.log("here");

    const newQuantity = currentProduct.quantity - quantity;

    try {
      await updateDoc(doc(db, "products", productId), {
        quantity: newQuantity,
      });
      await addDoc(collection(db, "soldItems"), {
        productId,
        name: currentProduct.name,
        category:currentProduct?.category,
        price: currentProduct.price,
        quantity,
        userId: user?.uid,
        soldAt: new Date(),
      });
      setSnackbarMessage("Product sold successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      if (user?.uid) fetchProducts(user.uid);
    } catch (error) {
      setSnackbarMessage("Error selling product!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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
            {user?.displayName}
          </Typography>
        </Box>
      )}
      <Box className="flex justify-between my-4">
        <TextField
          label="Search"
          variant="outlined"
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
        <Box>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
          >
            Add Product
          </Button>
          <Button
            color="warning"
            startIcon={<CameraAltIcon />}
            onClick={handleOpenImageModal}
            sx={{ marginLeft: "10px" }}
          >
            Add From Image
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Actions</TableCell>
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
                    <EditIcon className="text-green-500" />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <DeleteIcon className="text-red-500" />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenSoldProductModal(product)}
                  >
                    <AddIcon className="text-blue-500" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ProductModal
        modalOpen={modalOpen}
        handleCloseModal={() => setModalOpen(false)}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleAddProduct={handleAddProduct}
        editingProduct={editingProduct}
      />
      <ImageModal
        open={imageModalOpen}
        handleClose={handleCloseImageModal}
        handleGenerateProductFromImage={handleGenerateProductFromImage}
        isGenerating={isGenerating}
      />
      <SoldProductModal
        open={soldProductModalOpen}
        handleClose={() => setSoldProductModalOpen(false)}
        product={currentProduct!}
        handleSellProduct={handleSellProduct}
      />
    </Container>
  );
};

export default MainPage;
