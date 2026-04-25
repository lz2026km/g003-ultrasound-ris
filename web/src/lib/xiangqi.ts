// ============================================================
// 中国象棋 — 核心逻辑
// v1.0
// ============================================================

export type PieceType = 'k' | 'a' | 'b' | 'n' | 'r' | 'c' | 'p';
export type Player = 'red' | 'black';

export interface Piece {
  type: PieceType;
  player: Player;
  row: number;
  col: number;
}

export interface XiangqiState {
  board: (Piece | null)[][];
  currentPlayer: Player;
  selected: [number, number] | null;
  lastMove: { from: [number, number]; to: [number, number] } | null;
  gameOver: boolean;
  winner: Player | null;
  moveHistory: string[];
  redCaptured: Piece[];
  blackCaptured: Piece[];
  aiLevel: number;
}

// 棋子字符映射
const PIECE_CHARS: Record<string, Record<Player, string>> = {
  k: { red: '帅', black: '将' },
  a: { red: '仕', black: '士' },
  b: { red: '相', black: '象' },
  n: { red: '马', black: '马' },
  r: { red: '车', black: '车' },
  c: { red: '炮', black: '炮' },
  p: { red: '兵', black: '卒' },
};

export function getPieceChar(piece: Piece): string {
  return PIECE_CHARS[piece.type][piece.player];
}

// 初始化棋盘
export function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: 10 }, () =>
    Array(9).fill(null)
  );

  // 红方
  board[0][0] = { type: 'r', player: 'red', row: 0, col: 0 };
  board[0][2] = { type: 'n', player: 'red', row: 0, col: 2 };
  board[0][4] = { type: 'a', player: 'red', row: 0, col: 4 };
  board[0][6] = { type: 'b', player: 'red', row: 0, col: 6 };
  board[0][8] = { type: 'r', player: 'red', row: 0, col: 8 };
  board[2][1] = { type: 'c', player: 'red', row: 2, col: 1 };
  board[2][7] = { type: 'c', player: 'red', row: 2, col: 7 };
  board[3][0] = { type: 'p', player: 'red', row: 3, col: 0 };
  board[3][2] = { type: 'p', player: 'red', row: 3, col: 2 };
  board[3][4] = { type: 'p', player: 'red', row: 3, col: 4 };
  board[3][6] = { type: 'p', player: 'red', row: 3, col: 6 };
  board[3][8] = { type: 'p', player: 'red', row: 3, col: 8 };

  // 黑方
  board[9][0] = { type: 'r', player: 'black', row: 9, col: 0 };
  board[9][2] = { type: 'n', player: 'black', row: 9, col: 2 };
  board[9][4] = { type: 'a', player: 'black', row: 9, col: 4 };
  board[9][6] = { type: 'b', player: 'black', row: 9, col: 6 };
  board[9][8] = { type: 'r', player: 'black', row: 9, col: 8 };
  board[7][1] = { type: 'c', player: 'black', row: 7, col: 1 };
  board[7][7] = { type: 'c', player: 'black', row: 7, col: 7 };
  board[6][0] = { type: 'p', player: 'black', row: 6, col: 0 };
  board[6][2] = { type: 'p', player: 'black', row: 6, col: 2 };
  board[6][4] = { type: 'p', player: 'black', row: 6, col: 4 };
  board[6][6] = { type: 'p', player: 'black', row: 6, col: 6 };
  board[6][8] = { type: 'p', player: 'black', row: 6, col: 8 };

  // 红帅/黑将
  board[0][4] = { type: 'k', player: 'red', row: 0, col: 4 };
  board[9][4] = { type: 'k', player: 'black', row: 9, col: 4 };

  return board;
}

