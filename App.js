import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';

const INITIAL_REGION = {
  latitude: -23.55552,
  longitude: -46.633088,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function App() {
  const [region, setRegion] = useState(INITIAL_REGION);
  const [marker, setMarker] = useState({ latitude: INITIAL_REGION.latitude, longitude: INITIAL_REGION.longitude });
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'my-maps-app/1.0' } });
      const data = await res.json();
      if (!data || data.length === 0) {
        setError('Local não encontrado');
      } else {
        const place = data[0];
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        const newRegion = { latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 };
        setRegion(newRegion);
        setMarker({ latitude: lat, longitude: lon });
        mapRef.current?.animateToRegion(newRegion, 800);
      }
    } catch (e) {
      setError('Erro ao buscar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#000000ff" translucent={false} />
      <View style={styles.header}>
        <Text style={styles.title}> Mapa</Text>
        <Text style={styles.subtitle}> poeira </Text>
      </View>

      <View style={styles.mapCard}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          onRegionChangeComplete={setRegion}
        >
          <Marker coordinate={marker} title={query || 'Local'} />
          <Circle center={marker} radius={600} fillColor="rgba(231,76,60,0.06)" strokeColor="rgba(231,76,60,0.2)" />
        </MapView>

        {/* Barra de busca no rodapé (mantendo o estilo existente) */}
        <View style={styles.bottomSearchBar}>
          <TextInput
            placeholder="Buscar local..."
            placeholderTextColor="#9aa4b2"
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchBtnText}>Buscar</Text>}
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#200f0fff', // fundo escuro suave
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9aa4b2',
    fontSize: 12,
    marginTop: 4,
  },
  mapCard: {
    width: '92%',
    height: '68%',
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#000', 
  },
  map: {
    flex: 1,
  },
  bottomSearchBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    backgroundColor: '#ffffffdd',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#111',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  searchBtn: {
    backgroundColor: '#83180cff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  footer: {
    marginTop: 14,
  },

});