import React from 'react'
import Navbar from '../Components/Navbar/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../Components/Footer/Footer'
import ScrollToTop from '../Components/ScrollToTop'

function Root() {
  return (
      <>
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <Footer />
      </>
  )
}

export default Root