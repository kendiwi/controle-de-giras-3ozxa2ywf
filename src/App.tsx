import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from './hooks/use-auth'
import { ActiveGroupProvider } from './contexts/ActiveGroupContext'

import Layout from './components/Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import AuthPage from './pages/AuthPage'
import GroupsPage from './pages/GroupsPage'
import GirasPage from './pages/GirasPage'
import GiraCreatePage from './pages/GiraCreatePage'
import GiraDetailPage from './pages/GiraDetailPage'
import MediumsPage from './pages/MediumsPage'
import ListsPage from './pages/ListsPage'
import ListDetailPage from './pages/ListDetailPage'
import ReportsPage from './pages/ReportsPage'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <ActiveGroupProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/giras" element={<GirasPage />} />
              <Route path="/giras/new" element={<GiraCreatePage />} />
              <Route path="/giras/:id" element={<GiraDetailPage />} />
              <Route path="/mediums" element={<MediumsPage />} />
              <Route path="/lists" element={<ListsPage />} />
              <Route path="/lists/:id" element={<ListDetailPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </ActiveGroupProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
