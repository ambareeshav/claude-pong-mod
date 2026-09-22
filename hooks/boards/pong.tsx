/* @jsx h */
import type { ClientSurface } from 'claude-code'
import { base, claudeDone, grid, statusLine, type Base, type Props } from './common.tsx'
import { margin, movePlayer, newPong, tick, TICK_MS, WIN_SCORE, type PongGame } from '../games/pong.ts'

type State = Base & { game?: PongGame }

export default function Pong(props: Props, surface: ClientSurface<State>) {
  const { Box, Text } = surface.elements
  const boardRows = () => Math.min(14, surface.rows - 3)
  // a wide court reads better than tetris's square one; still two chars per cell
  const boardCols = () => Math.max(16, Math.min(40, Math.floor((surface.columns - 2) / 2)))

  if (surface.state === undefined) {
    surface.setState(base(props))
    surface.every(TICK_MS, () => {
      const s = surface.state
      if (!s?.game || !s.playing || s.game.over) return
      const game = tick(s.game)
      if (game.over) surface.post({ game: 'pong', score: margin(game) })
      surface.setState({ ...s, game })
    })
    surface.onKey(({ key }) => {
      const s = surface.state
      if (!s) return
      const k = key.toLowerCase()
      if (!s.game || s.game.over || k === 'r') {
        if (boardRows() < 6) return
        surface.setState({ ...s, banner: false, playing: true, game: newPong(boardCols(), boardRows()) })
        return
      }
      if (k === 'p') {
        surface.setState({ ...s, banner: false, playing: !s.playing })
        return
      }
      const g = s.game
      const game = k === 'up' || k === 'w' ? movePlayer(g, -1)
        : k === 'down' || k === 's' ? movePlayer(g, 1)
        : undefined
      if (!game) return
      surface.setState({ ...s, banner: false, playing: true, game })
    })
  }
  claudeDone(props, surface)

  const s = surface.state
  const g = s?.game
  const bw = g?.w ?? boardCols()
  const bh = g?.h ?? boardRows()
  const rows = grid(Text, bw, bh, (x, y) => {
    if (g && !g.over && Math.round(g.ballY) === y && Math.round(g.ballX) === x) return ['██', 'yellow']
    if (g && x === 0 && y >= g.playerY && y < g.playerY + g.paddleH) return ['██', 'cyan']
    if (g && x === g.w - 1 && y >= g.aiY && y < g.aiY + g.paddleH) return ['██', 'red']
    if (x === Math.floor(bw / 2) && y % 2 === 0) return [' ·', 'gray']
    return ['  ', 'gray']
  })
  const text = !g ? `pong · click here, then any key · ↑↓ move · p pause · first to ${WIN_SCORE} wins`
    : g.over ? (g.won ? `pong · you win ${g.playerScore}–${g.aiScore} · r plays again` : `pong · you lose ${g.playerScore}–${g.aiScore} · r plays again`)
    : !s?.playing ? `pong · paused · ${g.playerScore}–${g.aiScore} · p resumes`
    : `pong · ${g.playerScore}–${g.aiScore} · p pause`
  return (
    <Box flexDirection="column">
      <Box flexDirection="column" borderStyle="round" borderColor={g?.over ? (g.won ? 'green' : 'red') : 'cyan'} width={bw * 2 + 2}>{rows}</Box>
      {statusLine(Text, !!s?.banner, `${text} · best margin ${props?.best ?? 0}`)}
    </Box>
  )
}
