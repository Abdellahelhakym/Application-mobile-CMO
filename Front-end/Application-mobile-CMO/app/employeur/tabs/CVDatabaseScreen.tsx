import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const profiles = [
  { id: 1, name: 'YOUSFI', status: 'Vide !', mobility: '', availability: 'Oui' },
  { id: 2, name: 'Mohammed', status: 'Vide !', mobility: '', availability: 'Oui' },
  { id: 3, name: 'Youssef', status: 'Vide !', mobility: '', availability: 'Oui' }
];

export default function CVDatabaseScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >


      {/* FILTER BUTTON */}
      <View style={styles.center}>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="filter-outline" size={16} color="#fff" />
          <Text style={styles.filterText}> Filtre</Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      {profiles.map((profile) => (
        <View key={profile.id} style={styles.card}>

          <View style={styles.row}>
            <View style={styles.avatarLarge}>
              <Ionicons name="person-outline" size={30} color="#2b5bbb" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.status}>{profile.status}</Text>

              <Text style={styles.info}>
                Mobilite : {profile.mobility || ''}
              </Text>

              <Text style={styles.info}>
                Disponibilite : {profile.availability}
              </Text>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Jamais travaille chez vous
            </Text>

            <TouchableOpacity style={styles.cvBtn}>
              <Text style={styles.cvText}>Le CV </Text>
              <Ionicons name="eye-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

        </View>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff'
  },

  content: {
    paddingBottom: 120
  },

  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 20
  },

  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b2d5a'
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },

  outlineBtn: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#cfd9ee',
    padding: 8,
    borderRadius: 20,
    marginRight: 10
  },

  btnText: {
    marginLeft: 5
  },

  center: {
    alignItems: 'center',
    marginVertical: 10
  },

  filterBtn: {
    flexDirection: 'row',
    backgroundColor: '#2b5bbb',
    padding: 10,
    borderRadius: 20
  },

  filterText: {
    color: '#fff',
    marginLeft: 5
  },

  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#e7eeff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b2d5a'
  },

  status: {
    fontSize: 13,
    color: '#7a8ab8',
    fontStyle: 'italic'
  },

  info: {
    marginTop: 5,
    fontSize: 14,
    color: '#1b2d5a'
  },

  footer: {
    marginTop: 15,
    backgroundColor: '#fff1dc',
    padding: 10,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  footerText: {
    color: '#b87400',
    fontSize: 13
  },

  cvBtn: {
    flexDirection: 'row',
    backgroundColor: '#2b5bbb',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center'
  },

  cvText: {
    color: '#fff'
  }
});