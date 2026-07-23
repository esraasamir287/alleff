import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Benefits } from './components/sections/Benefits';
import { HowItWorks } from './components/sections/HowItWorks';
import { Instructor } from './components/sections/Instructor';
import { FAQ } from './components/sections/FAQ';
import { FinalCTA } from './components/sections/FinalCTA';
import { FloatingWhatsApp } from './components/ui/FloatingWhatsApp';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProfileCompletionPage } from './pages/ProfileCompletionPage';
import { QuizIntroPage } from './pages/QuizIntroPage';
import { QuizPage } from './pages/QuizPage';
import { QuizReviewPage } from './pages/QuizReviewPage';
import { QuizResultPage } from './pages/QuizResultPage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <About />
        <Benefits />
        <HowItWorks />
        <Instructor />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute requireProfileComplete={false}>
                <ProfileCompletionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <QuizIntroPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/run/:attemptId"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/review/:attemptId"
            element={
              <ProtectedRoute>
                <QuizReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/result/:attemptId"
            element={
              <ProtectedRoute>
                <QuizResultPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
