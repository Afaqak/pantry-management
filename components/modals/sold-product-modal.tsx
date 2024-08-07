import React, { useState } from "react";
import { Modal, Box, Button, TextField, Typography } from "@mui/material";

interface Product {
  id: string;
  name: string;
  quantity: number;
  category: string;
  price: number;
  userId?: string;
}

interface SoldProductModalProps {
  open: boolean;
  handleClose: () => void;
  product: Product;
  handleSellProduct: (productId: string, quantity: number) => void;
}

const SoldProductModal: React.FC<SoldProductModalProps> = ({
  open,
  handleClose,
  product,
  handleSellProduct,
}) => {
  const [quantity, setQuantity] = useState<number>(0);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);

    setQuantity(value);
  };

  const handleSell = () => {

      handleSellProduct(product.id, quantity);
      handleClose();
    
  };

  return (
    <Modal open={open} onClose={handleClose}>
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
          Sell Product
        </Typography>
        <TextField
          label="Name"
          value={product?.name}
          fullWidth
          margin="normal"
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField
          label="Price"
          value={product?.price}
          fullWidth
          margin="normal"
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField
          label="Original Quantity"
          value={product?.quantity}
          fullWidth
          margin="normal"
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField
          label="Quantity"
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          onClick={handleSell}
          fullWidth
          className="text-white"
          sx={{ mt: 2 }}
        >
          Sell
        </Button>
      </Box>
    </Modal>
  );
};

export default SoldProductModal;
