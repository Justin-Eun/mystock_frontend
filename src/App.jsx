import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import StockDashboard from './components/StockDashboard';
import Reports from './components/Reports';
import AgentReview from './components/AgentReview';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<StockDashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/agent" element={<AgentReview />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
