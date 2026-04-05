import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ToastProvider } from './components/ToastProvider.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Landing from './pages/Landing.jsx'
import AppPage from './pages/AppPage.jsx'
import Features from './pages/Features.jsx'
import About from './pages/About.jsx'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </AnimatePresence>
  )
}

function AppInner() {
  const location = useLocation()
  const isAppPage = location.pathname === '/app'

  return (
    <div className="min-h-screen bg-bg-primary text-white font-dm flex flex-col">
      <Navbar />
      <main className={`flex-1 ${isAppPage ? '' : ''}`}>
        <AnimatedRoutes />
      </main>
      {!isAppPage && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </BrowserRouter>
  )
}
