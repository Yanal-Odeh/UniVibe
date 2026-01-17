import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File size limits
const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const VIDEO_MAX_SIZE = 100 * 1024 * 1024; // 100MB

// File count limits
const MAX_IMAGES = 20;
const MAX_VIDEOS = 5;

/**
 * Upload media files for an event
 * POST /api/events/:id/media
 */
export const uploadEventMedia = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user.id; // Changed from req.user.userId to req.user.id

    console.log('=== UPLOAD MEDIA DEBUG ===');
    console.log('User ID from token:', userId);
    console.log('Event ID:', eventId);

    // Verify event exists and get community info
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        id: true, 
        createdBy: true, 
        status: true,
        communityId: true,
        community: {
          select: {
            clubLeaderId: true
          }
        }
      }
    });

    console.log('Event found:', event);
    console.log('Club Leader ID:', event?.community?.clubLeaderId);
    console.log('User ID:', userId);
    console.log('Match?', event?.community?.clubLeaderId === userId);

    if (!event) {
      // Delete uploaded files if event doesn't exist
      if (req.files) {
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify user is the club leader of the community that owns this event
    const isClubLeader = event.community?.clubLeaderId === userId;
    if (!isClubLeader) {
      // Delete uploaded files if user is not authorized
      if (req.files) {
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
      return res.status(403).json({ error: 'Only the club leader of this event\'s community can upload media' });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Get current media count for this event
    const currentMedia = await prisma.eventMedia.groupBy({
      by: ['fileType'],
      where: { eventId },
      _count: true
    });

    const currentImageCount = currentMedia.find(m => m.fileType === 'IMAGE')?._count || 0;
    const currentVideoCount = currentMedia.find(m => m.fileType === 'VIDEO')?._count || 0;

    // Validate and process uploaded files
    const mediaToCreate = [];
    const filesToDelete = [];

    for (const file of req.files) {
      const isImage = file.mimetype.startsWith('image/');
      const isVideo = file.mimetype.startsWith('video/');

      // Validate file size
      if (isImage && file.size > IMAGE_MAX_SIZE) {
        filesToDelete.push(file.path);
        continue; // Skip this file
      }
      if (isVideo && file.size > VIDEO_MAX_SIZE) {
        filesToDelete.push(file.path);
        continue; // Skip this file
      }

      // Check file count limits
      const newImageCount = mediaToCreate.filter(m => m.fileType === 'IMAGE').length;
      const newVideoCount = mediaToCreate.filter(m => m.fileType === 'VIDEO').length;

      if (isImage && (currentImageCount + newImageCount >= MAX_IMAGES)) {
        filesToDelete.push(file.path);
        continue; // Skip this file
      }
      if (isVideo && (currentVideoCount + newVideoCount >= MAX_VIDEOS)) {
        filesToDelete.push(file.path);
        continue; // Skip this file
      }

      // Add to creation list
      mediaToCreate.push({
        eventId,
        fileUrl: `/uploads/event-media/${file.filename}`,
        fileType: isImage ? 'IMAGE' : 'VIDEO',
        fileName: file.originalname,
        fileSize: file.size,
        uploadedBy: userId
      });
    }

    // Delete files that exceeded limits
    filesToDelete.forEach(filePath => {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    });

    // Create database records
    if (mediaToCreate.length === 0) {
      return res.status(400).json({ 
        error: 'No valid files to upload. Files may exceed size limits or event has reached maximum media count.',
        limits: {
          maxImages: MAX_IMAGES,
          maxVideos: MAX_VIDEOS,
          imageSizeLimit: '10MB',
          videoSizeLimit: '100MB'
        }
      });
    }

    const createdMedia = await prisma.$transaction(
      mediaToCreate.map(media => prisma.eventMedia.create({ data: media }))
    );

    res.status(201).json({
      message: `Successfully uploaded ${createdMedia.length} file(s)`,
      media: createdMedia,
      skipped: filesToDelete.length
    });

  } catch (error) {
    console.error('Error uploading media:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      });
    }

    res.status(500).json({ error: 'Failed to upload media' });
  }
};

/**
 * Get all media for an event
 * GET /api/events/:id/media
 */
export const getEventMedia = async (req, res) => {
  try {
    const { id: eventId } = req.params;

    const media = await prisma.eventMedia.findMany({
      where: { eventId },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ media });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
};

/**
 * Delete media file
 * DELETE /api/events/:id/media/:mediaId
 */
export const deleteEventMedia = async (req, res) => {
  try {
    const { id: eventId, mediaId } = req.params;
    const userId = req.user.id; // Changed from req.user.userId to req.user.id

    // Get media record with event and community info
    const media = await prisma.eventMedia.findUnique({
      where: { id: mediaId },
      include: {
        event: {
          select: { 
            createdBy: true,
            community: {
              select: {
                clubLeaderId: true
              }
            }
          }
        }
      }
    });

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    if (media.eventId !== eventId) {
      return res.status(400).json({ error: 'Media does not belong to this event' });
    }

    // Verify user is the club leader of the community that owns this event
    const isClubLeader = media.event.community?.clubLeaderId === userId;
    if (!isClubLeader) {
      return res.status(403).json({ error: 'Only the club leader of this event\'s community can delete media' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', media.fileUrl);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
    }

    // Delete database record
    await prisma.eventMedia.delete({
      where: { id: mediaId }
    });

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
};
