import { Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from './api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

/**
 * Request photo library permissions, then open the picker.
 * Returns the picked ImagePickerAsset, or null if cancelled/denied.
 */
export async function pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow access to your photo library to upload photos.',
      );
      return null;
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.75,
    allowsEditing: false,
    allowsMultipleSelection: false,
  });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0];
}

/**
 * Upload an ImagePickerAsset to the room-service and return the
 * publicly accessible URL.
 */
export async function uploadImageAsset(
  asset: ImagePicker.ImagePickerAsset,
): Promise<string> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    // On web, asset.uri is a local object URL or data URL — fetch → blob
    const fetchResponse = await fetch(asset.uri);
    const blob = await fetchResponse.blob();
    const ext = (asset.mimeType === 'image/png') ? '.png'
               : (asset.mimeType === 'image/webp') ? '.webp'
               : '.jpg';
    formData.append('file', blob, `photo_${Date.now()}${ext}`);
  } else {
    // On native, uri is a local file path
    const filename = asset.uri.split('/').pop() ?? `photo_${Date.now()}.jpg`;
    const type = asset.mimeType ?? 'image/jpeg';
    // React Native FormData accepts this object shape
    formData.append('file', { uri: asset.uri, name: filename, type } as any);
  }

  formData.append('baseUrl', BASE_URL);

  const { url } = await api.uploadImage(formData);
  return url;
}

/**
 * Convenience: pick + upload in one call.
 * Returns the final image URL, or null if the user cancelled.
 */
export async function pickAndUpload(): Promise<string | null> {
  const asset = await pickImage();
  if (!asset) return null;
  return uploadImageAsset(asset);
}
