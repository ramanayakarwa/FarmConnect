import React, { useRef, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import equipmentService from '../../services/equipmentService';
import { CATEGORIES } from '../../utils/categories';

export default function AddEquipmentScreen({
  route,
  navigation,
}) {
  const { t } = useTranslation();

  const editItem = route?.params?.equipment;
  const isEditing = route?.params?.mode === 'edit';

  const categories = CATEGORIES.filter(
    (item) => item !== 'All'
  );

  // Preserve an existing category even if it is not
  // included in the current category list.
  if (
    editItem?.category &&
    !categories.includes(editItem.category)
  ) {
    categories.push(editItem.category);
  }

  const [name, setName] = useState(
    editItem?.name || ''
  );

  const [category, setCategory] = useState(
    editItem?.category || categories[0]
  );

  const [description, setDescription] = useState(
    editItem?.description || ''
  );

  const [price, setPrice] = useState(
    editItem?.price != null
      ? String(editItem.price)
      : ''
  );

  const [pricingType, setPricingType] = useState(
    editItem?.pricing_type || 'per_day'
  );

  const [location, setLocation] = useState(
    editItem?.location || ''
  );

  const [image, setImage] = useState(
    editItem?.image || ''
  );

  const [submitting, setSubmitting] = useState(false);
  const submissionLock = useRef(false);

  const getCategoryLabel = (value) => {
    const translationKeys = {
      Tractor: 'tractor',
      Rotavator: 'rotavator',
      'Seed Drill': 'seedDrill',
      'Boom Sprayer': 'boomSprayer',
    };

    const key = translationKeys[value];

    return key
      ? t(key, { defaultValue: value })
      : value;
  };

  const handleSubmit = async () => {
    if (submissionLock.current) return;

    if (isEditing && !editItem?.id) {
      Alert.alert(
        'Unable to edit',
        'Equipment details are missing. Open the equipment again.'
      );
      return;
    }

    if (
      !name.trim() ||
      !description.trim() ||
      !price.trim() ||
      !location.trim()
    ) {
      Alert.alert(
        'Missing details',
        'Enter the equipment name, description, rental rate and location.'
      );
      return;
    }

    const numericPrice = Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0 ||
      numericPrice >= 100000000
    ) {
      Alert.alert(
        'Invalid rate',
        'Enter a positive rental rate below ₹100,000,000.'
      );
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(price.trim())) {
      Alert.alert(
        'Invalid rate',
        'Enter a number with no more than two decimal places.'
      );
      return;
    }

    if (
      !['per_acre', 'per_day'].includes(pricingType)
    ) {
      Alert.alert(
        'Choose pricing',
        'Select Per Acre or Per Day.'
      );
      return;
    }

    if (!categories.includes(category)) {
      Alert.alert(
        'Choose a category',
        'Select an equipment category.'
      );
      return;
    }

    submissionLock.current = true;
    setSubmitting(true);

    try {
      const equipmentData = {
        name: name.trim(),
        category,
        description: description.trim(),
        price: numericPrice,
        pricing_type: pricingType,
        location: location.trim(),
        image: image.trim(),
      };

      if (isEditing) {
        // Do not change availability while editing details.
        await equipmentService.updateEquipment(
          editItem.id,
          equipmentData
        );
      } else {
        await equipmentService.createEquipment({
          ...equipmentData,
          availability: true,
        });
      }

      Alert.alert(
        'Success',
        isEditing
          ? 'Equipment updated successfully.'
          : 'Equipment added successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
        { cancelable: false }
      );

      // Keep submission locked after success until leaving.
    } catch (error) {
      Alert.alert(
        'Unable to save',
        error.response?.data?.message ||
          error.message ||
          'Please try again.'
      );

      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios' ? 'padding' : 'height'
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={submitting}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#1B1B1B"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {isEditing
              ? t('editEquipment', {
                  defaultValue: 'Edit Equipment',
                })
              : t('addEquipment', {
                  defaultValue: 'Add Equipment',
                })}
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Equipment details
            </Text>

            <Text style={styles.label}>
              Equipment name
            </Text>

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Example: Mahindra 475 DI Tractor"
              placeholderTextColor="#888"
              maxLength={100}
              editable={!submitting}
            />

            <Text style={styles.label}>
              Category
            </Text>

            <View style={styles.categoryList}>
              {categories.map((item) => {
                const selected = category === item;

                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setCategory(item)}
                    disabled={submitting}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[
                      styles.categoryButton,
                      selected &&
                        styles.categoryButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected &&
                          styles.categoryTextSelected,
                      ]}
                    >
                      {getCategoryLabel(item)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>
              Description
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.descriptionInput,
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the equipment and what the rental includes."
              placeholderTextColor="#888"
              multiline
              textAlignVertical="top"
              maxLength={2000}
              editable={!submitting}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Rental pricing
            </Text>

            <Text style={styles.hint}>
              Choose how farmers will be charged.
            </Text>

            <View style={styles.pricingRow}>
              {[
                {
                  value: 'per_acre',
                  label: 'Per Acre',
                  icon: 'leaf-outline',
                },
                {
                  value: 'per_day',
                  label: 'Per Day',
                  icon: 'calendar-outline',
                },
              ].map((option) => {
                const selected =
                  pricingType === option.value;

                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() =>
                      setPricingType(option.value)
                    }
                    disabled={submitting}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[
                      styles.pricingButton,
                      selected &&
                        styles.pricingButtonSelected,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={
                        selected ? '#FFFFFF' : '#2E7D32'
                      }
                    />

                    <Text
                      style={[
                        styles.pricingText,
                        selected &&
                          styles.pricingTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>
              {pricingType === 'per_acre'
                ? 'Rental rate per acre (₹)'
                : 'Rental rate per day (₹)'}
            </Text>

            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="Example: 1500"
              placeholderTextColor="#888"
              keyboardType="decimal-pad"
              maxLength={11}
              editable={!submitting}
            />

            <Text style={styles.hint}>
              {pricingType === 'per_acre'
                ? 'Total = rate × acres. Example: ₹1,500 × 3 acres = ₹4,500.'
                : 'Total = rate × booking days. Example: ₹1,500 × 2 days = ₹3,000.'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Location and image
            </Text>

            <Text style={styles.label}>
              Equipment location
            </Text>

            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Village / city, district"
              placeholderTextColor="#888"
              maxLength={100}
              editable={!submitting}
            />

            <Text style={styles.label}>
              Image URL (optional)
            </Text>

            <TextInput
              style={styles.input}
              value={image}
              onChangeText={setImage}
              placeholder="https://example.com/equipment.jpg"
              placeholderTextColor="#888"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              maxLength={500}
              editable={!submitting}
            />

            <Text style={styles.hint}>
              {isEditing
                ? 'Editing these details keeps the current availability setting.'
                : 'New equipment will be available for booking. You can change availability from Equipment Management.'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              submitting && styles.disabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={22}
                  color="#FFFFFF"
                />

                <Text style={styles.saveButtonText}>
                  {isEditing
                    ? 'Save Changes'
                    : 'Add Equipment'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safe: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerSpacer: {
    width: 40,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#1B1B1B',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 10,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1B1B1B',
    marginBottom: 8,
  },

  descriptionInput: {
    minHeight: 100,
  },

  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },

  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },

  categoryButtonSelected: {
    backgroundColor: '#2E7D32',
  },

  categoryText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '600',
  },

  categoryTextSelected: {
    color: '#FFFFFF',
  },

  pricingRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },

  pricingButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  pricingButtonSelected: {
    backgroundColor: '#2E7D32',
  },

  pricingText: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },

  pricingTextSelected: {
    color: '#FFFFFF',
  },

  hint: {
    fontSize: 13,
    lineHeight: 20,
    color: '#666666',
    marginBottom: 6,
  },

  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  disabled: {
    opacity: 0.6,
  },
});