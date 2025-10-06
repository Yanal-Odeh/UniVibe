import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './Pages/Home/Home'
import About from './Pages/About/About'
import Root from './routes/Root';
import NotFound from './Pages/NotFound/NotFound';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
//beed
const router = createBrowserRouter([
  { 
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Home />
      },
       {
        path: "/about",
        element: <About />
      },
    
      {
        path: "*",
        element: <NotFound />
      }
      
    ]
  },
]);

function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
