# Tugas Besar Integrasi Arsitektur Enterprise

## Sistem Travel Agent - Microservices dengan GraphQL

Sistem ini terdiri dari 5 microservices yang saling terintegrasi menggunakan GraphQL untuk mengelola travel agent business. Setiap service memiliki tanggung jawab spesifik dan berkomunikasi dengan service lain untuk memberikan pengalaman yang seamless.

## 📋 Daftar Service dan Port

| Service         | Port | Database   | Teknologi             |
| --------------- | ---- | ---------- | --------------------- |
| User Management | 3001 | PostgreSQL | GraphQL + Sequelize   |
| Tour Package    | 3002 | MongoDB    | GraphQL + Mongoose    |
| Booking         | 3003 | PostgreSQL | GraphQL + PostgreSQL  |
| Payment         | 3004 | MongoDB    | GraphQL + Mongoose    |
| Inventory       | 3005 | MongoDB    | GraphQL + Mongoose    |
| Frontend        | 3000 | -          | React + Apollo Client |

---

## 🔐 1. USER MANAGEMENT SERVICE (Port: 3001)

**Tanggung Jawab:** Mengelola autentikasi, autorisasi, dan profil pengguna.

### 📡 Endpoints (Queries)

#### `getCurrentUser`

- **Fungsi:** Mendapatkan data user yang sedang login
- **Input:** Token JWT (dari header)
- **Output:** Data user (id, name, email, role)
- **Contoh:**

```graphql
query {
  getCurrentUser {
    id
    name
    email
    role
  }
}
```

#### `getUser(id: ID!)`

- **Fungsi:** Mendapatkan data user berdasarkan ID
- **Input:** User ID
- **Output:** Data user lengkap
- **Contoh:**

```graphql
query {
  getUser(id: "123") {
    id
    name
    email
    role
  }
}
```

#### `users`

- **Fungsi:** Mendapatkan semua user (khusus admin)
- **Output:** Array semua user
- **Contoh:**

```graphql
query {
  users {
    id
    name
    email
    role
  }
}
```

### 📡 Endpoints (Mutations)

#### `authenticateUser(email: String!, password: String!)`

- **Fungsi:** Login user dan generate JWT token
- **Input:** Email dan password
- **Output:** Token JWT dan data user
- **Contoh:**

```graphql
mutation {
  authenticateUser(email: "john@example.com", password: "password123") {
    token
    user {
      id
      name
      email
      role
    }
  }
}
```

#### `createUser(input: UserInput!)`

- **Fungsi:** Register user baru
- **Input:** Data user (name, email, password, role)
- **Output:** Data user yang baru dibuat
- **Contoh:**

```graphql
mutation {
  createUser(
    input: {
      name: "John Doe"
      email: "john@example.com"
      password: "password123"
      role: "customer"
    }
  ) {
    id
    name
    email
    role
  }
}
```

#### `updateUserProfile(id: ID!, input: UserUpdateInput!)`

- **Fungsi:** Update profil user
- **Input:** User ID dan data yang akan diupdate
- **Output:** Data user yang sudah diupdate
- **Contoh:**

```graphql
mutation {
  updateUserProfile(
    id: "123"
    input: { name: "John Smith", email: "johnsmith@example.com" }
  ) {
    id
    name
    email
    role
  }
}
```

---

## 🏝️ 2. TOUR PACKAGE SERVICE (Port: 3002)

**Tanggung Jawab:** Mengelola paket tour, destinasi, dan informasi travel.

### 🔗 Integrasi dengan Service Lain:

- **Inventory Service:** Mengecek ketersediaan slot tour
- **Travel Schedule Service:** Mendapatkan opsi transportasi

### 📡 Endpoints (Queries)

#### `getTourPackages`

- **Fungsi:** Mendapatkan semua paket tour
- **Output:** Array paket tour dengan info availability
- **Integrasi:** Memanggil Inventory Service untuk cek ketersediaan
- **Contoh:**

```graphql
query {
  getTourPackages {
    id
    name
    category
    shortDescription
    location {
      city
      province
      country
    }
    duration {
      days
      nights
    }
    price {
      amount
      currency
    }
    inventoryStatus {
      date
      slotsLeft
      hotelAvailable
      transportAvailable
    }
    isAvailable
  }
}
```

#### `getTourPackage(id: ID!)`

- **Fungsi:** Mendapatkan detail paket tour
- **Input:** Tour ID
- **Output:** Detail lengkap tour termasuk itinerary
- **Contoh:**

