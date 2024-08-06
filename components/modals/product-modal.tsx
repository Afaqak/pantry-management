import React from "react";
import { Modal, Box, TextField, Button, Typography, Grid } from "@mui/material";

interface Product {
  id: string;
  name: string;
  quantity: number;
  category: string;
  price: number;
  userId?: string;
}

interface ProductModalProps {
  modalOpen: boolean;
  handleCloseModal: () => void;
  newProduct: Partial<Product>;
  setNewProduct: React.Dispatch<React.SetStateAction<Partial<Product>>>;
  handleAddProduct: () => void;
  editingProduct: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({
  modalOpen,
  handleCloseModal,
  newProduct,
  setNewProduct,
  handleAddProduct,
  editingProduct,
}) => (
  <Modal open={modalOpen} onClose={handleCloseModal}>
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 400,
        bgcolor: "background.paper",
        borderRadius: 1,
        boxShadow: 24,
        p: 4,
      }}
    >
      <Typography variant="h6" component="h2">
        {editingProduct ? "Edit Product" : "Add Product"}
      </Typography>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={newProduct.name || ""}
            onChange={(e) =>
              setNewProduct((prevProduct) => ({
                ...prevProduct,
                name: e.target.value,
              }))
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Quantity"
            variant="outlined"
            fullWidth
            type="number"
            value={newProduct.quantity || ""}
            onChange={(e) =>
              setNewProduct((prevProduct) => ({
                ...prevProduct,
                quantity: parseInt(e.target.value, 10),
              }))
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Category"
            variant="outlined"
            fullWidth
            value={newProduct.category || ""}
            onChange={(e) =>
              setNewProduct((prevProduct) => ({
                ...prevProduct,
                category: e.target.value,
              }))
            }
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Price"
            variant="outlined"
            fullWidth
            type="number"
            value={newProduct.price || ""}
            onChange={(e) =>
              setNewProduct((prevProduct) => ({
                ...prevProduct,
                price: parseFloat(e.target.value),
              }))
            }
          />
        </Grid>
      </Grid>
      <Button
        variant="contained"
        onClick={handleAddProduct}
        sx={{ mt: 2 }}
        fullWidth
      >
        {editingProduct ? "Update" : "Add"}
      </Button>
    </Box>
  </Modal>
);

export default ProductModal;
