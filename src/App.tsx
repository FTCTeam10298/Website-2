import './App.css'

import { lazy, Suspense } from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import Footer from './components/footer/footer'
import NavBar from './components/navbar/navbar'
import About from './components/about/about';
import Home from './components/home/home'
import Team from './components/team/team';
import Seasons from './components/season/seasons';
import Sponsors from './components/sponsors/sponsors';
import Awards from './components/awards/awards';

// Neuron Pathing is its own mini-site (no team navbar/footer), loaded on demand
const NeuronPathing = lazy(() => import('./components/neuron-pathing/NeuronPathing'));

function TeamSite() {
  return (
    <>
      <NavBar/>
      <div className="page">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/team" element={<Team/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/seasons" element={<Seasons/>} />
          <Route path="/sponsors" element={<Sponsors/>} />
          <Route path="/awards" element={<Awards/>} />

          {/* <Route path="/donations" element={<Donations/>} /> */}
        </Routes>
      </div>
      <Footer/>
    </>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/neuron-pathing/*" element={<Suspense fallback={null}><NeuronPathing/></Suspense>} />
        <Route path="*" element={<TeamSite/>} />
      </Routes>
    </Router>
  )
}

export default App
