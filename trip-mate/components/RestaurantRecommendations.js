import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getRestaurants } from '../data/destinationData';

const RestaurantRecommendations = ({ destination, tripPurpose }) => {
  const restaurants = getRestaurants(destination, tripPurpose);

  const getPriceColor = (priceRange) => {
    if (priceRange === '$') return '#27AE60';
    if (priceRange === '$$') return '#F39C12';
    return '#E74C3C';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🍽️ Restaurant Recommendations</Text>

      {restaurants.map((area, areaIndex) => (
        <View key={areaIndex} style={styles.areaContainer}>
          <Text style={styles.areaTitle}>{area.area}</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
          >
            {area.restaurants.map((restaurant, restIndex) => (
              <View key={restIndex} style={styles.restaurantCard}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>

                <View style={styles.cuisineContainer}>
                  <Text style={styles.cuisineType}>{restaurant.cuisine}</Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Price Range:</Text>
                  <Text
                    style={[
                      styles.priceRange,
                      { color: getPriceColor(restaurant.priceRange) }
                    ]}
                  >
                    {restaurant.priceRange}
                  </Text>
                </View>

                <View style={styles.specialtiesContainer}>
                  <Text style={styles.specialtiesTitle}>Must Try:</Text>
                  {restaurant.specialties.map((specialty, specIndex) => (
                    <View key={specIndex} style={styles.specialtyItem}>
                      <Text style={styles.specialtyDot}>•</Text>
                      <Text style={styles.specialtyText}>{specialty}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📍</Text>
                  <Text style={styles.infoText}>{restaurant.distance}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>🕒</Text>
                  <Text style={styles.infoText}>{restaurant.hours}</Text>
                </View>

                {restaurant.rating && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>⭐ {restaurant.rating}/5</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      ))}
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
  areaContainer: {
    marginBottom: 25,
  },
  areaTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 12,
    paddingLeft: 5,
  },
  scrollView: {
    marginTop: 5,
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 15,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  cuisineContainer: {
    backgroundColor: '#E8F4FD',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  cuisineType: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginRight: 8,
  },
  priceRange: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  specialtiesContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  specialtiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  specialtyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  specialtyDot: {
    fontSize: 12,
    color: '#4A90E2',
    marginRight: 6,
  },
  specialtyText: {
    fontSize: 13,
    color: '#5D6D7E',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#5D6D7E',
  },
  ratingContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F39C12',
  },
});

export default RestaurantRecommendations;