// 将帅合法移动
function kingMoves(
  board: (Piece | null)[][],
  row: number,
  col: number,
  player: Player
): [number, number][] {
  const moves: [number, number][] = [];
  const ranges = player === 'red' ? [[0, 2], [0, 8]] : [[7, 10], [0, 8]];

  for (let dr = -1; dr <= 1; dr += 2) {
    const nr = row + dr;
    if (nr >= ranges[0][0] && nr <= ranges[0][1]) {
      if (board[nr][col] === null || board[nr][col]!.player !== player) {
        moves.push([nr, col]);
      }
    }
  }
  for (let dc = -1; dc <= 1; dc += 2) {
    const nc = col + dc;
    if (nc >= ranges[1][0] && nc <= ranges[1][1]) {
      if (board[row][nc] === null || board[row][nc]!.player !== player) {
        moves.push([row, nc]);
      }
    }
  }
  return moves;
}

// 仕/士合法移动
function advisorMoves(
  board: (Piece | null)[][],
  row: number,
  col: number,
  player: Player
): [number, number][] {
  const moves: [number, number][] = [];
  const ranges = player === 'red' ? [[0, 2], [3, 6]] : [[7, 10], [3, 6]];

  for (let dr of [-1, 1]) {
    for (let dc of [-1, 1]) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= ranges[0][0] && nr <= ranges[0][1] && nc >= ranges[1][0] && nc <= ranges[1][1]) {
        if (board[nr][nc] === null || board[nr][nc]!.player !== player) {
          moves.push([nr, nc]);
        }
      }
    }
  }
  return moves;
}

// 相/象合法移动
function bishopMoves(
  board: (Piece | null)[][],
  row: number,
  col: number,
  player: Player
): [number, number][] {
  const moves: [number, number][] = [];
  const ranges = player === 'red' ? [[0, 4], [0, 8]] : [[5, 10], [0, 8]];

  for (let dr of [-2, 2]) {
    for (let dc of [-2, 2]) {
      const nr = row + dr;
      const nc = col + dc;
      const er = row + dr / 2;
      const ec = col + dc / 2;
      if (nr >= ranges[0][0] && nr <= ranges[0][1] && nc >= ranges[1][0] && nc <= ranges[1][1]) {
        if (board[er][ec] === null && (board[nr][nc] === null || board[nr][nc]!.player !== player)) {
          moves.push([nr, nc]);
        }
      }
    }
  }
  return moves;
}

// 马合法移动
function knightMoves(
  board: (Piece | null)[][],
  row: number,
  col: number,
  player: Player
): [number, number][] {
  const moves: [number, number][] = [];
  const offsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];
  const blocks = [[-1, 0], [0, -1], [0, 1], [1, 0], [-1, 0], [0, -1], [0, 1], [1, 0]];

  for (let i = 0; i < offsets.length; i++) {
    const [dr, dc] = offsets[i];
    const [br, bc] = blocks[i];
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < 10 && nc >= 0 && nc < 9) {
      if (board[row + br][col + bc] === null) {
        if (board[nr][nc] === null || board[nr][nc]!.player !== player) {
          moves.push([nr, nc]);
        }
      }
    }
  }
  return moves;
}

// 车合法移动
function rookMoves(
  board: (Piece | null)[][],
  row: number,
  col: number,
  player: Player
): [number, number][] {
  const moves: [number, number][] = [];
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [dr, dc] of dirs) {
    let nr = row + dr;
    let nc = col + dc;
    while (nr >= 0 && nr < 10 && nc >= 0 && nc < 9) {
      if (board[nr][nc] === null) {
        moves.push([nr, nc]);
      } else {
        if (board[nr][nc]!.player !== player) {
          moves.push([nr, nc]);
        }
        break;
      }
      nr += dr;
      nc += dc;
    }
  }
  return moves;
}

