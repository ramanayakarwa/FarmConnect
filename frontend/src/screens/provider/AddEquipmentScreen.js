import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import equipmentService from '../../services/equipmentService';

export default function AddEquipmentScreen({ route, navigation }) {
  const { t } = useTranslation();

  const { mode, equipment: editItem } =
    route.params || { mode: 'add' };

  const categories = [
    'Tractor',
    'Rotavator',
    'Seed Drill',
    'Boom Sprayer',
  ];

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'Tractor':
        return t('tractor');
      case 'Rotavator':
        return t('rotavator');
      case 'Seed Drill':
        return t('seedDrill');
      case 'Boom Sprayer':
        return t('boomSprayer');
      default:
        return category;
    }
  };

  const [name, setName] = useState(editItem?.name || '');

  const [category, setCategory] = useState(
    editItem?.category || categories[0]
  );

  const [description, setDescription] = useState(
    editItem?.description || ''
  );

  const [price, setPrice] = useState(
    editItem?.price
      ? editItem.price.toString()
      : ''
  );

  const [location, setLocation] = useState(
    editItem?.location || 'Pune, Maharashtra'
  );

  const [image, setImage] = useState(
    editItem?.image ||
      'https://images.unsplash.com/photo-1605338803939-52a14d0c8bca?w=400'
  );

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (
      !name.trim() ||
      !description.trim() ||
      !price.trim() ||
      !location.trim()
    ) {
      Alert.alert(
        t('error'),
        t('pleaseFillAllDetails')
      );
      return;
    }

    const priceVal = parseFloat(price);

    if (isNaN(priceVal) || priceVal <= 0) {
      Alert.alert(
        t('error'),
        t('validPrice')
      );
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'add') {
        const newItem = {
          name: name.trim(),
          category,
          description: description.trim(),
          image,
          price: priceVal,
          location: location.trim(),
          availability: true,
          specifications: {
            category,
            condition: 'Excellent',
            year: 2023,
          },
        };

        await equipmentService.createEquipment(newItem);

        Alert.alert(
          t('success'),
          t('equipmentAddedSuccess'),
          [
            {
              text: t('ok'),
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        const updatedItem = {
          name: name.trim(),
          category,
          description: description.trim(),
          image,
          price: priceVal,
          location: location.trim(),
        };

        await equipmentService.updateEquipment(
          editItem.id,
          updatedItem
        );

        Alert.alert(
          t('success'),
          t('equipmentUpdatedSuccess'),
          [
            {
              text: t('ok'),
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (err) {
      Alert.alert(
        t('error'),
        err?.message ||
          (mode === 'add'
            ? t('failedToAddEquipment')
            : t('failedToUpdateEquipment'))
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#1B1B1B"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {mode === 'add'
              ? t('addEquipment')
              : t('editEquipment')}
          </Text>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* IMAGE */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {t('equipmentImage')}
            </Text>

            {image ? (
              <Image
                source={{ uri: image }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="image-outline"
                  size={48}
                  color="#8D6E63"
                />

                <Text style={styles.placeholderText}>
                  {t('previewWillAppear')}
                </Text>
              </View>
            )}

            <View style={styles.inputBox}>
              <Ionicons
                name="link-outline"
                size={18}
                color="#8D6E63"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                value={image}
                onChangeText={setImage}
                placeholder={t('pasteImageUrl')}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* DETAILS */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {t('details')}
            </Text>

            {/* NAME */}
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('equipmentName')}
              </Text>

              <View style={styles.inputBox}>
                <Ionicons
                  name="pricetag-outline"
                  size={18}
                  color="#8D6E63"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('equipmentNamePlaceholder')}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* CATEGORY */}
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('category')}
              </Text>

              <View style={styles.catRow}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catChip,
                      category === cat &&
                        styles.catChipActive,
                    ]}
                    onPress={() =>
                      setCategory(cat)
                    }
                  >
                    <Text
                      style={[
                        styles.catText,
                        category === cat &&
                          styles.catTextActive,
                      ]}
                    >
                      {getCategoryLabel(cat)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* PRICE */}
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('rentalPrice')}
              </Text>

              <View style={styles.inputBox}>
                <Ionicons
                  name="cash-outline"
                  size={18}
                  color="#8D6E63"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder={t('pricePlaceholder')}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* LOCATION */}
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('location')}
              </Text>

              <View style={styles.inputBox}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color="#8D6E63"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder={t('locationPlaceholder')}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* DESCRIPTION */}
            <View style={styles.field}>
              <Text style={styles.label}>
                {t('description')}
              </Text>

              <TextInput
                style={[
                  styles.inputBox,
                  styles.textArea,
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder={t('descriptionPlaceholder')}
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </ScrollView>

        {/* FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              submitting &&
                styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator
                size="small"
                color="#fff"
              />
            ) : (
              <Text style={styles.submitText}>
                {mode === 'add'
                  ? t('addEquipmentToRent')
                  : t('saveChanges')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },

  backBtn: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B1B1B',
  },

  scroll: {
    padding: 16,
    paddingBottom: 100,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B1B1B',
    marginBottom: 12,
  },

  previewImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },

  imagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#F5F5DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },

  placeholderText: {
    fontSize: 13,
    color: '#8D6E63',
    fontWeight: '600',
    marginTop: 4,
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 10,
  },

  inputIcon: {
    marginRight: 6,
  },

  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1B1B1B',
  },

  field: {
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginBottom: 6,
  },

  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F5F5DC',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },

  catChipActive: {
    backgroundColor: '#2E7D32',
  },

  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },

  catTextActive: {
    color: '#fff',
  },

  textArea: {
    paddingVertical: 10,
    height: 100,
    textAlignVertical: 'top',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 10,
  },

  submitBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 4,
  },

  submitBtnDisabled: {
    opacity: 0.7,
  },

  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});