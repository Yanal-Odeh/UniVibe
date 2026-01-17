import React, { useState, useEffect } from 'react';
import { Upload, X, ChevronLeft, ChevronRight, Image, Video, Trash2, AlertCircle } from 'lucide-react';
import styles from './EventMediaGallery.module.scss';
import api from '../../lib/api';

function EventMediaGallery({ eventId, isClubLeader, currentUser }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCarousel, setShowCarousel] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchMedia();
  }, [eventId]);

  const fetchMedia = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}/media`);
      const data = await response.json();
      setMedia(data.media || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('media', file);
    });

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      alert(`Successfully uploaded ${data.media.length} file(s)${data.skipped > 0 ? `. ${data.skipped} file(s) were skipped due to size or count limits.` : ''}`);
      setSelectedFiles([]);
      await fetchMedia();
    } catch (error) {
      console.error('Error uploading media:', error);
      alert(error.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}/media/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Delete failed');
      }

      await fetchMedia();
    } catch (error) {
      console.error('Error deleting media:', error);
      alert(error.message || 'Failed to delete media');
    }
  };

  const openCarousel = (index) => {
    setCurrentIndex(index);
    setShowCarousel(true);
  };

  const closeCarousel = () => {
    setShowCarousel(false);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const imageCount = media.filter(m => m.fileType === 'IMAGE').length;
  const videoCount = media.filter(m => m.fileType === 'VIDEO').length;

  if (loading) {
    return <div className={styles.loading}>Loading media...</div>;
  }

  return (
    <div className={styles.mediaGallery}>
      <h2 className={styles.title}>
        <Image size={24} />
        Event Photos & Videos
      </h2>

      {/* Upload Section - Only for Club Leaders */}
      {isClubLeader && (
        <div className={styles.uploadSection}>
          <div className={styles.uploadInfo}>
            <AlertCircle size={16} />
            <span>
              Upload up to 20 photos (10MB each) and 5 videos (100MB each). 
              Supported formats: JPG, PNG, GIF, WebP, MP4, MOV, AVI, WebM
            </span>
          </div>
          
          <div className={styles.uploadControls}>
            <input
              type="file"
              id="media-upload"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/x-msvideo,video/webm"
              onChange={handleFileSelect}
              className={styles.fileInput}
            />
            <label htmlFor="media-upload" className={styles.fileLabel}>
              <Upload size={20} />
              Choose Files
            </label>
            
            {selectedFiles.length > 0 && (
              <div className={styles.selectedFiles}>
                <span>{selectedFiles.length} file(s) selected</span>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={styles.uploadButton}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  onClick={() => setSelectedFiles([])}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className={styles.mediaStats}>
            <span>📷 {imageCount}/20 photos</span>
            <span>🎥 {videoCount}/5 videos</span>
          </div>
        </div>
      )}

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className={styles.emptyState}>
          <Image size={48} />
          <p>No photos or videos yet</p>
          {isClubLeader && <p className={styles.hint}>Upload media to share memories from this event!</p>}
        </div>
      ) : (
        <div className={styles.mediaGrid}>
          {media.map((item, index) => (
            <div key={item.id} className={styles.mediaItem}>
              {item.fileType === 'IMAGE' ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.fileUrl}`}
                  alt={item.fileName}
                  onClick={() => openCarousel(index)}
                  className={styles.thumbnail}
                />
              ) : (
                <div className={styles.videoThumbnail} onClick={() => openCarousel(index)}>
                  <Video size={48} />
                  <span>Click to play</span>
                </div>
              )}
              
              {isClubLeader && (
                <button
                  onClick={() => handleDelete(item.id)}
                  className={styles.deleteButton}
                  title="Delete media"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Carousel Modal */}
      {showCarousel && media.length > 0 && (
        <div className={styles.carouselModal} onClick={closeCarousel}>
          <button className={styles.closeButton} onClick={closeCarousel}>
            <X size={32} />
          </button>
          
          <button className={styles.navButton} style={{ left: '20px' }} onClick={(e) => { e.stopPropagation(); prevSlide(); }}>
            <ChevronLeft size={32} />
          </button>

          <div className={styles.carouselContent} onClick={(e) => e.stopPropagation()}>
            {media[currentIndex].fileType === 'IMAGE' ? (
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${media[currentIndex].fileUrl}`}
                alt={media[currentIndex].fileName}
                className={styles.carouselImage}
              />
            ) : (
              <video
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${media[currentIndex].fileUrl}`}
                controls
                className={styles.carouselVideo}
              />
            )}
            <div className={styles.carouselInfo}>
              <span>{currentIndex + 1} / {media.length}</span>
              <span className={styles.fileName}>{media[currentIndex].fileName}</span>
            </div>
          </div>

          <button className={styles.navButton} style={{ right: '20px' }} onClick={(e) => { e.stopPropagation(); nextSlide(); }}>
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </div>
  );
}

export default EventMediaGallery;
