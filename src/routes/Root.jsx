import React from 'react'
import Navbar from '../Components/Navbar/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../Components/Footer/Footer'
import ScrollToTop from '../Components/ScrollToTop'
import { AdminAuthProvider } from '../contexts/AdminAuthContext'
import { CommunitiesProvider } from '../contexts/CommunitiesContext'

function Root() {
  return (
    <AdminAuthProvider>
      <CommunitiesProvider>
        <ScrollToTop />
        <Navbar />
        <Outlet />
        <Footer />
      </CommunitiesProvider>
    </AdminAuthProvider>
  )
}

export default Root