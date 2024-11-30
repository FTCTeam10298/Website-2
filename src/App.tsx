import './App.css'

import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import Footer from './components/footer/footer'
import NavBar from './components/navbar/navbar'
import About from './components/about/about';
import Home from './components/home/home'
import Team from './components/team/team';
import Seasons from './components/season/seasons';
import Sponsors from './components/sponsors/sponsors';

function App() {
  return (
    <>
      <NavBar/>
      <Router>
        <Routes>
          <Route path="/" element={<div>
          <Home/>
          </div>} />
          <Route path="/team" element={<div>
            <Team/>
          </div>} />
          <Route path="/about" element={<div>
            <About/>
          </div>} />
          <Route path="/seasons" element={<div>
            <Seasons/>
          </div>} />
          <Route path="/sponsors" element={<div>
            <Sponsors/>
          </div>} />
        </Routes>
      </Router>
      <Footer/>
    </>
  
  )
}

export default App
