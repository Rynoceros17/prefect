import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { EditModeProvider } from './context/EditModeContext'
import { SiteDataProvider } from './context/SiteDataContext'
import { GalleryPage } from './pages/GalleryPage'
import { HomePage } from './pages/HomePage'
import { JourneyPage } from './pages/JourneyPage'
import { TheatrePage } from './pages/TheatrePage'

export default function App() {
  return (
    <SiteDataProvider>
      <EditModeProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="theatre" element={<TheatrePage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="journey" element={<JourneyPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </EditModeProvider>
    </SiteDataProvider>
  )
}