```graphql
query {
  getTourPackage(id: "tour123") {
    id
    name
    longDescription
    location {
      city
      meetingPoint
    }
    itinerary {
      day
      title
      description
      activities
    }
    inclusions
    exclusions
    maxParticipants
  }
}
```

#### `searchTourPackages(keyword: String!)`

- **Fungsi:** Pencarian tour berdasarkan keyword
- **Input:** Kata kunci pencarian
- **Output:** Array tour yang match
- **Contoh:**

```graphql
query {
  searchTourPackages(keyword: "Bali") {
    id
    name
    location {
      city
      country
    }
    price {
      amount
      currency
    }
  }
}
```

#### `checkTourAvailability(tourId: ID!, date: String!, participants: Int!)`

- **Fungsi:** Cek ketersediaan tour untuk tanggal dan jumlah peserta tertentu
- **Input:** Tour ID, tanggal, jumlah peserta
- **Output:** Status availability dan detail
- **Integrasi:** Memanggil Inventory Service
- **Contoh:**

```graphql
query {
  checkTourAvailability(
    tourId: "tour123"
    date: "2024-06-15"
    participants: 4
  ) {
    available
    message
    slotsLeft
    hotelAvailable
    transportAvailable
  }
}
```

#### `getTravelSchedulesForTour(tourId: ID!)`

- **Fungsi:** Mendapatkan jadwal transport untuk tour
- **Input:** Tour ID
- **Output:** Array jadwal transportasi
- **Integrasi:** Memanggil Travel Schedule Service
- **Contoh:**

```graphql
query {
  getTravelSchedulesForTour(tourId: "tour123") {
    id
    origin
    destination
    departureTime
    arrivalTime
    price
    seatsAvailable
    vehicleType
  }
}
```

### 📡 Endpoints (Mutations)

#### `createTourPackage(input: TourPackageInput!)`

- **Fungsi:** Membuat paket tour baru (admin only)
- **Input:** Data tour lengkap
- **Output:** Tour yang baru dibuat
- **Integrasi:** Otomatis initialize inventory jika ada availableDates
- **Contoh:**

```graphql
mutation {
  createTourPackage(
    input: {
      name: "Bali Adventure 3D2N"
      category: "Adventure"
      shortDescription: "Exciting Bali adventure tour"
      location: {
        city: "Denpasar"
        province: "Bali"
        country: "Indonesia"
        meetingPoint: "Ngurah Rai Airport"
      }
      duration: { days: 3, nights: 2 }
      price: { amount: 1500000, currency: "IDR" }
      maxParticipants: 20
      availableDates: [{ date: "2024-06-15", slots: 20 }]
    }
  ) {
    id
    name
    status
  }
}
```

#### `updateTourPackage(id: ID!, input: TourPackageInput!)`

- **Fungsi:** Update paket tour
- **Input:** Tour ID dan data update
- **Output:** Tour yang sudah diupdate

#### `initializeTourInventory(tourId: ID!, dates: [AvailableDateInput!]!)`

- **Fungsi:** Inisialisasi inventory untuk tour
- **Input:** Tour ID dan array tanggal available
- **Output:** Status berhasil/gagal
- **Integrasi:** Memanggil Inventory Service

---

## 📅 3. BOOKING SERVICE (Port: 3003)

**Tanggung Jawab:** Mengelola proses booking, kalkulasi harga, dan status reservasi.

### 🔗 Integrasi dengan Service Lain:

- **Tour Package Service:** Mengambil data tour dan harga
- **Inventory Service:** Reserve slot saat booking
- **Payment Service:** Proses pembayaran

### 📡 Endpoints (Queries)

#### `getAllBookings`

- **Fungsi:** Mendapatkan semua booking (admin only)
- **Output:** Array semua booking
- **Contoh:**

```graphql
query {
  getAllBookings {
    id
    userId
    tourId
    status
    departureDate
    participants
    totalCost
    paymentStatus
    createdAt
  }
}
```

#### `getUserBookings(userId: ID!)`

- **Fungsi:** Mendapatkan booking milik user tertentu
- **Input:** User ID
- **Output:** Array booking user
- **Contoh:**

```graphql
query {
  getUserBookings(userId: "user123") {
    id
    tourId
    status
    departureDate
    participants
    totalCost
    paymentStatus
    notes
  }
}
```

#### `getBooking(id: ID!)`

- **Fungsi:** Mendapatkan detail booking berdasarkan ID
- **Input:** Booking ID
- **Output:** Detail booking lengkap
- **Contoh:**

```graphql
query {
  getBooking(id: "booking123") {
    id
    userId
    tourId
    status
    departureDate
    participants
    totalCost
    bookingDate
    notes
    paymentStatus
  }
}
```

