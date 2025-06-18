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

**Tanggung Jawab:** Mengelola autentikasi, autorisasi, dan profil pengguna dengan role-based access control.

### 📡 Endpoints (Queries)

#### `getCurrentUser`

- **Fungsi:** Mendapatkan data user yang sedang login berdasarkan JWT token
- **Kegunaan:** Validasi session user, mengambil profil user saat ini
- **Auth Required:** Ya (JWT token)
- **Input:** Token JWT (dari Authorization header)
- **Output:** Data user (id, name, email, role)

```graphql
# Headers: { "Authorization": "Bearer YOUR_JWT_TOKEN" }
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
- **Kegunaan:** Melihat profil user lain (untuk admin), lookup user info
- **Auth Required:** Ya
- **Input:** User ID

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
- **Kegunaan:** Admin dashboard untuk manajemen user
- **Auth Required:** Ya (admin only)

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
- **Kegunaan:** Proses login, mendapatkan token untuk akses service lain
- **Flow:** Email/password → Validasi → Generate JWT → Return token + user data

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

- **Fungsi:** Register user baru dengan validasi role
- **Kegunaan:** Registrasi customer baru, admin menambah agent/admin
- **Role Logic:**
  - Default: customer
  - Valid roles: customer, agent, admin
  - Role selain customer hanya bisa dibuat oleh admin

```graphql
mutation {
  createUser(
    input: {
      name: "John Doe"
      email: "john@example.com"
      password: "password123"
      role: "customer" # Optional, default ke customer
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

- **Fungsi:** Update profil user dengan kontrol akses
- **Kegunaan:** Update nama/email user, admin update role user
- **Access Control:** Hanya admin yang bisa mengubah role

```graphql
mutation {
  updateUserProfile(
    id: "123"
    input: {
      name: "John Smith"
      email: "johnsmith@example.com"
      role: "agent" # Hanya admin yang bisa update role
    }
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

**Tanggung Jawab:** Mengelola paket tour, destinasi, dan integrasi dengan inventory & travel schedule service.

### 🔗 Integrasi dengan Service Lain:

- **Inventory Service (Port 3005):** Real-time availability checking dan slot management
- **Travel Schedule Service (Port 3006):** Opsi transportasi untuk tour

### 📡 Endpoints (Queries)

#### `getTourPackages`

- **Fungsi:** Mendapatkan semua paket tour dengan status availability
- **Kegunaan:** Homepage tour listing, browse tours
- **Integrasi:** Auto-fetch inventory status dari Inventory Service

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
      meetingPoint
    }
    duration {
      days
      nights
    }
    price {
      amount
      currency
    }
    maxParticipants
    status
    # Inventory integration
    inventoryStatus {
      tourId
      date
      slotsLeft
      hotelAvailable
      transportAvailable
    }
    isAvailable # Computed from inventoryStatus
  }
}
```

#### `getTourPackage(id: ID!)`

- **Fungsi:** Detail lengkap paket tour termasuk inventory status
- **Kegunaan:** Tour detail page, booking flow
- **Integrasi:** Fetch inventory dari Inventory Service

```graphql
query {
  getTourPackage(id: "67486c7a9eb3f9c8d2b4e123") {
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
    inventoryStatus {
      date
      slotsLeft
      hotelAvailable
      transportAvailable
    }
  }
}
```

#### `getTourPackagesByCategory(category: String!)`

- **Fungsi:** Filter tour berdasarkan kategori
- **Kegunaan:** Category filtering (Adventure, Cultural, Beach, etc.)

```graphql
query {
  getTourPackagesByCategory(category: "Adventure") {
    id
    name
    category
    price {
      amount
      currency
    }
    location {
      city
      country
    }
  }
}
```

#### `searchTourPackages(keyword: String!)`

- **Fungsi:** Search tour berdasarkan keyword (nama, deskripsi, lokasi, kategori)
- **Kegunaan:** Search functionality

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
    shortDescription
  }
}
```

#### `checkTourAvailability(tourId: ID!, date: Date!, participants: Int!)`

- **Fungsi:** Cek ketersediaan tour untuk tanggal dan jumlah peserta spesifik
- **Kegunaan:** Validasi sebelum booking, real-time availability check
- **Integrasi:** Direct call ke Inventory Service

```graphql
query {
  checkTourAvailability(
    tourId: "67486c7a9eb3f9c8d2b4e123"
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

#### `getAvailableTours(date: String!, participants: Int!)`

- **Fungsi:** Mendapatkan semua tour yang available untuk tanggal dan jumlah peserta
- **Kegunaan:** Search by availability, date-based filtering

```graphql
query {
  getAvailableTours(date: "2024-06-15", participants: 4) {
    id
    name
    location {
      city
      country
    }
    price {
      amount
    }
    maxParticipants
  }
}
```

#### `getTravelSchedulesForTour(tourId: ID!)`

- **Fungsi:** Mendapatkan opsi transportasi untuk tour tertentu
- **Kegunaan:** Booking flow - pilih transportasi
- **Integrasi:** Call ke Travel Schedule Service

```graphql
query {
  getTravelSchedulesForTour(tourId: "67486c7a9eb3f9c8d2b4e123") {
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

#### `getTourPackageWithTravel(id: ID!, origin: String)`

- **Fungsi:** Kombinasi tour detail + opsi travel jika origin disediakan
- **Kegunaan:** Complete booking information dalam satu query

```graphql
query {
  getTourPackageWithTravel(id: "67486c7a9eb3f9c8d2b4e123", origin: "Jakarta") {
    id
    name
    price {
      amount
    }
    # Travel options from Jakarta to tour destination
    travelOptions {
      id
      departureTime
      price
      vehicleType
      seatsAvailable
    }
    inventoryStatus {
      date
      slotsLeft
    }
  }
}
```

### 📡 Endpoints (Mutations)

#### `createTourPackage(input: TourPackageInput!)`

- **Fungsi:** Membuat paket tour baru (admin/agent only)
- **Kegunaan:** Admin menambah tour baru
- **Flow:** Create tour → Auto-set status active → Return tour data

```graphql
mutation {
  createTourPackage(
    input: {
      name: "Bali Adventure 3D2N"
      category: "Adventure"
      shortDescription: "Exciting Bali adventure tour"
      longDescription: "Complete adventure experience in Bali..."
      location: {
        city: "Denpasar"
        province: "Bali"
        country: "Indonesia"
        meetingPoint: "Ngurah Rai Airport"
      }
      duration: { days: 3, nights: 2 }
      price: { amount: 1500000, currency: "IDR" }
      maxParticipants: 20
      inclusions: ["Hotel", "Meals", "Transportation", "Guide"]
      exclusions: ["Flight tickets", "Personal expenses"]
      itinerary: [
        {
          day: 1
          title: "Arrival & City Tour"
          description: "Airport pickup and city exploration"
          activities: ["Airport pickup", "Check-in hotel", "City tour"]
        }
      ]
      defaultSlots: 20
      hotelRequired: true
      transportRequired: true
    }
  ) {
    id
    name
    status
    createdAt
  }
}
```

#### `updateTourPackage(id: ID!, input: TourPackageInput!)`

- **Fungsi:** Update data tour package
- **Kegunaan:** Admin update info tour

```graphql
mutation {
  updateTourPackage(
    id: "67486c7a9eb3f9c8d2b4e123"
    input: {
      name: "Bali Adventure 4D3N - Updated"
      price: { amount: 1800000, currency: "IDR" }
      maxParticipants: 25
    }
  ) {
    id
    name
    updatedAt
  }
}
```

#### `deleteTourPackage(id: ID!)`

- **Fungsi:** Hapus tour package dan inventory terkait
- **Kegunaan:** Admin menghapus tour
- **Integrasi:** Auto-delete inventory di Inventory Service

```graphql
mutation {
  deleteTourPackage(id: "67486c7a9eb3f9c8d2b4e123") {
    id
    name
  }
}
```

#### `updateTourStatus(id: ID!, status: String!)`

- **Fungsi:** Update status tour (active/inactive/draft)
- **Kegunaan:** Admin activate/deactivate tour

```graphql
mutation {
  updateTourStatus(id: "67486c7a9eb3f9c8d2b4e123", status: "inactive") {
    id
    status
    updatedAt
  }
}
```

#### `initializeTourInventory(tourId: ID!, dates: [String!]!, defaultSlots: Int!)`

- **Fungsi:** Initialize inventory untuk tour baru
- **Kegunaan:** Setup availability dates untuk tour
- **Integrasi:** Call ke Inventory Service

```graphql
mutation {
  initializeTourInventory(
    tourId: "67486c7a9eb3f9c8d2b4e123"
    dates: ["2024-06-15", "2024-06-22", "2024-06-29"]
    defaultSlots: 20
  )
}
```

---

## 📅 3. BOOKING SERVICE (Port: 3003)

**Tanggung Jawab:** Mengelola proses booking, kalkulasi harga otomatis, dan status reservasi dengan integrasi ke multiple services.

### 🔗 Integrasi dengan Service Lain:

- **Tour Package Service:** Validasi tour dan ambil harga base
- **Inventory Service:** Reserve slots otomatis saat booking
- **User Service:** Validasi user

### 📡 Endpoints (Queries)

#### `getAllBookings`

- **Fungsi:** Mendapatkan semua booking (admin only)
- **Kegunaan:** Admin dashboard - overview semua booking

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
    bookingDate
    createdAt
  }
}
```

#### `getUserBookings(userId: ID!)`

- **Fungsi:** Mendapatkan booking milik user tertentu
- **Kegunaan:** User dashboard - my bookings

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
    bookingDate
  }
}
```

#### `getBooking(id: ID!)`

- **Fungsi:** Detail booking berdasarkan ID
- **Kegunaan:** Booking detail page, status tracking

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
    createdAt
    updatedAt
  }
}
```

#### `getBookingsByStatus(status: BookingStatus!)`

- **Fungsi:** Filter booking berdasarkan status
- **Kegunaan:** Admin filter booking (PENDING, CONFIRMED, CANCELLED, COMPLETED)

```graphql
query {
  getBookingsByStatus(status: PENDING) {
    id
    userId
    tourId
    totalCost
    departureDate
    paymentStatus
  }
}
```

#### `getBookingsByDateRange(startDate: Date!, endDate: Date!)`

- **Fungsi:** Filter booking berdasarkan range tanggal keberangkatan
- **Kegunaan:** Report bulanan, analisis booking

```graphql
query {
  getBookingsByDateRange(startDate: "2024-06-01", endDate: "2024-06-30") {
    id
    tourId
    departureDate
    participants
    totalCost
    status
  }
}
```

#### `calculateBookingCost(tourId: ID!, participants: Int!, departureDate: Date!)`

- **Fungsi:** Kalkulasi otomatis total biaya dengan breakdown detail
- **Kegunaan:** Preview harga sebelum booking, validasi harga
- **Logic:** Base price × participants + tax (10%) - group discount (5% for ≥5 people)

```graphql
query {
  calculateBookingCost(
    tourId: "tour123"
    participants: 4
    departureDate: "2024-06-15"
  ) {
    basePrice # 1,000,000 IDR
    participants # 4
    subtotal # 4,000,000 IDR
    tax # 400,000 IDR (10%)
    discount # 0 IDR (no group discount)
    totalCost # 4,400,000 IDR
    breakdown {
      item # "Base Price per Person", "Tax (10%)"
      amount # 1000000, 400000
      quantity # 4, 1
    }
  }
}
```

### 📡 Endpoints (Mutations)

#### `createBooking(input: BookingInput!)`

- **Fungsi:** Membuat booking baru dengan auto-calculation dan validation
- **Kegunaan:** User membuat booking baru
- **Flow:**
  1. Calculate total cost dari Tour Package Service
  2. Validate tour availability
  3. Create booking dengan status PENDING
  4. Auto set payment status PENDING

```graphql
mutation {
  createBooking(
    input: {
      userId: "user123"
      tourId: "tour123"
      departureDate: "2024-06-15"
      participants: 4
      notes: "Vegetarian meals required"
    }
  ) {
    id
    status # PENDING
    totalCost # Auto-calculated
    paymentStatus # PENDING
    bookingDate # Current timestamp
  }
}
```

#### `updateBooking(id: ID!, input: BookingUpdateInput!)`

- **Fungsi:** Update status booking dan payment status
- **Kegunaan:** Admin update booking, update payment hasil

```graphql
mutation {
  updateBooking(
    id: "booking123"
    input: {
      status: CONFIRMED
      paymentStatus: PAID
      notes: "Payment confirmed via bank transfer"
    }
  ) {
    id
    status
    paymentStatus
    updatedAt
  }
}
```

#### `confirmBooking(id: ID!)`

- **Fungsi:** Konfirmasi booking (PENDING → CONFIRMED)
- **Kegunaan:** Admin/agent konfirmasi booking setelah payment

```graphql
mutation {
  confirmBooking(id: "booking123") {
    id
    status # CONFIRMED
    updatedAt
  }
}
```

#### `cancelBooking(id: ID!, reason: String)`

- **Fungsi:** Cancel booking dengan alasan
- **Kegunaan:** User/admin cancel booking

```graphql
mutation {
  cancelBooking(id: "booking123", reason: "Change of plans due to emergency") {
    id
    status # CANCELLED
    notes # Updated with cancellation reason
  }
}
```

---

## 💳 4. PAYMENT SERVICE (Port: 3004)

**Tanggung Jawab:** Mengelola proses pembayaran, generate invoice, dan tracking payment status.

### 📡 Endpoints (Queries)

#### `getPaymentStatus(paymentId: ID!)`

- **Fungsi:** Cek status pembayaran real-time
- **Kegunaan:** User track payment status, admin monitor payment

```graphql
query {
  getPaymentStatus(paymentId: "pay123") {
    id
    amount
    method
    status # pending, processing, completed, failed, refunded
    invoiceNumber # INV-2024-001
    createdAt
    updatedAt
  }
}
```

#### `listPayments`

- **Fungsi:** List semua pembayaran (admin only)
- **Kegunaan:** Admin dashboard financial overview

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

- **Fungsi:** Proses pembayaran baru dengan auto-generate invoice
- **Kegunaan:** User bayar booking
- **Flow:** Create payment → Generate invoice number → Set status processing

```graphql
mutation {
  processPayment(
    input: {
      method: "credit_card" # credit_card, bank_transfer, ewallet
      amount: 4400000 # Amount in IDR
    }
  ) {
    id
    method
    amount
    status # processing
    invoiceNumber # Auto-generated: INV-2024-001
    createdAt
  }
}
```

#### `updatePaymentStatus(paymentId: ID!, status: String!)`

- **Fungsi:** Update status pembayaran (biasanya dari payment gateway callback)
- **Kegunaan:** Payment gateway webhook, manual admin update

```graphql
mutation {
  updatePaymentStatus(paymentId: "pay123", status: "completed") {
    id
    status
    message # "Payment status updated successfully"
    payment {
      id
      status
      updatedAt
    }
  }
}
```

#### `generateInvoice(paymentId: ID!)`

- **Fungsi:** Generate invoice document untuk payment
- **Kegunaan:** User download invoice, accounting

```graphql
mutation {
  generateInvoice(paymentId: "pay123")
  # Returns formatted invoice string/URL
}
```

---

## 📦 5. INVENTORY SERVICE (Port: 3005)

**Tanggung Jawab:** Real-time slot management, availability tracking, dan reservation system.

### 🔗 Integrasi dengan Service Lain:

- **Tour Package Service:** Menerima tour data dan availability setup
- **Booking Service:** Auto-reserve slots saat booking dibuat

### 📡 Endpoints (Queries)

#### `checkAvailability(tourId: ID!, date: Date!, participants: Int!)`

- **Fungsi:** Real-time availability check dengan validation
- **Kegunaan:** Pre-booking validation, real-time slot checking

```graphql
query {
  checkAvailability(tourId: "tour123", date: "2024-06-15", participants: 4) {
    available # true/false
    message # "Available" atau "Not enough slots"
  }
}
```

#### `getInventoryStatus(tourId: ID!)`

- **Fungsi:** Status inventory lengkap untuk semua tanggal tour
- **Kegunaan:** Admin monitoring, tour calendar display

```graphql
query {
  getInventoryStatus(tourId: "tour123") {
    tourId
    date
    slotsLeft # Remaining available slots
    hotelAvailable # Hotel booking available
    transportAvailable # Transport available
  }
}
```

#### `getAllInventory`

- **Fungsi:** Overview semua inventory records (admin only)
- **Kegunaan:** System monitoring, inventory management dashboard

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

#### `updateInventory(input: InventoryUpdateInput!)`

- **Fungsi:** Update atau create inventory record untuk tanggal tertentu
- **Kegunaan:** Admin setup availability, update slots

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
    tourId
    date
    slots
    hotelAvailable
    transportAvailable
  }
}
```

#### `reserveSlots(input: ReservationInput!)`

- **Fungsi:** Reserve slots untuk booking (mengurangi available slots)
- **Kegunaan:** Auto-called saat booking dibuat
- **Flow:** Check availability → Reserve slots → Return reservation ID

```graphql
mutation {
  reserveSlots(
    input: { tourId: "tour123", date: "2024-06-15", participants: 4 }
  ) {
    success # true/false
    message # "Slots reserved successfully"
    reservationId # reservation_123 (untuk tracking)
  }
}
```

#### `initializeTourInventory(tourId: ID!, dates: [String!]!, defaultSlots: Int!)`

- **Fungsi:** Initialize inventory untuk tour baru
- **Kegunaan:** Called dari Tour Package Service saat tour dibuat

```graphql
mutation {
  initializeTourInventory(
    tourId: "tour123"
    dates: ["2024-06-15", "2024-06-22", "2024-06-29"]
    defaultSlots: 20
  ) {
    success
    message
  }
}
```

#### `deleteTour(tourId: ID!)`

- **Fungsi:** Hapus semua inventory records untuk tour
- **Kegunaan:** Cleanup saat tour dihapus dari Tour Package Service

```graphql
mutation {
  deleteTour(tourId: "tour123") {
    success
    message
  }
}
```

---

## 🔄 Complete Integration Flow

### 1. **User Registration & Authentication Flow**

```
1. User → Frontend (Register Form)
2. Frontend → User Service (createUser mutation)
3. User Service → Hash password → Save to PostgreSQL
4. Return user data

