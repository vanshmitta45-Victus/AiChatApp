import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import FloatingSidebar from './FloatingSidebar'
import SpatialTopBar from './SpatialTopBar'
import CommandPaletteModal from './CommandPaletteModal'

export default function SpatialAppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  // Global Ctrl+K / Cmd+K keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="spatial-canvas min-h-screen text-slate-100 flex p-3 md:p-5 gap-4 relative overflow-hidden">
      {/* Ambient background glows & 3D coordinate mesh */}
      <div className="spatial-glow-orb-indigo" />
      <div className="spatial-glow-orb-cyan" />
      <div className="spatial-mesh-grid" />

      {/* 1. Floating Detached Glass Sidebar */}
      <FloatingSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />

      {/* 2. Main Central Stage Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 h-[calc(100vh-2rem)] md:h-[calc(100vh-2.5rem)]">
        {/* Floating Top Bar */}
        <SpatialTopBar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Central View Stage */}
        <main className="flex-1 glass-panel bg-slate-900/50 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-3xl p-4 md:p-6 overflow-y-auto relative specular-top">
          <Outlet />
        </main>
      </div>

      {/* 3. Universal Command Palette Center */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  )
}
