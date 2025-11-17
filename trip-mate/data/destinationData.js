// This file contains mock data for different destinations
// In a real app, this would come from an API

const destinationsDatabase = {
  // Paris data
  paris: {
    name: 'Paris',
    country: 'France',
    coordinates: { latitude: 48.8566, longitude: 2.3522 },
  },
  // Tokyo data
  tokyo: {
    name: 'Tokyo',
    country: 'Japan',
    coordinates: { latitude: 35.6762, longitude: 139.6503 },
  },
  // Bali data
  bali: {
    name: 'Bali',
    country: 'Indonesia',
    coordinates: { latitude: -8.3405, longitude: 115.0920 },
  },
  // Default for any other destination
  default: {
    name: 'Your Destination',
    country: 'World',
    coordinates: { latitude: 0, longitude: 0 },
  }
};

export const getTravelDocumentation = (destination) => {
  const dest = destination.toLowerCase();

  const documentationData = {
    paris: {
      passportRequired: true,
      visaRequired: false,
      visaDetails: 'No visa required for stays up to 90 days for most countries.',
      processingTime: 'N/A',
      embassyLink: 'https://france-visas.gouv.fr/en_US/web/france-visas'
    },
    tokyo: {
      passportRequired: true,
      visaRequired: true,
      visaDetails: 'Tourist visa required for most nationalities. Apply at Japanese embassy or consulate in your country.',
      processingTime: '5-7 business days',
      embassyLink: 'https://www.mofa.go.jp/j_info/visit/visa/index.html'
    },
    bali: {
      passportRequired: true,
      visaRequired: false,
      visaDetails: 'Visa on arrival available for most countries for stays up to 30 days.',
      processingTime: 'Immediate at airport',
      embassyLink: 'https://bali.kdmid.ru/en/'
    }
  };

  return documentationData[dest] || {
    passportRequired: true,
    visaRequired: true,
    visaDetails: 'Please check with the local embassy for specific visa requirements for your nationality.',
    processingTime: 'Varies by country',
    embassyLink: 'https://www.embassy.gov'
  };
};

export const getFinancialInfo = (destination) => {
  const dest = destination.toLowerCase();

  const financialData = {
    paris: {
      currency: 'Euro (EUR)',
      currencySymbol: '€',
      dailyBudget: 150,
      exchangePlaces: [
        'CDG Airport (higher rates)',
        'Local banks (best rates)',
        'ATMs throughout the city',
        'Currency exchange offices in tourist areas'
      ],
      conversionTips: [
        'Avoid airport exchanges if possible',
        'Use ATMs for best rates',
        'Credit cards widely accepted',
        'Always choose to be charged in local currency'
      ]
    },
    tokyo: {
      currency: 'Japanese Yen (JPY)',
      currencySymbol: '¥',
      dailyBudget: 12000,
      exchangePlaces: [
        'Narita/Haneda Airport',
        '7-Eleven ATMs (best option)',
        'Post office currency exchange',
        'Major banks in city center'
      ],
      conversionTips: [
        'Cash is still king in Japan',
        '7-Eleven ATMs accept foreign cards',
        'IC cards (Suica/Pasmo) useful for transport',
        'Many places still cash-only'
      ]
    },
    bali: {
      currency: 'Indonesian Rupiah (IDR)',
      currencySymbol: 'Rp',
      dailyBudget: 800000,
      exchangePlaces: [
        'Ngurah Rai International Airport',
        'Authorized money changers in Kuta/Seminyak',
        'Bank ATMs',
        'Hotels (higher rates)'
      ],
      conversionTips: [
        'Always count your money before leaving',
        'Use authorized money changers only',
        'ATMs widely available',
        'Small bills useful for local markets'
      ]
    }
  };

  return financialData[dest] || {
    currency: 'Local Currency',
    currencySymbol: '$',
    dailyBudget: 100,
    exchangePlaces: [
      'International Airport',
      'Local banks',
      'ATMs',
      'Currency exchange offices'
    ],
    conversionTips: [
      'Research exchange rates before traveling',
      'Use official currency exchange services',
      'Keep receipts for currency exchange',
      'Notify your bank of travel plans'
    ]
  };
};

