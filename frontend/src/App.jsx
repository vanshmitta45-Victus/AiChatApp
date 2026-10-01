import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SpatialAppLayout from './components/layout/SpatialAppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Stage Components
import DashboardStage from './components/dashboard/DashboardStage'
import SpatialKanbanBoard from './components/kanban/SpatialKanbanBoard'
import ProjectsStage from './components/projects/ProjectsStage'
import TeamsStage from './components/teams/TeamsStage'
import SpatialChatContainer from './components/chat/SpatialChatContainer'
import SpatialNotepad from './components/notepad/SpatialNotepad'
import AIChatbot from './components/intelligence/AIChatbot'
import DocumentAnalyzer from './components/intelligence/DocumentAnalyzer'
import ResumeStudio from './components/intelligence/ResumeStudio'
import CodeInspector from './components/intelligence/CodeInspector'
import EvaluationHarness from './components/intelligence/EvaluationHarness'
import SelfHealingTestAssistant from './components/intelligence/SelfHealingTestAssistant'
import IdentityManagementPanel from './components/admin/IdentityManagementPanel'
import AuditStage from './components/admin/AuditStage'
import SettingsStage from './components/settings/SettingsStage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Spatial Shell Layout */}
        <Route path="/" element={<SpatialAppLayout />}>
          {/* 1. Workspace Subsystems */}
          <Route index element={<DashboardStage />} />
          <Route path="tasks" element={<SpatialKanbanBoard />} />
          <Route path="projects" element={<ProjectsStage />} />
          <Route path="teams" element={<TeamsStage />} />
          <Route path="chat" element={<SpatialChatContainer />} />
          <Route path="notes" element={<SpatialNotepad />} />

          {/* 2. AI Intelligence Suite */}
          <Route path="ai-chat" element={<AIChatbot />} />
          <Route path="documents" element={<DocumentAnalyzer />} />
          <Route path="resumes" element={<ResumeStudio />} />
          <Route path="code" element={<CodeInspector />} />
          <Route path="ai-eval" element={<EvaluationHarness />} />
          <Route path="self-heal" element={<SelfHealingTestAssistant />} />

          {/* 3. Administration (Strictly Guarded for ADMIN & MANAGER) */}
          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <IdentityManagementPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/audit"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <AuditStage />
              </ProtectedRoute>
            }
          />

          {/* 4. Settings */}
          <Route path="settings" element={<SettingsStage />} />

          {/* Fallback to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}