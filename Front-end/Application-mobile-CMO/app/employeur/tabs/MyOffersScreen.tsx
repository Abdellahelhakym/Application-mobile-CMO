import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { Phone, MessageSquare, ChevronDown } from 'lucide-react-native';

export default function MyOffersScreen() {
  const [activeTab, setActiveTab] =
    useState<'commands' | 'quotes' | 'archive'>('commands');

  const tableTitle =
    activeTab === 'commands'
      ? 'N° Commande'
      : activeTab === 'quotes'
      ? 'N° Devis'
      : 'Archive';

  return (
    <View style={styles.container}>
      {/* ✅ SCROLL FIXÉ */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* CARD INFO */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.logo}>
              <Text style={{ fontSize: 10, color: '#2b5bbb' }}>Logo</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.company}>test</Text>
              <Text style={styles.sub}>Pack DEVIS PERSONNALISE</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnOutline}>
              <Phone size={16} color="#2b5bbb" />
              <Text style={styles.btnText}>Conseiller</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnOutline}>
              <MessageSquare size={16} color="#2b5bbb" />
              <Text style={styles.btnText}>Chat</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Bienvenue sur votre page Commandes & Devis...
            </Text>
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          {['commands', 'quotes', 'archive'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              style={[
                styles.tab,
                activeTab === tab && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab === 'commands'
                  ? 'COMMANDES'
                  : tab === 'quotes'
                  ? 'DEVIS'
                  : 'ARCHIVE'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TABLE */}
        <View style={styles.tableCard}>

          <View style={styles.tableControls}>
            <Text style={styles.smallText}>Show</Text>

            <View style={styles.select}>
              <Text>10</Text>
              <ChevronDown size={16} />
            </View>

            <Text style={styles.smallText}>entries</Text>
          </View>

          <View style={styles.searchRow}>
            <Text style={styles.smallText}>Search:</Text>
            <TextInput style={styles.input} />
          </View>

          <View style={styles.tableHeader}>
            <Text style={styles.th}>{tableTitle}</Text>
            <Text style={styles.th}>Poste</Text>
            <Text style={styles.th}>Contrat</Text>
            <Text style={styles.th}>Details</Text>
            <Text style={styles.th}>Statut</Text>
          </View>

          <Text style={styles.empty}>
            Showing 0 to 0 of 0 entries
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff',
  },

  content: {
    padding: 15,
    paddingBottom: 120, // ✅ IMPORTANT pour scroll
    gap: 15,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f6f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  company: {
    fontSize: 16,
    color: '#1b2d5a',
  },

  sub: {
    fontSize: 12,
    color: '#7a8ab8',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  btnOutline: {
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: '#cfd9ee',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
  },

  btnText: {
    color: '#2b5bbb',
    fontSize: 12,
  },

  infoBox: {
    marginTop: 10,
    backgroundColor: '#fff1dc',
    padding: 10,
    borderRadius: 12,
  },

  infoText: {
    fontSize: 12,
    color: '#1b2d5a',
  },

  tabs: {
    flexDirection: 'row',
    gap: 10,
  },

  tab: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e9fb',
    alignItems: 'center',
  },

  tabActive: {
    backgroundColor: '#ffe9cf',
    borderColor: '#f2d9bf',
  },

  tabText: {
    fontSize: 12,
    color: '#1b2d5a',
  },

  tabTextActive: {
    fontWeight: '600',
  },

  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
  },

  tableControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },

  smallText: {
    fontSize: 12,
    color: '#1b2d5a',
  },

  select: {
    flexDirection: 'row',
    gap: 5,
    borderWidth: 1,
    borderColor: '#cfd9ee',
    padding: 5,
    borderRadius: 10,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cfd9ee',
    borderRadius: 20,
    padding: 8,
    backgroundColor: '#fff',
  },

  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  th: {
    fontSize: 10,
    color: '#2b5bbb',
    flex: 1,
  },

  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#7a8ab8',
  },
});