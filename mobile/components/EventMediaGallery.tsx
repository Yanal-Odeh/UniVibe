import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Video } from 'expo-av';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.8:5000';

interface EventMediaGalleryProps {
  eventId: string;
  isClubLeader: boolean;
}

interface MediaItem {
  id: string;
  fileUrl: string;
  fileType: 'IMAGE' | 'VIDEO';
  fileName: string;
  fileSize: number;
  createdAt: string;
}

export default function EventMediaGallery({ eventId, isClubLeader }: EventMediaGalleryProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [showCarousel, setShowCarousel] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, [eventId]);

  const fetchMedia = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events/${eventId}/media`);
      const data = await response.json();
      setMedia(data.media || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      uploadMedia(result.assets);
    }
  };

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        multiple: true,
      });

      if (result.type === 'success') {
        uploadMedia([result]);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to select video');
    }
  };

  const uploadMedia = async (files: any[]) => {
    setUploading(true);
    try {
      const formData = new FormData();

      for (const file of files) {
        const uri = file.uri;
        const name = file.fileName || file.uri.split('/').pop();
        const type = file.mimeType || file.type || 'image/jpeg';

        formData.append('media', {
          uri,
          name,
          type,
        } as any);
      }

      const token = await getToken();
      const response = await fetch(`${API_URL}/api/events/${eventId}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      Alert.alert(
        'Success',
        `Uploaded ${data.media.length} file(s)${data.skipped > 0 ? `. ${data.skipped} skipped due to limits.` : ''}`
      );
      await fetchMedia();
    } catch (error: any) {
      console.error('Error uploading media:', error);
      Alert.alert('Error', error.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (mediaId: string) => {
    Alert.alert(
      'Delete Media',
      'Are you sure you want to delete this media?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              const response = await fetch(`${API_URL}/api/events/${eventId}/media/${mediaId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Delete failed');
              }

              await fetchMedia();
              setShowCarousel(false);
            } catch (error: any) {
              console.error('Error deleting media:', error);
              Alert.alert('Error', error.message || 'Failed to delete media');
            }
          },
        },
      ]
    );
  };

  const getToken = async () => {
    // Use AsyncStorage to get the token
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    return AsyncStorage.getItem('token');
  };

  const openCarousel = (index: number) => {
    setSelectedMediaIndex(index);
    setShowCarousel(true);
  };

  const closeCarousel = () => {
    setShowCarousel(false);
    setSelectedMediaIndex(null);
  };

  const nextSlide = () => {
    if (selectedMediaIndex !== null && media.length > 0) {
      setSelectedMediaIndex((selectedMediaIndex + 1) % media.length);
    }
  };

  const prevSlide = () => {
    if (selectedMediaIndex !== null && media.length > 0) {
      setSelectedMediaIndex((selectedMediaIndex - 1 + media.length) % media.length);
    }
  };

  const imageCount = media.filter(m => m.fileType === 'IMAGE').length;
  const videoCount = media.filter(m => m.fileType === 'VIDEO').length;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📷 Event Photos & Videos</Text>

      {/* Upload Section - Only for Club Leaders */}
      {isClubLeader && (
        <View style={styles.uploadSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Upload up to 20 photos (10MB each) and 5 videos (100MB each)
            </Text>
          </View>

          <View style={styles.uploadButtons}>
            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={pickImage}
              disabled={uploading}
            >
              <Text style={styles.uploadButtonText}>
                {uploading ? 'Uploading...' : '📷 Upload Photos'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.uploadButton, styles.uploadButtonVideo, uploading && styles.uploadButtonDisabled]}
              onPress={pickVideo}
              disabled={uploading}
            >
              <Text style={styles.uploadButtonText}>
                {uploading ? 'Uploading...' : '🎥 Upload Videos'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>📷 {imageCount}/20 photos</Text>
            <Text style={styles.statsText}>🎥 {videoCount}/5 videos</Text>
          </View>
        </View>
      )}

      {/* Media Grid */}
      {media.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📷</Text>
          <Text style={styles.emptyText}>No photos or videos yet</Text>
          {isClubLeader && (
            <Text style={styles.emptyHint}>Upload media to share memories!</Text>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.mediaGrid}>
          {media.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.mediaItem}
              onPress={() => openCarousel(index)}
            >
              {item.fileType === 'IMAGE' ? (
                <Image
                  source={{ uri: `${API_URL}${item.fileUrl}` }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.videoPlaceholder}>
                  <Text style={styles.videoIcon}>▶️</Text>
                  <Text style={styles.videoText}>Video</Text>
                </View>
              )}

              {isClubLeader && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteMedia(item.id)}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Carousel Modal */}
      {showCarousel && selectedMediaIndex !== null && media[selectedMediaIndex] && (
        <Modal
          visible={showCarousel}
          transparent={false}
          animationType="fade"
          onRequestClose={closeCarousel}
        >
          <View style={styles.carouselContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={closeCarousel}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.carouselContent}>
              {media[selectedMediaIndex].fileType === 'IMAGE' ? (
                <Image
                  source={{ uri: `${API_URL}${media[selectedMediaIndex].fileUrl}` }}
                  style={styles.carouselImage}
                  resizeMode="contain"
                />
              ) : (
                <Video
                  source={{ uri: `${API_URL}${media[selectedMediaIndex].fileUrl}` }}
                  style={styles.carouselVideo}
                  useNativeControls
                  resizeMode="contain"
                  shouldPlay
                />
              )}

              <View style={styles.carouselInfo}>
                <Text style={styles.carouselCounter}>
                  {selectedMediaIndex + 1} / {media.length}
                </Text>
                <Text style={styles.carouselFileName}>
                  {media[selectedMediaIndex].fileName}
                </Text>
              </View>
            </View>

            {media.length > 1 && (
              <>
                <TouchableOpacity style={[styles.navButton, styles.navButtonLeft]} onPress={prevSlide}>
                  <Text style={styles.navButtonText}>‹</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.navButton, styles.navButtonRight]} onPress={nextSlide}>
                  <Text style={styles.navButtonText}>›</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Modal>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');
const itemSize = (width - 48) / 3;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  uploadSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  infoBox: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#92400e',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonVideo: {
    backgroundColor: '#8b5cf6',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 14,
    color: '#6b7280',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaItem: {
    width: itemSize,
    height: itemSize,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  videoText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 6,
    padding: 4,
  },
  deleteIcon: {
    fontSize: 16,
  },
  carouselContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
  },
  carouselContent: {
    width: '100%',
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselVideo: {
    width: '100%',
    height: '100%',
  },
  carouselInfo: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  carouselCounter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  carouselFileName: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.7,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
  },
});
