import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const HomeScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    fromDate: '',
    toDate: '',
    groupSize: '',
    tripPurpose: 'mixed'
  });

  const handleSubmit = () => {
    if (!formData.destination || !formData.duration || !formData.fromDate || !formData.toDate || !formData.groupSize) {
      alert('Please fill in all fields');
      return;
    }
    navigation.navigate('TripPlan', { tripData: formData });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Let's Plan Your Dream Trip!</Text>
          <Text style={styles.subtitle}>
            Fill in the details below and let us create the perfect itinerary for you.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>📍 Destination</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Paris, Tokyo, Bali"
              value={formData.destination}
              onChangeText={(text) => setFormData({ ...formData, destination: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>📅 Trip Duration (days)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 7"
              keyboardType="numeric"
              value={formData.duration}
              onChangeText={(text) => setFormData({ ...formData, duration: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>🛫 From Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (e.g., 2024-12-15)"
              value={formData.fromDate}
              onChangeText={(text) => setFormData({ ...formData, fromDate: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>🛬 To Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (e.g., 2024-12-22)"
              value={formData.toDate}
              onChangeText={(text) => setFormData({ ...formData, toDate: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>👥 Group Size</Text>
            <TextInput
              style={styles.input}
              placeholder="How many people?"
              keyboardType="numeric"
              value={formData.groupSize}
              onChangeText={(text) => setFormData({ ...formData, groupSize: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>🎯 Trip Purpose</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.tripPurpose}
                onValueChange={(itemValue) =>
                  setFormData({ ...formData, tripPurpose: itemValue })
                }
                style={styles.picker}
              >
                <Picker.Item
                  label="Relaxation & Peace"
                  value="relaxation"
                />
                <Picker.Item
                  label="Adventure & Exploration"
                  value="adventure"
                />
                <Picker.Item
                  label="Food & Culture"
                  value="food"
                />
                <Picker.Item
                  label="Mixed (combination)"
                  value="mixed"
                />
              </Picker>
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Create My Trip Plan 🚀</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#2C3E50',
  },
  pickerContainer: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
