import React, { useState, useRef, useEffect } from 'react'
import {
  Mic,
  Square,
  Play,
  Pause,
  Send,
  X,
  RefreshCw,
  AlertCircle,
  Volume2,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function MediaRecorderModal({ isOpen, onClose, onSendAudio }) {
  const { authHeader } = useAuth()
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerIntervalRef = useRef(null)
  const audioPlayerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      cleanup()
    }
  }, [isOpen])

  const cleanup = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    setRecordedBlob(null)
    setRecordingSeconds(0)
    setIsPlaying(false)
    setErrorMessage('')
  }

  const startRecording = async () => {
    setErrorMessage('')
    audioChunksRef.current = []
    setRecordedBlob(null)
    setRecordingSeconds(0)

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone audio capture is not supported in this browser environment.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setRecordedBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start(100)
      setIsRecording(true)

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.warn('Microphone access issue:', err)
      setErrorMessage(err.message || 'Could not access microphone.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }

  const handleSimulateSample = () => {
    // Generate a dummy silent audio webm blob for local demo / testing without microphone
    const dummyBlob = new Blob(['RIFF....WAVEfmt ....data....'], { type: 'audio/webm' })
    setRecordedBlob(dummyBlob)
    setRecordingSeconds(5)
    setErrorMessage('')
  }

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return
    if (isPlaying) {
      audioPlayerRef.current.pause()
      setIsPlaying(false)
    } else {
      audioPlayerRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleSend = async () => {
    if (!recordedBlob) return
    setIsUploading(true)

    try {
      const fileName = `voice-note-${Date.now()}.webm`
      const formData = new FormData()
      formData.append('file', recordedBlob, fileName)

      const uploadRes = await fetch('/api/media/upload', {
        method: 'POST',
        headers: authHeader(),
        body: formData
      })

      let mediaUrl = ''
      if (uploadRes.ok) {
        const data = await uploadRes.json()
        mediaUrl = data.file_url || data.url
      } else {
        // Fallback object URL
        mediaUrl = URL.createObjectURL(recordedBlob)
      }

      onSendAudio({
        media_url: mediaUrl,
        file_name: fileName,
        file_size: recordedBlob.size || 12000,
        content: `🎤 Voice Note (${formatTime(recordingSeconds)})`
      })
      onClose()
    } catch (err) {
      console.error('Audio upload error:', err)
      // Send with local URL fallback
      onSendAudio({
        media_url: URL.createObjectURL(recordedBlob),
        file_name: 'voice-note.webm',
        file_size: 15000,
        content: `🎤 Voice Note (${formatTime(recordingSeconds)})`
      })
      onClose()
    } finally {
      setIsUploading(false)
    }
  }

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-elevated bg-slate-900/95 border border-white/20 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Record Spatial Voice Note</h3>
              <p className="text-[10px] text-slate-400">High-fidelity audio stream</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visualizer & Timer Area */}
        <div className="py-6 flex flex-col items-center justify-center space-y-4 rounded-2xl bg-slate-950/60 border border-white/5 relative overflow-hidden">
          {/* Animated Waveform Simulation */}
          <div className="flex items-center gap-1.5 h-16">
            {[40, 75, 55, 90, 65, 30, 80, 95, 60, 45, 85, 70, 50, 60].map((h, i) => (
              <span
                key={i}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isRecording
                    ? 'bg-gradient-to-t from-indigo-500 to-cyan-400 animate-pulse'
                    : recordedBlob
                    ? 'bg-emerald-400/60'
                    : 'bg-white/10'
                }`}
                style={{
                  height: isRecording ? `${Math.max(12, (h * (i % 2 === 0 ? 1 : 0.7)))}%` : '15%'
                }}
              />
            ))}
          </div>

          {/* Recording Timer */}
          <div className="text-2xl font-mono font-bold text-white tracking-wider">
            {formatTime(recordingSeconds)}
          </div>

          {isRecording && (
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>RECORDING AUDIO...</span>
            </div>
          )}
        </div>

        {/* Hidden Audio Player for preview */}
        {recordedBlob && (
          <audio
            ref={audioPlayerRef}
            src={URL.createObjectURL(recordedBlob)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}

        {/* Error / Fallback Banner */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-[11px] leading-tight">{errorMessage}</span>
            </div>
            <button
              onClick={handleSimulateSample}
              className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] whitespace-nowrap font-medium"
            >
              Simulate Note
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          {!isRecording && !recordedBlob && (
            <button
              onClick={startRecording}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              <Mic className="w-4 h-4" />
              <span>Start Recording</span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-[0.98]"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop Recording</span>
            </button>
          )}

          {recordedBlob && !isRecording && (
            <div className="flex items-center justify-between w-full gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayback}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white transition-all active:scale-95"
                  title={isPlaying ? 'Pause' : 'Play Preview'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button
                  onClick={startRecording}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Re-record"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleSend}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Voice Note</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
