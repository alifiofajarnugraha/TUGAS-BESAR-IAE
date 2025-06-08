import React, { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

const ImageCarousel = ({ images, alt, height = 200 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback images jika tidak ada atau kosong
  const validImages =
    images && images.length > 0
      ? images
      : [`https://picsum.photos/800/600?random=${Math.random()}`];

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? validImages.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === validImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const getImageSrc = (image) => {
    if (typeof image === "string") {
      // Check if it's a valid base64 data URL
      if (image.startsWith("data:image/")) {
        return image;
      }
      // Check if it's a regular URL
      if (image.startsWith("http")) {
        return image;
      }
    }
    // Fallback
    return `https://picsum.photos/800/600?random=${Math.random()}`;
  };

  const handleImageError = (e) => {
    e.target.src = `https://via.placeholder.com/800x${height}/2196F3/white?text=Image+Not+Found`;
  };

  return (
    <Box
      sx={{ position: "relative", height, overflow: "hidden", borderRadius: 1 }}
    >
      {/* Main Image */}
      <Box
        component="img"
        src={getImageSrc(validImages[currentIndex])}
        alt={`${alt} - Image ${currentIndex + 1}`}
        onError={handleImageError}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          bgcolor: "grey.200",
        }}
      />

      {/* Navigation Arrows - Only show if more than 1 image */}
      {validImages.length > 1 && (
        <>
          {/* Left Arrow */}
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.7)",
              },
              width: 32,
              height: 32,
            }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>

          {/* Right Arrow */}
          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.7)",
              },
              width: 32,
              height: 32,
            }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>

          {/* Image Counter */}
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              bgcolor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: "0.75rem",
            }}
          >
            {currentIndex + 1} / {validImages.length}
          </Box>

          {/* Dots Indicator */}
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 0.5,
            }}
          >
            {validImages.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor:
                    index === currentIndex
                      ? "white"
                      : "rgba(255, 255, 255, 0.5)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "white",
                  },
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ImageCarousel;
