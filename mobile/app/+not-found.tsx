import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFound() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 404 Text */}
        <Text style={styles.glitch}>404</Text>
        
        {/* Title */}
        <Text style={styles.title}>Page Not Found</Text>
        
        {/* Description */}
        <Text style={styles.description}>
          Oops! The page you're looking for seems to have wandered off into the digital void.
        </Text>
        
        {/* Home Button */}
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.homeButtonText}>Take Me Home</Text>
        </TouchableOpacity>
        
        {/* Stars background */}
        <View style={styles.stars}>
          {[...Array(30)].map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.star,
                {
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }
              ]} 
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0064A4',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    zIndex: 2,
  },
  
  // 404 Glitch Text
  glitch: {
    fontSize: 120,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textShadowColor: 'rgba(255, 0, 222, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  
  // Title
  title: {
    fontSize: 28,
    color: '#ffffff',
    marginBottom: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  
  // Description
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  
  // Home Button
  homeButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },
  homeButtonText: {
    color: '#0064A4',
    fontWeight: '700',
    fontSize: 18,
  },
  
  // Stars
  stars: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
    opacity: 0.8,
  },
});
