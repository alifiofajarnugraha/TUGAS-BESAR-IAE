// Common styles for components
export const commonStyles = {
  pageContainer: {
    py: 4,
    minHeight: "calc(100vh - 64px)", // Subtract navbar height
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease-in-out",
    "&:hover": {
      transform: "scale(1.02)",
    },
  },
  form: {
    width: "100%",
    mt: 1,
  },
  submit: {
    mt: 3,
    mb: 2,
  },
  paper: {
    p: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "60vh",
  },
  // Add more common styles as needed
};
