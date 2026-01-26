import React, { useState } from 'react';
import styles from './PoliciesGuidelines.module.scss';

function PoliciesGuidelines() {
  const [activePolicy, setActivePolicy] = useState(null);

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

  const togglePolicy = (sectionId, policyIndex) => {
    const key = `${sectionId}-${policyIndex}`;
    setActivePolicy(activePolicy === key ? null : key);
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Policies & Guidelines</h1>
        <p>Important rules and regulations for all university members</p>
      </div>

      <div className={styles.content}>
        <div className={styles.intro}>
          <p>
            Our policies are designed to create a safe, respectful, and productive learning environment 
            for all members of the university community. Please review these guidelines carefully.
          </p>
        </div>

        <div className={styles.policySections}>
          {policySections.map(section => (
            <div key={section.id} className={styles.policySection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>{section.icon}</div>
                <div className={styles.sectionInfo}>
                  <h2>{section.title}</h2>
                  <p>{section.description}</p>
                </div>
              </div>

              <div className={styles.policiesList}>
                {section.policies.map((policy, index) => (
                  <div key={index} className={styles.policyItem}>
                    <button
                      className={`${styles.policyHeader} ${activePolicy === `${section.id}-${index}` ? styles.active : ''}`}
                      onClick={() => togglePolicy(section.id, index)}
                    >
                      <h3>{policy.title}</h3>
                      <span className={styles.arrow}>
                        {activePolicy === `${section.id}-${index}` ? '−' : '+'}
                      </span>
                    </button>
                    {activePolicy === `${section.id}-${index}` && (
                      <div className={styles.policyContent}>
                        <p>{policy.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerCard}>
            <h3>Questions About Our Policies?</h3>
            <p>If you need clarification on any policy or have specific questions, please contact our administration office.</p>
            <button className={styles.contactBtn}>Contact Administration</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PoliciesGuidelines;