#### `calculateBookingCost(tourId: ID!, participants: Int!, departureDate: Date!)`

- **Fungsi:** Kalkulasi total biaya booking
- **Input:** Tour ID, jumlah peserta, tanggal keberangkatan
- **Output:** Breakdown biaya detail
- **Integrasi:** Mengambil harga dari Tour Package Service
- **Contoh:**

```graphql
query {
  calculateBookingCost(
    tourId: "tour123"
    participants: 4
    departureDate: "2024-06-15"
  ) {
    basePrice
    participants
    subtotal
    tax
    discount
    totalCost
    breakdown {
      item
      amount
      quantity
    }
  }
}
```

### 📡 Endpoints (Mutations)

#### `createBooking(input: BookingInput!)`

- **Fungsi:** Membuat booking baru
- **Input:** Data booking (userId, tourId, departureDate, participants, notes)
- **Output:** Booking yang baru dibuat
- **Proses:**
  1. Kalkulasi total cost dari Tour Package Service
  2. Reserve slot di Inventory Service
  3. Simpan booking dengan status PENDING
- **Contoh:**

```graphql
mutation {
  createBooking(
    input: {
      userId: "user123"
      tourId: "tour123"
      departureDate: "2024-06-15"
      participants: 4
      notes: "Special dietary requirements"
    }
  ) {
    id
    status
    totalCost
  }
}
```

#### `updateBooking(id: ID!, input: BookingUpdateInput!)`

- **Fungsi:** Update status booking
- **Input:** Booking ID dan data update
- **Output:** Booking yang sudah diupdate

#### `confirmBooking(id: ID!)`

- **Fungsi:** Konfirmasi booking (ubah status ke CONFIRMED)
- **Input:** Booking ID
- **Output:** Booking yang dikonfirmasi

#### `cancelBooking(id: ID!, reason: String)`

- **Fungsi:** Cancel booking dengan alasan
- **Input:** Booking ID dan alasan (optional)
- **Output:** Booking yang dibatalkan

---

## 💳 4. PAYMENT SERVICE (Port: 3004)

**Tanggung Jawab:** Mengelola proses pembayaran, invoice, dan status payment.

### 📡 Endpoints (Queries)

#### `getPaymentStatus(paymentId: ID!)`

- **Fungsi:** Cek status pembayaran
- **Input:** Payment ID
- **Output:** Status payment dan detail
- **Contoh:**

```graphql
query {
  getPaymentStatus(paymentId: "pay123") {
    id
    amount
    method
    status
    invoiceNumber
    createdAt
  }
}
```

#### `listPayments`

- **Fungsi:** List semua pembayaran (admin only)
- **Output:** Array semua payment
- **Contoh:**

```graphql
query {
  listPayments {
    id
    amount
    method
    status
    invoiceNumber
    createdAt
  }
}
```

### 📡 Endpoints (Mutations)

#### `processPayment(input: PaymentInput!)`

- **Fungsi:** Proses pembayaran baru
- **Input:** Method payment dan amount
- **Output:** Payment record dengan invoice number
- **Contoh:**

```graphql
mutation {
  processPayment(input: { method: "credit_card", amount: 6000000 }) {
    id
    method
    amount
    status
    invoiceNumber
    createdAt
  }
}
```

#### `updatePaymentStatus(paymentId: ID!, status: String!)`

- **Fungsi:** Update status pembayaran
- **Input:** Payment ID dan status baru
- **Output:** Response dengan detail update
- **Contoh:**

```graphql
mutation {
  updatePaymentStatus(paymentId: "pay123", status: "completed") {
    id
    status
    message
    payment {
      id
      status
      updatedAt
    }
  }
}
```

#### `generateInvoice(paymentId: ID!)`

- **Fungsi:** Generate invoice untuk pembayaran
- **Input:** Payment ID
- **Output:** Invoice dalam format string
- **Contoh:**

```graphql
mutation {
  generateInvoice(paymentId: "pay123")
}
```

---

## 📦 5. INVENTORY SERVICE (Port: 3005)

**Tanggung Jawab:** Mengelola ketersediaan slot tour, hotel, dan transportasi.

### 🔗 Integrasi dengan Service Lain:

- **Tour Package Service:** Menerima data availability dari tour
- **Booking Service:** Reserve slot saat ada booking

### 📡 Endpoints (Queries)

#### `checkAvailability(tourId: ID!, date: String!, participants: Int!)`

- **Fungsi:** Cek ketersediaan slot untuk booking
- **Input:** Tour ID, tanggal, jumlah peserta
- **Output:** Status available dan pesan
- **Contoh:**

