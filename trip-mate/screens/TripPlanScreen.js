import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import TravelDocumentation from '../components/TravelDocumentation';
import FinancialPlanning from '../components/FinancialPlanning';
import AccommodationRecommendations from '../components/AccommodationRecommendations';
import ItineraryPlanner from '../components/ItineraryPlanner';
import LocalExperience from '../components/LocalExperience';
import RestaurantRecommendations from '../components/RestaurantRecommendations';
import AdditionalFeatures from '../components/AdditionalFeatures';
import InteractiveMap from '../components/InteractiveMap';

const TripPlanScreen = ({ route, navigation }) => {
  const { tripData } = route.params;

  const handleShare = async () => {
    try {
      const shareText = `Check out my trip plan to ${tripData.destination}!\n\nDates: ${tripData.fromDate} to ${tripData.toDate}\nDuration: ${tripData.duration} days\nGroup Size: ${tripData.groupSize} people\n\nPlanned with Trip Friend 🌍`;

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        Alert.alert('Share', shareText, [
          { text: 'OK', style: 'cancel' }
        ]);
      } else {
        Alert.alert('Share', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Your Perfect Trip to {tripData.destination}!
          </Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Share Trip 📤</Text>
          </TouchableOpacity>
        </View>

        <TravelDocumentation destination={tripData.destination} />

        <FinancialPlanning
          destination={tripData.destination}
          duration={tripData.duration}
          groupSize={tripData.groupSize}
        />

        <AccommodationRecommendations
          destination={tripData.destination}
          fromDate={tripData.fromDate}
          toDate={tripData.toDate}
          groupSize={tripData.groupSize}
        />

        <ItineraryPlanner
          destination={tripData.destination}
          duration={tripData.duration}
          tripPurpose={tripData.tripPurpose}
        />

        <LocalExperience destination={tripData.destination} />

        <RestaurantRecommendations
          destination={tripData.destination}
          tripPurpose={tripData.tripPurpose}
        />

        <AdditionalFeatures
          destination={tripData.destination}
          fromDate={tripData.fromDate}
          toDate={tripData.toDate}
          duration={tripData.duration}
          tripPurpose={tripData.tripPurpose}
        />

        <InteractiveMap destination={tripData.destination} />

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Plan Another Trip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    backgroundColor: '#7F8C8D',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TripPlanScreen;
