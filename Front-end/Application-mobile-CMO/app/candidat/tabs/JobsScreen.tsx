import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MapPin, Clock, Euro, Heart, Briefcase, Filter } from 'lucide-react-native';

const jobs = [
  {
    id: 1,
    title: 'Ouvrier viticole (H/F)',
    reference: '#18293758',
    type: 'CDD',
    duration: '4 à 6 mois',
    region: 'Bourgogne-Franche-Comté',
    description:
      'Nous recrutons un ouvrier viticole pour les travaux de la vigne.',
    salary: 'SMIC horaire',
    isFavorite: false,
    category: 'Agriculture',
  },
  {
    id: 2,
    title: 'Tractoriste polyvalent (H/F)',
    reference: '#18293756',
    type: 'CDI',
    duration: 'Indéterminé',
    region: 'Occitanie',
    description:
      'Nous recrutons un tractoriste polyvalent en CDI.',
    salary: '2150€ - 2200€ brut',
    isFavorite: true,
    category: 'Agriculture',
  },
];

export default function JobsScreen() {
  const [jobList, setJobList] = useState(jobs);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const toggleFavorite = (id: number) => {
    setJobList(prev =>
      prev.map(job =>
        job.id === id ? { ...job, isFavorite: !job.isFavorite } : job
      )
    );
  };

  const filteredJobs =
    selectedCategory === 'Tous'
      ? jobList
      : jobList.filter(j => j.category === selectedCategory);

  return (
    <ScrollView style={styles.container}>

      {/* ❌ HEADER SUPPRIMÉ */}

      {/* SEARCH BAR */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Rechercher une offre..."
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* FILTER */}
      {showFilters && (
        <View style={styles.card}>
          <TouchableOpacity onPress={() => setSelectedCategory('Tous')}>
            <Text style={styles.filterText}>Tous</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setSelectedCategory('Agriculture')}>
            <Text style={styles.filterText}>Agriculture</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setSelectedCategory('Viticulture')}>
            <Text style={styles.filterText}>Viticulture</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* JOB LIST */}
      <View style={{ padding: 15, gap: 15 }}>
        {filteredJobs.map(job => (
          <View key={job.id} style={styles.jobCard}>

            {/* TOP */}
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <View style={styles.row}>
                  <Briefcase size={14} color="#1b2d5a" />
                  <Text style={styles.category}>{job.category}</Text>
                </View>

                <Text style={styles.title}>{job.title}</Text>
                <Text style={styles.ref}>Réf: {job.reference}</Text>
              </View>

              <TouchableOpacity onPress={() => toggleFavorite(job.id)}>
                <Heart
                  size={22}
                  color={job.isFavorite ? 'red' : '#999'}
                  fill={job.isFavorite ? 'red' : 'transparent'}
                />
              </TouchableOpacity>
            </View>

            {/* TAGS */}
            <View style={styles.tags}>
              <Text style={styles.tag}>{job.type}</Text>
              <Text style={styles.tag}>{job.duration}</Text>
              <Text style={styles.tag}>{job.region}</Text>
            </View>

            {/* DESCRIPTION */}
            <Text style={styles.desc}>{job.description}</Text>

            {/* FOOTER */}
            <View style={styles.rowBetween}>
              <View style={styles.row}>
                <Euro size={16} color="#2b5bbb" />
                <Text style={styles.salary}>{job.salary}</Text>
              </View>

              <TouchableOpacity style={styles.applyBtn}>
                <Text style={styles.applyText}>Postuler</Text>
              </TouchableOpacity>
            </View>

          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/* STYLE */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3ff',
  },

  searchBox: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },

  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 40,
  },

  filterBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#2b5bbb',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },

  filterText: {
    paddingVertical: 5,
    color: '#1b2d5a',
  },

  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  category: {
    fontSize: 12,
    color: '#666',
  },

  title: {
    fontSize: 15,
    color: '#1b2d5a',
    marginTop: 5,
  },

  ref: {
    fontSize: 11,
    color: '#999',
  },

  tags: {
    flexDirection: 'row',
    gap: 5,
    marginVertical: 8,
  },

  tag: {
    fontSize: 11,
    backgroundColor: '#eef3ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    color: '#2b5bbb',
  },

  desc: {
    fontSize: 12,
    color: '#555',
    marginBottom: 10,
  },

  salary: {
    color: '#2b5bbb',
    marginLeft: 5,
  },

  applyBtn: {
    backgroundColor: '#2b5bbb',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },

  applyText: {
    color: '#fff',
    fontSize: 12,
  },
});