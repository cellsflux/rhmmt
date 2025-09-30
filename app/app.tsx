import WelcomeKit from '@/app/components/welcome/WelcomeKit'
import './styles/app.css'
import { Route, Routes } from 'react-router-dom'
import Home from './screens/Home'
import Agents from './screens/Agents'
import Departements from './screens/Departements'
import React from 'react'
import Specialite from './screens/Specialite'
import AgentDetail from './screens/AgentDetail'
import { UnderDevelopmentScreen } from './screens/404'
import RHCalculator from './screens/Utilitaire'

export default function App() {
  return (
    <Routes>
      <Route path="/" index element={<Home />} />
      <Route path="/agents" element={<Agents />} />
      <Route path="/departements" element={<Departements />} />
      <Route path="/specialite" element={<Specialite />} />
      <Route path="/agentDetails" element={<AgentDetail />} />
      <Route path="/welcome" element={<WelcomeKit />} />
      <Route path="/utilitaire" element={<RHCalculator />} />
      <Route path="*" element={<UnderDevelopmentScreen />} />
    </Routes>
  )
}