export const getAccommodations = (destination) => {
  const dest = destination.toLowerCase();

  const accommodationData = {
    paris: [
      {
        name: 'Hotel Le Marais',
        stars: 4,
        priceRange: '€120-€200',
        distance: '1.2 km from city center',
        userRating: 8.7,
        amenities: ['Free WiFi', 'Breakfast included', 'Gym', 'Rooftop terrace'],
        available: true,
        bookingLink: 'https://www.booking.com'
      },
      {
        name: 'Eiffel Tower View Suites',
        stars: 5,
        priceRange: '€250-€400',
        distance: '0.5 km from Eiffel Tower',
        userRating: 9.2,
        amenities: ['Free WiFi', 'Spa', 'Restaurant', 'Concierge', 'Tower views'],
        available: true,
        bookingLink: 'https://www.booking.com'
      },
      {
        name: 'Budget Inn Montmartre',
        stars: 3,
        priceRange: '€60-€90',
        distance: '2.5 km from city center',
        userRating: 7.8,
        amenities: ['Free WiFi', 'Breakfast', 'Luggage storage'],
        available: false,
        bookingLink: 'https://www.booking.com'
      }
    ],
    tokyo: [
      {
        name: 'Shibuya Grand Hotel',
        stars: 4,
        priceRange: '¥15,000-¥25,000',
        distance: '0.8 km from Shibuya Station',
        userRating: 8.9,
        amenities: ['Free WiFi', 'Onsen bath', 'Restaurant', 'Bar'],
        available: true,
        bookingLink: 'https://www.booking.com'
      },
      {
        name: 'Tokyo Luxury Suites',
        stars: 5,
        priceRange: '¥30,000-¥50,000',
        distance: 'Ginza district',
        userRating: 9.5,
        amenities: ['Free WiFi', 'Spa', 'Michelin restaurant', 'Concierge', 'Pool'],
        available: true,
        bookingLink: 'https://www.booking.com'
      },
      {
        name: 'Capsule Hotel Akihabara',
        stars: 2,
        priceRange: '¥3,000-¥5,000',
        distance: '0.3 km from Akihabara Station',
        userRating: 7.5,
        amenities: ['Free WiFi', 'Shared lounge', 'Lockers'],
        available: true,
        bookingLink: 'https://www.booking.com'
      }
    ],
    bali: [
      {
        name: 'Seminyak Beach Resort',
        stars: 4,
        priceRange: '$80-$150',
        distance: 'Beachfront, Seminyak',
        userRating: 9.0,
        amenities: ['Free WiFi', 'Pool', 'Beach access', 'Spa', 'Restaurant'],
        available: true,
        bookingLink: 'https://www.booking.com'
      },
      {
        name: 'Ubud Jungle Villa',
        stars: 5,
        priceRange: '$200-$350',
        distance: 'Ubud center (jungle views)',
        userRating: 9.4,
        amenities: ['Free WiFi', 'Infinity pool', 'Spa', 'Yoga classes', 'Butler service'],
        available: true,
        bookingLink: 'https://www.booking.com'
      },
      {
        name: 'Kuta Budget Hotel',
        stars: 3,
        priceRange: '$25-$45',
        distance: '1 km from Ngurah Rai Airport',
        userRating: 7.6,
        amenities: ['Free WiFi', 'Pool', 'Breakfast'],
        available: true,
        bookingLink: 'https://www.booking.com'
      }
    ]
  };

  return accommodationData[dest] || [
    {
      name: 'City Center Hotel',
      stars: 4,
      priceRange: '$100-$150',
      distance: '1 km from city center',
      userRating: 8.5,
      amenities: ['Free WiFi', 'Breakfast', 'Pool', 'Gym'],
      available: true,
      bookingLink: 'https://www.booking.com'
    },
    {
      name: 'Luxury Grand Hotel',
      stars: 5,
      priceRange: '$250-$400',
      distance: '0.5 km from main attractions',
      userRating: 9.0,
      amenities: ['Free WiFi', 'Spa', 'Restaurant', 'Concierge', 'Pool'],
      available: true,
      bookingLink: 'https://www.booking.com'
    },
    {
      name: 'Budget Traveler Inn',
      stars: 3,
      priceRange: '$40-$70',
      distance: '3 km from city center',
      userRating: 7.5,
      amenities: ['Free WiFi', 'Breakfast', 'Luggage storage'],
      available: true,
      bookingLink: 'https://www.booking.com'
    }
  ];
};

