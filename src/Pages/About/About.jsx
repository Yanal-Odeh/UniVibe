import React from 'react';
import { Users, Calendar, CheckCircle, Shield, Zap, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './About.module.scss';

function About() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: "Centralized Event Management",
      description: "All campus activities in one place, making it easy to discover and participate in events."
    },
    {
      icon: CheckCircle,
      title: "Conflict-Free Scheduling",
      description: "Smart availability checks ensure no venue conflicts, streamlining event planning."
    },
    {
      icon: Shield,
      title: "Clear Approval Workflow",
      description: "Structured process from association to Student Affairs with full transparency."
    },
    {
      icon: Users,
      title: "Easy Club Membership",
      description: "Simple join-association forms to help students connect with clubs they love."
    },
    {
      icon: Zap,
      title: "Digital Lifecycle",
      description: "Complete event digitization from submission to final approval and execution."
    },
    {
      icon: Heart,
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
    <div className={styles.aboutPage}>
      <section className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>
            About <span className={styles.brandHighlight}>UniVibe</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Transforming campus life through seamless event management and community engagement
          </p>
        </div>

        {/* Mission Statement */}
        <div className={styles.missionCard}>
          <h2 className={styles.sectionTitle}>Our Mission</h2>
          <p className={styles.missionText}>
            UniVibe is a comprehensive web and mobile platform designed to revolutionize how universities 
            manage campus activities. We eliminate venue conflicts, digitize the entire event lifecycle, 
            and create a transparent, efficient system that connects students with the vibrant campus 
            community they deserve.
          </p>
        </div>

        {/* Features Grid */}
        <div className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Why Choose UniVibe?</h2>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <Icon className={styles.icon} />
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow Section */}
        <div className={styles.workflowSection}>
          <h2 className={styles.workflowTitle}>Approval Workflow</h2>
          <p className={styles.workflowSubtitle}>
            Our structured approval process ensures every event is properly reviewed and authorized
          </p>
          <div className={styles.workflowGrid}>
            {workflow.map((item, index) => (
              <div key={index} className={styles.workflowItem}>
                <div className={styles.workflowCard}>
                  <div className={styles.stepNumber}>
                    {item.step}
                  </div>
                  <h3 className={styles.workflowRole}>{item.role}</h3>
                  <p className={styles.workflowAction}>{item.action}</p>
                </div>
                {index < workflow.length - 1 && (
                  <div className={styles.workflowArrow}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className={styles.benefitsSection}>
          <h2 className={styles.sectionTitle}>Benefits for Everyone</h2>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <div className={`${styles.benefitIcon} ${styles.greenIcon}`}>
                <Users className={styles.icon} />
              </div>
              <h3 className={styles.benefitTitle}>For Students</h3>
              <ul className={styles.benefitList}>
                <li>• Discover all campus events easily</li>
                <li>• Join clubs with simple forms</li>
                <li>• Stay engaged with campus life</li>
              </ul>
            </div>
            <div className={styles.benefitCard}>
              <div className={`${styles.benefitIcon} ${styles.blueIcon}`}>
                <Calendar className={styles.icon} />
              </div>
              <h3 className={styles.benefitTitle}>For Organizers</h3>
              <ul className={styles.benefitList}>
                <li>• Streamlined event submission</li>
                <li>• No venue conflicts</li>
                <li>• Clear approval tracking</li>
              </ul>
            </div>
            <div className={styles.benefitCard}>
              <div className={`${styles.benefitIcon} ${styles.purpleIcon}`}>
                <Shield className={styles.icon} />
              </div>
              <h3 className={styles.benefitTitle}>For Administration</h3>
              <ul className={styles.benefitList}>
                <li>• Full transparency</li>
                <li>• Organized workflow</li>
                <li>• Better resource management</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Ready to Transform Your Campus?</h2>
            <p className={styles.ctaSubtitle}>
              Join universities already using UniVibe to create vibrant, connected campus communities
            </p>
            <button className={styles.ctaButton} onClick={() => navigate('/signup')}>
              Get Started Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
