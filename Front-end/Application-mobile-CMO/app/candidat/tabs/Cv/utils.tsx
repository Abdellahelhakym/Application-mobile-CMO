import { Check, Save } from 'lucide-react-native';
import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { C } from './colors';

// ─── Encoding/Decoding ────────────────────────────────────────────────────────

export const decodeHTML = (value: unknown): string => {
  if (value == null) return '';
  let str = String(value);

  try {
    if (/[ÃÂâ]/.test(str)) {
      const bytes = Uint8Array.from(
        Array.from(str, char => char.charCodeAt(0) & 0xff)
      );
      const decoded = new TextDecoder('utf-8').decode(bytes);
      if (!decoded.includes('\uFFFD')) str = decoded;
    }
  } catch (error) {
    console.log('Erreur décodage UTF-8:', error);
  }

  str = str.replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)));
  str = str.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));

  const htmlEntities: Record<string, string> = {
    '&eacute;': 'é', '&egrave;': 'è', '&ecirc;': 'ê', '&agrave;': 'à', '&acirc;': 'â',
    '&ocirc;': 'ô', '&ù': 'ù', '&ucirc;': 'û', '&ccedil;': 'ç', '&amp;': '&',
    '&quot;': '"', '&apos;': "'", '&#039;': "'", '&lt;': '<', '&gt;': '>',
    '&nbsp;': ' ', '&ensp;': ' ', '&emsp;': ' ',
  };
  
  Object.entries(htmlEntities).forEach(([entity, char]) => {
    str = str.split(entity).join(char);
  });

  return str;
};

export const encodeHTML = (str: string): string => {
  if (!str) return '';
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
    'é': '&eacute;', 'è': '&egrave;', 'ê': '&ecirc;', 'à': '&agrave;',
    'â': '&acirc;', 'ô': '&ocirc;', 'ù': '&ugrave;', 'û': '&ucirc;', 'ç': '&ccedil;',
  };
  return str.replace(/[&<>"'éèêàâôùûç]/g, (char) => map[char] || char);
};

export const encodeForSave = (value: string): string => encodeHTML(decodeHTML(value));

// ─── Reusable Components ──────────────────────────────────────────────────────

export const Label = ({ children }: { children: string }) => (
  <Text style={styles.label}>{children}</Text>
);

export const InputField = ({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  numberOfLines,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
}) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor="#9ca3af"
    keyboardType={keyboardType ?? 'default'}
    multiline={multiline}
    numberOfLines={numberOfLines}
    style={[styles.input, multiline ? styles.inputMultiline : undefined]}
  />
);

export const Card = ({ children, style }: { children: React.ReactNode; style?: object }) => (
  <View style={[styles.card, style]}>{children}</View>
);

export const SectionSaveButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <View style={styles.saveContainer}>
    <TouchableOpacity style={styles.saveBtn} onPress={onPress}>
      <Save size={18} color={C.white} />
      <Text style={styles.saveBtnText}>{label}</Text>
    </TouchableOpacity>
  </View>
);

export const SectionTitle = ({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: string;
}) => (
  <View style={styles.sectionTitleRow}>
    {icon != null ? <View style={styles.sectionTitleIcon}>{icon}</View> : null}
    <Text style={styles.sectionTitle}>{children}</Text>
  </View>
);

export const SelectPicker = ({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <View>
      <TouchableOpacity style={styles.selectBox} onPress={() => setOpen(!open)}>
        <Text style={value ? styles.selectText : styles.selectPlaceholder}>
          {value || 'Sélectionner'}
        </Text>
      </TouchableOpacity>
      {open ? (
        <View style={styles.dropdownList}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt || '__empty__'}
              style={styles.dropdownItem}
              onPress={() => { onChange(opt); setOpen(false); }}
            >
              <Text style={[styles.dropdownItemText, opt === value ? styles.dropdownItemActive : undefined]}>
                {opt || 'Sélectionner'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export const CheckItem = ({
  label,
  checked,
  onToggle,
  wide,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  wide?: boolean;
}) => (
  <TouchableOpacity
    onPress={onToggle}
    style={[
      styles.checkItem,
      wide ? styles.checkItemWide : undefined,
      checked ? styles.checkItemChecked : undefined,
    ]}
  >
    <View style={[styles.checkbox, checked ? styles.checkboxChecked : undefined]}>
      {checked ? <Check size={11} color={C.white} strokeWidth={3} /> : null}
    </View>
    <Text style={[styles.checkLabel, checked ? styles.checkLabelActive : undefined]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── Helper Functions ────────────────────────────────────────────────────────

export const buildVillePays = (city: string, country: string) => {
  if (city && country) return `${city}, ${country}`;
  return city || country || '';
};

export const toApiDate = (val: string) => {
  if (!val) return '';
  const [mm, dd, yy] = val.split('/');
  if (!mm || !dd || !yy) return val;
  const yearNum = Number(yy);
  const fullYear = yy.length === 4 ? yearNum : yearNum + 2000;
  return `${String(fullYear).padStart(4, '0')}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
};

export const toYearNumber = (val: string) => {
  if (!val) return null;
  const num = Number(val);
  return Number.isNaN(num) ? null : num;
};

export const toMdYy = (value: string | null | undefined) => {
  if (!value) return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  label: { fontSize: 13, color: C.gray700, marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: C.borderLight,
    backgroundColor: C.inputBg,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 14,
    color: C.navy,
  },
  inputMultiline: {
    borderRadius: 12,
    paddingTop: 12,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: C.navy, lineHeight: 20, flexShrink: 1 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitleIcon: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  selectBox: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.white,
  },
  selectText: { fontSize: 14, color: C.navy, flex: 1 },
  selectPlaceholder: { fontSize: 14, color: '#9ca3af', flex: 1 },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: C.white,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  dropdownItemText: { fontSize: 14, color: C.gray700 },
  dropdownItemActive: { color: C.blue, fontWeight: '600' },
  checkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: C.gray200,
    borderRadius: 8,
    minWidth: 72,
  },
  checkItemWide: { width: '100%' },
  checkItemChecked: { borderColor: C.blueDark, backgroundColor: '#eff6ff' },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: C.blueDark, borderColor: C.blueDark },
  checkLabel: { fontSize: 13, color: C.gray700, flex: 1 },
  checkLabelActive: { color: C.navy, fontWeight: '500' },
  saveContainer: { marginTop: 8, paddingBottom: 8 },
  saveBtn: {
    backgroundColor: C.blueDark,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveBtnText: { color: C.white, fontSize: 15, fontWeight: '600' },
});