import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import {
  Flight,
  LocationOn,
  People,
  Star,
  CheckCircle,
  Timeline,
  EmojiEvents,
  Security,
  Support,
  Groups,
  TravelExplore,
  AttachMoney,
  Verified,
  Phone,
  Email,
  Facebook,
  Instagram,
  YouTube,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function About() {
  const navigate = useNavigate();

  // Company statistics
  const statistics = [
    { number: "10+", label: "Tahun Pengalaman", icon: <Timeline /> },
    { number: "50,000+", label: "Pelanggan Puas", icon: <People /> },
    { number: "150+", label: "Destinasi", icon: <LocationOn /> },
    { number: "98%", label: "Tingkat Kepuasan", icon: <Star /> },
  ];

  // Team members
  const teamMembers = [
    {
      name: "Budi Santoso",
      position: "CEO & Founder",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      description:
        "Lebih dari 15 tahun pengalaman di industri pariwisata Indonesia.",
    },
    {
      name: "Sari Dewi",
      position: "Operations Director",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      description: "Ahli dalam perencanaan tour dan manajemen operasional.",
    },
    {
      name: "Ahmad Rahman",
      position: "Head of Marketing",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      description:
        "Spesialis dalam digital marketing dan customer relationship.",
    },
    {
      name: "Linda Putri",
      position: "Customer Success Manager",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      description: "Memastikan setiap pelanggan mendapat pengalaman terbaik.",
    },
  ];

  // Company milestones
  const milestones = [
    {
      year: "2014",
      title: "Ticko Travel Didirikan",
      description:
        "Memulai perjalanan dengan visi membuat wisata Indonesia lebih mudah diakses.",
    },
    {
      year: "2016",
      title: "Ekspansi Regional",
      description:
        "Memperluas jangkauan ke seluruh Indonesia dengan 50+ destinasi.",
    },
    {
      year: "2018",
      title: "Platform Digital",
      description: "Meluncurkan platform online untuk kemudahan booking.",
    },
    {
      year: "2020",
      title: "Sertifikasi Internasional",
      description:
        "Mendapat sertifikasi ISO dan bergabung dengan asosiasi travel internasional.",
    },
    {
      year: "2022",
      title: "Sustainable Tourism",
      description: "Meluncurkan program wisata berkelanjutan dan eco-friendly.",
    },
    {
      year: "2024",
      title: "50,000+ Pelanggan",
      description:
        "Mencapai milestone 50,000+ pelanggan puas dengan rating 4.8/5.",
    },
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
          py: 12,
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
                <Flight sx={{ fontSize: 40 }} />
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
              Tentang Ticko Travel
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
              Membantu Anda menjelajahi keindahan Nusantara dengan pengalaman
              wisata yang tak terlupakan sejak 2014
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Company Overview */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, mb: 3, color: "#1a202c" }}
                >
                  Misi Kami
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                  Menjadi jembatan yang menghubungkan wisatawan dengan keindahan
                  dan kekayaan budaya Indonesia
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                  Ticko Travel didirikan dengan semangat untuk memperkenalkan
                  keindahan Indonesia kepada dunia. Kami percaya bahwa setiap
                  perjalanan adalah kesempatan untuk menciptakan kenangan
                  berharga, memperluas wawasan, dan membangun koneksi dengan
                  budaya lokal.
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  Dengan pengalaman lebih dari 10 tahun, kami telah melayani
                  ribuan wisatawan dari berbagai negara dan membantu mereka
                  menemukan sisi tersembunyi Indonesia yang menakjubkan.
                </Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600"
                    alt="Indonesia Tourism"
                    style={{
                      width: "100%",
                      height: "400px",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>

      {/* Statistics Section */}
      <Box sx={{ bgcolor: "#f8fafc", py: 8 }}>
        <Container maxWidth="lg">
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
              Pencapaian Kami
            </Typography>
            <Grid container spacing={4}>
              {statistics.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <motion.div variants={itemVariants}>
                    <Paper
                      sx={{
                        p: 4,
                        textAlign: "center",
                        borderRadius: 3,
                        height: "100%",
                        border: "1px solid #e2e8f0",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Box sx={{ color: "#6366f1", mb: 2 }}>
                        {React.cloneElement(stat.icon, {
                          sx: { fontSize: 50 },
                        })}
                      </Box>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: "#6366f1", mb: 1 }}
                      >
                        {stat.number}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Vision & Values */}
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
            Visi & Nilai Kami
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    border: "1px solid #e2e8f0",
                    "&:hover": {
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <TravelExplore
                        sx={{ fontSize: 40, color: "#6366f1", mr: 2 }}
                      />
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Visi Kami
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      Menjadi travel agent pilihan utama untuk eksplorasi
                      Indonesia, dikenal karena pelayanan berkualitas tinggi,
                      inovasi berkelanjutan, dan komitmen terhadap wisata
                      bertanggung jawab yang melestarikan alam dan budaya lokal.
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    border: "1px solid #e2e8f0",
                    "&:hover": {
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <CheckCircle
                        sx={{ fontSize: 40, color: "#10b981", mr: 2 }}
                      />
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Nilai-Nilai Kami
                      </Typography>
                    </Box>
                    <List dense>
                      {[
                        "Integritas dalam setiap pelayanan",
                        "Inovasi untuk pengalaman terbaik",
                        "Keberlanjutan lingkungan dan budaya",
                        "Keunggulan dalam customer service",
                        "Kemitraan yang saling menguntungkan",
                      ].map((value, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckCircle
                              sx={{ fontSize: 16, color: "#10b981" }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={value}
                            primaryTypographyProps={{ variant: "body1" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>

      {/* Why Choose Us Section */}
      <Box sx={{ bgcolor: "#f8fafc", py: 8 }}>
        <Container maxWidth="lg">
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
              Mengapa Memilih Ticko Travel?
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  icon: <Verified sx={{ fontSize: 50, color: "#6366f1" }} />,
                  title: "Terpercaya & Berpengalaman",
                  description:
                    "Lebih dari 10 tahun pengalaman melayani wisatawan dengan tingkat kepuasan 98%",
                },
                {
                  icon: <AttachMoney sx={{ fontSize: 50, color: "#10b981" }} />,
                  title: "Harga Terbaik",
                  description:
                    "Jaminan harga kompetitif dengan kualitas pelayanan premium tanpa biaya tersembunyi",
                },
                {
                  icon: <Support sx={{ fontSize: 50, color: "#f59e0b" }} />,
                  title: "24/7 Customer Support",
                  description:
                    "Tim support profesional siap membantu Anda kapan saja selama perjalanan",
                },
                {
                  icon: <Security sx={{ fontSize: 50, color: "#ef4444" }} />,
                  title: "Asuransi Perjalanan",
                  description:
                    "Semua paket tour dilengkapi dengan asuransi perjalanan untuk keamanan Anda",
                },
                {
                  icon: <Groups sx={{ fontSize: 50, color: "#8b5cf6" }} />,
                  title: "Guide Profesional",
                  description:
                    "Guide lokal berpengalaman yang ramah, berpengetahuan luas, dan berbahasa Inggris",
                },
                {
                  icon: (
                    <TravelExplore sx={{ fontSize: 50, color: "#06b6d4" }} />
                  ),
                  title: "Destinasi Eksklusif",
                  description:
                    "Akses ke destinasi tersembunyi dan pengalaman autentik yang tidak ada di tempat lain",
                },
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div variants={itemVariants}>
                    <Paper
                      sx={{
                        p: 4,
                        textAlign: "center",
                        height: "100%",
                        borderRadius: 3,
                        border: "1px solid #e2e8f0",
                        "&:hover": {
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          transform: "translateY(-5px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ lineHeight: 1.6 }}
                      >
                        {feature.description}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Company Timeline */}
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
            Perjalanan Kami
          </Typography>
          <Box sx={{ position: "relative" }}>
            {milestones.map((milestone, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Box
                  sx={{
                    display: "flex",
                    mb: 4,
                    alignItems: "flex-start",
                    position: "relative",
                  }}
                >
                  {/* Timeline line */}
                  {index < milestones.length - 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 24,
                        top: 48,
                        width: 2,
                        height: 80,
                        bgcolor: "#e2e8f0",
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* Year bubble */}
                  <Box
                    sx={{
                      minWidth: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: "#6366f1",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      mr: 3,
                      zIndex: 2,
                      position: "relative",
                    }}
                  >
                    {milestone.year.slice(-2)}
                  </Box>

                  {/* Content */}
                  <Card
                    sx={{
                      flexGrow: 1,
                      borderRadius: 3,
                      border: "1px solid #e2e8f0",
                      "&:hover": {
                        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {milestone.year} - {milestone.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {milestone.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>

      {/* Team Section */}
      <Box sx={{ bgcolor: "#f8fafc", py: 8 }}>
        <Container maxWidth="lg">
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
              Tim Kami
            </Typography>
            <Grid container spacing={4}>
              {teamMembers.map((member, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div variants={itemVariants}>
                    <Card
                      sx={{
                        textAlign: "center",
                        borderRadius: 3,
                        border: "1px solid #e2e8f0",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Avatar
                          src={member.avatar}
                          sx={{
                            width: 100,
                            height: 100,
                            mx: "auto",
                            mb: 2,
                            border: "4px solid #6366f1",
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          {member.name}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          color="primary"
                          sx={{ fontWeight: 600, mb: 2 }}
                        >
                          {member.position}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Contact Information */}
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
            Hubungi Kami
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8} sx={{ mx: "auto" }}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                }}
              >
                <CardContent sx={{ p: 6 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }}>
                    Mari Mulai Perjalanan Anda
                  </Typography>

                  <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Phone sx={{ fontSize: 40, color: "#6366f1", mb: 1 }} />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          Telepon
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          +62-81-353-079-529
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Email sx={{ fontSize: 40, color: "#6366f1", mb: 1 }} />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          Email
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          hello@tickotravel.co.id
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <LocationOn
                          sx={{ fontSize: 40, color: "#6366f1", mb: 1 }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 1 }}
                        >
                          Alamat
                        </Typography>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ textAlign: "center" }}
                        >
                          Jl. Sudirman No. 123
                          <br />
                          Jakarta Pusat 10220
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4 }} />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 2,
                      mb: 4,
                    }}
                  >
                    <Avatar sx={{ bgcolor: "#3b82f6" }}>
                      <Facebook />
                    </Avatar>
                    <Avatar sx={{ bgcolor: "#e1306c" }}>
                      <Instagram />
                    </Avatar>
                    <Avatar sx={{ bgcolor: "#ff0000" }}>
                      <YouTube />
                    </Avatar>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/tours")}
                    sx={{
                      bgcolor: "#6366f1",
                      px: 6,
                      py: 1.5,
                      borderRadius: 3,
                      "&:hover": {
                        bgcolor: "#5855eb",
                      },
                    }}
                  >
                    Mulai Petualangan Anda
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}

export default About;
