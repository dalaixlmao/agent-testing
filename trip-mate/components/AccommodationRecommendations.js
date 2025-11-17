import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { getAccommodations } from '../data/destinationData';

const AccommodationRecommendations = ({ destination, fromDate, toDate, groupSize }) => {
  const hotels = getAccommodations(destination);

  const openBookingLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🏨 Accommodation Recommendations</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {hotels.map((hotel, index) => (
          <View key={index} style={styles.hotelCard}>
            <View style={styles.hotelHeader}>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <Text style={styles.rating}>{'⭐'.repeat(hotel.stars)}</Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price per night:</Text>
              <Text style={styles.price}>{hotel.priceRange}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoText}>{hotel.distance}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>👥</Text>
              <Text style={styles.infoText}>User Rating: {hotel.userRating}/10</Text>
            </View>

            <View style={styles.amenitiesContainer}>
              <Text style={styles.amenitiesTitle}>Amenities:</Text>
              {hotel.amenities.map((amenity, idx) => (
                <View key={idx} style={styles.amenityItem}>
                  <Text style={styles.amenityDot}>•</Text>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>

            <View style={styles.availabilityContainer}>
              <Text style={styles.availabilityLabel}>Availability:</Text>
              <Text style={[
                styles.availabilityStatus,
                hotel.available ? styles.available : styles.notAvailable
              ]}>
                {hotel.available ? '✓ Available' : '✗ Limited'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => openBookingLink(hotel.bookingLink)}
            >
              <Text style={styles.bookButtonText}>View Details & Book</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  scrollView: {
    marginTop: 10,
  },
  hotelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginRight: 15,
    width: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hotelHeader: {
    marginBottom: 12,
  },
  hotelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  rating: {
    fontSize: 16,
  },
  priceContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#5D6D7E',
  },
  amenitiesContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  amenitiesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  amenityDot: {
    fontSize: 12,
    color: '#4A90E2',
    marginRight: 6,
  },
  amenityText: {
    fontSize: 13,
    color: '#5D6D7E',
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  availabilityLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  availabilityStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  available: {
    color: '#27AE60',
  },
  notAvailable: {
    color: '#E74C3C',
  },
  bookButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default AccommodationRecommendations;
