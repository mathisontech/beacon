import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Change to your server IP for physical devices

export default function App() {
  const [location, setLocation] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [description, setDescription] = useState('');

  // Request location permissions and get current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to report fires.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      loadNearbyIncidents(currentLocation.coords);
    })();
  }, []);

  // Load nearby fire incidents
  const loadNearbyIncidents = async (coords) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/incidents?status=active`);
      setIncidents(response.data);
    } catch (error) {
      console.error('Error loading incidents:', error);
    }
  };

  // Submit fire report
  const submitReport = async () => {
    if (!location) {
      Alert.alert('Location Required', 'Please enable location services.');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/reports`, {
        latitude: location.latitude,
        longitude: location.longitude,
        incident_id: selectedIncident?.id,
        description: description || null
      });

      Alert.alert('Success', 'Thank you for your report! Fire department has been notified.');
      setDescription('');

      // Reload incidents
      loadNearbyIncidents(location);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
      console.error('Error submitting report:', error);
    }
  };

  // Load lightweight prediction for selected incident
  const loadPrediction = async (incidentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/predictions/mobile/${incidentId}?hours=6`);
      setPrediction(response.data);
    } catch (error) {
      console.error('Error loading prediction:', error);
    }
  };

  // Handle incident selection
  const handleIncidentPress = (incident) => {
    setSelectedIncident(incident);
    loadPrediction(incident.id);
  };

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>🔥 Wildfire Reporter</Text>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {/* User location */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude
          }}
          title="Your Location"
          pinColor="blue"
        />

        {/* Fire incidents */}
        {incidents.map(incident => (
          <Marker
            key={incident.id}
            coordinate={{
              latitude: incident.latitude,
              longitude: incident.longitude
            }}
            title={incident.name}
            description={`Status: ${incident.status} | Severity: ${incident.severity}/5`}
            pinColor="red"
            onPress={() => handleIncidentPress(incident)}
          />
        ))}

        {/* Prediction circle */}
        {prediction && (
          <Circle
            center={{
              latitude: prediction.center_lat,
              longitude: prediction.center_lon
            }}
            radius={prediction.spread_radius_meters}
            fillColor="rgba(255, 0, 0, 0.2)"
            strokeColor="rgba(255, 0, 0, 0.5)"
            strokeWidth={2}
          />
        )}
      </MapView>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        <ScrollView>
          {selectedIncident ? (
            <View style={styles.incidentInfo}>
              <Text style={styles.incidentName}>{selectedIncident.name}</Text>
              <Text style={styles.incidentDetail}>
                Status: {selectedIncident.status.toUpperCase()}
              </Text>
              <Text style={styles.incidentDetail}>
                Severity: {selectedIncident.severity}/5
              </Text>
              {prediction && (
                <Text style={styles.predictionText}>
                  Predicted spread: {Math.round(prediction.spread_radius_meters / 1000)} km radius in 6 hours
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.infoText}>
              Tap on a fire marker to see details
            </Text>
          )}

          {/* Report Form */}
          <View style={styles.reportSection}>
            <Text style={styles.sectionTitle}>Report Fire Sighting</Text>

            <TextInput
              style={styles.input}
              placeholder="Add description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.reportButton}
              onPress={submitReport}
            >
              <Text style={styles.reportButtonText}>📍 Submit Report at My Location</Text>
            </TouchableOpacity>

            <Text style={styles.locationText}>
              Your location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
          </View>

          {/* Active Incidents List */}
          <View style={styles.incidentsSection}>
            <Text style={styles.sectionTitle}>Active Fires Nearby</Text>
            {incidents.map(incident => (
              <TouchableOpacity
                key={incident.id}
                style={[
                  styles.incidentCard,
                  selectedIncident?.id === incident.id && styles.selectedCard
                ]}
                onPress={() => handleIncidentPress(incident)}
              >
                <Text style={styles.cardTitle}>{incident.name}</Text>
                <Text style={styles.cardText}>Severity: {incident.severity}/5</Text>
              </TouchableOpacity>
            ))}
            {incidents.length === 0 && (
              <Text style={styles.noIncidentsText}>No active fires nearby</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#d32f2f',
    padding: 15,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  bottomPanel: {
    height: 350,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    padding: 15,
  },
  incidentInfo: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  incidentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 5,
  },
  incidentDetail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  predictionText: {
    fontSize: 13,
    color: '#f57c00',
    marginTop: 5,
    fontStyle: 'italic',
  },
  infoText: {
    textAlign: 'center',
    color: '#999',
    padding: 10,
    fontStyle: 'italic',
  },
  reportSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  reportButton: {
    backgroundColor: '#d32f2f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  incidentsSection: {
    marginBottom: 20,
  },
  incidentCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 3,
  },
  cardText: {
    fontSize: 13,
    color: '#666',
  },
  noIncidentsText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 15,
  },
});