export const getItinerary = (destination, duration, tripPurpose) => {
  const dest = destination.toLowerCase();
  const days = parseInt(duration) || 7;

  // Sample itinerary for Paris (can be extended for other destinations)
  const parisItinerary = [
    {
      day: 1,
      theme: 'Iconic Landmarks',
      activities: [
        {
          time: '9:00 AM',
          name: 'Eiffel Tower',
          description: 'Visit the iconic iron lady of Paris. Take the elevator to the top for breathtaking city views.',
          duration: '2-3 hours',
          entryFee: '€26 (summit access)',
          booking: 'Book tickets online in advance',
          travelTime: '15 min by metro'
        },
        {
          time: '1:00 PM',
          name: 'Lunch at Champ de Mars',
          description: 'Enjoy a picnic lunch with Eiffel Tower views or dine at a nearby bistro.',
          duration: '1 hour',
          entryFee: null,
          booking: null,
          travelTime: '5 min walk'
        },
        {
          time: '3:00 PM',
          name: 'Louvre Museum',
          description: 'Explore the world\'s largest art museum. Don\'t miss the Mona Lisa and Venus de Milo.',
          duration: '3-4 hours',
          entryFee: '€17',
          booking: 'Reserve time slot online',
          travelTime: null
        }
      ]
    },
    {
      day: 2,
      theme: 'Historic Paris',
      activities: [
        {
          time: '10:00 AM',
          name: 'Notre-Dame Cathedral',
          description: 'Admire the Gothic architecture (currently under restoration but exterior viewable).',
          duration: '1 hour',
          entryFee: 'Free (exterior)',
          booking: null,
          travelTime: '10 min walk'
        },
        {
          time: '12:00 PM',
          name: 'Latin Quarter Exploration',
          description: 'Wander through charming streets, visit Shakespeare and Company bookstore.',
          duration: '2 hours',
          entryFee: 'Free',
          booking: null,
          travelTime: '20 min metro'
        },
        {
          time: '4:00 PM',
          name: 'Sacré-Cœur Basilica',
          description: 'Visit the stunning white basilica on Montmartre hill with panoramic Paris views.',
          duration: '2 hours',
          entryFee: 'Free (church), €6 (dome)',
          booking: null,
          travelTime: null
        }
      ]
    }
  ];

  const tokyoItinerary = [
    {
      day: 1,
      theme: 'Modern Tokyo',
      activities: [
        {
          time: '10:00 AM',
          name: 'Shibuya Crossing',
          description: 'Experience the world\'s busiest pedestrian crossing and explore Shibuya district.',
          duration: '2 hours',
          entryFee: 'Free',
          booking: null,
          travelTime: '15 min'
        },
        {
          time: '1:00 PM',
          name: 'Harajuku & Takeshita Street',
          description: 'Discover youth fashion culture and quirky shops. Visit Meiji Shrine nearby.',
          duration: '3 hours',
          entryFee: 'Free (shrine)',
          booking: null,
          travelTime: '10 min'
        },
        {
          time: '6:00 PM',
          name: 'Shinjuku Night Views',
          description: 'Tokyo Metropolitan Government Building observation deck for free night views.',
          duration: '2 hours',
          entryFee: 'Free',
          booking: null,
          travelTime: null
        }
      ]
    },
    {
      day: 2,
      theme: 'Traditional Tokyo',
      activities: [
        {
          time: '9:00 AM',
          name: 'Senso-ji Temple',
          description: 'Visit Tokyo\'s oldest temple in Asakusa. Walk through the famous Nakamise shopping street.',
          duration: '2-3 hours',
          entryFee: 'Free',
          booking: null,
          travelTime: '20 min'
        },
        {
          time: '2:00 PM',
          name: 'Imperial Palace East Gardens',
          description: 'Explore the beautiful gardens of the Imperial Palace.',
          duration: '2 hours',
          entryFee: 'Free',
          booking: null,
          travelTime: '15 min'
        },
        {
          time: '5:00 PM',
          name: 'Akihabara Electric Town',
          description: 'Discover anime, manga, and electronics in this vibrant district.',
          duration: '2-3 hours',
          entryFee: 'Free',
          booking: null,
          travelTime: null
        }
      ]
    }
  ];

  const baliItinerary = [
    {
      day: 1,
      theme: 'Beach & Relaxation',
      activities: [
        {
          time: '10:00 AM',
          name: 'Seminyak Beach',
          description: 'Relax on the beautiful beach, try surfing lessons, or enjoy beach clubs.',
          duration: '3-4 hours',
          entryFee: 'Free (beach)',
          booking: 'Book surf lessons in advance',
          travelTime: '15 min'
        },
        {
          time: '3:00 PM',
          name: 'Tanah Lot Temple',
          description: 'Visit the iconic sea temple, best at sunset.',
          duration: '2 hours',
          entryFee: 'Rp 60,000',
          booking: null,
          travelTime: '20 min'
        }
      ]
    },
    {
      day: 2,
      theme: 'Cultural Ubud',
      activities: [
        {
          time: '9:00 AM',
          name: 'Tegalalang Rice Terraces',
          description: 'Marvel at the stunning terraced rice paddies. Great for photos!',
          duration: '2 hours',
          entryFee: 'Rp 15,000',
          booking: null,
          travelTime: '30 min'
        },
        {
          time: '12:00 PM',
          name: 'Ubud Monkey Forest',
          description: 'Walk through the sacred forest home to hundreds of playful monkeys.',
          duration: '1-2 hours',
          entryFee: 'Rp 80,000',
          booking: null,
          travelTime: '15 min'
        },
        {
          time: '3:00 PM',
          name: 'Ubud Palace & Art Market',
          description: 'Explore traditional Balinese architecture and shop for local crafts.',
          duration: '2 hours',
          entryFee: 'Free (palace)',
          booking: null,
          travelTime: null
        }
      ]
    }
  ];

  let itinerary = dest.includes('paris') ? parisItinerary :
                  dest.includes('tokyo') ? tokyoItinerary :
                  dest.includes('bali') ? baliItinerary :
                  parisItinerary; // default

  // Trim to requested duration
  return itinerary.slice(0, Math.min(days, itinerary.length));
};

