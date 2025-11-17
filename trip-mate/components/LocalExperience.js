import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getLocalExperience } from '../data/destinationData';

const LocalExperience = ({ destination }) => {
  const localInfo = getLocalExperience(destination);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🌟 Local Experience</Text>

      <View style={styles.card}>
        <Text style={styles.subTitle}>Overall Vibe</Text>
        <Text style={styles.description}>{localInfo.vibe}</Text>

        <View style={styles.divider} />

        <Text style={styles.subTitle}>Local Customs & Etiquette</Text>
        <View style={styles.listContainer}>
          {localInfo.customs.map((custom, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{custom}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={styles.subTitle}>Best Neighborhoods to Explore</Text>
        <View style={styles.neighborhoodList}>
          {localInfo.neighborhoods.map((neighborhood, index) => (
            <View key={index} style={styles.neighborhoodCard}>
              <Text style={styles.neighborhoodName}>{neighborhood.name}</Text>
              <Text style={styles.neighborhoodDesc}>{neighborhood.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={styles.subTitle}>Safety Tips & Emergency Contacts</Text>
        <View style={styles.safetyContainer}>
          {localInfo.safetyTips.map((tip, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.emergencyBox}>
          <Text style={styles.emergencyTitle}>🚨 Emergency Contacts</Text>
          {localInfo.emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.emergencyItem}>
              <Text style={styles.emergencyLabel}>{contact.type}:</Text>
              <Text style={styles.emergencyNumber}>{contact.number}</Text>
            </View>
          ))}
        </View>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#5D6D7E',
    lineHeight: 22,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#E1E8ED',
    marginVertical: 15,
  },
  listContainer: {
    marginLeft: 5,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bullet: {
    fontSize: 16,
    color: '#4A90E2',
    marginRight: 10,
    fontWeight: 'bold',
  },
  bulletText: {
    fontSize: 15,
    color: '#5D6D7E',
    flex: 1,
    lineHeight: 22,
  },
  neighborhoodList: {
    marginTop: 5,
  },
  neighborhoodCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
  },
  neighborhoodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  neighborhoodDesc: {
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 20,
  },
  safetyContainer: {
    marginLeft: 5,
    marginBottom: 15,
  },
  emergencyBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 15,
    marginTop: 5,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  emergencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  emergencyLabel: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
  },
  emergencyNumber: {
    fontSize: 14,
    color: '#856404',
    fontWeight: 'bold',
  },
});

export default LocalExperience;