Login:
1. User → Frontend (Login Form)
2. Frontend → User Service (authenticateUser mutation)
3. User Service → Validate credentials → Generate JWT
4. Frontend → Store JWT token → Redirect to dashboard
```

### 2. **Browse Tours Flow**

```
1. Frontend → Tour Package Service (getTourPackages query)
2. Tour Service → Inventory Service (getInventoryStatus for each tour)
3. Tour Service → Combine tour data + inventory status
4. Frontend → Display tours with real-time availability
```

### 3. **Complete Booking Flow**

```
1. User selects tour → Frontend → Tour Service (getTourPackage)
2. User inputs dates/participants → Frontend → Booking Service (calculateBookingCost)
3. User confirms → Frontend → Booking Service (createBooking)
   ↓
4. Booking Service → Tour Service (validate tour + get base price)
5. Booking Service → Calculate total (base × participants + tax - discount)
6. Booking Service → Inventory Service (reserveSlots)
7. Booking Service → Save booking with PENDING status
   ↓
8. Frontend → Payment Service (processPayment)
9. Payment Service → Generate invoice → Return payment data
10. Frontend → Booking Service (updateBooking with payment status)
```

### 4. **Admin Tour Management Flow**

```
1. Admin → Frontend (Create Tour Form)
2. Frontend → Tour Service (createTourPackage mutation)
3. Tour Service → Save tour to MongoDB
4. Frontend → Inventory Service (initializeTourInventory)
5. Inventory Service → Create availability records
6. Admin can update inventory via Frontend → Inventory Service (updateInventory)
```

### 5. **Real-time Availability Check Flow**

```
User browsing tours:
1. Frontend → Tour Service (checkTourAvailability)
2. Tour Service → Inventory Service (checkAvailability)
3. Inventory Service → Real-time slot calculation
4. Response → Available/Not Available + slots left
```

## 🎯 Key Integration Points

### **Service-to-Service Communication:**

- **Tour ↔ Inventory:** Tour creation triggers inventory initialization
- **Booking ↔ Tour:** Price calculation and tour validation
- **Booking ↔ Inventory:** Automatic slot reservation
- **Frontend ↔ All Services:** Unified GraphQL queries

### **Data Flow Patterns:**

1. **Command Flow:** Frontend → Service → Database
2. **Query Flow:** Frontend → Service → Other Services → Combined Response
3. **Event Flow:** Service Action → Trigger Other Service Actions

### **Error Handling:**

- Each service has fallback mechanisms
- Graceful degradation when dependent services unavailable
- Consistent error response format across all services

---

## 🚀 Getting Started

### Prerequisites:

- Node.js 16+
- PostgreSQL 13+
- MongoDB 5+

### Environment Setup:

```bash
# Start databases
docker-compose up -d postgres mongodb

# Install dependencies for all services
npm run install-all

# Start all services
npm run start-all
```

### Service URLs:

- User Management: http://localhost:3001/graphql
- Tour Package: http://localhost:3002/graphql
- Booking: http://localhost:3003/graphql
- Payment: http://localhost:3004/graphql
- Inventory: http://localhost:3005/graphql
- Frontend: http://localhost:3000

### Testing Integration:

1. Register user via User Service
2. Create tour via Tour Package Service (admin)
3. Initialize inventory via Inventory Service
4. Create booking via Booking Service
5. Process payment via Payment Service

This microservices architecture ensures scalability, maintainability, and clear separation of concerns while providing seamless integration for the travel booking experience.