export const getLocalExperience = (destination) => {
  const dest = destination.toLowerCase();

  const experienceData = {
    paris: {
      vibe: 'Paris exudes romance, elegance, and artistic charm. The city buzzes with café culture, street musicians, and the constant hum of creativity. Expect beautiful architecture, fashionable locals, and an appreciation for the finer things in life - from wine to pastries to art.',
      customs: [
        'Always greet shopkeepers with "Bonjour" when entering',
        'Tipping is appreciated but not mandatory (5-10% is standard)',
        'Dress smartly - Parisians take fashion seriously',
        'Learn basic French phrases - effort is appreciated',
        'Dining takes time - don\'t rush meals'
      ],
      neighborhoods: [
        {
          name: 'Le Marais',
          description: 'Historic district with trendy boutiques, galleries, and vibrant nightlife'
        },
        {
          name: 'Saint-Germain-des-Prés',
          description: 'Intellectual hub with famous cafés, art galleries, and bookshops'
        },
        {
          name: 'Montmartre',
          description: 'Bohemian hilltop village with artists, the Sacré-Cœur, and stunning views'
        }
      ],
      safetyTips: [
        'Watch for pickpockets, especially near tourist attractions and on metro',
        'Keep valuables secure and bags zipped',
        'Avoid unlicensed taxis',
        'Be cautious in crowded areas',
        'Stay aware of your surroundings at night'
      ],
      emergencyContacts: [
        { type: 'Police', number: '17' },
        { type: 'Ambulance', number: '15' },
        { type: 'Fire', number: '18' },
        { type: 'Emergency', number: '112' }
      ]
    },
    tokyo: {
      vibe: 'Tokyo is a fascinating blend of ultra-modern and traditional. Experience cutting-edge technology alongside ancient temples, neon-lit streets next to peaceful gardens. The city is incredibly clean, safe, and efficient with polite, helpful locals. Expect sensory overload in the best way possible!',
      customs: [
        'Bow when greeting - deeper bow shows more respect',
        'Remove shoes when entering homes and some restaurants',
        'Don\'t eat while walking',
        'Speak quietly on public transport',
        'No tipping - it can be considered rude'
      ],
      neighborhoods: [
        {
          name: 'Shibuya',
          description: 'Youth culture epicenter with shopping, entertainment, and the famous crossing'
        },
        {
          name: 'Asakusa',
          description: 'Traditional district with temples, traditional shops, and old Tokyo atmosphere'
        },
        {
          name: 'Shinjuku',
          description: 'Massive entertainment and business district with skyscrapers and nightlife'
        }
      ],
      safetyTips: [
        'Tokyo is extremely safe - one of the safest cities globally',
        'Always carry cash - many places don\'t accept cards',
        'Download offline maps - WiFi not always available',
        'Keep your JR Pass secure',
        'Learn basic Japanese or have translation app ready'
      ],
      emergencyContacts: [
        { type: 'Police', number: '110' },
        { type: 'Ambulance/Fire', number: '119' },
        { type: 'Japan Helpline', number: '0570-000-911' }
      ]
    },
    bali: {
      vibe: 'Bali offers a laid-back, spiritual atmosphere mixed with beach party vibes. The island is known for its friendly locals, stunning nature, rich Hindu culture, and wellness focus. You\'ll find yoga studios, beach clubs, ancient temples, and rice terraces all in close proximity. The pace is slower - embrace "island time"!',
      customs: [
        'Dress modestly when visiting temples (sarong required)',
        'Use right hand for giving/receiving - left hand considered impure',
        'Remove shoes before entering homes and temples',
        'Don\'t touch people\'s heads - considered sacred',
        'Bargaining is expected at markets but be respectful'
      ],
      neighborhoods: [
        {
          name: 'Seminyak',
          description: 'Upscale beach area with luxury resorts, beach clubs, and fine dining'
        },
        {
          name: 'Ubud',
          description: 'Cultural heart with art galleries, yoga studios, rice terraces, and temples'
        },
        {
          name: 'Canggu',
          description: 'Surfer paradise with laid-back vibes, beach clubs, and digital nomad scene'
        }
      ],
      safetyTips: [
        'Be cautious of traffic - rent scooters only if experienced',
        'Drink bottled water only',
        'Watch for monkeys - don\'t carry food openly',
        'Be aware of strong ocean currents',
        'Use authorized taxi services or ride-hailing apps'
      ],
      emergencyContacts: [
        { type: 'Police', number: '110' },
        { type: 'Ambulance', number: '118' },
        { type: 'Tourist Police', number: '+62 361 224111' }
      ]
    }
  };

  return experienceData[dest] || {
    vibe: 'This destination offers a unique cultural experience with a blend of modern amenities and local charm. Expect friendly locals, interesting cuisine, and plenty of sights to explore!',
    customs: [
      'Respect local customs and traditions',
      'Dress appropriately for religious sites',
      'Learn basic local phrases',
      'Be mindful of local etiquette',
      'Ask before taking photos of people'
    ],
    neighborhoods: [
      {
        name: 'City Center',
        description: 'Main tourist area with shops, restaurants, and attractions'
      },
      {
        name: 'Old Town',
        description: 'Historic district with traditional architecture and culture'
      },
      {
        name: 'Beach/Resort Area',
        description: 'Relaxed area with accommodations and leisure activities'
      }
    ],
    safetyTips: [
      'Keep valuables secure',
      'Stay aware of your surroundings',
      'Use official transportation',
      'Drink bottled water',
      'Have travel insurance'
    ],
    emergencyContacts: [
      { type: 'Police', number: '911' },
      { type: 'Ambulance', number: '911' },
      { type: 'Embassy', number: 'Check with your embassy' }
    ]
  };
};

