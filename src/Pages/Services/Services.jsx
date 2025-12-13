import React, { useState } from 'react';
import styles from './Services.module.scss';
import { 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Shield,
  BookOpen,
  Laptop,
  Bus,
  Home,
  FileText,
  Headphones,
  TrendingUp,
  Globe,
  Search
} from 'lucide-react';

function Services() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Services', icon: BookOpen },
    { id: 'academic', name: 'Academic', icon: GraduationCap },
    { id: 'student-support', name: 'Student Support', icon: Heart },
    { id: 'campus', name: 'Campus Life', icon: Users },
    { id: 'career', name: 'Career', icon: Briefcase },
  ];

  const services = [
    {
      id: 1,
      name: 'Academic Advising',
      category: 'academic',
      description: 'Professional guidance for course selection, degree planning, and academic success.',
      icon: <GraduationCap className={styles.serviceIcon} />,
      color: '#4f46e5',
      contact: 'advising@university.edu',
      phone: '(555) 123-4567',
      location: 'Academic Affairs Building, Room 201',
      hours: 'Mon-Fri: 8 AM - 5 PM',
      features: ['Degree Planning', 'Course Selection', 'Academic Progress Review']
    },
    {
      id: 2,
      name: 'Counseling Services',
      category: 'student-support',
      description: 'Confidential mental health support and wellness counseling for students.',
      icon: <Heart className={styles.serviceIcon} />,
      color: '#ec4899',
      contact: 'counseling@university.edu',
      phone: '(555) 234-5678',
      location: 'Student Health Center, 2nd Floor',
      hours: 'Mon-Fri: 9 AM - 6 PM',
      features: ['Individual Counseling', 'Group Therapy', 'Crisis Support']
    },
    {
      id: 3,
      name: 'Career Services',
      category: 'career',
      description: 'Career counseling, resume building, interview prep, and job placement assistance.',
      icon: <Briefcase className={styles.serviceIcon} />,
      color: '#10b981',
      contact: 'careers@university.edu',
      phone: '(555) 345-6789',
      location: 'Career Center, Main Campus',
      hours: 'Mon-Fri: 9 AM - 5 PM',
      features: ['Resume Review', 'Mock Interviews', 'Job Portal Access']
    },
    {
      id: 4,
      name: 'IT Support',
      category: 'campus',
      description: 'Technical support for campus technology, software, and network issues.',
      icon: <Laptop className={styles.serviceIcon} />,
      color: '#3b82f6',
      contact: 'itsupport@university.edu',
      phone: '(555) 456-7890',
      location: 'IT Services Building',
      hours: 'Mon-Fri: 8 AM - 8 PM',
      features: ['Software Support', 'Network Help', 'Device Troubleshooting']
    },
    {
      id: 5,
      name: 'Library Services',
      category: 'academic',
      description: 'Access to extensive collections, research assistance, and study resources.',
      icon: <BookOpen className={styles.serviceIcon} />,
      color: '#8b5cf6',
      contact: 'library@university.edu',
      phone: '(555) 567-8901',
      location: 'Main Library',
      hours: '24/7 (Staffed: 8 AM - 10 PM)',
      features: ['Book Loans', 'Research Help', 'Digital Resources']
    },
    {
      id: 6,
      name: 'Student Housing',
      category: 'campus',
      description: 'On-campus housing options and residential life support services.',
      icon: <Home className={styles.serviceIcon} />,
      color: '#f59e0b',
      contact: 'housing@university.edu',
      phone: '(555) 678-9012',
      location: 'Housing Office, Student Center',
      hours: 'Mon-Fri: 8 AM - 5 PM',
      features: ['Dorm Assignment', 'Maintenance Requests', 'Community Programs']
    },
    {
      id: 7,
      name: 'Transportation Services',
      category: 'campus',
      description: 'Campus shuttle services, parking permits, and transportation assistance.',
      icon: <Bus className={styles.serviceIcon} />,
      color: '#14b8a6',
      contact: 'transport@university.edu',
      phone: '(555) 789-0123',
      location: 'Transportation Office',
      hours: 'Mon-Fri: 7 AM - 7 PM',
      features: ['Shuttle Routes', 'Parking Permits', 'Bike Rentals']
    },
    {
      id: 8,
      name: 'International Student Services',
      category: 'student-support',
      description: 'Support for international students including visa assistance and cultural programs.',
      icon: <Globe className={styles.serviceIcon} />,
      color: '#6366f1',
      contact: 'international@university.edu',
      phone: '(555) 890-1234',
      location: 'International Center',
      hours: 'Mon-Fri: 9 AM - 5 PM',
      features: ['Visa Support', 'Cultural Events', 'Language Help']
    },
    {
      id: 9,
      name: 'Financial Aid Office',
      category: 'student-support',
      description: 'Assistance with scholarships, grants, loans, and financial planning.',
      icon: <FileText className={styles.serviceIcon} />,
      color: '#ef4444',
      contact: 'finaid@university.edu',
      phone: '(555) 901-2345',
      location: 'Financial Aid Office, Admin Building',
      hours: 'Mon-Fri: 8:30 AM - 4:30 PM',
      features: ['Scholarship Info', 'FAFSA Help', 'Payment Plans']
    },
    {
      id: 10,
      name: 'Disability Services',
      category: 'student-support',
      description: 'Accommodations and support services for students with disabilities.',
      icon: <Shield className={styles.serviceIcon} />,
      color: '#a855f7',
      contact: 'disability@university.edu',
      phone: '(555) 012-3456',
      location: 'Accessibility Services Center',
      hours: 'Mon-Fri: 8 AM - 5 PM',
      features: ['Accommodations', 'Assistive Technology', 'Advocacy']
    },
    {
      id: 11,
      name: 'Tutoring Center',
      category: 'academic',
      description: 'Free peer tutoring and academic support in various subjects.',
      icon: <Users className={styles.serviceIcon} />,
      color: '#0ea5e9',
      contact: 'tutoring@university.edu',
      phone: '(555) 123-9876',
      location: 'Learning Commons, Library',
      hours: 'Mon-Thu: 10 AM - 9 PM, Fri: 10 AM - 5 PM',
      features: ['Subject Tutoring', 'Writing Help', 'Study Groups']
    },
    {
      id: 12,
      name: 'Wellness & Recreation',
      category: 'campus',
      description: 'Fitness facilities, wellness programs, and recreational activities.',
      icon: <TrendingUp className={styles.serviceIcon} />,
      color: '#84cc16',
      contact: 'wellness@university.edu',
      phone: '(555) 234-8765',
      location: 'Recreation Center',
      hours: 'Mon-Fri: 6 AM - 11 PM, Sat-Sun: 8 AM - 10 PM',
      features: ['Gym Access', 'Fitness Classes', 'Wellness Programs']
    }
  ];

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const quickAccess = [
    {
      icon: Phone,
      title: 'Emergency Line',
      description: 'Campus Security',
      value: '(555) 911-HELP'
    },
    {
      icon: Headphones,
      title: 'IT Help Desk',
      description: 'Technical Support',
      value: '(555) 456-7890'
    },
    {
      icon: Heart,
      title: 'Crisis Support',
      description: '24/7 Counseling',
      value: '(555) 234-5678'
    },
    {
      icon: Mail,
      title: 'General Inquiries',
      description: 'Main Office',
      value: 'info@university.edu'
    }
  ];

  return (
    <div className={styles.servicesPage}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Campus <span className={styles.highlight}>Services</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Comprehensive support services designed to enhance your university experience
          </p>
        </div>
      </div>

      <div className={styles.container}>
        {/* Search and Filter Section */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search for services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.categories}>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  className={`${styles.categoryBtn} ${selectedCategory === category.id ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className={styles.categoryIcon} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Access Section */}
        <div className={styles.quickAccessSection}>
          <h2 className={styles.sectionTitle}>Quick Access</h2>
          <div className={styles.quickAccessGrid}>
            {quickAccess.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className={styles.quickAccessCard}>
                  <div className={styles.quickAccessIcon}>
                    <Icon className={styles.icon} />
                  </div>
                  <div className={styles.quickAccessInfo}>
                    <h3 className={styles.quickAccessTitle}>{item.title}</h3>
                    <p className={styles.quickAccessDescription}>{item.description}</p>
                    <a href={item.value.includes('@') ? `mailto:${item.value}` : `tel:${item.value}`} className={styles.quickAccessValue}>
                      {item.value}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        <div className={styles.servicesSection}>
          <h2 className={styles.sectionTitle}>
            Available Services
            <span className={styles.resultCount}>({filteredServices.length} services)</span>
          </h2>
          <div className={styles.servicesGrid}>
            {filteredServices.map((service) => (
              <div key={service.id} className={styles.serviceCard}>
                <div className={styles.serviceHeader} style={{ background: service.color }}>
                  {service.icon}
                </div>
                <div className={styles.serviceBody}>
                  <h3 className={styles.serviceName}>{service.name}</h3>
                  <p className={styles.serviceDescription}>{service.description}</p>
                  
                  <div className={styles.serviceDetails}>
                    <div className={styles.detailItem}>
                      <Clock className={styles.detailIcon} />
                      <span>{service.hours}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <MapPin className={styles.detailIcon} />
                      <span>{service.location}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <Mail className={styles.detailIcon} />
                      <a href={`mailto:${service.contact}`}>{service.contact}</a>
                    </div>
                    <div className={styles.detailItem}>
                      <Phone className={styles.detailIcon} />
                      <a href={`tel:${service.phone}`}>{service.phone}</a>
                    </div>
                  </div>

                  <div className={styles.features}>
                    <h4 className={styles.featuresTitle}>Key Features:</h4>
                    <ul className={styles.featuresList}>
                      {service.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources Section */}
        <div className={styles.resourcesSection}>
          <h2 className={styles.sectionTitle}>Additional Resources</h2>
          <div className={styles.resourcesGrid}>
            <div className={styles.resourceCard}>
              <div className={styles.resourceNumber}>1</div>
              <h3 className={styles.resourceTitle}>Student Portal</h3>
              <p className={styles.resourceText}>Access grades, schedules, and academic records online.</p>
            </div>
            <div className={styles.resourceCard}>
              <div className={styles.resourceNumber}>2</div>
              <h3 className={styles.resourceTitle}>Campus Map</h3>
              <p className={styles.resourceText}>Interactive map to help you navigate campus buildings.</p>
            </div>
            <div className={styles.resourceCard}>
              <div className={styles.resourceNumber}>3</div>
              <h3 className={styles.resourceTitle}>Service Requests</h3>
              <p className={styles.resourceText}>Submit maintenance and service requests online.</p>
            </div>
            <div className={styles.resourceCard}>
              <div className={styles.resourceNumber}>4</div>
              <h3 className={styles.resourceTitle}>FAQs</h3>
              <p className={styles.resourceText}>Find answers to commonly asked questions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;
