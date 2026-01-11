import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Layout from '@/components/Layout';
import api from '@/lib/api';

export default function HomeScreen() {
  const router = useRouter();
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoadingEvents(true);
      const data = await api.getEvents();
      const eventsList = data.events || data || [];
      
      // Filter approved events and get upcoming ones (next 3)
      const now = new Date();
      const approvedEvents = eventsList
        .filter((e: any) => e.status === 'APPROVED')
        .filter((e: any) => new Date(e.startDate) >= now)
        .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 3);
      
      setUpcomingEvents(approvedEvents);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: any = {
      'Technology': '#4f46e5',
      'Cultural': '#ec4899',
      'Educational': '#10b981',
      'Career': '#f59e0b',
      'Sports': '#ef4444',
      'General': '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <View className="h-[500px] relative">
        <ImageBackground
          source={require('@/assets/images/NNU.jpg')}
          className="h-full w-full"
          resizeMode="cover"
        >
          {/* Hero Content */}
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-white text-5xl font-black text-center mb-4 tracking-widest" style={{textShadowColor: 'rgba(0, 0, 0, 0.95)', textShadowOffset: {width: 0, height: 3}, textShadowRadius: 16}}>
              INTERACT. LEARN. ENJOY.
            </Text>
            <Text className="text-white text-lg text-center mb-8 max-w-md font-medium" style={{textShadowColor: 'rgba(0, 0, 0, 0.95)', textShadowOffset: {width: 0, height: 3}, textShadowRadius: 16}}>
              Your hub for campus life, events, and community connections
            </Text>
            
            {/* Hero Buttons */}
            <View className="flex-row gap-4">
              <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-lg flex-row items-center">
                <Text className="text-white font-semibold text-base mr-2">Explore Events</Text>
                <Text className="text-white">→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="bg-white/20 border-2 border-white px-6 py-3 rounded-lg">
                <Text className="text-white font-semibold text-base">Join Communities</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Stats Section */}
      <View className="bg-white py-12 px-4">
        <View className="flex-row flex-wrap justify-center" style={{gap: 12}}>
          {/* Stat 1 */}
          <View style={{width: '47%', minWidth: 150}}>
            <View className="bg-gray-50 rounded-xl p-6 items-center shadow-sm border border-gray-100">
              <Text className="text-4xl font-extrabold mb-2" style={{color: '#667eea'}}>
                6+
              </Text>
              <Text className="text-gray-600 text-xs text-center font-medium">
                Active Communities
              </Text>
            </View>
          </View>
          
          {/* Stat 2 */}
          <View style={{width: '47%', minWidth: 150}}>
            <View className="bg-gray-50 rounded-xl p-6 items-center shadow-sm border border-gray-100">
              <Text className="text-4xl font-extrabold mb-2" style={{color: '#667eea'}}>
                50+
              </Text>
              <Text className="text-gray-600 text-xs text-center font-medium">
                Events Monthly
              </Text>
            </View>
          </View>
          
          {/* Stat 3 */}
          <View style={{width: '47%', minWidth: 150}}>
            <View className="bg-gray-50 rounded-xl p-6 items-center shadow-sm border border-gray-100">
              <Text className="text-4xl font-extrabold mb-2" style={{color: '#667eea'}}>
                1000+
              </Text>
              <Text className="text-gray-600 text-xs text-center font-medium">
                Active Students
              </Text>
            </View>
          </View>
          
          {/* Stat 4 */}
          <View style={{width: '47%', minWidth: 150}}>
            <View className="bg-gray-50 rounded-xl p-6 items-center shadow-sm border border-gray-100">
              <Text className="text-4xl font-extrabold mb-2" style={{color: '#667eea'}}>
                24/7
              </Text>
              <Text className="text-gray-600 text-xs text-center font-medium">
                Access Available
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Features Section */}
      <View className="py-12 px-4 bg-gray-50">
        {/* Section Header */}
        <View className="items-center mb-8">
          <Text className="text-4xl mb-2">✨</Text>
          <Text className="text-3xl font-bold text-gray-800 mb-2">What We Offer</Text>
          <Text className="text-gray-600 text-center">Everything you need for an amazing campus experience</Text>
        </View>

        {/* Features Grid */}
        <View className="flex-row flex-wrap justify-between">
          {/* Feature 1 - Join Communities */}
          <View style={{width: '48%', marginBottom: 16}}>
            <View className="bg-white rounded-2xl p-5 shadow-lg border-l-4 border-purple-500" style={{minHeight: 220}}>
              <View className="bg-purple-500 w-14 h-14 rounded-full items-center justify-center mb-3">
                <Text className="text-white text-2xl">👥</Text>
              </View>
              <Text className="text-lg font-bold text-gray-800 mb-2">Join Communities</Text>
              <Text className="text-gray-600 text-xs mb-3">Connect with like-minded students and join vibrant communities</Text>
              <Text className="text-purple-500 font-semibold text-xs">Learn More →</Text>
            </View>
          </View>

          {/* Feature 2 - Upcoming Events */}
          <View style={{width: '48%', marginBottom: 16}}>
            <View className="bg-white rounded-2xl p-5 shadow-lg border-l-4 border-blue-500" style={{minHeight: 220}}>
              <View className="bg-blue-500 w-14 h-14 rounded-full items-center justify-center mb-3">
                <Text className="text-white text-2xl">📅</Text>
              </View>
              <Text className="text-lg font-bold text-gray-800 mb-2">Upcoming Events</Text>
              <Text className="text-gray-600 text-xs mb-3">Discover and participate in exciting campus events</Text>
              <Text className="text-blue-500 font-semibold text-xs">Learn More →</Text>
            </View>
          </View>

          {/* Feature 3 - Study Spaces */}
          <View style={{width: '48%', marginBottom: 16}}>
            <View className="bg-white rounded-2xl p-5 shadow-lg border-l-4 border-green-500" style={{minHeight: 220}}>
              <View className="bg-green-500 w-14 h-14 rounded-full items-center justify-center mb-3">
                <Text className="text-white text-2xl">📚</Text>
              </View>
              <Text className="text-lg font-bold text-gray-800 mb-2">Study Spaces</Text>
              <Text className="text-gray-600 text-xs mb-3">Find the perfect spot to study and collaborate</Text>
              <Text className="text-green-500 font-semibold text-xs">Learn More →</Text>
            </View>
          </View>

          {/* Feature 4 - Dine & Relax */}
          <View style={{width: '48%', marginBottom: 16}}>
            <View className="bg-white rounded-2xl p-5 shadow-lg border-l-4 border-pink-500" style={{minHeight: 220}}>
              <View className="bg-pink-500 w-14 h-14 rounded-full items-center justify-center mb-3">
                <Text className="text-white text-2xl">☕</Text>
              </View>
              <Text className="text-lg font-bold text-gray-800 mb-2">Dine & Relax</Text>
              <Text className="text-gray-600 text-xs mb-3">Explore dining options and relaxation areas</Text>
              <Text className="text-pink-500 font-semibold text-xs">Learn More →</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Upcoming Events Section */}
      <View className="py-12 px-4 bg-white">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800 text-center mb-2">Upcoming Events</Text>
          <Text className="text-gray-600 text-center mb-2">Discover exciting events happening on campus</Text>
          <View className="w-16 h-1 mx-auto rounded-full" style={{backgroundColor: '#0064a4'}}></View>
        </View>

        {loadingEvents ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#667eea" />
            <Text className="text-gray-600 mt-4">Loading events...</Text>
          </View>
        ) : upcomingEvents.length === 0 ? (
          <View className="items-center py-8">
            <Text className="text-4xl mb-4">📅</Text>
            <Text className="text-gray-600 text-center">No upcoming events at the moment</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row" style={{gap: 16}}>
              {upcomingEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => router.push(`/event-details?id=${event.id}`)}
                  style={{width: 300}}
                >
                  <View className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Event Header with Gradient */}
                    <View 
                      className="p-6"
                      style={{
                        backgroundColor: '#0064a4',
                      }}
                    >
                      <View className="flex-row justify-between items-start mb-3">
                        <View 
                          className="px-3 py-1 rounded-full"
                          style={{backgroundColor: 'rgba(255, 255, 255, 0.3)'}}
                        >
                          <Text className="text-white text-xs font-semibold">{event.category}</Text>
                        </View>
                        {event.capacity && (
                          <View 
                            className="px-3 py-1 rounded-full"
                            style={{backgroundColor: 'rgba(255, 255, 255, 0.3)'}}
                          >
                            <Text className="text-white text-xs font-semibold">
                              {event.registeredCount || 0}/{event.capacity}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-white text-2xl font-bold mb-2" numberOfLines={2}>
                        {event.title}
                      </Text>
                    </View>

                    {/* Event Details */}
                    <View className="p-4">
                      <View className="flex-row items-center mb-3">
                        <Text className="text-lg mr-2">📅</Text>
                        <Text className="text-gray-700 text-sm font-medium">
                          {formatDate(event.startDate)}
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center mb-3">
                        <Text className="text-lg mr-2">🕐</Text>
                        <Text className="text-gray-700 text-sm">
                          {formatTime(event.startDate)}
                        </Text>
                      </View>

                      {event.location && (
                        <View className="flex-row items-start mb-4">
                          <Text className="text-lg mr-2">📍</Text>
                          <Text className="text-gray-700 text-sm flex-1" numberOfLines={2}>
                            {event.location}
                          </Text>
                        </View>
                      )}

                      <TouchableOpacity 
                        className="py-3 rounded-lg items-center"
                        style={{backgroundColor: '#0064a4'}}
                        onPress={() => router.push(`/event-details?id=${event.id}`)}
                      >
                        <Text className="text-white font-semibold">View Details →</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* View All Events Button */}
        {upcomingEvents.length > 0 && (
          <TouchableOpacity 
            className="mt-6 px-6 py-4 rounded-lg items-center"
            style={{backgroundColor: '#0064a4'}}
            onPress={() => router.push('/event-calendar')}
          >
            <Text className="text-white font-semibold text-base">View All Events →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Info Cards Section */}
      <View className="py-12 px-4 bg-white">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800 text-center mb-2">Student Services</Text>
          <View className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></View>
        </View>
        <View className="flex-row flex-wrap justify-between">
          {/* Card 1 - Hours */}
          <View style={{width: '48%', marginBottom: 16}}>
            <View className="bg-white rounded-xl shadow-md p-4 border border-gray-200" style={{minHeight: 280, flex: 1, justifyContent: 'space-between'}}>
              <View>
                <View className="items-center mb-3">
                  <Text className="text-3xl mb-1">🕐</Text>
                  <Text className="text-lg font-bold text-gray-800">Hours</Text>
                </View>
                <Text className="text-gray-600 font-semibold text-xs mb-1">Building</Text>
                <Text className="text-gray-700 text-xs mb-1">7:00 a.m. - midnight</Text>
                <Text className="text-gray-700 text-xs mb-2">Monday - Sunday</Text>
                <Text className="text-gray-500 text-xs mb-3">Closed seasonally | Weekends</Text>
              </View>
              <View>
                <TouchableOpacity className="bg-blue-600 px-3 py-2 rounded-lg mb-2">
                  <Text className="text-white font-semibold text-xs text-center">Shop, Play, Sleep</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-200 px-3 py-2 rounded-lg">
                  <Text className="text-gray-700 font-semibold text-xs text-center">Services</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Card 2 - Events */}
          <View style={{width: '48%', marginBottom: 16}}>
            <View className="bg-white rounded-xl shadow-md p-4 border border-gray-200" style={{minHeight: 280, flex: 1, justifyContent: 'space-between'}}>
              <View>
                <View className="items-center mb-3">
                  <Text className="text-3xl mb-1">📅</Text>
                  <Text className="text-lg font-bold text-gray-800">Events</Text>
                </View>
                <Text className="text-gray-600 text-xs mb-3">Social, educational and cultural</Text>
              </View>
              <View>
                <TouchableOpacity className="bg-blue-600 px-3 py-2 rounded-lg mb-2">
                  <Text className="text-white font-semibold text-xs text-center">Plan an Event</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-200 px-3 py-2 rounded-lg">
                  <Text className="text-gray-700 font-semibold text-xs text-center">Event Calendar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Card 3 - Study */}
          <View style={{width: '48%', marginBottom: 16}}>
            <View className="bg-white rounded-xl shadow-md p-4 border border-gray-200" style={{minHeight: 280, flex: 1, justifyContent: 'space-between'}}>
              <View>
                <View className="items-center mb-3">
                  <Text className="text-3xl mb-1">📚</Text>
                  <Text className="text-lg font-bold text-gray-800">Study</Text>
                </View>
                <Text className="text-gray-600 text-xs mb-3">The Student Center provides quiet places for students to do work, on-call, and also offers rooms available for group work.</Text>
              </View>
              <View>
                <TouchableOpacity className="bg-blue-600 px-3 py-2 rounded-lg mb-2">
                  <Text className="text-white font-semibold text-xs text-center">Book a Study Room</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-200 px-3 py-2 rounded-lg">
                  <Text className="text-gray-700 font-semibold text-xs text-center">Study Spaces</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Card 4 - Directions */}
          <View style={{width: '48%', marginBottom: 16}}>
            <View className="bg-white rounded-xl shadow-md p-4 border border-gray-200" style={{minHeight: 280, flex: 1, justifyContent: 'space-between'}}>
              <View>
                <View className="items-center mb-3">
                  <Text className="text-3xl mb-1">📍</Text>
                  <Text className="text-lg font-bold text-gray-800">Directions</Text>
                </View>
                <Text className="text-gray-600 text-xs mb-3">Find your way to the Student Center and elsewhere on campus</Text>
              </View>
              <View>
                <TouchableOpacity className="bg-blue-600 px-3 py-2 rounded-lg mb-2">
                  <Text className="text-white font-semibold text-xs text-center">Get Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-200 px-3 py-2 rounded-lg">
                  <Text className="text-gray-700 font-semibold text-xs text-center">Campus Map</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Community Spotlight Section */}
      <View className="py-12 px-4 bg-gradient-to-br from-purple-50 to-blue-50">
        <Text className="text-3xl font-bold text-gray-800 mb-4">Join Our Vibrant Communities</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          Connect with students who share your interests. From tech enthusiasts to artists, 
          athletes to musicians, there's a community for everyone at UniVibe.
        </Text>

        {/* Community Features */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-3">🎵</Text>
            <Text className="text-gray-700 text-base font-medium">Music & Arts</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-3">👥</Text>
            <Text className="text-gray-700 text-base font-medium">Sports & Fitness</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-3">📷</Text>
            <Text className="text-gray-700 text-base font-medium">Photography</Text>
          </View>
        </View>

        {/* Community Cards */}
        <View className="flex-row flex-wrap mb-6">
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-lg p-4 shadow-sm items-center">
              <Text className="text-3xl mb-2">🖥️</Text>
              <Text className="text-gray-700 text-sm font-medium">Computer Science</Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-lg p-4 shadow-sm items-center">
              <Text className="text-3xl mb-2">🎨</Text>
              <Text className="text-gray-700 text-sm font-medium">Art & Design</Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-lg p-4 shadow-sm items-center">
              <Text className="text-3xl mb-2">📚</Text>
              <Text className="text-gray-700 text-sm font-medium">Book Club</Text>
            </View>
          </View>
          <View className="w-1/2 p-2">
            <View className="bg-white rounded-lg p-4 shadow-sm items-center">
              <Text className="text-3xl mb-2">⚽</Text>
              <Text className="text-gray-700 text-sm font-medium">Sports</Text>
            </View>
          </View>
        </View>

        {/* Explore Button */}
        <TouchableOpacity className="px-6 py-4 rounded-lg flex-row items-center justify-center" style={{backgroundColor: '#0064a4'}}>
          <Text className="text-white font-semibold text-base mr-2">Explore All Communities</Text>
          <Text className="text-white">→</Text>
        </TouchableOpacity>
      </View>

    </Layout>
  );
}

// Styles are not needed since we're using Tailwind
