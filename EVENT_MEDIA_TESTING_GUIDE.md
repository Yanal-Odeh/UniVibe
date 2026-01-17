# Event Media Upload Feature - Testing Guide

## 🎉 Feature Overview

Club leaders can now upload photos and videos to their approved events! Media is displayed in a beautiful carousel for all users to view.

## ✨ Key Features

- **Upload**: Club leaders can upload up to 20 photos and 5 videos
- **File Limits**: Images max 10MB, Videos max 100MB
- **Formats**: JPG, PNG, GIF, WebP, MP4, MOV, AVI, WebM
- **Display**: Beautiful carousel/slideshow for viewing
- **Delete**: Club leaders can remove media they uploaded
- **Visibility**: Anyone viewing event details can see the media

## 🚀 How to Test

### Prerequisites
1. Make sure server is running: `npm run dev` in `/server`
2. Make sure web client is running: `npm run dev` in root
3. Database should have the `event_media` table (migration already run)

### Test Scenario 1: Club Leader Upload (Web)

1. **Sign in as Club Leader**
   - Use a club leader account that has created an event
   
2. **Navigate to Event**
   - Go to an APPROVED event you created
   - Scroll down to "Event Photos & Videos" section
   
3. **Upload Photos**
   - Click "Choose Files" button
   - Select 1-3 images from your computer
   - Click "Upload" button
   - Should see success message with upload count
   - Images should appear in the grid

4. **Upload Videos**
   - Click "Choose Files" button again
   - Select 1-2 videos (MP4 files work best)
   - Click "Upload"
   - Videos should appear with play icon

5. **View in Carousel**
   - Click any image/video thumbnail
   - Carousel should open in fullscreen
   - Use arrow buttons to navigate
   - Videos should have playback controls
   - Close with X button

6. **Delete Media**
   - Hover over a thumbnail
   - Click the trash icon (🗑️) in top-right
   - Confirm deletion
   - Media should be removed

### Test Scenario 2: Student View (Web)

1. **Sign in as Student**
   - Use any student account
   
2. **Navigate to Same Event**
   - Go to the event where club leader uploaded media
   - Scroll to "Event Photos & Videos"
   
3. **Verify**
   - ✅ Can see all uploaded media
   - ❌ Cannot see upload button
   - ❌ Cannot see delete buttons
   - ✅ Can open carousel and view media

### Test Scenario 3: Mobile App

1. **Open Mobile App**
   - Start Expo app: `npx expo start` in `/mobile`
   
2. **Sign in as Club Leader**
   - Login with club leader credentials
   
3. **Navigate to Event Details**
   - Find an approved event you created
   - Scroll down to media section
   
4. **Upload Photos (Mobile)**
   - Tap "📷 Upload Photos"
   - Select photos from gallery
   - Photos should upload and display
   
5. **Upload Videos (Mobile)**
   - Tap "🎥 Upload Videos"
   - Select video files
   - Videos should upload
   
6. **View Carousel (Mobile)**
   - Tap any thumbnail
   - Fullscreen carousel opens
   - Swipe or use arrows to navigate
   - Videos should play with controls

### Test Scenario 4: File Limits

1. **Test Size Limits**
   - Try uploading image > 10MB → Should be rejected
   - Try uploading video > 100MB → Should be rejected
   
2. **Test Count Limits**
   - Upload 20 photos successfully
   - Try uploading 21st photo → Should fail with message
   - Upload 5 videos successfully
   - Try uploading 6th video → Should fail with message

3. **Test File Types**
   - Try uploading .txt file → Should be rejected
   - Try uploading .pdf → Should be rejected
   - Upload .jpg, .png, .gif, .webp → Should work
   - Upload .mp4, .mov, .webm → Should work

### Test Scenario 5: Event States

1. **Pending Event**
   - Create new event (status: PENDING)
   - Check if you can upload media
   - ✅ Should be able to upload (for history)
   
2. **Past Event**
   - Find event with past end date
   - Check if you can upload media
   - ✅ Should be able to upload (memories!)

## 🔍 What to Check

### Functionality Checks
- [ ] Only club leaders see upload button
- [ ] Only club leaders can delete media
- [ ] All users can view media in carousel
- [ ] File size limits enforced
- [ ] File count limits enforced (20 photos, 5 videos)
- [ ] Only allowed file types accepted
- [ ] Media displays in correct order (newest first)
- [ ] Carousel navigation works (prev/next)
- [ ] Videos play with controls
- [ ] Delete removes file from server and database

