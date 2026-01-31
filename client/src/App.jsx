import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import Story from './components/Story'
import VideoTranslator from './components/VideoTranslator'
import './components/VideoTranslator.css'

const App = () => {
  const [showTranslator, setShowTranslator] = useState(false)

  if (showTranslator) {
    return <VideoTranslator />
  }

  return (
    <div className="app">
      <Navbar />
      <Hero onGetStarted={() => setShowTranslator(true)} />
      <HowItWorks />
      <Story />
      <Features />
    </div>
  )
}

export default App
