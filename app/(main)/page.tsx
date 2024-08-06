// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import {
//   Container,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   IconButton,
//   Snackbar,
//   Alert,
//   Modal,
//   Box,
//   TextField,
//   InputAdornment,
//   Typography,
//   Switch,
//   FormControlLabel,
// } from "@mui/material";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import AddIcon from "@mui/icons-material/Add";
// import SearchIcon from "@mui/icons-material/Search";
// import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
// import CameraAltIcon from "@mui/icons-material/CameraAlt";
// import { db, auth } from "@/utils/firebase";
// import {
//   collection,
//   getDocs,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   doc,
//   query,
//   where,
// } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth";
// import { model } from "@/utils/generative-ai";
// import { useRouter } from "next/navigation";
// import { Camera } from "react-camera-pro";
// import Image from "next/image";

// interface Product {
//   id: string;
//   name: string;
//   quantity: number;
//   category: string;
//   price: number;
//   userId?: string;
// }

// const MainPage: React.FC = () => {
//   const router = useRouter();
//   const [products, setProducts] = useState<Product[]>([]);
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [newProduct, setNewProduct] = useState<Partial<Product>>({});
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [modalOpen, setModalOpen] = useState<boolean>(false);
//   const [imageModalOpen, setImageModalOpen] = useState<boolean>(false);
//   const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
//   const [snackbarMessage, setSnackbarMessage] = useState<string>("");
//   const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
//     "success"
//   );
//   const [user, setUser] = useState<any | null>(null);
//   const [recipe, setRecipe] = useState<string>("");
//   const [isGenerating, setIsGenerating] = useState<boolean>(false);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [useCamera, setUseCamera] = useState<boolean>(false);
//   const [capturedImage, setCapturedImage] = useState<string | null>(null);
//   const camera = useRef(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);
//         fetchProducts(currentUser.uid);
//       } else {
//         router.push("/login");
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     setFilteredProducts(
//       products.filter((product) =>
//         product.name.toLowerCase().includes(searchQuery.toLowerCase())
//       )
//     );
//   }, [searchQuery, products]);

//   const fetchProducts = async (userId: string) => {
//     const q = query(collection(db, "products"), where("userId", "==", userId));
//     const querySnapshot = await getDocs(q);
//     const productsList = querySnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...(doc.data() as Omit<Product, "id">),
//     }));
//     setProducts(productsList);
//   };

//   const handleAddProduct = async () => {
//     try {
//       const productData = { ...newProduct, userId: user?.uid };
//       if (editingProduct) {
//         await updateDoc(doc(db, "products", editingProduct.id), productData);
//         setSnackbarMessage("Product updated successfully!");
//       } else {
//         await addDoc(collection(db, "products"), productData);
//         setSnackbarMessage("Product added successfully!");
//       }
//       setSnackbarSeverity("success");
//       setSnackbarOpen(true);
//       setNewProduct({});
//       setEditingProduct(null);
//       setModalOpen(false);
//       if (user?.uid) fetchProducts(user.uid);
//     } catch (error) {
//       setSnackbarMessage("Error adding/updating product!");
//       setSnackbarSeverity("error");
//       setSnackbarOpen(true);
//     }
//   };

//   const handleEditProduct = (product: Product) => {
//     setNewProduct(product);
//     setEditingProduct(product);
//     setModalOpen(true);
//   };

//   const handleDeleteProduct = async (productId: string) => {
//     try {
//       await deleteDoc(doc(db, "products", productId));
//       setSnackbarMessage("Product deleted successfully!");
//       setSnackbarSeverity("success");
//       setSnackbarOpen(true);
//       if (user?.uid) fetchProducts(user.uid);
//     } catch (error) {
//       setSnackbarMessage("Error deleting product!");
//       setSnackbarSeverity("error");
//       setSnackbarOpen(true);
//     }
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbarOpen(false);
//   };

//   const handleOpenModal = () => {
//     setNewProduct({});
//     setEditingProduct(null);
//     setModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setModalOpen(false);
//   };

//   const handleOpenImageModal = () => {
//     setImageModalOpen(true);
//   };

//   const handleCloseImageModal = () => {
//     setImageModalOpen(false);
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setImageFile(e.target.files[0]);
//     }
//   };

//   const handleGenerateProductFromImage = async () => {
//     if (!imageFile && !capturedImage) return;

//     try {
//       setIsGenerating(true);
//       const base64Image = capturedImage ? capturedImage.split(",")[1] : "";

//       if (imageFile) {
//         const reader = new FileReader();
//         reader.readAsDataURL(imageFile);
//         reader.onloadend = async () => {
//           const base64ImageFromFile = reader.result?.toString().split(",")[1];
//           await generateProduct(base64ImageFromFile, imageFile.type);
//         };
//       } else if (base64Image) {
//         await generateProduct(base64Image, "image/png");
//       }
//       setIsGenerating(false);
//     } catch (err) {
//       setIsGenerating(false);
//       console.log(err);
//     } finally {
//       // setImageModalOpen(false);
//     }
//   };

//   const generateProduct = async (base64Image: string, mimeType: string) => {
//     const prompt = `
//     Generate information about the product based on the given image. Provide the following details:
//     Product Name
//     Category
//     generate a feasible Price
//     quantity
//     give the output like example
//     apple
//     fruit
//     2.99
//     29
//     `;

//     const imagePart = {
//       inlineData: {
//         data: base64Image,
//         mimeType: mimeType,
//       },
//     };

//     const result = await model.generateContent([prompt, imagePart]);
//     const response = await result.response;
//     const text = await response.text();
//     console.log(text, "TEXT_IMAGE");
//     console.log(text.split("\n"));

//     const splittedText = text.split("\n");

//     await addDoc(collection(db, "products"), {
//       category: splittedText[1],
//       name: splittedText[0],
//       quantity: splittedText[3],
//       price: splittedText[2],
//       userId: user.uid,
//     });
//     fetchProducts(user.uid);

//   };

//   return (
//     <Container sx={{ padding: "100px 0px" }}>
//       <Snackbar
//         open={snackbarOpen}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//       >
//         <Alert
//           onClose={handleCloseSnackbar}
//           severity={snackbarSeverity}
//           sx={{ width: "100%" }}
//         >
//           {snackbarMessage}
//         </Alert>
//       </Snackbar>
//       <h1 className="text-4xl font-bold my-4">Welcome Back 🖐️</h1>
//       {user && (
//         <Box className="flex mt-4 mb-8">
//           <Typography variant="h6" className="text-gray-600">
//             {user.email}
//           </Typography>
//         </Box>
//       )}
//       <Box className="flex justify-between my-4">
//         <TextField
//           label="Search"
//           variant="outlined"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <SearchIcon />
//               </InputAdornment>
//             ),
//           }}
//         />
//         <Box>
//           <Button
//             variant="contained"
//             className="bg-green-500 hover:bg-green-600"
//             startIcon={<AddIcon />}
//             onClick={handleOpenModal}
//           >
//             Add Product
//           </Button>
//           <Button
//             variant="contained"
//             className="bg-yellow-500 hover:bg-yellow-600"
//             startIcon={<CameraAltIcon />}
//             onClick={handleOpenImageModal}
//             sx={{ marginLeft: "10px" }}
//           >
//             Add From Image
//           </Button>
//         </Box>
//       </Box>
//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Name</TableCell>
//               <TableCell>Quantity</TableCell>
//               <TableCell>Category</TableCell>
//               <TableCell>Price</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {filteredProducts.map((product) => (
//               <TableRow key={product.id}>
//                 <TableCell>{product.name}</TableCell>
//                 <TableCell>{product.quantity}</TableCell>
//                 <TableCell>{product.category}</TableCell>
//                 <TableCell>{product.price}</TableCell>
//                 <TableCell>
//                   <IconButton onClick={() => handleEditProduct(product)}>
//                     <EditIcon />
//                   </IconButton>
//                   <IconButton
//                     color="secondary"
//                     onClick={() => handleDeleteProduct(product.id)}
//                   >
//                     <DeleteIcon />
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <Modal open={modalOpen} onClose={handleCloseModal}>
//         <Box className="absolute top-1/2 left-1/2 w-1/3 bg-white p-8 transform -translate-x-1/2 -translate-y-1/2">
//           <Typography variant="h6" className="mb-4">
//             {editingProduct ? "Edit Product" : "Add Product"}
//           </Typography>
//           <TextField
//             label="Name"
//             variant="outlined"
//             fullWidth
//             value={newProduct.name || ""}
//             onChange={(e) =>
//               setNewProduct((prev) => ({ ...prev, name: e.target.value }))
//             }
//             className="mb-4"
//           />
//           <TextField
//             label="Quantity"
//             variant="outlined"
//             fullWidth
//             value={newProduct.quantity || ""}
//             onChange={(e) =>
//               setNewProduct((prev) => ({
//                 ...prev,
//                 quantity: parseInt(e.target.value),
//               }))
//             }
//             className="mb-4"
//           />
//           <TextField
//             label="Category"
//             variant="outlined"
//             fullWidth
//             value={newProduct.category || ""}
//             onChange={(e) =>
//               setNewProduct((prev) => ({ ...prev, category: e.target.value }))
//             }
//             className="mb-4"
//           />
//           <TextField
//             label="Price"
//             variant="outlined"
//             fullWidth
//             value={newProduct.price || ""}
//             onChange={(e) =>
//               setNewProduct((prev) => ({
//                 ...prev,
//                 price: parseFloat(e.target.value),
//               }))
//             }
//             className="mb-4"
//           />
//           <Box className="flex justify-end mt-4">
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={handleAddProduct}
//             >
//               {editingProduct ? "Update" : "Add"}
//             </Button>
//           </Box>
//         </Box>
//       </Modal>
//       <ImageModal
//         imageModalOpen={imageModalOpen}
//         handleCloseImageModal={handleCloseImageModal}
//         handleImageChange={handleImageChange}
//         handleGenerateProductFromImage={handleGenerateProductFromImage}
//         isGenerating={isGenerating}
//       />
//     </Container>
//   );
// };

// export default MainPage;

// const ImageModal = ({
//   imageModalOpen,
//   handleCloseImageModal,
//   handleImageChange,
//   handleGenerateProductFromImage,
//   isGenerating,
// }) => {
//   const [useCamera, setUseCamera] = useState(false);
//   const [imagePreview, setImagePreview] = useState(null);
//   const camera = useRef(null);

//   const handleCaptureImage = () => {
//     const photo = camera.current.takePhoto();
//     setUseCamera(!useCamera);
//     setImagePreview(photo);
//   };

//   const handleImageFileChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//       };
//     }
//     handleImageChange(e);
//   };

//   return (
//     <Modal open={imageModalOpen} onClose={handleCloseImageModal}>
//       <Box
//         className="absolute top-1/2 left-1/2 w-1/3 bg-white p-8 transform -translate-x-1/2 -translate-y-1/2"
//         sx={{ boxShadow: 24, borderRadius: 2 }}
//       >
//         <Typography variant="h6" className="mb-4">
//           Add Product from Image
//         </Typography>
//         <FormControlLabel
//           control={
//             <Switch
//               checked={useCamera}
//               onChange={() => {
//                 setUseCamera(!useCamera);
//                 setImagePreview(null);
//               }}
//             />
//           }
//           label="Use Camera"
//         />
//         {useCamera ? (
//           <Box>
//             <Camera ref={camera} aspectRatio={12 / 8} />
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={handleCaptureImage}
//               className="mt-4"
//             >
//               Capture Image
//             </Button>
//           </Box>
//         ) : (
//           <TextField
//             type="file"
//             variant="outlined"
//             fullWidth
//             onChange={handleImageFileChange}
//             className="mb-4"
//           />
//         )}
//         {imagePreview && (
//           <Box className="mt-4">
//             <Typography variant="subtitle1" className="mb-2">
//               Preview:
//             </Typography>
//             <div className="h-60 w-full relative">
//               <Image
//                 fill
//                 src={imagePreview}
//                 alt="Captured or Selected"
//                 className="w-full h-auto"
//               />
//             </div>
//           </Box>
//         )}
//         <Box className="flex justify-end mt-4">
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleGenerateProductFromImage}
//             disabled={isGenerating}
//           >
//             {isGenerating ? "Generating..." : "Generate Product"}
//           </Button>
//         </Box>
//       </Box>
//     </Modal>
//   );
// };

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
            className="bg-green-500 hover:bg-green-600"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
          >
            Add Product
          </Button>
          <Button
            variant="contained"
            className="bg-yellow-500 hover:bg-yellow-600"
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
                    <EditIcon className="text-green-500"/>
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <DeleteIcon className="text-red-500"/>
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
    </Container>
  );
};

export default MainPage;
