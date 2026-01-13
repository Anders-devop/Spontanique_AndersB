import { Routes, Route } from 'react-router-dom';
import Events from './pages/Events';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Events />} />
      </Routes>
    </div>
  );
}

export default App;
