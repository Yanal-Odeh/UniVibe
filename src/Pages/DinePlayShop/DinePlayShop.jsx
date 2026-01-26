import React, { useState } from 'react';
import styles from './DinePlayShop.module.scss';
import { Coffee, Utensils, ShoppingBag, Gamepad2, Book, Pizza, Sandwich, IceCream, Search, MapPin, Clock, DollarSign, Star } from 'lucide-react';

function DinePlayShop() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Places', icon: Star },
    { id: 'dining', name: 'Dining', icon: Utensils },
    { id: 'cafes', name: 'Cafés', icon: Coffee },
    { id: 'recreation', name: 'Recreation', icon: Gamepad2 },
    { id: 'shopping', name: 'Shopping', icon: ShoppingBag },
  ];

  const places = [
    {
      id: 1,
      name: 'Campus Dining Hall',
      category: 'dining',
      description: 'Full-service cafeteria with diverse meal options, salad bar, and daily specials.',
      type: 'Restaurant',
      price: '$$',
      hours: '7 AM - 9 PM',
      location: 'Student Center, 1st Floor',
      rating: 4.5,
      image: '🍽️',
      color: '#f59e0b',
      features: ['Buffet Style', 'Vegetarian Options', 'Halal Food']
    },
    {
      id: 2,
      name: 'Bean & Brew Café',
      category: 'cafes',
      description: 'Cozy coffee shop serving specialty coffee, pastries, and light snacks.',
      type: 'Café',
      price: '$',
      hours: '7 AM - 8 PM',
      location: 'Library Building',
      rating: 4.7,
      image: '☕',
      color: '#0064A4',
      features: ['Free WiFi', 'Study Space', 'Fresh Pastries']
    },
    {
      id: 3,
      name: 'Pizza Corner',
      category: 'dining',
      description: 'Quick-service pizzeria with made-to-order pizzas and Italian favorites.',
      type: 'Fast Food',
      price: '$',
      hours: '11 AM - 11 PM',
      location: 'Student Union',
      rating: 4.3,
      image: '🍕',
      color: '#ef4444',
      features: ['Delivery', 'Late Night', 'Custom Toppings']
    },
    {
      id: 4,
      name: 'Campus Recreation Center',
      category: 'recreation',
      description: 'State-of-the-art fitness center, basketball courts, and swimming pool.',
      type: 'Gym & Sports',
      price: 'Free',
      hours: '6 AM - 10 PM',
      location: 'Recreation Complex',
      rating: 4.8,
      image: '🏀',
      color: '#10b981',
      features: ['Gym', 'Pool', 'Courts', 'Classes']
    },
    {
      id: 5,
      name: 'University Bookstore',
      category: 'shopping',
      description: 'Complete bookstore with textbooks, supplies, apparel, and tech accessories.',
      type: 'Retail',
      price: '$$',
      hours: '8 AM - 6 PM',
      location: 'Main Campus Building',
      rating: 4.2,
      image: '📚',
      color: '#3b82f6',
      features: ['Textbooks', 'Merchandise', 'Electronics']
    },
    {
      id: 6,
      name: 'Smoothie Station',
      category: 'cafes',
      description: 'Fresh fruit smoothies, juices, and healthy snack options.',
      type: 'Juice Bar',
      price: '$',
      hours: '8 AM - 7 PM',
      location: 'Wellness Center',
      rating: 4.6,
      image: '🥤',
      color: '#ec4899',
      features: ['Fresh Juice', 'Protein Shakes', 'Healthy Snacks']
    },
    {
      id: 7,
      name: 'Game Room',
      category: 'recreation',
      description: 'Entertainment hub with pool tables, video games, and board games.',
      type: 'Gaming',
      price: 'Free',
      hours: '10 AM - Midnight',
      location: 'Student Center, Basement',
      rating: 4.4,
      image: '🎮',
      color: '#6366f1',
      features: ['Video Games', 'Pool Tables', 'Board Games']
    },
    {
      id: 8,
      name: 'Sandwich Shop',
      category: 'dining',
      description: 'Made-to-order sandwiches, wraps, and fresh salads.',
      type: 'Deli',
      price: '$',
      hours: '9 AM - 8 PM',
      location: 'Engineering Building',
      rating: 4.5,
      image: '🥪',
      color: '#f97316',
      features: ['Custom Orders', 'Grab & Go', 'Fresh Daily']
    },
    {
      id: 9,
      name: 'Ice Cream Parlor',
      category: 'cafes',
      description: 'Artisan ice cream with rotating flavors and toppings bar.',
      type: 'Dessert Shop',
      price: '$',
      hours: '11 AM - 10 PM',
      location: 'Student Plaza',
      rating: 4.9,
      image: '🍦',
      color: '#14b8a6',
      features: ['Premium Ice Cream', 'Vegan Options', 'Custom Sundaes']
    },
    {
      id: 10,
      name: 'Campus Convenience Store',
      category: 'shopping',
      description: 'Quick stop for snacks, drinks, toiletries, and essentials.',
      type: 'Convenience',
      price: '$',
      hours: '24/7',
      location: 'Residence Hall Complex',
      rating: 4.1,
      image: '🏪',
      color: '#84cc16',
      features: ['Open 24/7', 'Snacks', 'Essentials']
    },
    {
      id: 11,
      name: 'Outdoor Courtyard',
      category: 'recreation',
      description: 'Beautiful outdoor space with seating, games, and relaxation areas.',
      type: 'Outdoor Area',
      price: 'Free',
      hours: '24/7',
      location: 'Central Campus',
      rating: 4.7,
      image: '🌳',
      color: '#059669',
      features: ['Outdoor Seating', 'Green Space', 'Events']
    },
    {
      id: 12,
      name: 'Tech Shop',
      category: 'shopping',
      description: 'Electronics, accessories, and tech support services.',
      type: 'Electronics',
      price: '$$$',
      hours: '9 AM - 6 PM',
      location: 'IT Building',
      rating: 4.3,
      image: '💻',
      color: '#6366f1',
      features: ['Laptops', 'Accessories', 'Repairs']
    }
  ];

  const filteredPlaces = places.filter(place => {
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          place.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const highlights = [
    {
      icon: Utensils,
      title: 'Diverse Dining',
      description: 'Multiple restaurants and cafés with international cuisines'
    },
    {
      icon: Gamepad2,
      title: 'Fun & Recreation',
      description: 'Sports facilities, game rooms, and entertainment areas'
    },
    {
      icon: ShoppingBag,
      title: 'Convenient Shopping',
      description: 'Bookstores, convenience stores, and specialty shops'
    },
    {
      icon: Clock,
      title: 'Flexible Hours',
      description: 'Many venues open late and some available 24/7'
    }
  ];

  return (
    <div className={styles.dinePlayShopPage}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.highlight}>Dine</span>, <span className={styles.highlight}>Play</span> & <span className={styles.highlight}>Shop</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Everything you need for campus life - from delicious meals to entertainment and essentials
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
              placeholder="Search for dining, recreation, or shopping..."
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

        {/* Highlights Grid */}
        <div className={styles.highlightsSection}>
          <h2 className={styles.sectionTitle}>Campus Amenities</h2>
          <div className={styles.highlightsGrid}>
            {highlights.map((highlight, index) => {
              const Icon = highlight.icon;
              return (
                <div key={index} className={styles.highlightCard}>
                  <div className={styles.highlightIcon}>
                    <Icon className={styles.icon} />
                  </div>
                  <h3 className={styles.highlightTitle}>{highlight.title}</h3>
                  <p className={styles.highlightDescription}>{highlight.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Places Grid */}
        <div className={styles.placesSection}>
          <h2 className={styles.sectionTitle}>
            Explore Campus Venues
            <span className={styles.resultCount}>({filteredPlaces.length} places)</span>
          </h2>
          <div className={styles.placesGrid}>
            {filteredPlaces.map((place) => (
              <div key={place.id} className={styles.placeCard}>
                <div className={styles.placeHeader} style={{ background: `linear-gradient(135deg, ${place.color}dd, ${place.color})` }}>
                  <div className={styles.placeEmoji}>{place.image}</div>
                  <div className={styles.placeRating}>
                    <Star className={styles.starIcon} fill="currentColor" />
                    <span>{place.rating}</span>
                  </div>
                </div>
                <div className={styles.placeBody}>
                  <div className={styles.placeTop}>
                    <h3 className={styles.placeName}>{place.name}</h3>
                    <span className={styles.placeType}>{place.type}</span>
                  </div>
                  <p className={styles.placeDescription}>{place.description}</p>
                  
                  <div className={styles.placeDetails}>
                    <div className={styles.detailItem}>
                      <Clock className={styles.detailIcon} />
                      <span>{place.hours}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <MapPin className={styles.detailIcon} />
                      <span>{place.location}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <DollarSign className={styles.detailIcon} />
                      <span>{place.price}</span>
                    </div>
                  </div>

                  <div className={styles.features}>
                    {place.features.map((feature, idx) => (
                      <span key={idx} className={styles.featureTag}>{feature}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips Section */}
        <div className={styles.tipsSection}>
          <h2 className={styles.sectionTitle}>Campus Life Tips</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipNumber}>1</div>
              <h3 className={styles.tipTitle}>Meal Plans</h3>
              <p className={styles.tipText}>Check out meal plan options for convenient and affordable dining.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipNumber}>2</div>
              <h3 className={styles.tipTitle}>Student Discounts</h3>
              <p className={styles.tipText}>Show your student ID for special discounts at most venues.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipNumber}>3</div>
              <h3 className={styles.tipTitle}>Peak Hours</h3>
              <p className={styles.tipText}>Visit during off-peak hours to avoid crowds and long waits.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipNumber}>4</div>
              <h3 className={styles.tipTitle}>Campus Events</h3>
              <p className={styles.tipText}>Many venues host special events and promotions throughout the year.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DinePlayShop;
