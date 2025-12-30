import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import router from './routes';
import { ArtProvider } from './context/ArtContext';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import SocketStatus from './components/SocketStatus';

function App() {
  return (
    <UserProvider>
      <ArtProvider>
        <CartProvider>
          <RouterProvider router={router} />
          {/* Socket Connection Status Indicator */}
          <SocketStatus />
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
  )
}

export default App;