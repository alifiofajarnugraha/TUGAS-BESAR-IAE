import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Paper,
  Avatar,
  Divider,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Phone,
  Email,
  LocationOn,
  AccessTime,
  Send,
  Flight,
  Facebook,
  Instagram,
  YouTube,
  MusicNote,
  WhatsApp,
  Telegram,
  ExpandMore,
  CheckCircle,
  Help,
  Support,
  Business,
  TravelExplore,
  Group,
  Payment,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSubmitStatus({
        type: "success",
        message:
          "Pesan Anda telah berhasil dikirim! Tim kami akan menghubungi Anda dalam 24 jam.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        inquiryType: "general",
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contact information
  const contactInfo = [
    {
      icon: <Phone sx={{ fontSize: 30, color: "#6366f1" }} />,
      title: "Telepon",
      info: "+62-81-353-079-529",
      description: "Senin - Minggu, 08:00 - 22:00 WIB",
      action: "tel:+6281353079529",
    },
    {
      icon: <Email sx={{ fontSize: 30, color: "#6366f1" }} />,
      title: "Email",
      info: "hello@tickotravel.co.id",
      description: "Respon dalam 2-4 jam",
      action: "mailto:hello@tickotravel.co.id",
    },
    {
      icon: <WhatsApp sx={{ fontSize: 30, color: "#25d366" }} />,
      title: "WhatsApp",
      info: "+62-81-353-079-529",
      description: "Chat langsung dengan tim kami",
      action: "https://wa.me/6281353079529",
    },
    {
      icon: <LocationOn sx={{ fontSize: 30, color: "#6366f1" }} />,
      title: "Alamat Kantor",
      info: "Jl. Sudirman No. 123",
      description: "Jakarta Pusat 10220, Indonesia",
      action: "https://maps.google.com/?q=Jl.+Sudirman+No.+123+Jakarta+Pusat",
    },
  ];

  // Office hours
  const officeHours = [
    { day: "Senin - Jumat", hours: "08:00 - 17:00 WIB" },
    { day: "Sabtu", hours: "09:00 - 15:00 WIB" },
    { day: "Minggu", hours: "10:00 - 14:00 WIB" },
    { day: "Emergency Line", hours: "24/7 (WhatsApp only)" },
  ];

  // FAQ data
  const faqs = [
    {
      question: "Bagaimana cara melakukan booking tour?",
      answer:
        "Anda dapat melakukan booking melalui website kami dengan memilih paket tour, mengisi formulir booking, dan melakukan pembayaran. Tim kami akan menghubungi Anda untuk konfirmasi detail.",
    },
    {
      question: "Apakah harga sudah termasuk semua biaya?",
      answer:
        "Harga yang tertera sudah termasuk akomodasi, transportasi, makan sesuai itinerary, guide, dan tiket masuk tempat wisata. Biaya tambahan akan disebutkan di deskripsi paket.",
    },
    {
      question: "Bagaimana kebijakan pembatalan tour?",
      answer:
        "Pembatalan dapat dilakukan hingga 7 hari sebelum keberangkatan dengan pengembalian 80% dari total pembayaran. Pembatalan kurang dari 7 hari dikenakan biaya administrasi.",
    },
    {
      question: "Apakah tersedia guide berbahasa Inggris?",
      answer:
        "Ya, kami menyediakan guide berbahasa Inggris untuk semua paket tour. Silakan mention kebutuhan ini saat melakukan booking.",
    },
    {
      question: "Bagaimana jika cuaca buruk saat tour?",
      answer:
        "Kami memiliki backup plan untuk setiap itinerary. Jika cuaca tidak memungkinkan, aktivitas akan diganti dengan alternatif yang setara atau dijadwal ulang.",
    },
  ];

  // Inquiry types
  const inquiryTypes = [
    { value: "general", label: "Pertanyaan Umum" },
    { value: "booking", label: "Booking & Reservasi" },
    { value: "payment", label: "Pembayaran" },
    { value: "complaint", label: "Keluhan" },
    { value: "partnership", label: "Kerjasama" },
    { value: "feedback", label: "Saran & Masukan" },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <Box sx={{ bgcolor: "background.default" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          color: "white",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "rgba(255,255,255,0.2)",
                  fontSize: "2rem",
                }}
              >
                <Support sx={{ fontSize: 40 }} />
              </Avatar>
            </Box>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
              }}
            >
              Hubungi Ticko Travel
            </Typography>
            <Typography
              variant="h5"
              sx={{
                maxWidth: "800px",
                mx: "auto",
                opacity: 0.9,
                lineHeight: 1.6,
              }}
            >
              Kami siap membantu Anda merencanakan perjalanan impian. Tim
              customer service kami tersedia 7 hari seminggu.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Contact Methods Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              fontWeight: 700,
              mb: 6,
              color: "#1a202c",
            }}
          >
            Cara Menghubungi Kami
          </Typography>

          <Grid container spacing={4}>
            {contactInfo.map((contact, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div variants={itemVariants}>
                  <Card
                    sx={{
                      height: "100%",
                      textAlign: "center",
                      borderRadius: 3,
                      border: "1px solid #e2e8f0",
                      cursor: contact.action ? "pointer" : "default",
                      "&:hover": {
                        transform: contact.action ? "translateY(-5px)" : "none",
                        boxShadow: contact.action
                          ? "0 10px 25px rgba(0,0,0,0.1)"
                          : "inherit",
                      },
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => {
                      if (contact.action) {
                        if (contact.action.startsWith("http")) {
                          window.open(contact.action, "_blank");
                        } else {
                          window.location.href = contact.action;
                        }
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ mb: 3 }}>{contact.icon}</Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        {contact.title}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                        {contact.info}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contact.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Contact Form & Info Section */}
      <Box sx={{ bgcolor: "#f8fafc", py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Contact Form */}
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Paper sx={{ p: 6, borderRadius: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
                    Kirim Pesan
                  </Typography>

                  {submitStatus && (
                    <Alert
                      severity={submitStatus.type}
                      sx={{ mb: 3 }}
                      onClose={() => setSubmitStatus(null)}
                    >
                      {submitStatus.message}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nama Lengkap"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nomor Telepon"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          select
                          label="Jenis Pertanyaan"
                          name="inquiryType"
                          value={formData.inquiryType}
                          onChange={handleInputChange}
                          variant="outlined"
                          SelectProps={{ native: true }}
                        >
                          {inquiryTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Subjek"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Pesan"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          multiline
                          rows={6}
                          variant="outlined"
                          placeholder="Tuliskan pesan Anda di sini..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={isSubmitting}
                          startIcon={isSubmitting ? null : <Send />}
                          sx={{
                            bgcolor: "#6366f1",
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            "&:hover": {
                              bgcolor: "#5855eb",
                            },
                          }}
                        >
                          {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            {/* Office Info & Hours */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                {/* Office Hours */}
                <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <AccessTime
                      sx={{ fontSize: 30, color: "#6366f1", mr: 2 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Jam Operasional
                    </Typography>
                  </Box>
                  <List dense>
                    {officeHours.map((schedule, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={schedule.day}
                          secondary={schedule.hours}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>

                {/* Social Media */}
                <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Ikuti Kami
                  </Typography>
                  <Box
                    sx={{ display: "flex", gap: 2, justifyContent: "center" }}
                  >
                    <IconButton
                      sx={{
                        bgcolor: "#3b82f6",
                        color: "white",
                        "&:hover": { bgcolor: "#2563eb" },
                      }}
                      onClick={() =>
                        window.open(
                          "https://facebook.com/tickotravel",
                          "_blank"
                        )
                      }
                    >
                      <Facebook />
                    </IconButton>
                    <IconButton
                      sx={{
                        bgcolor: "#e1306c",
                        color: "white",
                        "&:hover": { bgcolor: "#c13584" },
                      }}
                      onClick={() =>
                        window.open(
                          "https://instagram.com/tickotravel",
                          "_blank"
                        )
                      }
                    >
                      <Instagram />
                    </IconButton>
                    <IconButton
                      sx={{
                        bgcolor: "#ff0000",
                        color: "white",
                        "&:hover": { bgcolor: "#cc0000" },
                      }}
                      onClick={() =>
                        window.open("https://youtube.com/tickotravel", "_blank")
                      }
                    >
                      <YouTube />
                    </IconButton>
                    <IconButton
                      sx={{
                        bgcolor: "#25d366",
                        color: "white",
                        "&:hover": { bgcolor: "#128c7e" },
                      }}
                      onClick={() =>
                        window.open("https://wa.me/6281353079529", "_blank")
                      }
                    >
                      <WhatsApp />
                    </IconButton>
                  </Box>
                </Paper>

                {/* Quick Actions */}
                <Paper sx={{ p: 4, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Aksi Cepat
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<TravelExplore />}
                      onClick={() => navigate("/tours")}
                      fullWidth
                    >
                      Lihat Paket Tour
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Group />}
                      onClick={() => navigate("/about")}
                      fullWidth
                    >
                      Tentang Kami
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Business />}
                      fullWidth
                    >
                      Kerjasama Bisnis
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              fontWeight: 700,
              mb: 6,
              color: "#1a202c",
            }}
          >
            Pertanyaan yang Sering Diajukan
          </Typography>

          <Box sx={{ maxWidth: "800px", mx: "auto" }}>
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Accordion
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    "&:before": { display: "none" },
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            ))}
          </Box>

          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Tidak menemukan jawaban yang Anda cari?
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Support />}
              sx={{
                bgcolor: "#6366f1",
                px: 4,
                py: 1.5,
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "#5855eb",
                },
              }}
              onClick={() =>
                window.open("https://wa.me/6281353079529", "_blank")
              }
            >
              Chat dengan Customer Service
            </Button>
          </Box>
        </motion.div>
      </Container>

      {/* Map Section */}
      <Box sx={{ bgcolor: "#f8fafc", py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h3"
              sx={{
                textAlign: "center",
                fontWeight: 700,
                mb: 6,
                color: "#1a202c",
              }}
            >
              Lokasi Kantor Kami
            </Typography>

            <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Box
                sx={{
                  height: "400px",
                  background:
                    "linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  position: "relative",
                }}
              >
                {/* Placeholder for map */}
                <Box sx={{ textAlign: "center" }}>
                  <LocationOn sx={{ fontSize: 80, mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    Jl. Sudirman No. 123
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                    Jakarta Pusat 10220, Indonesia
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.3)",
                      },
                    }}
                    onClick={() =>
                      window.open(
                        "https://maps.google.com/?q=Jl.+Sudirman+No.+123+Jakarta+Pusat",
                        "_blank"
                      )
                    }
                  >
                    Buka di Google Maps
                  </Button>
                </Box>
              </Box>
            </Card>

            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                Kantor kami berlokasi strategis di pusat Jakarta, mudah
                dijangkau dengan transportasi umum. Kunjungi kami untuk
                konsultasi gratis mengenai paket wisata impian Anda.
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          py: 8,
          color: "white",
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h3"
              sx={{
                textAlign: "center",
                mb: 2,
                fontWeight: 700,
              }}
            >
              Siap Merencanakan Perjalanan?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                mb: 4,
                opacity: 0.9,
              }}
            >
              Tim travel consultant kami siap membantu Anda merencanakan
              perjalanan yang tak terlupakan sesuai budget dan preferensi Anda.
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "white",
                  color: "#6366f1",
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: "#f1f5f9",
                  },
                }}
                onClick={() => navigate("/tours")}
              >
                Lihat Paket Tour
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "white",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
                onClick={() =>
                  window.open("https://wa.me/6281353079529", "_blank")
                }
              >
                Chat WhatsApp
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}

export default Contact;
