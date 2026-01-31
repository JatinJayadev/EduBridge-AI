import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import Story from './components/Story'
import Footer from './components/Footer'

const App = () => {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Story />
      <Features />
      <Footer />
    </div>
  )
}

export default App
