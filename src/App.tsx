import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Courses from "./pages/Courses";
import Dashboard from "./pages/Dashboard";
import CourseDetail from "./pages/CourseDetail";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Leaderboard from "./pages/Leaderboard";
import PendingApproval from "./pages/PendingApproval";
import Profile from "./pages/Profile";
import Forum from "./pages/Forum";
import ForumCategory from "./pages/ForumCategory";
import ForumTopic from "./pages/ForumTopic";
import ForumNewTopic from "./pages/ForumNewTopic";
import Quiz from "./pages/Quiz";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tanitim" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
