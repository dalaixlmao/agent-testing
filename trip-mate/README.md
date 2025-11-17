# 🌍 Trip Friend - Your Personal Travel Planning Companion

A comprehensive React Native mobile app that helps users plan complete trips from start to finish. Built with Expo for easy cross-platform development.

![Trip Friend Banner](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue) ![Expo](https://img.shields.io/badge/Expo-~50.0.0-000020?logo=expo) ![React Native](https://img.shields.io/badge/React%20Native-0.73.0-61DAFB?logo=react)

## ✨ Features

### 📝 User Input
- Destination selection
- Trip duration calculator
- Travel date picker
- Group size input
- Trip purpose selection (Relaxation, Adventure, Food & Culture, or Mixed)

### 📄 Travel Documentation
- Passport requirements
- Visa information and application process
- Embassy website links
- Processing time estimates

### 💰 Financial Planning
- Local currency information
- Currency exchange recommendations
- Daily budget estimates
- Total trip cost calculator
- Currency conversion tips

### 🏨 Accommodation Recommendations
- 3-5 hotel options with detailed info:
  - Star ratings
  - Price ranges
  - Distance from attractions
  - Amenities list
  - User ratings
  - Booking availability
  - Direct booking links

### 📅 Day-by-Day Itinerary
- Must-visit attractions with descriptions
- Recommended visit times
- Duration estimates
- Entry fees and booking requirements
- Travel time between locations

### 🌟 Local Experience
- Destination atmosphere and vibe
- Local customs and etiquette
- Best neighborhoods to explore
- Safety tips
- Emergency contact numbers

### 🍽️ Restaurant Recommendations
- 3-4 restaurants per area
- Cuisine types
- Price ranges
- Specialty dishes
- Distance from attractions
- Operating hours
- User ratings

### ✨ Additional Features
- Weather forecasts
- Packing checklists
- Transportation options
- Trip cost breakdown
- Useful local phrases with pronunciation

### 🗺️ Interactive Map
- Visual representation of hotels, attractions, and restaurants
- Color-coded markers
- Clickable location details

### 📤 Share & Export
- Share trip plans with companions
- Save itineraries

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo Go app on your iPhone (download from App Store)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd trip-mate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## 📱 Testing on Your iPhone

### Method 1: Expo Go App (Recommended)

1. **Download Expo Go:**
   - Open the App Store on your iPhone
   - Search for "Expo Go"
   - Download and install the app

2. **Connect to the same network:**
   - Make sure your iPhone and computer are on the same WiFi network

3. **Start the app:**
   ```bash
   npm start
   ```

4. **Scan the QR code:**
   - Open the Expo Go app on your iPhone
   - Tap "Scan QR Code"
   - Scan the QR code displayed in your terminal or browser
   - The app will load on your iPhone!

### Method 2: Tunnel Mode (If on different networks)

1. **Start with tunnel:**
   ```bash
   npm start -- --tunnel
   ```

2. **Scan the QR code:**
   - The tunnel URL will work even if you're not on the same network
   - Scan with Expo Go app as above

### Method 3: Manual URL Entry

1. **Note the URL:**
   - When you run `npm start`, you'll see a URL like `exp://192.168.x.x:8081`

2. **Enter manually in Expo Go:**
   - Open Expo Go app
   - Tap "Enter URL manually"
   - Type the URL shown in your terminal
   - Tap "Connect"

## 🛠️ Built With

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **React Native Maps** - Interactive maps
- **Expo Sharing** - Share functionality

## 📱 Supported Destinations

Currently includes detailed data for:
- 🇫🇷 Paris, France
- 🇯🇵 Tokyo, Japan
- 🇮🇩 Bali, Indonesia

Default template data provided for other destinations.

## 🔧 Project Structure

```
trip-mate/
├── App.js                 # Main app entry
├── screens/
│   ├── HomeScreen.js      # Input form screen
│   └── TripPlanScreen.js  # Trip plan display
├── components/
│   ├── TravelDocumentation.js
│   ├── FinancialPlanning.js
│   ├── AccommodationRecommendations.js
│   ├── ItineraryPlanner.js
│   ├── LocalExperience.js
│   ├── RestaurantRecommendations.js
│   ├── AdditionalFeatures.js
│   └── InteractiveMap.js
├── data/
│   └── destinationData.js # Mock destination data
└── package.json
```

## 🎨 Design Philosophy

- **Clean & Intuitive:** Easy-to-use interface
- **Mobile-First:** Optimized for mobile devices
- **Comprehensive:** All travel planning features in one place
- **Friendly Tone:** Like talking to a knowledgeable travel buddy

## 📝 Customization

### Adding New Destinations

1. Open `data/destinationData.js`
2. Add your destination data to each function:
   - `getTravelDocumentation()`
   - `getFinancialInfo()`
   - `getAccommodations()`
   - `getItinerary()`
   - `getLocalExperience()`
   - `getRestaurants()`
   - `getAdditionalFeatures()`
   - `getMapData()`

### Modifying Styles

Each component has its own StyleSheet at the bottom of the file. Modify colors, fonts, and spacing as needed.

## 🐛 Troubleshooting

### App won't load on iPhone

- **Check WiFi:** Ensure both devices are on the same network
- **Firewall:** Check if your computer's firewall is blocking the connection
- **Use Tunnel:** Try running with `--tunnel` flag
- **Restart Expo:** Close and restart the development server

### QR Code won't scan

- **Camera Permissions:** Make sure Expo Go has camera permissions
- **Lighting:** Ensure good lighting for QR code scanning
- **Manual Entry:** Use manual URL entry as alternative

### Map not showing

- **Google Maps API:** For Android, you'll need a Google Maps API key
- **Permissions:** Ensure location permissions are granted
- **Fallback:** The app works without maps, just that component won't display

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 💬 Support

For issues or questions:
- Check the troubleshooting section
- Review Expo documentation: https://docs.expo.dev
- React Native documentation: https://reactnative.dev

## 🎉 Enjoy Planning Your Trip!

Made with ❤️ for travelers everywhere

---

**Happy Travels! 🌍✈️**
