import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import Story from './components/Story'

const App = () => {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Story />
      <Features />
    </div>
  )
}

export default App
