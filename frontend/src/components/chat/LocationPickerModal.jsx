import React, { useState } from 'react'
import {
  MapPin,
  Navigation,
  Check,
  X,
  ExternalLink,
  Compass,
  Building,
  Radio
} from 'lucide-react'

export default function LocationPickerModal({ isOpen, onClose, onSendLocation }) {
  const [coords, setCoords] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    label: 'Enterprise HQ - Innovation Center, San Francisco'
  })
  const [isLocating, setIsLocating] = useState(false)
  const [locationStatus, setLocationStatus] = useState('')

  const PRESET_LOCATIONS = [
    { label: 'Enterprise HQ - Innovation Center, San Francisco', lat: 37.7749, lng: -122.4194 },
    { label: 'East Coast Data Center - Ashburn, VA', lat: 39.0438, lng: -77.4874 },
    { label: 'European Engineering Campus - London, UK', lat: 51.5074, lng: -0.1278 },
    { label: 'Asia-Pacific Regional Hub - Singapore', lat: 1.3521, lng: 103.8198 },
  ]

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.')
      return
    }

    setIsLocating(true)
    setLocationStatus('Acquiring GPS fix...')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: parseFloat(pos.coords.latitude.toFixed(5)),
          longitude: parseFloat(pos.coords.longitude.toFixed(5)),
          label: 'Current Live GPS Location'
        })
        setIsLocating(false)
        setLocationStatus('GPS coordinate locked!')
      },
      (err) => {
        setIsLocating(false)
        setLocationStatus(`Could not acquire GPS: ${err.message}. Select a preset below.`)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const handleSend = () => {
    onSendLocation({
      latitude: coords.latitude,
      longitude: coords.longitude,
      location_label: coords.label,
      content: `📍 Location: ${coords.label}`,
      message_type: 'LOCATION'
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-elevated bg-slate-900/95 border border-white/20 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Share Geolocation</h3>
              <p className="text-[10px] text-slate-400">Spatial telemetry & coordinates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Map Preview Hologram Card */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950/80 p-5 flex flex-col items-center justify-center min-h-[160px] text-center">
          {/* Spatial Grid Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d422_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Floating Pin */}
          <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 p-[2px] shadow-lg shadow-cyan-500/20 animate-bounce">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <MapPin className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <div className="relative z-10 mt-3 font-mono text-xs text-white font-semibold">
            {coords.latitude}° N, {coords.longitude}° E
          </div>
          <div className="relative z-10 text-[11px] text-slate-300 mt-1 max-w-sm truncate">
            {coords.label}
          </div>

          {/* Detect Button */}
          <button
            onClick={detectCurrentLocation}
            disabled={isLocating}
            className="relative z-10 mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-medium transition-all active:scale-[0.98]"
          >
            <Navigation className={`w-3 h-3 text-cyan-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Acquiring GPS...' : 'Use My Live GPS'}</span>
          </button>
        </div>

        {locationStatus && (
          <div className="text-[11px] text-cyan-300 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            {locationStatus}
          </div>
        )}

        {/* Address Label Input */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Custom Location Label
          </label>
          <input
            type="text"
            value={coords.label}
            onChange={(e) => setCoords({ ...coords, label: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Presets */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Quick Facility Presets
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_LOCATIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCoords({ latitude: preset.lat, longitude: preset.lng, label: preset.label })}
                className={`p-2 rounded-xl border text-left text-xs transition-all ${
                  coords.latitude === preset.lat && coords.longitude === preset.lng
                    ? 'bg-cyan-600/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="truncate font-medium">{preset.label}</div>
                <div className="text-[10px] font-mono opacity-60 mt-0.5">{preset.lat}, {preset.lng}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Send Action */}
        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all active:scale-[0.98]"
          >
            Share Location
          </button>
        </div>
      </div>
    </div>
  )
}
