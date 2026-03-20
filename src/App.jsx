import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import router from './routes';
import { ArtProvider } from './context/ArtContext';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import SocketStatus from './components/SocketStatus';
import SettingsPreview from './components/SettingsPreview';
import SettingsTest from './components/SettingsTest';
import './styles/settings.css';

function App() {
  return (
    <SettingsProvider>
      <UserProvider>
        <ArtProvider>
          <CartProvider>
            <RouterProvider router={router} />
            {/* Socket Connection Status Indicator */}
            {/* <SocketStatus />             */}
            {/* Settings Preview for Development - Bottom Right */}
            {/* <SettingsPreview /> */}
            {/* Settings Test Panel - Top Left (for debugging only) */}
            {/* <SettingsTest /> */}
            {/* Toast Notifications */}
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                // Default options
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                },
                // Success toast style
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4caf50',
                    secondary: '#fff',
                  },
                  style: {
                    background: '#4caf50',
                    color: '#fff',
                  },
                },
                // Error toast style
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#f44336',
                    secondary: '#fff',
                  },
                  style: {
                    background: '#f44336',
                    color: '#fff',
                  },
                },
              }}
            />
           
          </CartProvider>
        </ArtProvider>
      </UserProvider>
    </SettingsProvider>
  )
}

export default App;