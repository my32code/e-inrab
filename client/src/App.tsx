import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Contact } from './pages/Contact';
import { Catalogue } from './pages/Catalogue';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MonCompte } from './pages/MonCompte';
import { Admin } from './pages/Admin';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import { ServiceRequest } from './pages/ServiceRequest';

function App() {
  return (
    <AuthProvider>
    <div className="min-h-screen bg-gray-50 main-background">
      <Navbar />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/services" element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          } />
          <Route path="/services/demande/:serviceId" element={
            <ProtectedRoute>
              <ServiceRequest />
            </ProtectedRoute>
          } />
          <Route path="/produits/demande/:productId" element={
            <ProtectedRoute>
              <ServiceRequest />
            </ProtectedRoute>
          } />
          <Route path="/contact" element={
            <Contact />
          } />
          <Route path="/catalogue" element={
            <ProtectedRoute>
              <Catalogue />
            </ProtectedRoute>
          } />
          <Route path="/mon-compte" element={
            <ProtectedRoute>
              <MonCompte />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
      <Footer />
      <ToastContainer position="bottom-right" />
    </div>
    </AuthProvider>
  );
}

export default App;