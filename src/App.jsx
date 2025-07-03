import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Menu from './pages/Menu';
import Level01 from './pages/Level01';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/level-01" element={<Level01 />} />
      </Routes>
    </Router>
  );
}

export default App; 