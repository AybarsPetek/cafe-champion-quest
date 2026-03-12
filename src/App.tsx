import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import PwaUpdatePrompt from "./components/PwaUpdatePrompt";

// Lazy load all non-index routes
const Landing = lazy(() => import("./pages/Landing"));
const Contact = lazy(() => import("./pages/Contact"));
const Courses = lazy(() => import("./pages/Courses"));
const Payment = lazy(() => import("./pages/Payment"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const PendingApproval = lazy(() => import("./pages/PendingApproval"));
const Profile = lazy(() => import("./pages/Profile"));
const Forum = lazy(() => import("./pages/Forum"));
const ForumCategory = lazy(() => import("./pages/ForumCategory"));
const ForumTopic = lazy(() => import("./pages/ForumTopic"));
const ForumNewTopic = lazy(() => import("./pages/ForumNewTopic"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Library = lazy(() => import("./pages/Library"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PwaUpdatePrompt />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tanitim" element={<Landing />} />
            <Route path="/iletisim" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute allowPasswordChange>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
            <Route path="/courses" element={<Courses />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/library" element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            } />
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/category/:categoryId" element={<ForumCategory />} />
            <Route path="/forum/topic/:topicId" element={<ForumTopic />} />
            <Route
              path="/forum/new"
              element={
                <ProtectedRoute>
                  <ForumNewTopic />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/course/:id" 
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz/:courseId" 
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
