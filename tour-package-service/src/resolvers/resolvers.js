// src/resolvers/resolvers.js
// Resolvers dasar untuk Tour Package Service

const resolvers = {
  Query: {
    getTourPackages: (parent, { filter }) => {
      // Untuk demo, filter diabaikan, return data dummy
      return [
        {
          id: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
          name: 'Paket Petualangan 3 Hari 2 Malam di Bromo & Ijen',
          slug: 'paket-petualangan-bromo-ijen-3d2n',
          short_description: 'Petualangan seru ke Bromo & Ijen selama 3 hari 2 malam.',
          long_description: 'Nikmati pengalaman tak terlupakan menjelajahi Bromo dan Ijen dengan fasilitas lengkap dan itinerary menarik.',
          status: 'published',
          category: 'Adventure', // kategori destinasi
          location: {
            city: 'Malang',
            province: 'Jawa Timur',
            country: 'Indonesia',
            meeting_point: 'Stasiun Kota Baru Malang',
          },
          duration: {
            days: 3,
            nights: 2,
          },
          price: {
            amount: 1500000,
            currency: 'IDR',
            per_pax: true,
          },
          inclusions: [
            'Transportasi AC',
            'Jeep Bromo',
            'Tiket Masuk Wisata',
            'Akomodasi 1 Malam',
            'Air Mineral'
          ],
          exclusions: [
            'Makan Siang & Malam',
            'Pengeluaran Pribadi',
            'Tips untuk Guide & Driver'
          ],
          itinerary: [
            {
              day: 1,
              title: 'Penjemputan & Perjalanan Menuju Bromo',
              description: 'Anda akan dijemput di Malang, lalu perjalanan menuju hotel di area Bromo. Sore hari acara bebas.',
              activities: [
                'Jemput di meeting point',
                'Makan siang (biaya pribadi)',
                'Check-in hotel'
              ]
            },
            {
              day: 2,
              title: 'Wisata Bromo',
              description: 'Menikmati sunrise di Penanjakan, explore Kawah Bromo, dan Savana.',
              activities: [
                'Sunrise di Penanjakan',
                'Kawah Bromo',
                'Bukit Teletubbies',
                'Kembali ke hotel'
              ]
            },
            {
              day: 3,
              title: 'Ijen Blue Fire & Kembali',
              description: 'Pendakian ke Kawah Ijen untuk melihat blue fire, lalu kembali ke Malang.',
              activities: [
                'Pendakian Kawah Ijen',
                'Blue Fire',
                'Kembali ke Malang'
              ]
            }
          ],
          average_rating: 4.8,
          review_count: 120,
          availability: [
            {
              start_date: '2025-12-20',
              end_date: '2025-12-22',
              slots_available: 10
            },
            {
              start_date: '2026-01-10',
              end_date: '2026-01-12',
              slots_available: 8
            }
          ],
          tour_operator_id: 'operator-123',
        }
      ];
    },
    getTourPackage: (parent, { id }) => {
      // Data dummy sama seperti di atas
      const data = [
        {
          id: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
          name: 'Paket Petualangan 3 Hari 2 Malam di Bromo & Ijen',
          slug: 'paket-petualangan-bromo-ijen-3d2n',
          short_description: 'Petualangan seru ke Bromo & Ijen selama 3 hari 2 malam.',
          long_description: 'Nikmati pengalaman tak terlupakan menjelajahi Bromo dan Ijen dengan fasilitas lengkap dan itinerary menarik.',
          status: 'published',
          category: 'Adventure', // kategori destinasi
          location: {
            city: 'Malang',
            province: 'Jawa Timur',
            country: 'Indonesia',
            meeting_point: 'Stasiun Kota Baru Malang',
          },
          duration: {
            days: 3,
            nights: 2,
          },
          price: {
            amount: 1500000,
            currency: 'IDR',
            per_pax: true,
          },
          inclusions: [
            'Transportasi AC',
            'Jeep Bromo',
            'Tiket Masuk Wisata',
            'Akomodasi 1 Malam',
            'Air Mineral'
          ],
          exclusions: [
            'Makan Siang & Malam',
            'Pengeluaran Pribadi',
            'Tips untuk Guide & Driver'
          ],
          itinerary: [
            {
              day: 1,
              title: 'Penjemputan & Perjalanan Menuju Bromo',
              description: 'Anda akan dijemput di Malang, lalu perjalanan menuju hotel di area Bromo. Sore hari acara bebas.',
              activities: [
                'Jemput di meeting point',
                'Makan siang (biaya pribadi)',
                'Check-in hotel'
              ]
            },
            {
              day: 2,
              title: 'Wisata Bromo',
              description: 'Menikmati sunrise di Penanjakan, explore Kawah Bromo, dan Savana.',
              activities: [
                'Sunrise di Penanjakan',
                'Kawah Bromo',
                'Bukit Teletubbies',
                'Kembali ke hotel'
              ]
            },
            {
              day: 3,
              title: 'Ijen Blue Fire & Kembali',
              description: 'Pendakian ke Kawah Ijen untuk melihat blue fire, lalu kembali ke Malang.',
              activities: [
                'Pendakian Kawah Ijen',
                'Blue Fire',
                'Kembali ke Malang'
              ]
            }
          ],
          average_rating: 4.8,
          review_count: 120,
          availability: [
            {
              start_date: '2025-12-20',
              end_date: '2025-12-22',
              slots_available: 10
            },
            {
              start_date: '2026-01-10',
              end_date: '2026-01-12',
              slots_available: 8
            }
          ],
          tour_operator_id: 'operator-123',
        }
      ];
      return data.find(pkg => pkg.id === id) || null;
    },
  },
  Mutation: {
    createTourPackage: (parent, { input }) => {
      // Untuk demo, return input sebagai hasil
      return {
        id: 'dummy-id',
        ...input
      };
    },
    updateTourPackage: (parent, { id, input }) => {
      // Untuk demo, return input sebagai hasil update
      return {
        id,
        ...input
      };
    },
  },
};

module.exports = resolvers;
