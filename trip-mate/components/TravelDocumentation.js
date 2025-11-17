import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { getTravelDocumentation } from '../data/destinationData';

const TravelDocumentation = ({ destination }) => {
  const docData = getTravelDocumentation(destination);

  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📄 Travel Documentation</Text>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Passport Required:</Text>
          <Text style={styles.value}>{docData.passportRequired ? 'Yes ✓' : 'No ✗'}</Text>
        </View>

        {docData.visaRequired && (
          <>
            <View style={styles.divider} />
            <Text style={styles.subTitle}>Visa Requirements</Text>
            <Text style={styles.description}>{docData.visaDetails}</Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Processing Time:</Text>
              <Text style={styles.value}>{docData.processingTime}</Text>
            </View>

            {docData.embassyLink && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => openLink(docData.embassyLink)}
              >
                <Text style={styles.linkText}>Visit Embassy Website 🔗</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {!docData.visaRequired && (
          <>
            <View style={styles.divider} />
            <Text style={styles.successText}>✓ No visa required for most visitors!</Text>
          </>
        )}
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
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#5D6D7E',
    lineHeight: 22,
    marginBottom: 12,
  },
  linkButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  successText: {
    fontSize: 16,
    color: '#27AE60',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TravelDocumentation;
