import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Display from './pages/Display';
import Host from './pages/Host';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/display" element={<Display />} />
        <Route path="/host" element={<Host />} />
        <Route path="/" element={<Navigate to="/host" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
