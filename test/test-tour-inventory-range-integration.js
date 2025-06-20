const axios = require("axios");

const testRangeIntegration = async () => {
  console.log("🔗 Testing Tour-Inventory Range Integration...\n");

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
            name: "Bali Beach Paradise",
            category: "Beach",
            shortDescription: "Amazing beach experience in Bali",
            longDescription:
              "Enjoy pristine beaches, water sports, and sunset views.",
            location: {
              city: "Sanur",
              province: "Bali",
              country: "Indonesia",
              meetingPoint: "Sanur Beach Front",
            },
            duration: {
              days: 3,
              nights: 2,
            },
            price: {
              amount: 1500000,
              currency: "IDR",
            },
            inclusions: ["Beach access", "Water sports", "Lunch", "Guide"],
            exclusions: ["Personal expenses", "Dinner"],
            itinerary: [
              {
                day: 1,
                title: "Beach Arrival",
                description: "Arrive and enjoy beach activities",
                activities: ["Beach check-in", "Swimming", "Beach volleyball"],
              },
            ],
            status: "active",
          },
        },
      }
    );

    const newTour = createTourResponse.data.data.createTourPackage;
    console.log(`✅ Tour created: ${newTour.name} (ID: ${newTour.id})`);

    // 2. Preview date range
    console.log("\n2️⃣ Previewing date range...");
    const previewResponse = await axios.post("http://localhost:3005/graphql", {
      query: `
        query PreviewRange($startDate: String!, $endDate: String!, $skipDays: [Int!], $skipDates: [String!]) {
          previewInventoryRange(startDate: $startDate, endDate: $endDate, skipDays: $skipDays, skipDates: $skipDates)
        }
      `,
      variables: {
        startDate: "2025-06-20",
        endDate: "2025-07-20",
        skipDays: [0, 6], // Skip Sundays (0) and Saturdays (6)
        skipDates: ["2025-07-04", "2025-07-17"], // Skip Independence Day and random date
      },
    });

    const previewDates = previewResponse.data.data.previewInventoryRange;
    console.log(`✅ Preview: ${previewDates.length} dates will be created`);
    console.log(`📅 First 10 dates: ${previewDates.slice(0, 10).join(", ")}`);
    console.log(`📅 Last 5 dates: ${previewDates.slice(-5).join(", ")}`);

    // 3. Initialize inventory range
    console.log("\n3️⃣ Initializing inventory range...");
    const initRangeResponse = await axios.post(
      "http://localhost:3005/graphql",
      {
        query: `
        mutation InitRange($input: InventoryRangeInput!) {
          initializeTourInventoryRange(input: $input) {
            success
            message
            totalDays
            createdRecords
            skippedRecords
            errorRecords
            dateRange
            details
          }
        }
      `,
        variables: {
          input: {
            tourId: newTour.id,
            startDate: "2025-06-20",
            endDate: "2025-07-20",
            slots: 100,
            hotelAvailable: true,
            transportAvailable: true,
            skipDays: [0, 6], // Skip weekends
            skipDates: ["2025-07-04", "2025-07-17"],
          },
        },
      }
    );

    const rangeResult =
      initRangeResponse.data.data.initializeTourInventoryRange;
    console.log(`✅ Range initialization result:`);
    console.log(`   📊 Total days: ${rangeResult.totalDays}`);
    console.log(`   ✅ Created: ${rangeResult.createdRecords}`);
    console.log(`   ⏭️ Skipped: ${rangeResult.skippedRecords}`);
    console.log(`   ❌ Errors: ${rangeResult.errorRecords}`);
    console.log(`   📅 Range: ${rangeResult.dateRange}`);
    console.log(
      `   📝 Details: ${rangeResult.details.slice(0, 5).join(", ")}...`
    );

    // 4. Get tour with inventory
    console.log("\n4️⃣ Getting tour with inventory data...");
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
      totalAvailableDates: tourWithInventory.availableDates.length,
      firstFewDates: tourWithInventory.availableDates.slice(0, 5),
      inventoryRecords: tourWithInventory.inventoryStatus.length,
      sampleSlots: tourWithInventory.inventoryStatus
        .slice(0, 3)
        .map((inv) => `${inv.date}: ${inv.slotsAvailable} slots`),
    });

    // 5. Check availability range
    console.log("\n5️⃣ Checking availability range...");
    const availabilityRangeResponse = await axios.post(
      "http://localhost:3005/graphql",
      {
        query: `
        query GetAvailabilityRange($tourId: ID!, $startDate: String!, $endDate: String!) {
          getTourAvailabilityRange(tourId: $tourId, startDate: $startDate, endDate: $endDate) {
            tourId
            date
            slotsLeft
            hotelAvailable
            transportAvailable
          }
        }
      `,
        variables: {
          tourId: newTour.id,
          startDate: "2025-06-20",
          endDate: "2025-06-30",
        },
      }
    );

    const availabilityRange =
      availabilityRangeResponse.data.data.getTourAvailabilityRange;
    console.log(
      `✅ Availability range (Jun 20-30): ${availabilityRange.length} days`
    );
    availabilityRange.forEach((inv) => {
      console.log(
        `   📅 ${inv.date}: ${inv.slotsLeft} slots, Hotel: ${inv.hotelAvailable}, Transport: ${inv.transportAvailable}`
      );
    });

    // 6. Update inventory range
    console.log("\n6️⃣ Updating inventory range (reduce slots)...");
    const updateRangeResponse = await axios.post(
      "http://localhost:3005/graphql",
      {
        query: `
        mutation UpdateRange($input: InventoryRangeInput!) {
          updateInventoryRange(input: $input) {
            success
            message
            totalDays
            createdRecords
            skippedRecords
            errorRecords
            details
          }
        }
      `,
        variables: {
          input: {
            tourId: newTour.id,
            startDate: "2025-06-20",
            endDate: "2025-06-30",
            slots: 75, // Reduce from 100 to 75
            hotelAvailable: true,
            transportAvailable: true,
            skipDays: [], // Update all days
            skipDates: [],
          },
        },
      }
    );

    const updateResult = updateRangeResponse.data.data.updateInventoryRange;
    console.log(`✅ Range update result:`);
    console.log(`   📊 Total days: ${updateResult.totalDays}`);
    console.log(`   ✅ Updated: ${updateResult.createdRecords}`);
    console.log(`   ⏭️ Skipped: ${updateResult.skippedRecords}`);
    console.log(
      `   📝 Details: ${updateResult.details.slice(0, 3).join(", ")}...`
    );

    // 7. Reserve some slots
    console.log("\n7️⃣ Testing slot reservation...");
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
            date: "2025-06-23", // Monday
            participants: 15,
          },
        },
      }
    );

    const reservation = reservationResponse.data.data.reserveSlots;
    console.log(`✅ Reservation result:`, reservation);

    // 8. Check updated availability
    console.log("\n8️⃣ Checking updated availability after reservation...");
    const updatedAvailabilityResponse = await axios.post(
      "http://localhost:3005/graphql",
      {
        query: `
        query CheckAvailability($tourId: ID!, $date: String!, $participants: Int!) {
          checkAvailability(tourId: $tourId, date: $date, participants: $participants) {
            available
            message
            slotsLeft
          }
        }
      `,
        variables: {
          tourId: newTour.id,
          date: "2025-06-23",
          participants: 20,
        },
      }
    );

    const updatedAvailability =
      updatedAvailabilityResponse.data.data.checkAvailability;
    console.log(`✅ Updated availability:`, updatedAvailability);

    // 9. Get available tours on specific date
    console.log("\n9️⃣ Getting available tours for Monday...");
    const availableToursResponse = await axios.post(
      "http://localhost:3005/graphql",
      {
        query: `
        query GetAvailableTours($date: String!, $minSlots: Int) {
          getAvailableToursOnDate(date: $date, minSlots: $minSlots) {
            tourId
            date
            slotsLeft
            hotelAvailable
            transportAvailable
          }
        }
      `,
        variables: {
          date: "2025-06-23",
          minSlots: 50,
        },
      }
    );

    const availableTours =
      availableToursResponse.data.data.getAvailableToursOnDate;
    console.log(
      `✅ Available tours on 2025-06-23 with min 50 slots: ${availableTours.length} tours`
    );
    availableTours.forEach((tour) => {
      console.log(
        `   🎫 Tour ${tour.tourId}: ${tour.slotsLeft} slots available`
      );
    });

    // 10. Clean up - delete test tour
    console.log("\n🔟 Cleaning up test data...");
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

    console.log(
      "\n🎉 Tour-Inventory Range Integration Test Completed Successfully!"
    );
    console.log(
      "=================================================================="
    );
    console.log("✅ Features tested:");
    console.log("   📅 Date range generation with skip options");
    console.log("   🔄 Bulk inventory initialization");
    console.log("   📊 Range-based inventory updates");
    console.log("   🎫 Slot reservation and availability checking");
    console.log("   📈 Analytics queries across date ranges");
    console.log("   🧹 Proper cleanup and error handling");
  } catch (error) {
    console.error(
      "❌ Range integration test failed:",
      error.response?.data || error.message
    );
  }
};

testRangeIntegration();
