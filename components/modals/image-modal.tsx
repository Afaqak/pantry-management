import React, { useRef, useState } from "react";
import {
  Modal,
  Box,
  Button,
  CircularProgress,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Camera } from "react-camera-pro";
import Image from "next/image";

interface ImageModalProps {
  open: boolean;
  handleClose: () => void;
  handleGenerateProductFromImage: (base64Image: string) => void;
  isGenerating: boolean;
}

const ImageModal: React.FC<ImageModalProps> = ({
  open,
  handleClose,
  handleGenerateProductFromImage,
  isGenerating,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const camera = useRef<any | null>(null);

  const handleCaptureImage = () => {
    if (camera.current) {
      const photo = camera.current.takePhoto();
      setSelectedImage(photo);
      setImagePreview(photo);
      setUseCamera(!useCamera);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    if (selectedImage) {
      handleGenerateProductFromImage(selectedImage);
    }
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
        <FormControlLabel
          control={
            <Switch
              checked={useCamera}
              onChange={() => {
                setUseCamera(!useCamera);
                setImagePreview(null);
              }}
            />
          }
          label="Use Camera"
        />
        {useCamera && (
          <Box>
            <Camera ref={camera} aspectRatio={16 / 9} errorMessages={{
                          noCameraAccessible: undefined,
                          permissionDenied: undefined,
                          switchCamera: undefined,
                          canvas: undefined
                      }} />
            <Button variant="contained" color="warning" className="text-white" onClick={handleCaptureImage} sx={{ mt: 2 }}>
              Capture Image
            </Button>
          </Box>
        )}
        {!useCamera && (
          <div>
            <input
              type="file"
              accept="image/*"
              ref={inputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <Button
              variant="contained"
              className="text-white"
              color="warning"
              onClick={() => inputRef.current?.click()}
              sx={{ mt: 2 }}
            >
              Select Image
            </Button>
          </div>
        )}
        {imagePreview && (
          <div className="h-64 relative">
            <Image src={imagePreview} alt="preview" layout="fill" objectFit="contain" />
          </div>
        )}
        <Button
          variant="contained"
          onClick={handleGenerate}
          sx={{ mt: 2 }}
          fullWidth
          className="text-white"
          disabled={isGenerating}
        >
          {isGenerating ? <CircularProgress size={24} /> : "Generate Product"}
        </Button>
      </Box>
    </Modal>
  );
};

export default ImageModal;