// 炮合法移动
function cannonMoves(
  board: (Piece | null)[][],
  row: number,
  col: number,
  player: Player
): [number, number][] {
  const moves: [number, number][] = [];
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [dr, dc] of dirs) {
    let nr = row + dr;
    let nc = col + dc;
    let jumped = false;
    while (nr >= 0 && nr < 10 && nc >= 0 && nc < 9) {
      if (!jumped) {
        if (board[nr][nc] === null) {
          moves.push([nr, nc]);
        } else {
          jumped = true;
        }
      } else {
        if (board[nr][nc] !== null) {
          if (board[nr][nc]!.player !== player) {
            moves.push([nr, nc]);
          }
          break;
        }
      }
      nr += dr;
      nc += dc;
    }
  }
  return moves;
}

// 兵/卒合法移动
function pawnMoves(
  board: (Piece | null)[][],
  row: number,
  col: number,
  player: Player
): [number, number][] {
  const moves: [number, number][] = [];
  if (player === 'red') {
    if (row <= 4) {
      for (let dc of [-1, 0, 1]) {
        const nc = col + dc;
        const nr = row + 1;
        if (nc >= 0 && nc < 9 && nr < 10) {
          if (board[nr][nc] === null || board[nr][nc]!.player !== player) {
            moves.push([nr, nc]);
          }
        }
      }
    } else {
      const nr = row + 1;
      if (nr < 10 && (board[nr][col] === null || board[nr][col]!.player !== player)) {
        moves.push([nr, col]);
      }
    }
  } else {
    if (row >= 5) {
      for (let dc of [-1, 0, 1]) {
        const nc = col + dc;
        const nr = row - 1;
        if (nc >= 0 && nc < 9 && nr >= 0) {
          if (board[nr][nc] === null || board[nr][nc]!.player !== player) {
            moves.push([nr, nc]);
          }
        }
      }
    } else {
      const nr = row - 1;
      if (nr >= 0 && (board[nr][col] === null || board[nr][col]!.player !== player)) {
        moves.push([nr, col]);
      }
    }
  }
  return moves;
}

// 获取某棋子的所有合法移动
export function getLegalMoves(
  board: (Piece | null)[][],
  row: number,
  col: number
): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];

  switch (piece.type) {
    case 'k': return kingMoves(board, row, col, piece.player);
    case 'a': return advisorMoves(board, row, col, piece.player);
    case 'b': return bishopMoves(board, row, col, piece.player);
    case 'n': return knightMoves(board, row, col, piece.player);
    case 'r': return rookMoves(board, row, col, piece.player);
    case 'c': return cannonMoves(board, row, col, piece.player);
    case 'p': return pawnMoves(board, row, col, piece.player);
    default: return [];
  }
}

// 判断是否被将军
export function isInCheck(board: (Piece | null)[][], player: Player): boolean {
  let kingPos: [number, number] | null = null;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.player === player) {
        kingPos = [r, c];
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return false;
  const [kr, kc] = kingPos;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p && p.player !== player) {
        const moves = getLegalMoves(board, r, c);
        if (moves.some(([mr, mc]) => mr === kr && mc === kc)) {
          return true;
        }
      }
    }
  }
  return false;
}

// 判断某方是否有合法移动
function hasLegalMoves(board: (Piece | null)[][], player: Player): boolean {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p && p.player === player) {
        const moves = getLegalMoves(board, r, c);
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
}

// 尝试移动，返回新棋盘和是否吃子
export function applyMove(
  board: (Piece | null)[][],
  from: [number, number],
  to: [number, number]
): { board: (Piece | null)[][]; captured: Piece | null } {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from[0]][from[1]]!;
  const captured = newBoard[to[0]][to[1]];
  newBoard[to[0]][to[1]] = { ...piece, row: to[0], col: to[1] };
  newBoard[from[0]][from[1]] = null;
  return { board: newBoard, captured };
}

// 局面评估（仅评估红方分数，黑方为负）
function evaluateBoard(board: (Piece | null)[][]): number {
  const values: Record<PieceType, number> = {
    k: 10000, a: 20, b: 20, n: 40, r: 90, c: 45, p: 10,
  };

  let score = 0;
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p) {
        const base = values[p.type];
        const posBonus = p.type === 'p'
          ? (p.player === 'red' ? (r >= 5 ? 5 : 0) : (r <= 4 ? 5 : 0))
          : 0;
        const val = base + posBonus;
        score += p.player === 'red' ? val : -val;
      }
    }
  }
  return score;
}