export const getRestaurants = (destination, tripPurpose) => {
  const dest = destination.toLowerCase();

  const restaurantData = {
    paris: [
      {
        area: 'Near Eiffel Tower',
        restaurants: [
          {
            name: 'Le Jules Verne',
            cuisine: 'French Fine Dining',
            priceRange: '$$$',
            specialties: ['Duck confit', 'Lobster', 'Soufflé'],
            distance: 'Inside Eiffel Tower',
            hours: '12:00 PM - 10:00 PM',
            rating: 4.6
          },
          {
            name: 'Café de l\'Homme',
            cuisine: 'French Contemporary',
            priceRange: '$$',
            specialties: ['Steak frites', 'French onion soup', 'Crème brûlée'],
            distance: '500m from tower',
            hours: '12:00 PM - 11:00 PM',
            rating: 4.4
          }
        ]
      },
      {
        area: 'Le Marais',
        restaurants: [
          {
            name: 'L\'As du Fallafel',
            cuisine: 'Middle Eastern',
            priceRange: '$',
            specialties: ['Falafel wrap', 'Shawarma', 'Hummus'],
            distance: 'Heart of Le Marais',
            hours: '11:00 AM - 11:00 PM',
            rating: 4.7
          },
          {
            name: 'Breizh Café',
            cuisine: 'Crêperie',
            priceRange: '$$',
            specialties: ['Buckwheat crêpes', 'Sweet crêpes', 'Cidre'],
            distance: 'Le Marais district',
            hours: '11:30 AM - 11:00 PM',
            rating: 4.5
          }
        ]
      }
    ],
    tokyo: [
      {
        area: 'Shibuya',
        restaurants: [
          {
            name: 'Ichiran Ramen',
            cuisine: 'Japanese Ramen',
            priceRange: '$',
            specialties: ['Tonkotsu ramen', 'Spicy red sauce', 'Soft-boiled eggs'],
            distance: '5 min from Shibuya crossing',
            hours: '24 hours',
            rating: 4.6
          },
          {
            name: 'Genki Sushi',
            cuisine: 'Conveyor Belt Sushi',
            priceRange: '$$',
            specialties: ['Fresh sushi', 'Salmon', 'Tuna'],
            distance: 'Shibuya Station',
            hours: '11:00 AM - 11:00 PM',
            rating: 4.4
          }
        ]
      },
      {
        area: 'Tsukiji/Ginza',
        restaurants: [
          {
            name: 'Sushi Dai',
            cuisine: 'Sushi',
            priceRange: '$$',
            specialties: ['Omakase', 'Toro', 'Sea urchin'],
            distance: 'Tsukiji Outer Market',
            hours: '5:00 AM - 1:00 PM',
            rating: 4.8
          },
          {
            name: 'Kyubey',
            cuisine: 'Sushi Fine Dining',
            priceRange: '$$$',
            specialties: ['Premium omakase', 'Seasonal fish', 'Wagyu'],
            distance: 'Ginza district',
            hours: '11:30 AM - 10:00 PM',
            rating: 4.7
          }
        ]
      }
    ],
    bali: [
      {
        area: 'Seminyak',
        restaurants: [
          {
            name: 'La Lucciola',
            cuisine: 'Italian Beachfront',
            priceRange: '$$',
            specialties: ['Wood-fired pizza', 'Pasta', 'Seafood'],
            distance: 'Beachfront, Seminyak',
            hours: '8:00 AM - 11:00 PM',
            rating: 4.5
          },
          {
            name: 'Merah Putih',
            cuisine: 'Indonesian Fine Dining',
            priceRange: '$$$',
            specialties: ['Bebek goreng', 'Rendang', 'Satay platter'],
            distance: 'Seminyak center',
            hours: '12:00 PM - 11:00 PM',
            rating: 4.6
          }
        ]
      },
      {
        area: 'Ubud',
        restaurants: [
          {
            name: 'Locavore',
            cuisine: 'Modern Indonesian',
            priceRange: '$$$',
            specialties: ['Tasting menu', 'Local ingredients', 'Molecular gastronomy'],
            distance: 'Ubud center',
            hours: '12:00 PM - 10:00 PM',
            rating: 4.8
          },
          {
            name: 'Warung Biah Biah',
            cuisine: 'Traditional Indonesian',
            priceRange: '$',
            specialties: ['Nasi campur', 'Babi guling', 'Gado-gado'],
            distance: 'Near Ubud Palace',
            hours: '8:00 AM - 9:00 PM',
            rating: 4.7
          }
        ]
      }
    ]
  };

  return restaurantData[dest] || [
    {
      area: 'City Center',
      restaurants: [
        {
          name: 'Local Favorite Restaurant',
          cuisine: 'Local Cuisine',
          priceRange: '$$',
          specialties: ['Traditional dish 1', 'Traditional dish 2', 'House specialty'],
          distance: 'City center',
          hours: '11:00 AM - 10:00 PM',
          rating: 4.5
        },
        {
          name: 'International Bistro',
          cuisine: 'International',
          priceRange: '$$',
          specialties: ['Pasta', 'Steak', 'Seafood'],
          distance: 'Near main attractions',
          hours: '12:00 PM - 11:00 PM',
          rating: 4.3
        }
      ]
    }
  ];
};