```graphql
query {
  checkAvailability(tourId: "tour123", date: "2024-06-15", participants: 4) {
    available
    message
  }
}
```

#### `getInventoryStatus(tourId: ID!)`

- **Fungsi:** Status inventory untuk semua tanggal tour
- **Input:** Tour ID
- **Output:** Array status per tanggal
- **Contoh:**

```graphql
query {
  getInventoryStatus(tourId: "tour123") {
    tourId
    date
    slotsLeft
    hotelAvailable
    transportAvailable
  }
}
```

#### `getAllInventory`

- **Fungsi:** List semua inventory (admin only)
- **Output:** Array semua inventory record
- **Contoh:**

```graphql
query {
  getAllInventory {
    id
    tourId
    date
    slots
    hotelAvailable
    transportAvailable
    createdAt
  }
}
```

### 📡 Endpoints (Mutations)

#### `updateInventory(input: InventoryInput!)`

- **Fungsi:** Update atau create inventory record
- **Input:** Data inventory (tourId, date, slots, hotelAvailable, transportAvailable)
- **Output:** Inventory record yang diupdate
- **Contoh:**

```graphql
mutation {
  updateInventory(
    input: {
      tourId: "tour123"
      date: "2024-06-15"
      slots: 20
      hotelAvailable: true
      transportAvailable: true
    }
  ) {
    id
    tourId
    date
    slots
    hotelAvailable
    transportAvailable
  }
}
```

#### `reserveSlots(input: ReservationInput!)`

- **Fungsi:** Reserve slot untuk booking (mengurangi available slots)
- **Input:** Tour ID, tanggal, jumlah peserta
- **Output:** Status reservasi dan reservation ID
- **Contoh:**

```graphql
mutation {
  reserveSlots(
    input: { tourId: "tour123", date: "2024-06-15", participants: 4 }
  ) {
    success
    message
    reservationId
  }
}
```

#### `deleteTour(tourId: ID!)`

- **Fungsi:** Hapus semua inventory record untuk tour tertentu
- **Input:** Tour ID
- **Output:** Status penghapusan

---

## 🔄 Flow Integrasi Antar Service

### 1. **User Registration & Login Flow**

```
Frontend → User Service (createUser/authenticateUser) → JWT Token → Stored in Frontend
```

### 2. **Browse Tours Flow**

```
Frontend → Tour Package Service (getTourPackages)
         → Inventory Service (getInventoryStatus)
         → Combined Response with Availability
```

### 3. **Booking Flow**

```
1. Frontend → Tour Service (getTourPackage) - Get tour details
2. Frontend → Booking Service (calculateBookingCost) - Calculate price
3. Frontend → Booking Service (createBooking)
   ↓
4. Booking Service → Tour Service (getTourPackage) - Verify tour & get price
5. Booking Service → Inventory Service (reserveSlots) - Reserve slots
6. Frontend → Payment Service (processPayment) - Process payment
7. Frontend → Booking Service (updateBooking) - Update payment status
```

### 4. **Admin Tour Management Flow**

```
1. Frontend → Tour Service (createTourPackage) - Create tour
2. Tour Service → Inventory Service (updateInventory) - Initialize inventory
3. Frontend → Inventory Service (updateInventory) - Manage availability
```

---

## 🚀 Cara Menjalankan Sistem

1. **Start semua database:**

   - PostgreSQL untuk User & Booking Service
   - MongoDB untuk Tour, Payment & Inventory Service

2. **Start setiap service:**

```bash
# User Service
cd user-management-service && npm start

# Tour Package Service
cd tour-package-service && npm start

# Booking Service
cd booking-service && npm start

# Payment Service
cd payment-service && npm start

# Inventory Service
cd inventory-service && npm start

# Frontend
cd frontend/travel-agent-frontend && npm start
```

3. **Access endpoints:**
   - Frontend: http://localhost:3000
   - GraphQL Playgrounds: http://localhost:300X/graphql (X = 1-5)

---

## 📝 Catatan Penting

- **Authentication:** User Service menyediakan JWT token yang digunakan oleh service lain
- **Error Handling:** Setiap service memiliki fallback jika service lain tidak available
- **Data Consistency:** Booking service bertanggung jawab memastikan data konsisten antar service
- **Real-time Updates:** Inventory service melakukan real-time slot management
- **Admin Features:** Beberapa endpoint restricted untuk admin role saja

System ini dirancang dengan prinsip microservices yang loosely coupled namun highly cohesive untuk memberikan pengalaman travel booking yang seamless.
