const axios = require("axios");

const testIntegration = async () => {
  console.log("🔗 Testing Tour-Inventory Integration...\n");

  try {
    // 1. Create a new tour package
    console.log("1️⃣ Creating new tour package...");
    const createTourResponse = await axios.post(
      "http://localhost:3002/graphql",
      {
        query: `
        mutation CreateTour($input: TourPackageInput!) {
          createTourPackage(input: $input) {
            id
            name
            category
            location {
              city
            }
            price {
              amount
              currency
            }
          }
        }
      `,
        variables: {
          input: {
            name: "Jakarta City Tour",
            category: "City Tour",
            shortDescription: "Explore Jakarta's highlights",
            longDescription:
              "A comprehensive city tour covering Jakarta's main attractions.",
            location: {
              city: "Jakarta",
              province: "DKI Jakarta",
              country: "Indonesia",
              meetingPoint: "Hotel Indonesia Roundabout",
            },
            duration: {
              days: 1,
              nights: 0,
            },
            price: {
              amount: 350000,
              currency: "IDR",
            },
            inclusions: ["Transportation", "Guide", "Lunch"],
            exclusions: ["Personal expenses"],
            itinerary: [
              {
                day: 1,
                title: "Jakarta Highlights",
                description: "Visit Jakarta's main attractions",
                activities: ["National Monument", "Old Town", "Museum Tour"],
              },
            ],
            status: "active",
          },
        },
      }
    );

    const newTour = createTourResponse.data.data.createTourPackage;
    console.log(`✅ Tour created: ${newTour.name} (ID: ${newTour.id})`);

    // 2. Initialize inventory for the new tour
    console.log("\n2️⃣ Initializing inventory for the tour...");
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const initInventoryResponse = await axios.post(
      "http://localhost:3002/graphql",
      {
        query: `
        mutation InitInventory($tourId: ID!, $dates: [String!]!, $defaultSlots: Int!) {
          initializeTourInventory(tourId: $tourId, dates: $dates, defaultSlots: $defaultSlots) {
            success
            message
          }
        }
      `,
        variables: {
          tourId: newTour.id,
          dates: [today, tomorrow],
          defaultSlots: 25,
        },
      }
    );

    console.log(
      `✅ Inventory initialized: ${initInventoryResponse.data.data.initializeTourInventory.message}`
    );

    // 3. Get tour with inventory
    console.log("\n3️⃣ Getting tour with inventory data...");
    const tourWithInventoryResponse = await axios.post(
      "http://localhost:3002/graphql",
      {
        query: `
        query GetTourWithInventory($id: ID!) {
          getTourWithInventory(id: $id) {
            id
            name
            inventoryStatus {
              date
              slotsAvailable
              hotelAvailable
              transportAvailable
            }
            isAvailable
            availableDates
          }
        }
      `,
        variables: { id: newTour.id },
      }
    );

    const tourWithInventory =
      tourWithInventoryResponse.data.data.getTourWithInventory;
    console.log(`✅ Tour with inventory:`, {
      name: tourWithInventory.name,
      isAvailable: tourWithInventory.isAvailable,
      availableDates: tourWithInventory.availableDates,
      inventoryRecords: tourWithInventory.inventoryStatus.length,
    });

    // 4. Check availability
    console.log("\n4️⃣ Checking tour availability...");
    const availabilityResponse = await axios.post(
      "http://localhost:3002/graphql",
      {
        query: `
        query CheckAvailability($tourId: ID!, $date: String!, $participants: Int!) {
          checkTourAvailability(tourId: $tourId, date: $date, participants: $participants) {
            available
            message
            slotsLeft
          }
        }
      `,
        variables: {
          tourId: newTour.id,
          date: today,
          participants: 10,
        },
      }
    );

    const availability = availabilityResponse.data.data.checkTourAvailability;
    console.log(`✅ Availability check:`, availability);

    // 5. Reserve slots via inventory service
    console.log("\n5️⃣ Reserving slots...");
    const reservationResponse = await axios.post(
      "http://localhost:3005/graphql",
      {
        query: `
        mutation ReserveSlots($input: ReservationInput!) {
          reserveSlots(input: $input) {
            success
            message
            reservationId
            slotsRemaining
          }
        }
      `,
        variables: {
          input: {
            tourId: newTour.id,
            date: today,
            participants: 5,
          },
        },
      }
    );

    const reservation = reservationResponse.data.data.reserveSlots;
    console.log(`✅ Reservation result:`, reservation);

    // 6. Check updated availability
    console.log("\n6️⃣ Checking updated availability...");
    const updatedAvailabilityResponse = await axios.post(
      "http://localhost:3002/graphql",
      {
        query: `
        query CheckAvailability($tourId: ID!, $date: String!, $participants: Int!) {
          checkTourAvailability(tourId: $tourId, date: $date, participants: $participants) {
            available
            message
            slotsLeft
          }
        }
      `,
        variables: {
          tourId: newTour.id,
          date: today,
          participants: 10,
        },
      }
    );

    const updatedAvailability =
      updatedAvailabilityResponse.data.data.checkTourAvailability;
    console.log(`✅ Updated availability:`, updatedAvailability);

    // 7. Get available tours
    console.log("\n7️⃣ Getting available tours for today...");
    const availableToursResponse = await axios.post(
      "http://localhost:3002/graphql",
      {
        query: `
        query GetAvailableTours($date: String!, $participants: Int!) {
          getAvailableTours(date: $date, participants: $participants) {
            id
            name
            location {
              city
            }
            price {
              amount
              currency
            }
            isAvailable
          }
        }
      `,
        variables: {
          date: today,
          participants: 5,
        },
      }
    );

    const availableTours = availableToursResponse.data.data.getAvailableTours;
    console.log(`✅ Available tours: ${availableTours.length} tours found`);
    availableTours.forEach((tour) => {
      console.log(
        `   - ${tour.name} in ${tour.location.city} (${
          tour.price.currency
        } ${tour.price.amount.toLocaleString()})`
      );
    });

    // 8. Clean up - delete test tour
    console.log("\n8️⃣ Cleaning up test data...");
    const deleteResponse = await axios.post("http://localhost:3002/graphql", {
      query: `
        mutation DeleteTour($id: ID!) {
          deleteTourPackage(id: $id) {
            id
            name
          }
        }
      `,
      variables: { id: newTour.id },
    });

    console.log(
      `✅ Test tour deleted: ${deleteResponse.data.data.deleteTourPackage.name}`
    );

    console.log("\n🎉 Tour-Inventory Integration Test Completed Successfully!");
  } catch (error) {
    console.error(
      "❌ Integration test failed:",
      error.response?.data || error.message
    );
  }
};

testIntegration();
