import { Suspense, lazy } from 'react'
import './App.css'
import Root from './routes/Root';
import Loader from './Components/Loader/Loader';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { CommunitiesProvider } from './contexts/CommunitiesContext';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Lazy load all page components for better code splitting
const Home = lazy(() => import('./Pages/Home/Home'));
const About = lazy(() => import('./Pages/About/About'));
const EventCalendar = lazy(() => import('./Pages/EventCalendar/EventCalendar'));
const Events = lazy(() => import('./Pages/Events/Events'));
const EventDetails = lazy(() => import('./Pages/EventDetails/EventDetails'));
const SavedEvents = lazy(() => import('./Pages/SavedEvents/SavedEvents'));
const InformationCenter = lazy(() => import('./Pages/InformationCenter/InformationCenter'));
const FormsApplications = lazy(() => import('./Pages/FormsApplications/FormsApplications'));
const PoliciesGuidelines = lazy(() => import('./Pages/PoliciesGuidelines/PoliciesGuidelines'));
const VirtualTour = lazy(() => import('./Pages/VirtualTour/VirtualTour'));
const PlanEventsPage = lazy(() => import('./Pages/PlamEvents/PlanEvents'));
const NotFound = lazy(() => import('./Pages/NotFound/NotFound'));
const SignIn = lazy(() => import('./Pages/SignIn/SignIn'));
const SignUp = lazy(() => import('./Pages/SignUp/SignUp'));
const Communities = lazy(() => import('./Pages/Communities/Communities'));
const AdminPanel = lazy(() => import('./Pages/AdminPanel/AdminPanel'));

const router = createBrowserRouter([
  { 
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Suspense fallback={<Loader />}><Home /></Suspense>
      },
       {
        path: "/about",
        element: <Suspense fallback={<Loader />}><About /></Suspense>
        
      },
      {
        path: "/signin",
        element: <Suspense fallback={<Loader />}><SignIn /></Suspense>
      },
      {
        path: "/signup",
        element: <Suspense fallback={<Loader />}><SignUp /></Suspense>
      },
      
        {
          path: "/calendar",
          element: <Suspense fallback={<Loader />}><EventCalendar /></Suspense>
        },
        {
          path: "/events",
          element: <Suspense fallback={<Loader />}><Events /></Suspense>
        },
        {
          path: "/events/:id",
          element: <Suspense fallback={<Loader />}><EventDetails /></Suspense>
        },
        {
          path: "/saved-events",
          element: <Suspense fallback={<Loader />}><SavedEvents /></Suspense>
        },
        {
          path: "/information",
          element: <Suspense fallback={<Loader />}><InformationCenter /></Suspense>
        },
        {
          path: "/information-center",
          element: <Suspense fallback={<Loader />}><InformationCenter /></Suspense>
        },
        {
          path: "/forms",
          element: <Suspense fallback={<Loader />}><FormsApplications /></Suspense>
        },
        {
          path: "/policies",
          element: <Suspense fallback={<Loader />}><PoliciesGuidelines /></Suspense>
        },
        {
          path: "/tour",
          element: <Suspense fallback={<Loader />}><VirtualTour /></Suspense>
        },
        {
          path: "/virtual-tour",
          element: <Suspense fallback={<Loader />}><VirtualTour /></Suspense>
        },
        {
        path: "/communities",
        element: <Suspense fallback={<Loader />}><Communities /></Suspense>
      },
        {
          path: "/plan-events",
          element: <Suspense fallback={<Loader />}><PlanEventsPage /></Suspense>
        },
      {
        path: "/admin-panel",
        element: <Suspense fallback={<Loader />}><AdminPanel /></Suspense>
      },  
        
      {
        path: "*",
        element: <Suspense fallback={<Loader />}><NotFound /></Suspense>
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
