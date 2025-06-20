import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  DateRange as DateRangeIcon,
  Add as AddIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Hotel as HotelIcon,
  DirectionsBus as TransportIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { inventoryService, QUERIES, MUTATIONS } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 900,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 3,
  maxHeight: "95vh",
  overflowY: "auto",
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function InventoryManagementModal({ open, onClose, tour }) {
  const [activeTab, setActiveTab] = useState(0);
  const [message, setMessage] = useState(null);

  // Single date form state
  const [singleForm, setSingleForm] = useState({
    date: "",
    slots: 10,
    hotelAvailable: true,
    transportAvailable: true,
  });

  // Range form state
  const [rangeForm, setRangeForm] = useState({
    startDate: "",
    endDate: "",
    slots: 10,
    hotelAvailable: true,
    transportAvailable: true,
    skipWeekends: false,
    skipDays: [],
    skipDates: [],
  });

  // Preview state
  const [previewDates, setPreviewDates] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch current inventory
  const { data, loading, error, refetch } = useQuery(
    QUERIES.GET_INVENTORY_STATUS,
    {
      variables: { tourId: tour?.id },
      client: inventoryService,
      skip: !tour?.id,
      onError: (error) => {
        console.error("Inventory query error:", error);
        setMessage({ type: "error", text: "Failed to load inventory data" });
      },
    }
  );

  // Fetch availability range (for display)
  const { data: rangeData, refetch: refetchRange } = useQuery(
    QUERIES.GET_TOUR_AVAILABILITY_RANGE,
    {
      variables: {
        tourId: tour?.id,
        startDate: getDateString(-30), // Last 30 days
        endDate: getDateString(90), // Next 90 days
      },
      client: inventoryService,
      skip: !tour?.id,
    }
  );

  // Lazy Query for preview range
  const [previewRangeLazy, { loading: previewLoading }] = useLazyQuery(
    QUERIES.PREVIEW_INVENTORY_RANGE,
    {
      client: inventoryService,
      onCompleted: (data) => {
        setPreviewDates(data.previewInventoryRange || []);
        setShowPreview(true);
      },
      onError: (err) => {
        console.error("Preview range error:", err);
        setMessage({ type: "error", text: err.message });
      },
    }
  );

  // Mutations
  const [updateInventory, { loading: updateLoading }] = useMutation(
    MUTATIONS.UPDATE_INVENTORY,
    {
      client: inventoryService,
      onCompleted: () => {
        setMessage({
          type: "success",
          text: "Inventory updated successfully!",
        });
        refetch();
        refetchRange();
        clearMessage();
      },
      onError: (err) => {
        console.error("Update inventory error:", err);
        setMessage({ type: "error", text: err.message });
      },
    }
  );

  const [initializeRange, { loading: rangeLoading }] = useMutation(
    MUTATIONS.INITIALIZE_TOUR_INVENTORY_RANGE,
    {
      client: inventoryService,
      onCompleted: (data) => {
        const result = data.initializeTourInventoryRange;
        setMessage({
          type: "success",
          text: `Range initialized: ${result.createdRecords} created, ${result.skippedRecords} skipped`,
        });
        refetch();
        refetchRange();
        setShowPreview(false);
        clearMessage();
      },
      onError: (err) => {
        console.error("Initialize range error:", err);
        setMessage({ type: "error", text: err.message });
      },
    }
  );

  // Helper functions
  function getDateString(daysOffset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split("T")[0];
  }

  function clearMessage() {
    setTimeout(() => setMessage(null), 3000);
  }

  // Event handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setMessage(null);
  };

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (!singleForm.date) {
      setMessage({ type: "error", text: "Date is required" });
      return;
    }

    updateInventory({
      variables: {
        input: {
          tourId: tour.id,
          date: singleForm.date,
          slots: parseInt(singleForm.slots, 10),
          hotelAvailable: singleForm.hotelAvailable,
          transportAvailable: singleForm.transportAvailable,
        },
      },
    });
  };

  const handlePreviewRange = () => {
    if (!rangeForm.startDate || !rangeForm.endDate) {
      setMessage({ type: "error", text: "Start and end dates are required" });
      return;
    }

    const skipDays = rangeForm.skipWeekends ? [0, 6] : rangeForm.skipDays; // 0=Sunday, 6=Saturday

    previewRangeLazy({
      variables: {
        startDate: rangeForm.startDate,
        endDate: rangeForm.endDate,
        skipDays,
        skipDates: rangeForm.skipDates,
      },
    });
  };

  const handleInitializeRange = () => {
    if (!rangeForm.startDate || !rangeForm.endDate) {
      setMessage({ type: "error", text: "Start and end dates are required" });
      return;
    }

    const skipDays = rangeForm.skipWeekends ? [0, 6] : rangeForm.skipDays;

    initializeRange({
      variables: {
        input: {
          tourId: tour.id,
          startDate: rangeForm.startDate,
          endDate: rangeForm.endDate,
          slots: parseInt(rangeForm.slots, 10),
          hotelAvailable: rangeForm.hotelAvailable,
          transportAvailable: rangeForm.transportAvailable,
          skipDays,
          skipDates: rangeForm.skipDates,
        },
      },
    });
  };

  // Set default dates on load
  useEffect(() => {
    if (!rangeForm.startDate) {
      setRangeForm((prev) => ({
        ...prev,
        startDate: getDateString(1), // Tomorrow
        endDate: getDateString(30), // Next 30 days
      }));
    }
  }, []);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              borderBottom: 1,
              borderColor: "divider",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "12px 12px 0 0",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Inventory Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {tour?.name}
                </Typography>
              </Box>
              <IconButton onClick={onClose} sx={{ color: "white" }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Alert Messages */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{ padding: "16px" }}
              >
                <Alert severity={message.type} onClose={() => setMessage(null)}>
                  {message.text}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Tabs */}
          <Box sx={{ px: 3, borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="inventory management tabs"
              variant="fullWidth"
            >
              <Tab
                icon={<CalendarIcon />}
                label="Single Date"
                iconPosition="start"
              />
              <Tab
                icon={<DateRangeIcon />}
                label="Date Range"
                iconPosition="start"
              />
              <Tab
                icon={<PreviewIcon />}
                label="View Inventory"
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* Tab 1: Single Date Management */}
            <TabPanel value={activeTab} index={0}>
              <Box component="form" onSubmit={handleSingleSubmit}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Update Single Date Inventory
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Date"
                      type="date"
                      fullWidth
                      value={singleForm.date}
                      onChange={(e) =>
                        setSingleForm((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Available Slots"
                      type="number"
                      fullWidth
                      value={singleForm.slots}
                      onChange={(e) =>
                        setSingleForm((prev) => ({
                          ...prev,
                          slots: e.target.value,
                        }))
                      }
                      required
                      inputProps={{ min: 0, step: 1 }}
                      InputProps={{
                        startAdornment: (
                          <PeopleIcon sx={{ mr: 1, color: "action.active" }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={singleForm.hotelAvailable}
                          onChange={(e) =>
                            setSingleForm((prev) => ({
                              ...prev,
                              hotelAvailable: e.target.checked,
                            }))
                          }
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <HotelIcon sx={{ mr: 1 }} />
                          Hotel Available
                        </Box>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={singleForm.transportAvailable}
                          onChange={(e) =>
                            setSingleForm((prev) => ({
                              ...prev,
                              transportAvailable: e.target.checked,
                            }))
                          }
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <TransportIcon sx={{ mr: 1 }} />
                          Transport Available
                        </Box>
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={updateLoading}
                      startIcon={
                        updateLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      sx={{ py: 1.5 }}
                    >
                      {updateLoading ? "Updating..." : "Update Inventory"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>

            {/* Tab 2: Date Range Management */}
            <TabPanel value={activeTab} index={1}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Initialize Date Range Inventory
              </Typography>

              <Grid container spacing={3}>
                {/* Date Range Selection */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    value={rangeForm.startDate}
                    onChange={(e) =>
                      setRangeForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="End Date"
                    type="date"
                    fullWidth
                    value={rangeForm.endDate}
                    onChange={(e) =>
                      setRangeForm((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Slots Configuration */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Slots per Day"
                    type="number"
                    fullWidth
                    value={rangeForm.slots}
                    onChange={(e) =>
                      setRangeForm((prev) => ({
                        ...prev,
                        slots: e.target.value,
                      }))
                    }
                    required
                    inputProps={{ min: 0, step: 1 }}
                    InputProps={{
                      startAdornment: (
                        <PeopleIcon sx={{ mr: 1, color: "action.active" }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={rangeForm.skipWeekends}
                        onChange={(e) =>
                          setRangeForm((prev) => ({
                            ...prev,
                            skipWeekends: e.target.checked,
                          }))
                        }
                        color="primary"
                      />
                    }
                    label="Skip Weekends (Sat & Sun)"
                  />
                </Grid>

                {/* Service Availability */}
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={rangeForm.hotelAvailable}
                        onChange={(e) =>
                          setRangeForm((prev) => ({
                            ...prev,
                            hotelAvailable: e.target.checked,
                          }))
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <HotelIcon sx={{ mr: 1 }} />
                        Hotel Available
                      </Box>
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={rangeForm.transportAvailable}
                        onChange={(e) =>
                          setRangeForm((prev) => ({
                            ...prev,
                            transportAvailable: e.target.checked,
                          }))
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <TransportIcon sx={{ mr: 1 }} />
                        Transport Available
                      </Box>
                    }
                  />
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={handlePreviewRange}
                    disabled={previewLoading}
                    startIcon={
                      previewLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <PreviewIcon />
                      )
                    }
                    sx={{ py: 1.5 }}
                  >
                    {previewLoading ? "Loading..." : "Preview Dates"}
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleInitializeRange}
                    disabled={rangeLoading || !showPreview}
                    startIcon={
                      rangeLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <AddIcon />
                      )
                    }
                    sx={{ py: 1.5 }}
                  >
                    {rangeLoading ? "Initializing..." : "Initialize Range"}
                  </Button>
                </Grid>

                {/* Preview Results */}
                {showPreview && previewDates.length > 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Preview: {previewDates.length} dates will be processed
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {previewDates.slice(0, 20).map((date, index) => (
                          <Chip
                            key={index}
                            label={date}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                        {previewDates.length > 20 && (
                          <Chip
                            label={`+${previewDates.length - 20} more`}
                            size="small"
                            color="default"
                          />
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            {/* Tab 3: View Current Inventory */}
            <TabPanel value={activeTab} index={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">Current Inventory Status</Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    refetch();
                    refetchRange();
                  }}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">
                  Error loading inventory: {error.message}
                </Alert>
              ) : (
                <>
                  {/* Quick Stats */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h4" color="primary">
                          {data?.getInventoryStatus?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Days
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h4" color="success.main">
                          {data?.getInventoryStatus?.reduce(
                            (sum, inv) => sum + inv.slotsLeft,
                            0
                          ) || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Slots
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h4" color="info.main">
                          {data?.getInventoryStatus?.filter(
                            (inv) => inv.hotelAvailable
                          ).length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Hotel Available
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h4" color="warning.main">
                          {data?.getInventoryStatus?.filter(
                            (inv) => inv.transportAvailable
                          ).length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Transport Available
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Inventory Table */}
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Date</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Slots</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Hotel</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Transport</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Status</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {!data?.getInventoryStatus ||
                        data.getInventoryStatus.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              align="center"
                              sx={{ py: 4 }}
                            >
                              <Typography color="text.secondary">
                                No inventory data found for this tour.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          // ✅ FIX: Clone array before sorting to avoid mutating Apollo cache
                          [...(data.getInventoryStatus || [])]
                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                            .map((inv, index) => (
                              <TableRow
                                key={`${inv.date}-${index}`}
                                sx={{
                                  "&:nth-of-type(odd)": {
                                    bgcolor: "action.hover",
                                  },
                                  "&:hover": { bgcolor: "action.selected" },
                                }}
                              >
                                <TableCell>
                                  {new Date(inv.date).toLocaleDateString(
                                    "id-ID",
                                    {
                                      weekday: "short",
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={inv.slotsLeft}
                                    color={
                                      inv.slotsLeft > 5
                                        ? "success"
                                        : inv.slotsLeft > 0
                                        ? "warning"
                                        : "error"
                                    }
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    icon={<HotelIcon />}
                                    label={inv.hotelAvailable ? "Yes" : "No"}
                                    color={
                                      inv.hotelAvailable ? "success" : "error"
                                    }
                                    variant="outlined"
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    icon={<TransportIcon />}
                                    label={
                                      inv.transportAvailable ? "Yes" : "No"
                                    }
                                    color={
                                      inv.transportAvailable
                                        ? "success"
                                        : "error"
                                    }
                                    variant="outlined"
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={
                                      inv.slotsLeft > 0 &&
                                      inv.hotelAvailable &&
                                      inv.transportAvailable
                                        ? "Available"
                                        : "Limited"
                                    }
                                    color={
                                      inv.slotsLeft > 0 &&
                                      inv.hotelAvailable &&
                                      inv.transportAvailable
                                        ? "success"
                                        : "warning"
                                    }
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </TabPanel>
          </Box>
        </motion.div>
      </Box>
    </Modal>
  );
}

export default InventoryManagementModal;