### UI/UX Checks
- [ ] Upload button clearly visible
- [ ] File selection works smoothly
- [ ] Upload progress shows (loading state)
- [ ] Success/error messages display
- [ ] Thumbnails display correctly
- [ ] Carousel is fullscreen and centered
- [ ] Carousel close button works
- [ ] Mobile touch interactions smooth
- [ ] Stats show correct counts (X/20 photos, X/5 videos)

### Security Checks
- [ ] Non-club-leaders cannot access upload endpoint
- [ ] Club leader can only upload to their own events
- [ ] Club leader can only delete their own media
- [ ] File validation prevents malicious uploads
- [ ] Token authentication required for upload/delete

## 🐛 Known Issues to Watch For

1. **CORS Issues**: If upload fails, check server CORS settings
2. **File Path**: Uploads go to `server/uploads/event-media/`
3. **Mobile Permissions**: App needs camera roll permissions
4. **Large Files**: May timeout on slow connections

## 📊 Database Check

You can verify media was saved with:

\`\`\`sql
SELECT * FROM event_media WHERE eventId = 'your-event-id';
\`\`\`

Should show:
- id
- eventId
- fileUrl (path: /uploads/event-media/...)
- fileType (IMAGE or VIDEO)
- fileName (original name)
- fileSize (in bytes)
- uploadedBy (user ID)
- createdAt (timestamp)

## 🎯 Success Criteria

The feature is working correctly if:

1. ✅ Club leaders can upload photos/videos to their events
2. ✅ Files are validated (size, type, count)
3. ✅ Media displays in beautiful carousel
4. ✅ All users can view media
5. ✅ Only club leaders can upload/delete
6. ✅ Works on both web and mobile
7. ✅ Files are properly stored on server
8. ✅ Database records are created correctly

## 🚨 Troubleshooting

### Upload Fails
- Check if `server/uploads/event-media/` directory exists
- Verify multer middleware is imported
- Check server logs for errors
- Verify file size and type

### Images Don't Display
- Check fileUrl format: should be `/uploads/event-media/filename`
- Verify server is serving static files from `/uploads`
- Check CORS settings
- Inspect network tab in browser

### Delete Doesn't Work
- Verify user is the event creator
- Check authentication token
- Look for 403/404 errors in console

### Mobile Issues
- Grant camera roll permissions
- Check Expo package installation
- Verify API_URL is correct
- Check if AsyncStorage has token

## 📝 API Endpoints

### Upload Media
```
POST /api/events/:id/media
Headers: Authorization: Bearer <token>
Body: FormData with 'media' files (max 10 files)
```

### Get Media
```
GET /api/events/:id/media
Response: { media: [...] }
```

### Delete Media
```
DELETE /api/events/:id/media/:mediaId
Headers: Authorization: Bearer <token>
Response: { message: "Media deleted successfully" }
```

## 🎨 UI Components

### Web
- **Component**: `src/Components/EventMediaGallery/EventMediaGallery.jsx`
- **Styles**: `src/Components/EventMediaGallery/EventMediaGallery.module.scss`
- **Used in**: `src/Pages/EventDetails/EventDetails.jsx`

### Mobile
- **Component**: `mobile/components/EventMediaGallery.tsx`
- **Used in**: `mobile/app/event-details.tsx`

## 💾 Backend Files

- **Controller**: `server/controllers/eventMediaController.js`
- **Routes**: Added to `server/routes/events.js`
- **Middleware**: `server/middleware/upload.js`
- **Schema**: `server/prisma/schema.prisma` (EventMedia model)
- **Static Files**: `server/server.js` (serves /uploads)

---

## ✅ Final Checklist

Before marking as complete:

- [ ] Database migration successful
- [ ] multer and dependencies installed
- [ ] Upload directory created automatically
- [ ] Web component renders correctly
- [ ] Mobile component renders correctly
- [ ] File uploads work (photos and videos)
- [ ] File limits enforced
- [ ] Carousel displays media
- [ ] Delete functionality works
- [ ] Only club leaders can upload/delete
- [ ] All users can view media
- [ ] Works for approved, pending, and past events
- [ ] No console errors
- [ ] Mobile permissions handled gracefully

---

Happy Testing! 🎉
