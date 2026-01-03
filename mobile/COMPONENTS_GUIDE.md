# Mobile App Components - Usage Guide

## Overview
The mobile app now has reusable Navbar, Footer, and Layout components that match the web version's design exactly.

## Components

### 1. Layout Component
A wrapper component that includes Navbar and Footer with ScrollView functionality.

**Usage:**
```tsx
import Layout from '@/components/Layout';

export default function MyPage() {
  return (
    <Layout>
      {/* Your page content here */}
    </Layout>
  );
}
```

**Props:**
- `showNavbar` (boolean, default: true) - Show/hide navbar
- `showFooter` (boolean, default: true) - Show/hide footer

### 2. Navbar Component
Matches the web design with:
- UniVibe logo with blue background (#0064a4)
- Responsive hamburger menu
- Notification bell icon
- User profile icon
- Full-screen menu modal with all navigation items

**Features:**
- Sticky header
- Smooth animations
- Dropdown menus organized by category
- Active route highlighting (ready for implementation)

### 3. Footer Component
Matches the web design with:
- Background image with dark overlay
- Contact information
- Social media icons
- Navigation links organized by sections
- Staff directory button with gradient
- Copyright and university info

## Styling
All components use StyleSheet for exact matching with web CSS:
- Colors: #0064a4 (primary blue), #667eea (purple accent)
- Fonts: System fonts with proper weights
- Shadows: Text shadows for readability on images
- Spacing: Matches web padding and margins

## Routing

### Current Routes:
- `/` or `/(tabs)` - Home page
- `/about` - About page
- `/communities` - Communities page
- `/events` - Events page

### Adding New Routes:
1. Create a new file in `mobile/app/` directory (e.g., `study.tsx`)
2. Use the Layout component
3. Add the route to Navbar's `handleNavigate` function

Example:
```tsx
// mobile/app/study.tsx
import React from 'react';
import { View, Text } from 'react-native';
import Layout from '@/components/Layout';

export default function StudyScreen() {
  return (
    <Layout>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24 }}>Study Spaces</Text>
      </View>
    </Layout>
  );
}
```

Then update Navbar.tsx:
```tsx
} else if (path === '/study') {
  router.push('/study');
}
```

## Design Specifications

### Navbar
- Height: 70px
- Background: White (#ffffff)
- Logo box: #0064a4 (blue)
- Logo text: White, 20px, bold
- Shadow: 0 2px 8px rgba(0,0,0,0.1)
- Border: 1px solid #e0e0e0

### Footer
- Background: Image with rgba(0,0,0,0.65) overlay
- Padding: 80px top, 20px horizontal
- Heading: 18px, bold, white
- Text: 14px, #e8e8e8
- Button gradient: #667eea to #764ba2
- Button radius: 25px

### Mobile Menu
- Width: 350px (max 85vw)
- Background: White
- Overlay: rgba(0,0,0,0.8)
- Close button: 32px, top-right
- Animation: Slide from right

## File Structure
```
mobile/
  components/
    Layout.tsx       # Main layout wrapper
    Navbar.tsx       # Navigation bar
    Footer.tsx       # Footer component
    index.ts         # Export all components
  app/
    (tabs)/
      index.tsx      # Home page
    about.tsx        # About page
    communities.tsx  # Communities page
    events.tsx       # Events page
```

## Next Steps
1. Add more route pages as needed
2. Implement authentication UI
3. Add notification functionality
4. Connect to backend APIs
5. Add loading states and error handling

## Notes
- All styling matches web version exactly
- Uses Expo Router for navigation
- Fully responsive design
- Reusable across all pages
- TypeScript support
