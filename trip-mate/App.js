import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import TripPlanScreen from './screens/TripPlanScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4A90E2',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: '🌍 Trip Friend',
              headerShown: true
            }}
          />
          <Stack.Screen
            name="TripPlan"
            component={TripPlanScreen}
            options={{
              title: 'Your Trip Plan',
              headerShown: true
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
