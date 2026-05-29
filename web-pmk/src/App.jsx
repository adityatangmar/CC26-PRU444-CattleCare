import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Deteksi from './pages/Deteksi';
import Hasil from './pages/Hasil';

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/deteksi" element={<Deteksi />} />
          <Route path="/hasil" element={<Hasil />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;