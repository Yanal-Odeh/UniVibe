import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
}

export default function Layout({ 
  children, 
  showNavbar = true, 
  showFooter = true 
}: LayoutProps) {
  return (
    <View style={styles.container}>
      {showNavbar && <Navbar />}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {children}
        {showFooter && <Footer />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
