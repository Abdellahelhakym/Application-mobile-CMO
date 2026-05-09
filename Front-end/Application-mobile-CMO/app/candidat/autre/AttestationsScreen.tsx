import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { Bell, User, Upload, Eye, Trash2 } from 'lucide-react-native';

const sections = [
  {
    title: 'Identite',
    items: ['CNI', 'Passeport', 'Carte de securite sociale', 'Titre de sejour'],
  },
  {
    title: 'Experiences professionnelles',
    items: ['Certificat de travail'],
  },
  {
    title: 'Formations & diplomes',
    items: [],
  },
  {
    title: 'Mobilite & logistique',
    items: ['Permis de conduire'],
  },
];

export default function AttestationsScreen() {
  return (
    <View style={styles.container}>

    

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.content}>

        {sections.map((section, index) => (
          <View key={index} style={styles.card}>

            <Text style={styles.sectionTitle}>
              {section.title}
            </Text>

            {section.items.length === 0 ? (
              <Text style={styles.empty}>
                Aucun document
              </Text>
            ) : (
              section.items.map((item, i) => (
                <View key={i} style={styles.itemRow}>

                  <Text style={styles.itemText}>
                    {item}
                  </Text>

                  <View style={styles.actions}>

                    <TouchableOpacity style={styles.uploadBtn}>
                      <Text style={styles.uploadText}>Importer</Text>
                      <Upload size={16} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconCircle}>
                      <Eye size={18} color="#2b5bbb" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconDanger}>
                      <Trash2 size={18} color="#b64a2f" />
                    </TouchableOpacity>

                  </View>
                </View>
              ))
            )}

          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff',
  },

  header: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e9fb',
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },

  iconBtn: {
    position: 'relative',
    padding: 8,
    borderRadius: 12,
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#f7b500',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e7eeff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 20,
    color: '#1b2d5a',
    marginTop: 10,
  },

  content: {
    padding: 15,
    gap: 15,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
  },

  sectionTitle: {
    fontSize: 16,
    color: '#1b2d5a',
    marginBottom: 10,
  },

  empty: {
    fontSize: 13,
    color: '#7a8ab8',
  },

  itemRow: {
    backgroundColor: '#f6f8ff',
    borderWidth: 1,
    borderColor: '#e1e9fb',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },

  itemText: {
    color: '#1b2d5a',
    marginBottom: 10,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  uploadBtn: {
    flexDirection: 'row',
    gap: 5,
    backgroundColor: '#2b5bbb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },

  uploadText: {
    color: '#fff',
    fontSize: 12,
  },

  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dfe8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconDanger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffd9c9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});