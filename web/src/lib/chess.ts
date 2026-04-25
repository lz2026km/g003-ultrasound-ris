// ============================================================
// 国际象棋 — 核心逻辑
// v1.0
// ============================================================

export type PieceType = 'k' | 'q' | 'r' | 'b' | 'n' | 'p';
export type Player = 'white' | 'black';

export interface Piece {
  type: PieceType;
  player: Player;
  row: number;
  col: number;
}

export interface ChessState {
  board: (Piece | null)[][];
  currentPlayer: Player;
  selected: [number, number] | null;
  lastMove: { from: [number, number]; to: [number, number] } | null;
  gameOver: boolean;
  winner: Player | null;
  moveHistory: string[];
  whiteCaptured: Piece[];
  blackCaptured: Piece[];
  aiLevel: number;
  // 王车易位权限
  whiteKingside: boolean;
  whiteQueenside: boolean;
  blackKingside: boolean;
  blackQueenside: boolean;
  // 吃过路兵
  enPassant: [number, number] | null;
  // 重复局面计数
  repetitionCount: number;
}

// 棋子字符
const PIECE_CHARS: Record<string, Record<Player, string>> = {
  k: { white: '♔', black: '♚' },
  q: { white: '♕', black: '♛' },
  r: { white: '♖', black: '♜' },
  b: { white: '♗', black: '♝' },
  n: { white: '♘', black: '♞' },
  p: { white: '♙', black: '♟' },
};

export function getPieceChar(piece: Piece): string {
  return PIECE_CHARS[piece.type][piece.player];
}

// 初始化棋盘
export function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
    Array(8).fill(null)
  );

  // 黒方（行7-8）
  board[7][0] = { type: 'r', player: 'black', row: 7, col: 0 };
  board[7][1] = { type: 'n', player: 'black', row: 7, col: 1 };
  board[7][2] = { type: 'b', player: 'black', row: 7, col: 2 };
  board[7][3] = { type: 'q', player: 'black', row: 7, col: 3 };
  board[7][4] = { type: 'k', player: 'black', row: 7, col: 4 };
  board[7][5] = { type: 'b', player: 'black', row: 7, col: 5 };
  board[7][6] = { type: 'n', player: 'black', row: 7, col: 6 };
  board[7][7] = { type: 'r', player: 'black', row: 7, col: 7 };
  board[6][0] = { type: 'p', player: 'black', row: 6, col: 0 };
  board[6][1] = { type: 'p', player: 'black', row: 6, col: 1 };
  board[6][2] = { type: 'p', player: 'black', row: 6, col: 2 };
  board[6][3] = { type: 'p', player: 'black', row: 6, col: 3 };
  board[6][4] = { type: 'p', player: 'black', row: 6, col: 4 };
  board[6][5] = { type: 'p', player: 'black', row: 6, col: 5 };
  board[6][6] = { type: 'p', player: 'black', row: 6, col: 6 };
  board[6][7] = { type: 'p', player: 'black', row: 6, col: 7 };

  // 白方（行1-2）
  board[0][0] = { type: 'r', player: 'white', row: 0, col: 0 };
  board[0][1] = { type: 'n', player: 'white', row: 0, col: 1 };
  board[0][2] = { type: 'b', player: 'white', row: 0, col: 2 };
  board[0][3] = { type: 'q', player: 'white', row: 0, col: 3 };
  board[0][4] = { type: 'k', player: 'white', row: 0, col: 4 };
  board[0][5] = { type: 'b', player: 'white', row: 0, col: 5 };
  board[0][6] = { type: 'n', player: 'white', row: 0, col: 6 };
  board[0][7] = { type: 'r', player: 'white', row: 0, col: 7 };
  board[1][0] = { type: 'p', player: 'white', row: 1, col: 0 };
  board[1][1] = { type: 'p', player: 'white', row: 1, col: 1 };
  board[1][2] = { type: 'p', player: 'white', row: 1, col: 2 };
  board[1][3] = { type: 'p', player: 'white', row: 1, col: 3 };
  board[1][4] = { type: 'p', player: 'white', row: 1, col: 4 };
  board[1][5] = { type: 'p', player: 'white', row: 1, col: 5 };
  board[1][6] = { type: 'p', player: 'white', row: 1, col: 6 };
  board[1][7] = { type: 'p', player: 'white', row: 1, col: 7 };

  return board;
}

// 获取棋子合法移动（不考虑将军校验，用于生成候选）
function getRawMoves(
  board: (Piece | null)[][],
  row: number,
  col: number
): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];

  const { type, player } = piece;
  const moves: [number, number][] = [];

  const add = (r: number, c: number) => {
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const target = board[r][c];
      if (target === null || target.player !== player) {
        moves.push([r, c]);
        return target === null;
      }
    }
    return false;
  };

  const slide = (dirs: [number, number][]) => {
    for (const [dr, dc] of dirs) {
      let r = row + dr, c = col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const t = board[r][c];
        if (t === null) {
          moves.push([r, c]);
        } else {
          if (t.player !== player) moves.push([r, c]);
          break;
        }
        r += dr; c += dc;
      }
    }
  };

  switch (type) {
    case 'p': {
      const dir = player === 'white' ? 1 : -1;
      const startRow = player === 'white' ? 1 : 6;

      // 前进一格
      if (add(row + dir, col) && row === startRow) {
        add(row + 2 * dir, col);
      }
      // 吃子
      for (const dc of [-1, 1]) {
        const nr = row + dir, nc = col + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const t = board[nr][nc];
          if (t && t.player !== player) {
            moves.push([nr, nc]);
          }
        }
      }
      // 吃过路兵（简化处理）
      break;
    }
    case 'n': {
      for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
        add(row + dr, col + dc);
      }
      break;
    }
    case 'b': slide([[-1,-1],[-1,1],[1,-1],[1,1]]); break;
    case 'r': slide([[-1,0],[1,0],[0,-1],[0,1]]); break;
    case 'q': slide([[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]); break;
    case 'k': {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) add(row + dr, col + dc);
        }
      }
      break;
    }
  }
  return moves;
}

