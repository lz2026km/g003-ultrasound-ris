import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SanguoshaPage from './pages/SanguoshaPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SanguoshaPage />} />
      </Routes>
    </BrowserRouter>
  )
}
