import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { EditModeProvider } from './context/EditModeContext'
import { SiteAccessGuard } from './context/SiteAccessGuard'
import { SiteAccessProvider } from './context/SiteAccessContext'
import { SiteDataProvider } from './context/SiteDataContext'
import { GalleryPage } from './pages/GalleryPage'
import { HomePage } from './pages/HomePage'
import { ConnectionsPage } from './pages/ConnectionsPage'
import { GamesPage } from './pages/GamesPage'
import { JourneyPage } from './pages/JourneyPage'
import { TheatrePage } from './pages/TheatrePage'

export default function App() {
  return (
    <SiteDataProvider>
      <SiteAccessProvider>
        <SiteAccessGuard>
          <EditModeProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="theatre" element={<TheatrePage />} />
                  <Route path="gallery" element={<GalleryPage />} />
                  <Route path="journey" element={<JourneyPage />} />
                  <Route path="games" element={<GamesPage />} />
                  <Route path="games/connections" element={<ConnectionsPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </EditModeProvider>
        </SiteAccessGuard>
      </SiteAccessProvider>
    </SiteDataProvider>
  )
}
