import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Layout from '@/components/Layout';

export default function HomeScreen() {
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
        <View className="flex-row flex-wrap justify-center">
          {/* Feature 1 - Join Communities */}
          <View className="w-full sm:w-1/2 p-2">
            <View className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
              <View className="bg-purple-500 w-16 h-16 rounded-full items-center justify-center mb-4">
                <Text className="text-white text-3xl">👥</Text>
              </View>
              <Text className="text-xl font-bold text-gray-800 mb-2">Join Communities</Text>
              <Text className="text-gray-600 mb-4">Connect with like-minded students and join vibrant communities</Text>
              <Text className="text-purple-500 font-semibold">Learn More →</Text>
            </View>
          </View>

          {/* Feature 2 - Upcoming Events */}
          <View className="w-full sm:w-1/2 p-2">
            <View className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
              <View className="bg-blue-500 w-16 h-16 rounded-full items-center justify-center mb-4">
                <Text className="text-white text-3xl">📅</Text>
              </View>
              <Text className="text-xl font-bold text-gray-800 mb-2">Upcoming Events</Text>
              <Text className="text-gray-600 mb-4">Discover and participate in exciting campus events</Text>
              <Text className="text-blue-500 font-semibold">Learn More →</Text>
            </View>
          </View>

          {/* Feature 3 - Study Spaces */}
          <View className="w-full sm:w-1/2 p-2">
            <View className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
              <View className="bg-green-500 w-16 h-16 rounded-full items-center justify-center mb-4">
                <Text className="text-white text-3xl">📚</Text>
              </View>
              <Text className="text-xl font-bold text-gray-800 mb-2">Study Spaces</Text>
              <Text className="text-gray-600 mb-4">Find the perfect spot to study and collaborate</Text>
              <Text className="text-green-500 font-semibold">Learn More →</Text>
            </View>
          </View>

          {/* Feature 4 - Dine & Relax */}
          <View className="w-full sm:w-1/2 p-2">
            <View className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-pink-500">
              <View className="bg-pink-500 w-16 h-16 rounded-full items-center justify-center mb-4">
                <Text className="text-white text-3xl">☕</Text>
              </View>
              <Text className="text-xl font-bold text-gray-800 mb-2">Dine & Relax</Text>
              <Text className="text-gray-600 mb-4">Explore dining options and relaxation areas</Text>
              <Text className="text-pink-500 font-semibold">Learn More →</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Info Cards Section */}
      <View className="py-12 px-4 bg-white">
        {/* Card 1 - Hours */}
        <View className="bg-white rounded-xl shadow-md p-6 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Text className="text-4xl mr-3">🕐</Text>
            <Text className="text-2xl font-bold text-gray-800">Hours</Text>
          </View>
          <Text className="text-gray-600 font-semibold mb-1">Building</Text>
          <Text className="text-gray-700 mb-2">7:00 a.m. - midnight{'\n'}Monday - Sunday</Text>
          <Text className="text-gray-500 text-sm mb-4">Closed seasonally | Weekends</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg flex-1">
              <Text className="text-white font-semibold text-center">Shop, Play, Sleep</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 px-4 py-2 rounded-lg flex-1">
              <Text className="text-gray-700 font-semibold text-center">Services</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 2 - Events */}
        <View className="bg-white rounded-xl shadow-md p-6 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Text className="text-4xl mr-3">📅</Text>
            <Text className="text-2xl font-bold text-gray-800">Events</Text>
          </View>
          <Text className="text-gray-600 mb-4">Social, educational and cultural</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg flex-1">
              <Text className="text-white font-semibold text-center">Plan an Event</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 px-4 py-2 rounded-lg flex-1">
              <Text className="text-gray-700 font-semibold text-center">Event Calendar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 3 - Study */}
        <View className="bg-white rounded-xl shadow-md p-6 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Text className="text-4xl mr-3">📚</Text>
            <Text className="text-2xl font-bold text-gray-800">Study</Text>
          </View>
          <Text className="text-gray-600 mb-4">The Student Center provides quiet places for students to do work, on-call, and also offers rooms available for group work.</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg flex-1">
              <Text className="text-white font-semibold text-center">Book a Study Room</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 px-4 py-2 rounded-lg flex-1">
              <Text className="text-gray-700 font-semibold text-center">Study Spaces</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 4 - Directions */}
        <View className="bg-white rounded-xl shadow-md p-6 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Text className="text-4xl mr-3">📍</Text>
            <Text className="text-2xl font-bold text-gray-800">Directions</Text>
          </View>
          <Text className="text-gray-600 mb-4">Find your way to the Student Center and elsewhere on campus</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg flex-1">
              <Text className="text-white font-semibold text-center">Information Center</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 px-4 py-2 rounded-lg flex-1">
              <Text className="text-gray-700 font-semibold text-center">Parking</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 5 - Employment */}
        <View className="bg-white rounded-xl shadow-md p-6 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Text className="text-4xl mr-3">💼</Text>
            <Text className="text-2xl font-bold text-gray-800">Employment</Text>
          </View>
          <Text className="text-gray-600 mb-4">Do you want to be part of our team? Find out about openings at the Student Center.</Text>
          <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg">
            <Text className="text-white font-semibold text-center">Student Employment Opportunities</Text>
          </TouchableOpacity>
        </View>

        {/* Card 6 - Work Orders */}
        <View className="bg-white rounded-xl shadow-md p-6 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Text className="text-4xl mr-3">📋</Text>
            <Text className="text-2xl font-bold text-gray-800">Work Orders</Text>
          </View>
          <Text className="text-gray-600 mb-4">Departments can use this form to request a special or repair of repair in the Student Center.</Text>
          <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-lg">
            <Text className="text-white font-semibold text-center">Work Order Request Form</Text>
          </TouchableOpacity>
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
        <TouchableOpacity className="bg-purple-600 px-6 py-4 rounded-lg flex-row items-center justify-center">
          <Text className="text-white font-semibold text-base mr-2">Explore All Communities</Text>
          <Text className="text-white">→</Text>
        </TouchableOpacity>
      </View>

    </Layout>
  );
}

// Styles are not needed since we're using Tailwind