// 获取所有合法着法
export function getAllLegalMoves(
  board: (Piece | null)[][],
  player: Player
): { from: [number, number]; to: [number, number] }[] {
  const moves: { from: [number, number]; to: [number, number] }[] = [];

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p && p.player === player) {
        const pieceMoves = getLegalMoves(board, r, c);
        for (const [nr, nc] of pieceMoves) {
          const { board: newBoard } = applyMove(board, [r, c], [nr, nc]);
          if (!isInCheck(newBoard, player)) {
            moves.push({ from: [r, c], to: [nr, nc] });
          }
        }
      }
    }
  }
  return moves;
}

// AI 移动选择
export function getAIMove(
  board: (Piece | null)[][],
  aiPlayer: Player,
  level: number
): { from: [number, number]; to: [number, number] } | null {
  const allMoves = getAllLegalMoves(board, aiPlayer);
  if (allMoves.length === 0) return null;

  if (level === 1) {
    // 初级：随机
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  if (level === 2) {
    // 中级：贪心最优
    let best: { from: [number, number]; to: [number, number] } | null = null;
    let bestScore = aiPlayer === 'red' ? -Infinity : Infinity;

    for (const move of allMoves) {
      const { board: newBoard, captured } = applyMove(board, move.from, move.to);
      let s = evaluateBoard(newBoard);
      if (captured) {
        const values: Record<PieceType, number> = { k: 10000, a: 20, b: 20, n: 40, r: 90, c: 45, p: 10 };
        s += aiPlayer === 'red' ? values[captured.type] : -values[captured.type];
      }
      if (aiPlayer === 'red' ? s > bestScore : s < bestScore) {
        bestScore = s;
        best = move;
      }
    }
    return best;
  }

  // 高级：简单评估函数 + 随机扰动
  const scored = allMoves.map(move => {
    const { board: newBoard, captured } = applyMove(board, move.from, move.to);
    let s = evaluateBoard(newBoard);
    if (captured) {
      const values: Record<PieceType, number> = { k: 10000, a: 20, b: 20, n: 40, r: 90, c: 45, p: 10 };
      s += aiPlayer === 'red' ? values[captured.type] : -values[captured.type];
    }
    // 检查是否将军
    if (isInCheck(newBoard, aiPlayer === 'red' ? 'black' : 'red')) {
      s += aiPlayer === 'red' ? 50 : -50;
    }
    return { move, score: s + (Math.random() - 0.5) * 10 };
  });

  scored.sort((a, b) => aiPlayer === 'red' ? b.score - a.score : a.score - b.score);
  const top = scored.slice(0, Math.min(3, scored.length));
  return top[Math.floor(Math.random() * top.length)].move;
}

// 检查游戏是否结束
export function checkGameOver(board: (Piece | null)[][]): { over: boolean; winner: Player | null } {
  let redKing = false, blackKing = false;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c];
      if (p && p.type === 'k') {
        if (p.player === 'red') redKing = true;
        else blackKing = true;
      }
    }
  }

  if (!redKing) return { over: true, winner: 'black' };
  if (!blackKing) return { over: true, winner: 'red' };

  // 无子可动
  for (const player of ['red', 'black'] as Player[]) {
    if (!hasLegalMoves(board, player)) {
      return { over: true, winner: player === 'red' ? 'black' : 'red' };
    }
  }

  return { over: false, winner: null };
}

// 创建初始状态
export function createInitialState(aiLevel = 1): XiangqiState {
  return {
    board: createInitialBoard(),
    currentPlayer: 'red',
    selected: null,
    lastMove: null,
    gameOver: false,
    winner: null,
    moveHistory: [],
    redCaptured: [],
    blackCaptured: [],
    aiLevel,
  };
}
