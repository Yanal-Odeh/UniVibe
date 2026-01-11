import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Layout from '@/components/Layout';

export default function AboutScreen() {
  const features = [
    {
      icon: "📅",
      title: "Centralized Event Management",
      description: "All campus activities in one place, making it easy to discover and participate in events."
    },
    {
      icon: "✅",
      title: "Conflict-Free Scheduling",
      description: "Smart availability checks ensure no venue conflicts, streamlining event planning."
    },
    {
      icon: "🛡️",
      title: "Clear Approval Workflow",
      description: "Structured process from association to Student Affairs with full transparency."
    },
    {
      icon: "👥",
      title: "Easy Club Membership",
      description: "Simple join-association forms to help students connect with clubs they love."
    },
    {
      icon: "⚡",
      title: "Digital Lifecycle",
      description: "Complete event digitization from submission to final approval and execution."
    },
    {
      icon: "❤️",
      title: "Enhanced Campus Life",
      description: "Foster community engagement and make campus life more vibrant and connected."
    }
  ];

  const workflow = [
    { step: "1", role: "Association", action: "Submit Event" },
    { step: "2", role: "College", action: "Review & Approve" },
    { step: "3", role: "Dean", action: "Authorize" },
    { step: "4", role: "Student Affairs", action: "Final Approval" }
  ];

  return (
    <Layout>
      <View style={styles.aboutPage}>
        <View style={styles.container}>
          {/* Hero Section */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>
              About <Text style={styles.brandHighlight}>UniVibe</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Transforming campus life through seamless event management and community engagement
            </Text>
          </View>

          {/* Mission Statement */}
          <View style={styles.missionCard}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.missionText}>
              UniVibe is a comprehensive web and mobile platform designed to revolutionize how universities 
              manage campus activities. We eliminate venue conflicts, digitize the entire event lifecycle, 
              and create a transparent, efficient system that connects students with the vibrant campus 
              community they deserve.
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Why Choose UniVibe?</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Text style={styles.featureIconText}>{feature.icon}</Text>
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Workflow Section */}
          <View style={styles.workflowSection}>
            <Text style={styles.workflowTitle}>Approval Workflow</Text>
            <Text style={styles.workflowSubtitle}>
              Our structured approval process ensures every event is properly reviewed and authorized
            </Text>
            <View style={styles.workflowGrid}>
              {workflow.map((item, index) => (
                <View key={index} style={styles.workflowItem}>
                  <View style={styles.workflowCard}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{item.step}</Text>
                    </View>
                    <Text style={styles.workflowRole}>{item.role}</Text>
                    <Text style={styles.workflowAction}>{item.action}</Text>
                  </View>
                  {index < workflow.length - 1 && (
                    <Text style={styles.workflowArrow}>→</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Benefits for Everyone</Text>
            <View style={styles.benefitsGrid}>
              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, styles.greenIcon]}>
                  <Text style={styles.benefitIconText}>👥</Text>
                </View>
                <Text style={styles.benefitTitle}>For Students</Text>
                <View style={styles.benefitList}>
                  <Text style={styles.benefitListItem}>• Discover all campus events easily</Text>
                  <Text style={styles.benefitListItem}>• Join clubs with simple forms</Text>
                  <Text style={styles.benefitListItem}>• Stay engaged with campus life</Text>
                </View>
              </View>

              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, styles.blueIcon]}>
                  <Text style={styles.benefitIconText}>📅</Text>
                </View>
                <Text style={styles.benefitTitle}>For Organizers</Text>
                <View style={styles.benefitList}>
                  <Text style={styles.benefitListItem}>• Streamlined event submission</Text>
                  <Text style={styles.benefitListItem}>• No venue conflicts</Text>
                  <Text style={styles.benefitListItem}>• Clear approval tracking</Text>
                </View>
              </View>

              <View style={styles.benefitCard}>
                <View style={[styles.benefitIcon, styles.purpleIcon]}>
                  <Text style={styles.benefitIconText}>🛡️</Text>
                </View>
                <Text style={styles.benefitTitle}>For Administration</Text>
                <View style={styles.benefitList}>
                  <Text style={styles.benefitListItem}>• Full transparency</Text>
                  <Text style={styles.benefitListItem}>• Organized workflow</Text>
                  <Text style={styles.benefitListItem}>• Better resource management</Text>
                </View>
              </View>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <View style={styles.ctaCard}>
              <Text style={styles.ctaTitle}>Ready to Transform Your Campus?</Text>
              <Text style={styles.ctaSubtitle}>
                Join universities already using UniVibe to create vibrant, connected campus communities
              </Text>
              <View style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>Get Started Today</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  aboutPage: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    padding: 24,
  },
  
  // Hero Section
  hero: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  brandHighlight: {
    color: '#0064a4',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 16,
  },

  // Mission Card
  missionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    padding: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  missionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 28,
    textAlign: 'center',
  },

  // Features Section
  featuresSection: {
    marginBottom: 32,
  },
  featuresGrid: {
    marginTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    width: '48%',
    marginBottom: 16,
  },
  featureIcon: {
    backgroundColor: '#e0e7ff',
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },

  // Workflow Section
  workflowSection: {
    backgroundColor: '#0064a4',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    padding: 24,
    marginBottom: 32,
  },
  workflowTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  workflowSubtitle: {
    color: '#e0e7ff',
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
  },
  workflowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  workflowItem: {
    width: '48%',
    marginBottom: 16,
  },
  workflowCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 140,
  },
  stepNumber: {
    backgroundColor: '#ffffff',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  stepNumberText: {
    color: '#0064a4',
    fontWeight: '700',
    fontSize: 18,
  },
  workflowRole: {
    fontWeight: '600',
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  workflowAction: {
    color: '#e0e7ff',
    fontSize: 12,
    textAlign: 'center',
  },
  workflowArrow: {
    display: 'none',
  },

  // Benefits Section
  benefitsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    padding: 24,
    marginBottom: 32,
  },
  benefitsGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitCard: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 20,
  },
  benefitIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  benefitIconText: {
    fontSize: 28,
  },
  greenIcon: {
    backgroundColor: '#d1fae5',
  },
  blueIcon: {
    backgroundColor: '#dbeafe',
  },
  purpleIcon: {
    backgroundColor: '#f3e8ff',
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  benefitList: {
    alignSelf: 'stretch',
    paddingHorizontal: 8,
  },
  benefitListItem: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
    lineHeight: 16,
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },

  // CTA Section
  ctaSection: {
    marginBottom: 20,
  },
  ctaCard: {
    backgroundColor: '#0064a4',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    color: '#e0e7ff',
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaButtonText: {
    color: '#0064a4',
    fontWeight: '600',
    fontSize: 16,
  },
});