export const getAdditionalFeatures = (destination, tripPurpose) => {
  const dest = destination.toLowerCase();

  const featuresData = {
    paris: {
      weather: {
        description: 'Paris has a temperate oceanic climate with mild temperatures year-round.',
        temperature: '15-25°C (59-77°F)',
        conditions: 'Partly cloudy with occasional rain'
      },
      packingList: [
        'Comfortable walking shoes',
        'Light jacket or cardigan',
        'Umbrella',
        'Smart casual outfits',
        'Camera',
        'Power adapter (Type C/E)',
        'Reusable water bottle',
        'Scarf (stylish accessory)'
      ],
      transportation: [
        {
          type: 'Metro',
          description: 'Extensive metro system covering all major areas',
          cost: '€1.90 per ride, €14.90 for 10 rides'
        },
        {
          type: 'RER Train',
          description: 'Regional express network for longer distances',
          cost: '€10-15 to/from airports'
        },
        {
          type: 'Vélib\' (Bike Share)',
          description: 'City bike rental system',
          cost: '€1 for 24 hours + usage fees'
        }
      ],
      costBreakdown: [
        { category: 'Accommodation', amount: '€700-1400' },
        { category: 'Food & Dining', amount: '€350-700' },
        { category: 'Attractions', amount: '€150-300' },
        { category: 'Transportation', amount: '€50-100' },
        { category: 'Shopping & Misc', amount: '€200-400' }
      ],
      totalEstimate: '€1,450-2,900',
      localPhrases: [
        { english: 'Hello', local: 'Bonjour', pronunciation: 'bon-ZHOOR' },
        { english: 'Please', local: 'S\'il vous plaît', pronunciation: 'see voo PLAY' },
        { english: 'Thank you', local: 'Merci', pronunciation: 'mehr-SEE' },
        { english: 'Excuse me', local: 'Excusez-moi', pronunciation: 'ex-kew-zay MWAH' },
        { english: 'How much?', local: 'Combien?', pronunciation: 'kom-bee-EN' },
        { english: 'Where is...?', local: 'Où est...?', pronunciation: 'oo eh' }
      ]
    },
    tokyo: {
      weather: {
        description: 'Tokyo has four distinct seasons with hot, humid summers and mild winters.',
        temperature: '20-28°C (68-82°F)',
        conditions: 'Clear to partly cloudy'
      },
      packingList: [
        'Comfortable walking shoes',
        'Cash (many places cash-only)',
        'Portable WiFi or SIM card',
        'Light clothing layers',
        'Rain gear',
        'Power adapter (Type A/B)',
        'Face masks (common courtesy)',
        'Small towel (restrooms often lack paper towels)'
      ],
      transportation: [
        {
          type: 'JR Rail Pass',
          description: 'Unlimited JR trains including Shinkansen (for tourists)',
          cost: '¥29,650 (7 days)'
        },
        {
          type: 'Metro/Subway',
          description: 'Extensive network covering all of Tokyo',
          cost: '¥170-320 per ride'
        },
        {
          type: 'IC Card (Suica/Pasmo)',
          description: 'Rechargeable card for all transit',
          cost: 'Pay-as-you-go, ¥500 deposit'
        }
      ],
      costBreakdown: [
        { category: 'Accommodation', amount: '¥70,000-150,000' },
        { category: 'Food & Dining', amount: '¥42,000-84,000' },
        { category: 'Attractions', amount: '¥20,000-40,000' },
        { category: 'Transportation', amount: '¥15,000-30,000' },
        { category: 'Shopping & Misc', amount: '¥30,000-60,000' }
      ],
      totalEstimate: '¥177,000-364,000',
      localPhrases: [
        { english: 'Hello', local: 'Konnichiwa', pronunciation: 'kon-nee-chee-wah' },
        { english: 'Thank you', local: 'Arigatou gozaimasu', pronunciation: 'ah-ree-gah-toh go-zai-mas' },
        { english: 'Excuse me', local: 'Sumimasen', pronunciation: 'soo-mee-mah-sen' },
        { english: 'Yes/No', local: 'Hai/Iie', pronunciation: 'hai/ee-eh' },
        { english: 'How much?', local: 'Ikura desu ka?', pronunciation: 'ee-koo-rah dess kah' },
        { english: 'Where is...?', local: 'Doko desu ka?', pronunciation: 'doh-koh dess kah' }
      ]
    },
    bali: {
      weather: {
        description: 'Bali has a tropical climate - warm and humid year-round with dry and wet seasons.',
        temperature: '26-32°C (79-90°F)',
        conditions: 'Sunny with possible afternoon showers'
      },
      packingList: [
        'Sunscreen (high SPF)',
        'Insect repellent',
        'Light, breathable clothing',
        'Swimwear',
        'Sarong (for temples)',
        'Sandals and walking shoes',
        'Rain jacket or poncho',
        'Reusable water bottle',
        'Cash (many places prefer cash)'
      ],
      transportation: [
        {
          type: 'Scooter Rental',
          description: 'Most popular way to get around (need international license)',
          cost: 'Rp 50,000-70,000/day'
        },
        {
          type: 'Grab/Gojek',
          description: 'Ride-hailing apps for cars and scooters',
          cost: 'Varies, approximately Rp 20,000-50,000 for short trips'
        },
        {
          type: 'Private Driver',
          description: 'Hire for full day of sightseeing',
          cost: 'Rp 500,000-700,000/day'
        }
      ],
      costBreakdown: [
        { category: 'Accommodation', amount: '$350-1050' },
        { category: 'Food & Dining', amount: '$150-400' },
        { category: 'Attractions & Activities', amount: '$200-400' },
        { category: 'Transportation', amount: '$100-200' },
        { category: 'Shopping & Misc', amount: '$150-300' }
      ],
      totalEstimate: '$950-2,350',
      localPhrases: [
        { english: 'Hello', local: 'Om swastiastu', pronunciation: 'om swas-tee-as-too' },
        { english: 'Thank you', local: 'Terima kasih', pronunciation: 'teh-ree-mah kah-see' },
        { english: 'Please', local: 'Tolong', pronunciation: 'toh-long' },
        { english: 'Yes/No', local: 'Ya/Tidak', pronunciation: 'yah/tee-dahk' },
        { english: 'How much?', local: 'Berapa?', pronunciation: 'beh-rah-pah' },
        { english: 'Delicious!', local: 'Enak!', pronunciation: 'eh-nahk' }
      ]
    }
  };

  return featuresData[dest] || {
    weather: {
      description: 'Check local weather forecast before your trip.',
      temperature: 'Varies by season',
      conditions: 'Check forecast'
    },
    packingList: [
      'Comfortable walking shoes',
      'Appropriate clothing for weather',
      'Travel documents',
      'Medications',
      'Camera',
      'Power adapter',
      'Reusable water bottle',
      'Sunscreen'
    ],
    transportation: [
      {
        type: 'Public Transit',
        description: 'Local bus and train system',
        cost: 'Varies'
      },
      {
        type: 'Taxi/Ride-share',
        description: 'Convenient door-to-door service',
        cost: 'Meter-based or app pricing'
      }
    ],
    costBreakdown: [
      { category: 'Accommodation', amount: '$500-1000' },
      { category: 'Food & Dining', amount: '$300-600' },
      { category: 'Attractions', amount: '$200-400' },
      { category: 'Transportation', amount: '$100-200' },
      { category: 'Shopping & Misc', amount: '$200-400' }
    ],
    totalEstimate: '$1,300-2,600',
    localPhrases: [
      { english: 'Hello', local: 'Hello', pronunciation: null },
      { english: 'Thank you', local: 'Thank you', pronunciation: null },
      { english: 'Please', local: 'Please', pronunciation: null },
      { english: 'Yes/No', local: 'Yes/No', pronunciation: null }
    ]
  };
};

