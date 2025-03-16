import './App.css'

import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import Footer from './components/footer/footer'
import NavBar from './components/navbar/navbar'
import About from './components/about/about';
import Home from './components/home/home'
import Team from './components/team/team';
import Seasons from './components/season/seasons';
import Sponsors from './components/sponsors/sponsors';
import Awards from './components/awards/awards';
import Donations from './components/donations/donations';
function App() {
  return (
    <>
      <NavBar/>
      <div className="content">
        <Router>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/team" element={<Team/>} />
            <Route path="/about" element={<About/>} />
            <Route path="/seasons" element={<Seasons/>} />
            <Route path="/sponsors" element={<Sponsors/>} />
            <Route path="/awards" element={<Awards/>} />
            <Route path="/donations" element={<Donations/>} />
          </Routes>
        </Router>
      </div>
      <Footer/>
    </>
  )
}

export default App