// 判断某方国王位置
function findKing(board: (Piece | null)[][], player: Player): [number, number] | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.player === player) return [r, c];
    }
  }
  return null;
}

// 判断某方是否被将军
export function isInCheck(board: (Piece | null)[][], player: Player): boolean {
  const king = findKing(board, player);
  if (!king) return false;
  const [kr, kc] = king;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.player !== player) {
        const raw = getRawMoves(board, r, c);
        if (raw.some(([mr, mc]) => mr === kr && mc === kc)) return true;
      }
    }
  }
  return false;
}

// 应用移动，返回新棋盘
export function applyMove(
  board: (Piece | null)[][],
  from: [number, number],
  to: [number, number]
): { board: (Piece | null)[][]; captured: Piece | null; promotion: PieceType | null } {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from[0]][from[1]]!;
  const captured = newBoard[to[0]][to[1]];
  let promotion: PieceType | null = null;

  // 兵升变
  const promoRow = piece.player === 'white' ? 7 : 0;
  if (piece.type === 'p' && to[0] === promoRow) {
    promotion = 'q'; // 默认升后
  }

  newBoard[to[0]][to[1]] = { ...piece, row: to[0], col: to[1] };
  if (promotion) {
    newBoard[to[0]][to[1]]!.type = promotion;
  }
  newBoard[from[0]][from[1]] = null;

  return { board: newBoard, captured, promotion };
}

// 获取所有合法移动（含将军过滤）
export function getAllLegalMoves(
  board: (Piece | null)[][],
  player: Player
): { from: [number, number]; to: [number, number] }[] {
  const moves: { from: [number, number]; to: [number, number] }[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.player === player) {
        const raw = getRawMoves(board, r, c);
        for (const [nr, nc] of raw) {
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

// 局面评估
function evaluateBoard(board: (Piece | null)[][]): number {
  const values: Record<PieceType, number> = {
    p: 10, n: 30, b: 30, r: 50, q: 90, k: 2000,
  };

  // 兵位置表（白方，黑方翻转）
  const pawnTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [10, 10, 10, 10, 10, 10, 10, 10],
    [5, 5, 6, 6, 6, 6, 5, 5],
    [3, 3, 4, 5, 5, 4, 3, 3],
    [2, 2, 3, 4, 4, 3, 2, 2],
    [1, 1, 1, 2, 2, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        const base = values[p.type];
        const pos = p.type === 'p'
          ? (p.player === 'white' ? pawnTable[r][c] : pawnTable[7 - r][c])
          : 0;
        const val = base + pos;
        score += p.player === 'white' ? val : -val;
      }
    }
  }
  return score;
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
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  if (level === 2) {
    let best: typeof allMoves[0] | null = null;
    let bestScore = aiPlayer === 'white' ? -Infinity : Infinity;

    for (const move of allMoves) {
      const { board: nb, captured } = applyMove(board, move.from, move.to);
      let s = evaluateBoard(nb);
      if (captured) {
        const values: Record<PieceType, number> = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 2000 };
        s += aiPlayer === 'white' ? values[captured.type] : -values[captured.type];
      }
      if (aiPlayer === 'white' ? s > bestScore : s < bestScore) {
        bestScore = s;
        best = move;
      }
    }
    return best;
  }

  // 高级
  const scored = allMoves.map(move => {
    const { board: nb, captured } = applyMove(board, move.from, move.to);
    let s = evaluateBoard(nb);
    if (captured) {
      const values: Record<PieceType, number> = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 2000 };
      s += aiPlayer === 'white' ? values[captured.type] : -values[captured.type];
    }
    if (isInCheck(nb, aiPlayer === 'white' ? 'black' : 'white')) {
      s += aiPlayer === 'white' ? 30 : -30;
    }
    return { move, score: s + (Math.random() - 0.5) * 8 };
  });

  scored.sort((a, b) => aiPlayer === 'white' ? b.score - a.score : a.score - b.score);
  const top = scored.slice(0, Math.min(3, scored.length));
  return top[Math.floor(Math.random() * top.length)].move;
}

// 检查游戏结束
export function checkChessGameOver(
  board: (Piece | null)[][],
  player: Player
): { over: boolean; winner: Player | null } {
  const moves = getAllLegalMoves(board, player);
  if (moves.length === 0) {
    if (isInCheck(board, player)) {
      return { over: true, winner: player === 'white' ? 'black' : 'white' };
    }
    return { over: true, winner: null }; // 和棋
  }
  return { over: false, winner: null };
}

// 创建初始状态
export function createInitialChessState(aiLevel = 1): ChessState {
  return {
    board: createInitialBoard(),
    currentPlayer: 'white',
    selected: null,
    lastMove: null,
    gameOver: false,
    winner: null,
    moveHistory: [],
    whiteCaptured: [],
    blackCaptured: [],
    aiLevel,
    whiteKingside: true,
    whiteQueenside: true,
    blackKingside: true,
    blackQueenside: true,
    enPassant: null,
    repetitionCount: 0,
  };
}
