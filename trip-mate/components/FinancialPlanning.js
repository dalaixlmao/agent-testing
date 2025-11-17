import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getFinancialInfo } from '../data/destinationData';

const FinancialPlanning = ({ destination, duration, groupSize }) => {
  const financialInfo = getFinancialInfo(destination);
  const totalBudget = financialInfo.dailyBudget * duration * groupSize;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>💰 Financial Planning</Text>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Local Currency:</Text>
          <Text style={styles.value}>{financialInfo.currency}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.subTitle}>Currency Exchange</Text>
        <View style={styles.exchangeList}>
          {financialInfo.exchangePlaces.map((place, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{place}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={styles.subTitle}>Budget Estimate</Text>
        <View style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>Daily Budget (per person):</Text>
          <Text style={styles.budgetValue}>{financialInfo.currencySymbol}{financialInfo.dailyBudget}</Text>
        </View>
        <View style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>Total Trip Cost:</Text>
          <Text style={styles.budgetValueTotal}>{financialInfo.currencySymbol}{totalBudget.toLocaleString()}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.subTitle}>💡 Conversion Tips</Text>
        <View style={styles.exchangeList}>
          {financialInfo.conversionTips.map((tip, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{tip}</Text>
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E1E8ED',
    marginVertical: 15,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  exchangeList: {
    marginLeft: 5,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#4A90E2',
    marginRight: 8,
    fontWeight: 'bold',
  },
  bulletText: {
    fontSize: 15,
    color: '#5D6D7E',
    flex: 1,
    lineHeight: 22,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetLabel: {
    fontSize: 15,
    color: '#7F8C8D',
  },
  budgetValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  budgetValueTotal: {
    fontSize: 18,
    color: '#27AE60',
    fontWeight: 'bold',
  },
});

export default FinancialPlanning;
