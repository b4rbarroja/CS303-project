import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { submitDonation, resetDonationSlice } from '../store/slices/donationSlice';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../shared/designTokens';

export default function DonateBookScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.donation);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [edition, setEdition] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (message) {
      Toast.show({ type: 'success', text1: 'Success', text2: message });
      dispatch(resetDonationSlice());
      navigation.goBack();
    }
    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error });
      dispatch(resetDonationSlice());
    }
  }, [message, error, dispatch, navigation]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setImagePreview(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!title || !author || !genre || !edition) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill all fields' });
      return;
    }

    if (!image) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please upload a book cover image' });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("genre", genre);
    formData.append("edition", edition);

    const localUri = image.uri;
    const filename = localUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;
    formData.append('image', { uri: localUri, name: filename, type });

    dispatch(submitDonation(formData));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <Text style={styles.headerIcon}>🎁</Text>
          <View>
            <Text style={styles.headerTitle}>Donate a Book</Text>
            <Text style={styles.headerSubtitle}>Share a book with the library community.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imagePreview ? (
            <Image source={{ uri: imagePreview }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderIcon}>📸</Text>
              <Text style={styles.placeholderText}>Tap to upload book cover</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter book title" placeholderTextColor={COLORS.text.tertiary} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Author</Text>
          <TextInput style={styles.input} value={author} onChangeText={setAuthor} placeholder="Enter author name" placeholderTextColor={COLORS.text.tertiary} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Genre</Text>
          <TextInput style={styles.input} value={genre} onChangeText={setGenre} placeholder="e.g. Science, Fiction, History" placeholderTextColor={COLORS.text.tertiary} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Edition</Text>
          <TextInput style={styles.input} value={edition} onChangeText={setEdition} placeholder="e.g. 1st, 2nd, 3rd" placeholderTextColor={COLORS.text.tertiary} />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            📋 Your donation will be reviewed by a library admin. If approved, the book will be added to the library catalog.
          </Text>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>🎁 Donate Book</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.xl,
    paddingTop: 50,
  },
  backBtn: { marginBottom: SPACING.lg },
  backText: { color: COLORS.brand.primary, fontWeight: 'bold', fontSize: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING['2xl'],
  },
  headerIcon: { fontSize: 36 },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.xl,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: COLORS.border.dark,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderContainer: { alignItems: 'center' },
  placeholderIcon: { fontSize: 40, marginBottom: 8 },
  placeholderText: { color: COLORS.text.tertiary, fontWeight: 'bold' },
  inputGroup: { marginBottom: SPACING.lg },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: 'bold',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
    marginLeft: 4,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: 14,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  infoBox: {
    backgroundColor: `${COLORS.brand.primary}10`,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: `${COLORS.brand.primary}25`,
  },
  infoText: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  submitBtn: {
    backgroundColor: COLORS.brand.primary,
    padding: 16,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    color: COLORS.text.onBrand,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
