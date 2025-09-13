import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import UserProvider from './context/UserContext.jsx'
import {CaptainProvider} from './context/CaptainContext.jsx'  
import { SocketProvider } from './context/SocketContext.jsx'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

createRoot(document.getElementById('root')).render(
  <CaptainProvider>
    <UserProvider>
      <SocketProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SocketProvider>
    </UserProvider>
  </CaptainProvider>
)