export const getMapData = (destination) => {
  const dest = destination.toLowerCase();

  const mapData = {
    paris: {
      region: {
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      markers: [
        {
          coordinate: { latitude: 48.8584, longitude: 2.2945 },
          title: 'Eiffel Tower',
          description: 'Iconic iron tower',
          type: 'attraction'
        },
        {
          coordinate: { latitude: 48.8606, longitude: 2.3376 },
          title: 'Louvre Museum',
          description: 'World-famous art museum',
          type: 'attraction'
        },
        {
          coordinate: { latitude: 48.8566, longitude: 2.3522 },
          title: 'Hotel Le Marais',
          description: '4-star hotel',
          type: 'hotel'
        },
        {
          coordinate: { latitude: 48.8584, longitude: 2.2985 },
          title: 'Café de l\'Homme',
          description: 'French restaurant',
          type: 'restaurant'
        }
      ]
    },
    tokyo: {
      region: {
        latitude: 35.6762,
        longitude: 139.6503,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      markers: [
        {
          coordinate: { latitude: 35.6762, longitude: 139.6503 },
          title: 'Shibuya Crossing',
          description: 'Famous pedestrian crossing',
          type: 'attraction'
        },
        {
          coordinate: { latitude: 35.7148, longitude: 139.7967 },
          title: 'Senso-ji Temple',
          description: 'Ancient Buddhist temple',
          type: 'attraction'
        },
        {
          coordinate: { latitude: 35.6650, longitude: 139.7290 },
          title: 'Shibuya Grand Hotel',
          description: '4-star hotel',
          type: 'hotel'
        },
        {
          coordinate: { latitude: 35.6680, longitude: 139.7016 },
          title: 'Ichiran Ramen',
          description: 'Popular ramen chain',
          type: 'restaurant'
        }
      ]
    },
    bali: {
      region: {
        latitude: -8.3405,
        longitude: 115.0920,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      },
      markers: [
        {
          coordinate: { latitude: -8.6705, longitude: 115.0920 },
          title: 'Seminyak Beach',
          description: 'Popular beach destination',
          type: 'attraction'
        },
        {
          coordinate: { latitude: -8.5069, longitude: 115.2625 },
          title: 'Tegalalang Rice Terraces',
          description: 'Scenic rice paddies',
          type: 'attraction'
        },
        {
          coordinate: { latitude: -8.6840, longitude: 115.1730 },
          title: 'Seminyak Beach Resort',
          description: '4-star resort',
          type: 'hotel'
        },
        {
          coordinate: { latitude: -8.6720, longitude: 115.1350 },
          title: 'La Lucciola',
          description: 'Beachfront restaurant',
          type: 'restaurant'
        }
      ]
    }
  };

  return mapData[dest] || {
    region: {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    markers: [
      {
        coordinate: { latitude: 0, longitude: 0 },
        title: 'Main Attraction',
        description: 'Popular tourist spot',
        type: 'attraction'
      }
    ]
  };
};
