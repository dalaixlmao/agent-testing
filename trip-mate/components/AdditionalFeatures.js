import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAdditionalFeatures } from '../data/destinationData';

const AdditionalFeatures = ({ destination, fromDate, toDate, duration, tripPurpose }) => {
  const features = getAdditionalFeatures(destination, tripPurpose);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>✨ Additional Features</Text>

      <View style={styles.card}>
        {/* Weather Forecast */}
        <Text style={styles.subTitle}>🌤️ Weather Forecast</Text>
        <View style={styles.weatherContainer}>
          <Text style={styles.weatherText}>{features.weather.description}</Text>
          <View style={styles.weatherDetails}>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherLabel}>Temperature:</Text>
              <Text style={styles.weatherValue}>{features.weather.temperature}</Text>
            </View>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherLabel}>Conditions:</Text>
              <Text style={styles.weatherValue}>{features.weather.conditions}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Packing Checklist */}
        <Text style={styles.subTitle}>🎒 Packing Checklist</Text>
        <View style={styles.packingList}>
          {features.packingList.map((item, index) => (
            <View key={index} style={styles.checklistItem}>
              <Text style={styles.checkboxEmpty}>☐</Text>
              <Text style={styles.checklistText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Transportation */}
        <Text style={styles.subTitle}>🚗 Transportation Options</Text>
        {features.transportation.map((option, index) => (
          <View key={index} style={styles.transportCard}>
            <Text style={styles.transportName}>{option.type}</Text>
            <Text style={styles.transportDesc}>{option.description}</Text>
            <Text style={styles.transportCost}>Cost: {option.cost}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Trip Cost Breakdown */}
        <Text style={styles.subTitle}>💵 Estimated Trip Cost Breakdown</Text>
        <View style={styles.costContainer}>
          {features.costBreakdown.map((cost, index) => (
            <View key={index} style={styles.costRow}>
              <Text style={styles.costLabel}>{cost.category}</Text>
              <Text style={styles.costValue}>{cost.amount}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Estimate:</Text>
            <Text style={styles.totalValue}>{features.totalEstimate}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Local Phrases */}
        <Text style={styles.subTitle}>💬 Useful Local Phrases</Text>
        <View style={styles.phrasesList}>
          {features.localPhrases.map((phrase, index) => (
            <View key={index} style={styles.phraseItem}>
              <Text style={styles.phraseEnglish}>{phrase.english}</Text>
              <Text style={styles.phraseLocal}>{phrase.local}</Text>
              {phrase.pronunciation && (
                <Text style={styles.pronunciation}>({phrase.pronunciation})</Text>
              )}
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
  divider: {
    height: 1,
    backgroundColor: '#E1E8ED',
    marginVertical: 20,
  },
  weatherContainer: {
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    padding: 15,
  },
  weatherText: {
    fontSize: 15,
    color: '#2C3E50',
    marginBottom: 12,
    lineHeight: 22,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherItem: {
    alignItems: 'center',
  },
  weatherLabel: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  packingList: {
    marginLeft: 5,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxEmpty: {
    fontSize: 18,
    color: '#4A90E2',
    marginRight: 10,
  },
  checklistText: {
    fontSize: 15,
    color: '#2C3E50',
  },
  transportCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  transportName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  transportDesc: {
    fontSize: 14,
    color: '#5D6D7E',
    marginBottom: 6,
  },
  transportCost: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '600',
  },
  costContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  costLabel: {
    fontSize: 15,
    color: '#5D6D7E',
  },
  costValue: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#4A90E2',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  phrasesList: {
    marginTop: 5,
  },
  phraseItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  phraseEnglish: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 4,
  },
  phraseLocal: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  pronunciation: {
    fontSize: 13,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
});

export default AdditionalFeatures;
