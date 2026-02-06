import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import StockDashboard from './components/StockDashboard';
import Reports from './components/Reports';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<StockDashboard />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
