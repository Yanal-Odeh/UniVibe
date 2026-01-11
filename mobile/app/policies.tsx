import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Layout from '@/components/Layout';

export default function PoliciesGuidelines() {
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  const policySections = [
    {
      id: 1,
      icon: '📖',
      title: 'Academic Policies',
      description: 'Guidelines for academic conduct, grading, and course requirements',
      policies: [
        {
          title: 'Academic Integrity',
          content: 'All students are expected to maintain the highest standards of academic honesty. Plagiarism, cheating, and other forms of academic dishonesty are strictly prohibited.'
        },
        {
          title: 'Grading System',
          content: 'The university uses a letter grade system (A-F) with grade point values. A minimum GPA of 2.0 is required for graduation.'
        },
        {
          title: 'Attendance Policy',
          content: 'Regular attendance is expected for all courses. Absences exceeding 20% of class meetings may result in grade penalties or course failure.'
        }
      ]
    },
    {
      id: 2,
      icon: '🎓',
      title: 'Student Conduct',
      description: 'Behavioral expectations and disciplinary procedures',
      policies: [
        {
          title: 'Code of Conduct',
          content: 'Students must respect the rights of others, follow university rules, and maintain personal integrity in all activities.'
        },
        {
          title: 'Disciplinary Procedures',
          content: 'Violations of university policies may result in warnings, probation, suspension, or expulsion depending on severity.'
        },
        {
          title: 'Anti-Discrimination',
          content: 'The university maintains a zero-tolerance policy for discrimination, harassment, or bullying of any kind.'
        }
      ]
    },
    {
      id: 3,
      icon: '🏫',
      title: 'Campus Life',
      description: 'Rules and regulations for campus facilities and activities',
      policies: [
        {
          title: 'Housing Regulations',
          content: 'Residence hall policies include quiet hours, guest policies, and room maintenance requirements.'
        },
        {
          title: 'Library Usage',
          content: 'Library resources are available to all students. Materials must be returned on time to avoid fines.'
        },
        {
          title: 'Parking & Transportation',
          content: 'Valid parking permits are required. Violations may result in fines or towing at owner expense.'
        }
      ]
    },
    {
      id: 4,
      icon: '🔒',
      title: 'Privacy & Data',
      description: 'Information about student privacy rights and data protection',
      policies: [
        {
          title: 'FERPA Rights',
          content: 'Students have the right to review, request amendments to, and control disclosure of their educational records.'
        },
        {
          title: 'Data Protection',
          content: 'The university protects student data in accordance with applicable privacy laws and regulations.'
        },
        {
          title: 'Technology Use',
          content: 'Acceptable use policies apply to all university technology resources including Wi-Fi, computers, and online platforms.'
        }
      ]
    },
    {
      id: 5,
      icon: '⚕️',
      title: 'Health & Safety',
      description: 'Campus health regulations and emergency procedures',
      policies: [
        {
          title: 'Health Requirements',
          content: 'All students must provide proof of required vaccinations and health insurance coverage.'
        },
        {
          title: 'Emergency Procedures',
          content: 'Familiarize yourself with evacuation routes and emergency contact numbers for campus safety.'
        },
        {
          title: 'Substance Abuse',
          content: 'The university maintains a drug-free campus. Violations will result in disciplinary action.'
        }
      ]
    },
    {
      id: 6,
      icon: '💼',
      title: 'Financial Policies',
      description: 'Tuition, fees, refunds, and financial aid guidelines',
      policies: [
        {
          title: 'Tuition & Fees',
          content: 'Tuition must be paid by published deadlines. Late payments may result in course drops and financial holds.'
        },
        {
          title: 'Refund Policy',
          content: 'Refund eligibility depends on the timing of withdrawal. See the academic calendar for specific deadlines.'
        },
        {
          title: 'Financial Aid',
          content: 'Maintain satisfactory academic progress to remain eligible for financial aid and scholarships.'
        }
      ]
    }
  ];

  const togglePolicy = (sectionId: number, policyIndex: number) => {
    const key = `${sectionId}-${policyIndex}`;
    setActivePolicy(activePolicy === key ? null : key);
  };

  return (
    <Layout>
      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Policies & Guidelines</Text>
          <Text style={styles.heroSubtitle}>
            Important rules and regulations for all university members
          </Text>
        </View>

        <View style={styles.content}>
          {/* Intro */}
          <View style={styles.intro}>
            <Text style={styles.introText}>
              Our policies are designed to create a safe, respectful, and productive learning environment 
              for all members of the university community. Please review these guidelines carefully.
            </Text>
          </View>

          {/* Policy Sections */}
          <View style={styles.policySections}>
            {policySections.map(section => (
              <View key={section.id} style={styles.policySection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>{section.icon}</Text>
                  <View style={styles.sectionInfo}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.sectionDescription}>{section.description}</Text>
                  </View>
                </View>

                <View style={styles.policiesList}>
                  {section.policies.map((policy, index) => {
                    const isActive = activePolicy === `${section.id}-${index}`;
                    return (
                      <View key={index} style={styles.policyItem}>
                        <TouchableOpacity
                          style={[styles.policyHeader, isActive && styles.policyHeaderActive]}
                          onPress={() => togglePolicy(section.id, index)}
                        >
                          <Text style={styles.policyTitle}>{policy.title}</Text>
                          <Text style={styles.arrow}>{isActive ? '−' : '+'}</Text>
                        </TouchableOpacity>
                        {isActive && (
                          <View style={styles.policyContent}>
                            <Text style={styles.policyText}>{policy.content}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerCard}>
              <Text style={styles.footerTitle}>Questions About Our Policies?</Text>
              <Text style={styles.footerText}>
                If you need clarification on any policy or have specific questions, please contact our administration office.
              </Text>
              <TouchableOpacity style={styles.contactBtn}>
                <Text style={styles.contactBtnText}>Contact Administration</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  hero: {
    backgroundColor: '#0064a4',
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.95,
  },
  content: {
    padding: 20,
  },
  intro: {
    backgroundColor: '#e8eaf6',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  introText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
  policySections: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  policySection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: '48%',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 17,
  },
  policiesList: {
    gap: 8,
  },
  policyItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  policyHeaderActive: {
    backgroundColor: '#e8eaf6',
  },
  policyTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  arrow: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0064a4',
    marginLeft: 8,
  },
  policyContent: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  policyText: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 17,
  },
  footer: {
    marginTop: 32,
    marginBottom: 20,
  },
  footerCard: {
    backgroundColor: '#0064a4',
    padding: 28,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    opacity: 0.95,
  },
  contactBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  contactBtnText: {
    color: '#0064a4',
    fontSize: 15,
    fontWeight: '600',
  },
});
