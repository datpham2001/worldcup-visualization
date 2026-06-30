import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'World Cup 2026 Live Tracker'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #060f1e 0%, #0a1829 50%, #091525 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid lines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(96,144,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(96,144,255,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Top glow */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 800,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(232,184,75,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Trophy icon */}
        <div style={{ fontSize: 100, marginBottom: 20, filter: 'drop-shadow(0 0 40px rgba(232,184,75,0.6))' }}>
          🏆
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-2px',
            textAlign: 'center',
            lineHeight: 1.05,
            marginBottom: 16,
            textShadow: '0 0 60px rgba(232,184,75,0.4)',
          }}
        >
          World Cup 2026
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 30,
            fontWeight: 600,
            color: 'rgba(232,184,75,0.9)',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: 48,
          }}
        >
          Live Tracker
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Live Scores', 'Schedule', 'Standings', 'Bracket', 'Top Scorers'].map(label => (
            <div
              key={label}
              style={{
                padding: '10px 22px',
                borderRadius: 999,
                background: 'rgba(96,144,255,0.12)',
                border: '1px solid rgba(96,144,255,0.35)',
                color: '#90b8ff',
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, transparent, #e8b84b, #6090ff, #e8b84b, transparent)',
          }}
        />
      </div>
    ),
    { ...size },
  )
}
