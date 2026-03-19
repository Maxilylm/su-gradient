import { useState, useCallback } from 'react'
import './App.css'

interface ColorStop {
  color: string
  position: number
  id: number
}

type GradientType = 'linear' | 'radial'
type RadialShape = 'circle' | 'ellipse'

const POSITIONS = ['center', 'top', 'top right', 'right', 'bottom right', 'bottom', 'bottom left', 'left', 'top left']

const PRESETS: { name: string; type: GradientType; angle: number; shape: RadialShape; radialPosition: string; stops: Omit<ColorStop, 'id'>[] }[] = [
  { name: 'Sunset', type: 'linear', angle: 135, shape: 'circle', radialPosition: 'center', stops: [{ color: '#f97316', position: 0 }, { color: '#ec4899', position: 50 }, { color: '#8b5cf6', position: 100 }] },
  { name: 'Ocean', type: 'linear', angle: 180, shape: 'circle', radialPosition: 'center', stops: [{ color: '#06b6d4', position: 0 }, { color: '#3b82f6', position: 50 }, { color: '#1e3a5f', position: 100 }] },
  { name: 'Forest', type: 'linear', angle: 160, shape: 'circle', radialPosition: 'center', stops: [{ color: '#22c55e', position: 0 }, { color: '#15803d', position: 100 }] },
  { name: 'Neon', type: 'linear', angle: 90, shape: 'circle', radialPosition: 'center', stops: [{ color: '#f0abfc', position: 0 }, { color: '#818cf8', position: 50 }, { color: '#34d399', position: 100 }] },
  { name: 'Fire', type: 'radial', angle: 0, shape: 'circle', radialPosition: 'center', stops: [{ color: '#fbbf24', position: 0 }, { color: '#f97316', position: 40 }, { color: '#dc2626', position: 100 }] },
  { name: 'Aurora', type: 'linear', angle: 225, shape: 'circle', radialPosition: 'center', stops: [{ color: '#a78bfa', position: 0 }, { color: '#06b6d4', position: 33 }, { color: '#34d399', position: 66 }, { color: '#fbbf24', position: 100 }] },
  { name: 'Midnight', type: 'linear', angle: 180, shape: 'circle', radialPosition: 'center', stops: [{ color: '#0f172a', position: 0 }, { color: '#1e3a5f', position: 50 }, { color: '#7c3aed', position: 100 }] },
  { name: 'Peach', type: 'radial', angle: 0, shape: 'ellipse', radialPosition: 'center', stops: [{ color: '#fecaca', position: 0 }, { color: '#fda4af', position: 50 }, { color: '#f472b6', position: 100 }] },
]

let nextId = 100

function randomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

