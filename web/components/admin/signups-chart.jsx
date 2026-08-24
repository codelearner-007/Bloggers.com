'use client'

import { useId, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const WIDTH = 640
const HEIGHT = 180
const PAD_X = 12
const PAD_TOP = 12
const PAD_BOTTOM = 24
const GRIDLINES = 4

function formatDay(day) {
  const date = new Date(`${day}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return day
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

// Hand-rolled SVG area chart -- no charting library dependency, per the
// project constraint. Points are laid out evenly along x regardless of the
// actual date gaps, which is fine here because the caller always supplies
// one row per day with zero-filled gaps.
export function SignupsChart({ data }) {
  const gradientId = useId()
  const [hoverIndex, setHoverIndex] = useState(null)

  const points = data ?? []
  const plotWidth = WIDTH - PAD_X * 2
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM

  if (points.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Signups, last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No signups yet.</p>
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(1, ...points.map((point) => Number(point.count) || 0))
  const step = points.length > 1 ? plotWidth / (points.length - 1) : 0

  const coords = points.map((point, index) => ({
    x: PAD_X + step * index,
    y: PAD_TOP + plotHeight * (1 - (Number(point.count) || 0) / maxCount),
    day: point.day,
    count: Number(point.count) || 0,
  }))

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
  const areaPath = `${linePath} L${coords[coords.length - 1].x},${PAD_TOP + plotHeight} L${coords[0].x},${PAD_TOP + plotHeight} Z`

  const hovered = hoverIndex !== null ? coords[hoverIndex] : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Signups, last 30 days</CardTitle>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-40 w-full overflow-visible"
          role="img"
          aria-label="New signups per day over the last 30 days"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="[stop-color:var(--color-primary)]" stopOpacity="0.25" />
              <stop offset="100%" className="[stop-color:var(--color-primary)]" stopOpacity="0" />
            </linearGradient>
          </defs>

          {Array.from({ length: GRIDLINES + 1 }, (_, i) => {
            const y = PAD_TOP + (plotHeight / GRIDLINES) * i
            return (
              <line
                key={i}
                x1={PAD_X}
                x2={WIDTH - PAD_X}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeWidth="1"
              />
            )
          })}

          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path d={linePath} fill="none" className="stroke-primary" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {coords.map((c, index) => (
            <rect
              key={c.day}
              x={c.x - step / 2}
              y={PAD_TOP}
              width={Math.max(step, 1)}
              height={plotHeight}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(index)}
            />
          ))}

          {hovered ? (
            <>
              <line
                x1={hovered.x}
                x2={hovered.x}
                y1={PAD_TOP}
                y2={PAD_TOP + plotHeight}
                className="stroke-border"
                strokeWidth="1"
              />
              <circle cx={hovered.x} cy={hovered.y} r="3.5" className="fill-primary" />
            </>
          ) : null}
        </svg>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDay(coords[0].day)}</span>
          {hovered ? (
            <span className="font-medium text-foreground">
              {formatDay(hovered.day)}: {hovered.count} signup{hovered.count === 1 ? '' : 's'}
            </span>
          ) : (
            <span>Peak: {maxCount} signup{maxCount === 1 ? '' : 's'}</span>
          )}
          <span>{formatDay(coords[coords.length - 1].day)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
