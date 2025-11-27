import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './Pages/Home/Home'
import About from './Pages/About/About'
import EventCalendar from './Pages/EventCalendar/EventCalendar'
import Events from './Pages/Events/Events'
import EventDetails from './Pages/EventDetails/EventDetails'
import InformationCenter from './Pages/InformationCenter/InformationCenter'
import FormsApplications from './Pages/FormsApplications/FormsApplications'
import PoliciesGuidelines from './Pages/PoliciesGuidelines/PoliciesGuidelines'
import VirtualTour from './Pages/VirtualTour/VirtualTour'
import PlanEventsPage from './Pages/PlamEvents/PlanEvents'
import Root from './routes/Root';
import NotFound from './Pages/NotFound/NotFound';
import SignIn from './Pages/SignIn/SignIn';
import SignUp from './Pages/SignUp/SignUp';
import Communities from './Pages/Communities/Communities';
import AdminPanel from './Pages/AdminPanel/AdminPanel';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { CommunitiesProvider } from './contexts/CommunitiesContext';
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
        path: "/signin",
        element: <SignIn />
      },
      {
        path: "/signup",
        element: <SignUp />
      },
      
        {
          path: "/calendar",
          element: <EventCalendar />
        },
        {
          path: "/events",
          element: <Events />
        },
        {
          path: "/events/:id",
          element: <EventDetails />
        },
        {
          path: "/information",
          element: <InformationCenter />
        },
        {
          path: "/information-center",
          element: <InformationCenter />
        },
        {
          path: "/forms",
          element: <FormsApplications />
        },
        {
          path: "/policies",
          element: <PoliciesGuidelines />
        },
        {
          path: "/tour",
          element: <VirtualTour />
        },
        {
          path: "/virtual-tour",
          element: <VirtualTour />
        },
        {
        path: "/communities",
        element: <Communities />
      },
        {
          path: "/plan-events",
          element: <PlanEventsPage />
        },
      {
        path: "/admin-panel",
        element: <AdminPanel />
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
    <AdminAuthProvider>
      <CommunitiesProvider>
        <RouterProvider router={router} />
      </CommunitiesProvider>
    </AdminAuthProvider>
  )
}

export default App
