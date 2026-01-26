import React from 'react'
import Navbar from '../Components/Navbar/Navbar'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../Components/Footer/Footer'
import ScrollToTop from '../Components/ScrollToTop'
import { AdminAuthProvider } from '../contexts/AdminAuthContext'
import { CommunitiesProvider } from '../contexts/CommunitiesContext'
import { ChatProvider } from '../contexts/ChatContext'

function Root() {
  const location = useLocation();
  const hideFooter = location.pathname === '/signin' || location.pathname === '/signup';

  return (
    <AdminAuthProvider>
      <ChatProvider>
        <CommunitiesProvider>
          <ScrollToTop />
          <Navbar />
          <Outlet />
          {!hideFooter && <Footer />}
        </CommunitiesProvider>
      </ChatProvider>
    </AdminAuthProvider>
  )
}

export default Root
