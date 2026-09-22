// Pong: pure game logic, drawn by the Pong module in ../boards/pong.tsx.
// The player's paddle is column 0 (left); the AI's paddle is the last column (right).
// Coordinates and speeds are whole board cells — the ball moves exactly one cell per tick,
// so a paddle plane is only ever crossed on a single tick, never skipped over.

export type PongGame = {
  w: number
  h: number
  paddleH: number
  ballX: number
  ballY: number
  vx: -1 | 1
  vy: -1 | 1
  playerY: number
  aiY: number
  playerScore: number
  aiScore: number
  over: boolean
  won: boolean // true when the player reached WIN_SCORE first
}

export const WIN_SCORE = 7

const clampPaddle = (y: number, paddleH: number, h: number) => Math.max(0, Math.min(h - paddleH, y))
const randomSign = (rand: () => number): -1 | 1 => (rand() < 0.5 ? -1 : 1)

export function newPong(w: number, h: number, rand = Math.random): PongGame {
  const paddleH = Math.max(3, Math.floor(h / 4))
  const midY = Math.floor((h - paddleH) / 2)
  return {
    w,
    h,
    paddleH,
    ballX: Math.floor(w / 2),
    ballY: Math.floor(h / 2),
    vx: randomSign(rand),
    vy: randomSign(rand),
    playerY: midY,
    aiY: midY,
    playerScore: 0,
    aiScore: 0,
    over: false,
    won: false,
  }
}

export function movePlayer(g: PongGame, dy: number): PongGame {
  if (g.over) return g
  return { ...g, playerY: clampPaddle(g.playerY + dy, g.paddleH, g.h) }
}

// re-center and send the ball toward whoever just conceded, so the other side gets a beat to react
function serve(g: PongGame, towardPlayer: boolean, rand: () => number): PongGame {
  return {
    ...g,
    ballX: Math.floor(g.w / 2),
    ballY: Math.floor(g.h / 2),
    vx: towardPlayer ? -1 : 1,
    vy: randomSign(rand),
  }
}

// steepens (changes vy) when the ball caught the paddle's outer third, so a shot placed at the
// edge answers back; a hit near the center keeps the ball's existing vertical direction
function deflect(vy: -1 | 1, hitY: number, paddleY: number, paddleH: number): -1 | 1 {
  const offset = (hitY - (paddleY + paddleH / 2)) / (paddleH / 2)
  return offset < -0.3 ? -1 : offset > 0.3 ? 1 : vy
}

export function tick(g: PongGame, rand = Math.random): PongGame {
  if (g.over) return g

  // the AI tracks the ball's row, one cell per tick — beatable, not psychic
  const aiCenter = g.aiY + g.paddleH / 2
  const aiY = clampPaddle(g.aiY + (aiCenter < g.ballY ? 1 : aiCenter > g.ballY ? -1 : 0), g.paddleH, g.h)

  let { ballX, ballY, vx, vy } = g
  ballX += vx
  ballY += vy

  if (ballY <= 0) {
    ballY = 0
    vy = 1
  } else if (ballY >= g.h - 1) {
    ballY = g.h - 1
    vy = -1
  }

  if (ballX === 1 && vx < 0 && ballY >= g.playerY && ballY < g.playerY + g.paddleH) {
    vx = 1
    vy = deflect(vy, ballY, g.playerY, g.paddleH)
  } else if (ballX === g.w - 2 && vx > 0 && ballY >= aiY && ballY < aiY + g.paddleH) {
    vx = -1
    vy = deflect(vy, ballY, aiY, g.paddleH)
  }

  if (ballX < 0) {
    const aiScore = g.aiScore + 1
    return aiScore >= WIN_SCORE
      ? { ...g, aiY, aiScore, over: true, won: false }
      : serve({ ...g, aiY, aiScore }, true, rand)
  }
  if (ballX > g.w - 1) {
    const playerScore = g.playerScore + 1
    return playerScore >= WIN_SCORE
      ? { ...g, aiY, playerScore, over: true, won: true }
      : serve({ ...g, aiY, playerScore }, false, rand)
  }

  return { ...g, aiY, ballX, ballY, vx, vy }
}

// the score posted when a round ends: the player's winning margin, negative when they lost —
// isBetter in ./best.ts already refuses anything <= 0, so a loss never overwrites a real best
export const margin = (g: PongGame) => g.playerScore - g.aiScore

// ticks (140 ms each) between ball steps: one cell per tick throughout, speed is constant.
// Slower than the first pass (60 ms) — arrow-key auto-repeat can't move the paddle fast enough
// to keep up with a ball crossing the court in ~1s; giving it ~2.5x longer per crossing makes
// the AI's perfect one-cell-per-tick tracking a lot less punishing to play against.
export const TICK_MS = 140