function App() {
  const [gradientType, setGradientType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(135)
  const [radialShape, setRadialShape] = useState<RadialShape>('circle')
  const [radialPosition, setRadialPosition] = useState('center')
  const [stops, setStops] = useState<ColorStop[]>([
    { color: '#a855f7', position: 0, id: 1 },
    { color: '#06b6d4', position: 50, id: 2 },
    { color: '#ec4899', position: 100, id: 3 },
  ])
  const [copied, setCopied] = useState(false)

  const buildCSS = useCallback(() => {
    const colorStops = [...stops]
      .sort((a, b) => a.position - b.position)
      .map(s => `${s.color} ${s.position}%`)
      .join(', ')

    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${colorStops})`
    }
    return `radial-gradient(${radialShape} at ${radialPosition}, ${colorStops})`
  }, [gradientType, angle, radialShape, radialPosition, stops])

  const cssValue = buildCSS()
  const fullCSS = `background: ${cssValue};`

  const copyCSS = async () => {
    await navigator.clipboard.writeText(fullCSS)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const addStop = () => {
    setStops(prev => [...prev, { color: randomColor(), position: 50, id: nextId++ }])
  }

  const removeStop = (id: number) => {
    if (stops.length <= 2) return
    setStops(prev => prev.filter(s => s.id !== id))
  }

  const updateStop = (id: number, field: 'color' | 'position', value: string | number) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const randomGradient = () => {
    const type = Math.random() > 0.5 ? 'linear' : 'radial' as GradientType
    const numStops = 2 + Math.floor(Math.random() * 3)
    const newStops: ColorStop[] = []
    for (let i = 0; i < numStops; i++) {
      newStops.push({
        color: randomColor(),
        position: Math.round((i / (numStops - 1)) * 100),
        id: nextId++,
      })
    }
    setGradientType(type)
    setAngle(Math.floor(Math.random() * 360))
    setRadialShape(Math.random() > 0.5 ? 'circle' : 'ellipse')
    setRadialPosition(POSITIONS[Math.floor(Math.random() * POSITIONS.length)])
    setStops(newStops)
  }

  const loadPreset = (index: number) => {
    const p = PRESETS[index]
    setGradientType(p.type)
    setAngle(p.angle)
    setRadialShape(p.shape)
    setRadialPosition(p.radialPosition)
    setStops(p.stops.map(s => ({ ...s, id: nextId++ })))
  }

  return (
    <div className="app">
      <header>
        <h1>CSS Gradient Generator</h1>
      </header>

      <main>
        <div className="preview" style={{ background: cssValue }} />

        <div className="controls">
          <section className="panel">
            <h2>Type</h2>
            <div className="toggle-group">
              <button className={gradientType === 'linear' ? 'active' : ''} onClick={() => setGradientType('linear')}>Linear</button>
              <button className={gradientType === 'radial' ? 'active' : ''} onClick={() => setGradientType('radial')}>Radial</button>
            </div>

            {gradientType === 'linear' ? (
              <div className="slider-row">
                <label>Angle: {angle}&deg;</label>
                <input type="range" min={0} max={360} value={angle} onChange={e => setAngle(Number(e.target.value))} />
              </div>
            ) : (
              <>
                <div className="slider-row">
                  <label>Shape</label>
                  <div className="toggle-group small">
                    <button className={radialShape === 'circle' ? 'active' : ''} onClick={() => setRadialShape('circle')}>Circle</button>
                    <button className={radialShape === 'ellipse' ? 'active' : ''} onClick={() => setRadialShape('ellipse')}>Ellipse</button>
                  </div>
                </div>
                <div className="slider-row">
                  <label>Position</label>
                  <select value={radialPosition} onChange={e => setRadialPosition(e.target.value)}>
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Color Stops</h2>
              <button className="btn-small" onClick={addStop}>+ Add</button>
            </div>
            <div className="stops-list">
              {stops.map(stop => (
                <div key={stop.id} className="stop-row">
                  <input type="color" value={stop.color} onChange={e => updateStop(stop.id, 'color', e.target.value)} />
                  <span className="color-hex">{stop.color}</span>
                  <input type="range" min={0} max={100} value={stop.position} onChange={e => updateStop(stop.id, 'position', Number(e.target.value))} />
                  <span className="pos-label">{stop.position}%</span>
                  <button className="btn-remove" onClick={() => removeStop(stop.id)} disabled={stops.length <= 2}>&times;</button>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>CSS Code</h2>
            <div className="code-block">
              <code>{fullCSS}</code>
            </div>
            <button className="btn-copy" onClick={copyCSS}>{copied ? 'Copied!' : 'Copy CSS'}</button>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Actions</h2>
            </div>
            <button className="btn-random" onClick={randomGradient}>Random Gradient</button>
          </section>

          <section className="panel">
            <h2>Presets</h2>
            <div className="presets-grid">
              {PRESETS.map((p, i) => {
                const stopsCSS = p.stops.map(s => `${s.color} ${s.position}%`).join(', ')
                const bg = p.type === 'linear'
                  ? `linear-gradient(${p.angle}deg, ${stopsCSS})`
                  : `radial-gradient(${p.shape} at ${p.radialPosition}, ${stopsCSS})`
                return (
                  <button key={i} className="preset" onClick={() => loadPreset(i)} title={p.name}>
                    <div className="preset-swatch" style={{ background: bg }} />
                    <span>{p.name}</span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
