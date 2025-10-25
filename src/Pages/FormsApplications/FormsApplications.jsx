import React, { useState } from 'react';
import styles from './FormsApplications.module.scss';

function FormsApplications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Forms' },
    { id: 'admission', name: 'Admission' },
    { id: 'financial', name: 'Financial Aid' },
    { id: 'academic', name: 'Academic' },
    { id: 'student', name: 'Student Services' }
  ];

  const forms = [
    {
      id: 1,
      title: 'Admission Application',
      category: 'admission',
      description: 'Apply for undergraduate or graduate programs',
      format: 'PDF',
      size: '2.5 MB',
      icon: '📝'
    },
    {
      id: 2,
      title: 'Financial Aid Form',
      category: 'financial',
      description: 'Request financial assistance and scholarships',
      format: 'PDF',
      size: '1.8 MB',
      icon: '💰'
    },
    {
      id: 3,
      title: 'Course Registration',
      category: 'academic',
      description: 'Register for courses and manage your schedule',
      format: 'Online',
      size: '-',
      icon: '📚'
    },
    {
      id: 4,
      title: 'Leave of Absence',
      category: 'academic',
      description: 'Request temporary leave from studies',
      format: 'PDF',
      size: '1.2 MB',
      icon: '✈️'
    },
    {
      id: 5,
      title: 'Transcript Request',
      category: 'academic',
      description: 'Order official academic transcripts',
      format: 'Online',
      size: '-',
      icon: '📄'
    },
    {
      id: 6,
      title: 'Housing Application',
      category: 'student',
      description: 'Apply for on-campus housing',
      format: 'PDF',
      size: '3.1 MB',
      icon: '🏠'
    },
    {
      id: 7,
      title: 'ID Card Request',
      category: 'student',
      description: 'Request or replace your student ID card',
      format: 'PDF',
      size: '0.8 MB',
      icon: '🪪'
    },
    {
      id: 8,
      title: 'Scholarship Application',
      category: 'financial',
      description: 'Apply for merit-based scholarships',
      format: 'PDF',
      size: '2.0 MB',
      icon: '🎓'
    }
  ];

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || form.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Forms & Applications</h1>
        <p>Download and submit required forms for various university services</p>
      </div>

      <div className={styles.content}>
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>

          <div className={styles.categories}>
            {categories.map(category => (
              <button
                key={category.id}
                className={`${styles.categoryBtn} ${selectedCategory === category.id ? styles.active : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formsGrid}>
          {filteredForms.map(form => (
            <div key={form.id} className={styles.formCard}>
              <div className={styles.formIcon}>{form.icon}</div>
              <div className={styles.formContent}>
                <h3>{form.title}</h3>
                <p>{form.description}</p>
                <div className={styles.formMeta}>
                  <span className={styles.format}>{form.format}</span>
                  {form.size !== '-' && <span className={styles.size}>{form.size}</span>}
                </div>
              </div>
              <div className={styles.formActions}>
                <button className={styles.downloadBtn}>Download</button>
                <button className={styles.viewBtn}>View</button>
              </div>
            </div>
          ))}
        </div>

        {filteredForms.length === 0 && (
          <div className={styles.noResults}>
            <p>No forms found matching your criteria</p>
          </div>
        )}

        <div className={styles.helpSection}>
          <div className={styles.helpBox}>
            <h3>Need Assistance?</h3>
            <p>If you need help completing a form or have questions about the application process, our team is here to help.</p>
            <button className={styles.contactBtn}>Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormsApplications;