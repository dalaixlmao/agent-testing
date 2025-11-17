import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getItinerary } from '../data/destinationData';

const ItineraryPlanner = ({ destination, duration, tripPurpose }) => {
  const itinerary = getItinerary(destination, duration, tripPurpose);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📅 Day-by-Day Itinerary</Text>

      <View style={styles.itineraryContainer}>
        {itinerary.map((day, index) => (
          <View key={index} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayNumber}>Day {day.day}</Text>
              <Text style={styles.dayTheme}>{day.theme}</Text>
            </View>

            {day.activities.map((activity, actIndex) => (
              <View key={actIndex} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                  <Text style={styles.activityName}>{activity.name}</Text>
                </View>

                <Text style={styles.activityDescription}>{activity.description}</Text>

                <View style={styles.activityDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>⏱️</Text>
                    <Text style={styles.detailText}>Duration: {activity.duration}</Text>
                  </View>

                  {activity.entryFee && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailIcon}>💵</Text>
                      <Text style={styles.detailText}>Entry: {activity.entryFee}</Text>
                    </View>
                  )}

                  {activity.booking && (
                    <View style={styles.bookingRequired}>
                      <Text style={styles.bookingText}>📝 {activity.booking}</Text>
                    </View>
                  )}
                </View>

                {activity.travelTime && (
                  <View style={styles.travelTime}>
                    <Text style={styles.travelIcon}>🚗</Text>
                    <Text style={styles.travelText}>Travel to next: {activity.travelTime}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
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
  itineraryContainer: {
    marginTop: 10,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dayHeader: {
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
    paddingLeft: 12,
    marginBottom: 15,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  dayTheme: {
    fontSize: 16,
    color: '#4A90E2',
    fontStyle: 'italic',
  },
  activityCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },
  activityHeader: {
    marginBottom: 8,
  },
  activityTime: {
    fontSize: 13,
    color: '#7F8C8D',
    fontWeight: '600',
    marginBottom: 4,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  activityDescription: {
    fontSize: 15,
    color: '#5D6D7E',
    lineHeight: 22,
    marginBottom: 12,
  },
  activityDetails: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#5D6D7E',
  },
  bookingRequired: {
    backgroundColor: '#FFF3CD',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  bookingText: {
    fontSize: 13,
    color: '#856404',
    fontWeight: '500',
  },
  travelTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
  },
  travelIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  travelText: {
    fontSize: 13,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
});

export default ItineraryPlanner;
