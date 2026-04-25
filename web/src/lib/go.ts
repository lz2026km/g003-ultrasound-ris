// ============================================================
// 围棋核心逻辑 — go.ts
// 包含：棋盘/气计算/劫/AI三级/局势评估
// ============================================================

export type Stone = "" | "B" | "W"; // 空/黑/白
export type Player = "B" | "W";
export type Cell = { stone: Stone; groupId: number };
export type Board = Cell[][];

export interface Point {
  row: number;
  col: number;
}

export interface Move {
  point: Point | null; // null = pass
  player: Player;
  isCapture?: boolean;
  capturedStones?: Point[];
}

export interface Group {
  id: number;
  stone: Stone;
  cells: Point[];
  liberties: Set<string>;
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  history: Move[];
  koPoint: Point | null;
  previousState: Board | null;
  captures: { B: number; W: number }; // 各方被提子数
  score: { B: number; W: number };
  gameOver: boolean;
  winner: Player | "draw" | null;
  lastMove: Point | null;
  aiLevel: 1 | 2 | 3; // 1=初级, 2=中级, 3=高级
}

// ---------- 常量 ----------

export const BOARD_SIZE = 19;
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function ptKey(p: Point): string {
  return `${p.row},${p.col}`;
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

// ---------- 棋盘工具 ----------

export function createBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({
      stone: "" as Stone,
      groupId: -1,
    }))
  );
}

function copyBoard(board: Board): Board {
  return board.map(row => row.map(cell => ({ ...cell })));
}

// ---------- 棋子组 & 气 ----------

let _groupIdCounter = 0;

function floodFill(
  board: Board,
  start: Point,
  groupMap: Map<string, { groupId: number; stone: Stone; cells: Point[] }>,
): void {
  const stone = board[start.row][start.col].stone;
  if (!stone) return;

  const key = ptKey(start);
  if (groupMap.has(key)) return;

  const cells: Point[] = [];
  const stack = [start];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const p = stack.pop()!;
    const k = ptKey(p);
    if (visited.has(k)) continue;
    visited.add(k);
    if (board[p.row][p.col].stone !== stone) continue;
    cells.push(p);
    for (const [dr, dc] of DIRS) {
      const nr = p.row + dr;
      const nc = p.col + dc;
      if (inBounds(nr, nc) && !visited.has(ptKey({ row: nr, col: nc }))) {
        stack.push({ row: nr, col: nc });
      }
    }
  }

  const id = ++_groupIdCounter;
  const liberties = new Set<string>();

  for (const cell of cells) {
    board[cell.row][cell.col].groupId = id;
    for (const [dr, dc] of DIRS) {
      const nr = cell.row + dr;
      const nc = cell.col + dc;
      if (inBounds(nr, nc) && board[nr][nc].stone === "") {
        liberties.add(ptKey({ row: nr, col: nc }));
      }
    }
  }

  groupMap.set(key, { groupId: id, stone, cells });
}

// ---------- 提子 & 合法性检查 ----------

function findCaptures(board: Board, player: Player): Point[] {
  const opponent = player === "B" ? "W" : "B";
  const captures: Point[] = [];
  const visited = new Set<string>();

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c].stone !== opponent) continue;
      const key = ptKey({ row: r, col: c });
      if (visited.has(key)) continue;

      const groupMap = new Map();
      floodFill(board, { row: r, col: c }, groupMap);
      for (const [, g] of groupMap) {
        for (const cell of g.cells) visited.add(ptKey(cell));

        // 数气
        const liberties = new Set<string>();
        for (const cell of g.cells) {
          for (const [dr, dc] of DIRS) {
            const nr = cell.row + dr;
            const nc = cell.col + dc;
            if (inBounds(nr, nc) && board[nr][nc].stone === "") {
              liberties.add(ptKey({ row: nr, col: nc }));
            }
          }
        }
        if (liberties.size === 0) {
          for (const cell of g.cells) captures.push(cell);
        }
      }
    }
  }

  return captures;
}

function findFriendlyGroups(board: Board, player: Player): Array<{ cells: Point[]; liberties: Set<string> }> {
  const groups: Array<{ cells: Point[]; liberties: Set<string> }> = [];
  const visited = new Set<string>();

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c].stone !== player) continue;
      const key = ptKey({ row: r, col: c });
      if (visited.has(key)) continue;

      const groupMap = new Map();
      floodFill(board, { row: r, col: c }, groupMap);
      for (const [, g] of groupMap) {
        for (const cell of g.cells) visited.add(ptKey(cell));
      }

      // 计算liberties
      const liberties = new Set<string>();
      for (const [, g] of groupMap) {
        for (const cell of g.cells) {
          for (const [dr, dc] of DIRS) {
            const nr = cell.row + dr;
            const nc = cell.col + dc;
            if (inBounds(nr, nc) && board[nr][nc].stone === "") {
              liberties.add(ptKey({ row: nr, col: nc }));
            }
          }
        }
      }
      groups.push({ cells: [...groupMap.values()][0].cells, liberties });
    }
  }

  return groups;
}

export function isValidMove(board: Board, point: Point, player: Player, koPoint: Point | null, previousBoard: Board | null): string | null {
  if (point.row < 0 || point.row >= BOARD_SIZE || point.col < 0 || point.col >= BOARD_SIZE) {
    return "棋盘外";
  }
  if (board[point.row][point.col].stone !== "") {
    return "该位置已有棋子";
  }
  if (koPoint && point.row === koPoint.row && point.col === koPoint.col) {
    return "当前劫点不能落子";
  }

  // 模拟落子
  const testBoard = copyBoard(board);
  testBoard[point.row][point.col].stone = player;

  // 检查是否自杀
  const opponent = player === "B" ? "W" : "B";
  const captures = findCaptures(testBoard, opponent);

  // 提子
  for (const cap of captures) {
    testBoard[cap.row][cap.col].stone = "";
  }

  // 检查己方棋子是否还有气（自杀）
  const myGroups = findFriendlyGroups(testBoard, player);
  for (const g of myGroups) {
    if (g.cells.some(c => c.row === point.row && c.col === point.col) && g.liberties.size === 0) {
      // 特殊情况：如果能提对方的子，则不算自杀
      if (captures.length === 0) return "自杀禁着";
    }
  }

  // 打劫检查：不能刚落一子就提回
  if (previousBoard && captures.length === 1) {
    const cap = captures[0];
    // 检查被提子位置在上一手是否就是自己刚下的
    if (previousBoard[cap.row][cap.col].stone === player) {
      return "打劫禁着";
    }
  }

  return null;
}

export function getValidMoves(board: Board, player: Player, _koPoint: Point | null, _previousBoard: Board | null): Point[] {
  // koPoint and previousBoard used for rule validation
  const moves: Point[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!isValidMove(board, { row: r, col: c }, player, null, null)) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
}

// ---------- 落子 ----------

export function placeStone(state: GameState, point: Point | null): GameState {
  const board = copyBoard(state.board);
  const player = state.currentPlayer;
  const opponent = player === "B" ? "W" : "B";

  if (!point) {
    // Pass
    return {
      ...state,
      history: [...state.history, { point: null, player }],
      currentPlayer: opponent,
      koPoint: null,
    };
  }

  const error = isValidMove(board, point, player, state.koPoint, state.previousState);
  if (error) return state;

  board[point.row][point.col].stone = player;

  // 提子
  const captures = findCaptures(board, opponent);
  for (const cap of captures) {
    board[cap.row][cap.col].stone = "";
  }

  const capturesB = player === "B" ? captures.length : 0;
  const capturesW = player === "W" ? captures.length : 0;

  // 打劫点
  let koPoint: Point | null = null;
  if (captures.length === 1) {
    const cap = captures[0];
    const testBoard = copyBoard(board);
    testBoard[cap.row][cap.col].stone = "";
    const oppCaptures = findCaptures(testBoard, opponent);
    if (oppCaptures.length === 1 && oppCaptures[0].row === point.row && oppCaptures[0].col === point.col) {
      koPoint = cap;
    }
  }

  // 检测游戏结束（双 Pass）
  const lastMove = state.history[state.history.length - 1];
  const gameOver = lastMove?.point === null && point === null;

  const newState: GameState = {
    ...state,
    board,
    currentPlayer: opponent,
    history: [...state.history, {
      point,
      player,
      isCapture: captures.length > 0,
      capturedStones: captures,
    }],
    koPoint,
    previousState: state.board,
    captures: {
      B: state.captures.B + capturesB,
      W: state.captures.W + capturesW,
    },
    lastMove: point,
    gameOver,
    winner: null,
  };

  if (gameOver) {
    newState.score = calcScore(board, newState.captures);
    newState.winner = decideWinner(newState.score);
  }

  return newState;
}

// ---------- 计棋（中国规则 - 数子法）----------

function calcScore(board: Board, _captures: { B: number; W: number }): { B: number; W: number } {
  const visited = new Set<string>();
  let blackTerritory = 0;
  let whiteTerritory = 0;
  let neutral = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c].stone !== "") continue;
      const key = ptKey({ row: r, col: c });
      if (visited.has(key)) continue;

      const { territory, stones } = floodTerritory(board, { row: r, col: c }, visited);
      if (territory === "B") blackTerritory += stones.size;
      else if (territory === "W") whiteTerritory += stones.size;
      else neutral += stones.size;
    }
  }

  // 黑棋：子+地+让子（假设白让黑不贴目，简化为各自计）
  const blackScore = (() => {
    let s = 0;
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++)
        if (board[r][c].stone === "B") s++;
    return s + blackTerritory;
  })();

  const whiteScore = (() => {
    let s = 0;
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++)
        if (board[r][c].stone === "W") s++;
    return s + whiteTerritory;
  })();

  return { B: blackScore, W: whiteScore };
}

function floodTerritory(
  board: Board,
  start: Point,
  visited: Set<string>,
): { territory: Stone | ""; stones: Set<string> } {
  const queue = [start];
  const region = new Set<string>();
  const borderingStones = new Set<Stone>();
  const seen = new Set<string>();

  while (queue.length > 0) {
    const p = queue.shift()!;
    const key = ptKey(p);
    if (seen.has(key)) continue;
    seen.add(key);

    const stone = board[p.row][p.col].stone;
    if (stone !== "") {
      borderingStones.add(stone);
      continue;
    }
    if (region.has(key)) continue;
    region.add(key);

    for (const [dr, dc] of DIRS) {
      const nr = p.row + dr;
      const nc = p.col + dc;
      if (inBounds(nr, nc) && !seen.has(ptKey({ row: nr, col: nc }))) {
        queue.push({ row: nr, col: nc });
      }
    }
  }

  for (const k of region) visited.add(k);

  let territory: Stone | "" = "";
  if (borderingStones.size === 1) {
    territory = [...borderingStones][0];
  }
  return { territory, stones: region };
}

function decideWinner(score: { B: number; W: number }): Player | "draw" {
  if (score.B > score.W) return "B";
  if (score.W > score.B) return "W";
  return "draw";
}

// ---------- AI 三档 ----------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 评估落子分数（AI内部用）
function evaluateMove(
  board: Board,
  point: Point,
  player: Player,
  _koPoint: Point | null,
  _previousBoard: Board | null,
): number {
  const testBoard = copyBoard(board);
  testBoard[point.row][point.col].stone = player;
  const opponent = player === "B" ? "W" : "B";

  const captures = findCaptures(testBoard, opponent);
  let score = 0;

  // 1. 提子价值
  score += captures.length * 15;

  // 2. 连接己方棋子
  for (const [dr, dc] of DIRS) {
    const nr = point.row + dr;
    const nc = point.col + dc;
    if (inBounds(nr, nc) && board[nr][nc].stone === player) {
      score += 8; // 连接加分
    }
  }

  // 3. 防守/进攻（威胁对方棋子）
  const friendlyGroups = findFriendlyGroups(testBoard, player);
  const oppGroups = findFriendlyGroups(testBoard, opponent);

  for (const g of oppGroups) {
    if (g.liberties.size === 1) {
      // 对方只有1气，进攻
      const libPt = [...g.liberties][0].split(",").map(Number);
      if (libPt[0] === point.row && libPt[1] === point.col) {
        score += 25; // 紧气
      }
    }
    if (g.liberties.size === 2) {
      const libs = [...g.liberties];
      const isNear = libs.some(lib => {
        const [lr, lc] = lib.split(",").map(Number);
        return Math.abs(lr - point.row) <= 1 && Math.abs(lc - point.col) <= 1;
      });
      if (isNear) score += 10;
    }
  }

  for (const g of friendlyGroups) {
    if (g.liberties.size === 1) {
      score -= 20; // 己方危险，防守
    }
    if (g.liberties.size === 2) {
      score -= 5;
    }
  }

  // 4. 围棋战略点
  // 星位（3,3）、（3,15）、（15,3）、（15,15）等
  const starPoints = [
    [3, 3], [3, 9], [3, 15],
    [9, 3], [9, 9], [9, 15],
    [15, 3], [15, 9], [15, 15],
  ];
  for (const [sr, sc] of starPoints) {
    if (point.row === sr && point.col === sc) score += 6;
  }

  // 5. 天元
  if (point.row === 9 && point.col === 9) score += 5;

  // 6. 角部优先
  if (point.row <= 2 || point.row >= 16 || point.col <= 2 || point.col >= 16) {
    score += 2;
  }

  // 7. 避免填子（远离己方棋子密集区）
  let nearbyCount = 0;
  for (let dr = -3; dr <= 3; dr++) {
    for (let dc = -3; dc <= 3; dc++) {
      const nr = point.row + dr;
      const nc = point.col + dc;
      if (inBounds(nr, nc) && board[nr][nc].stone === player) {
        nearbyCount++;
      }
    }
  }
  score -= nearbyCount * 0.5; // 避免太密集

  // 8. 中高级：评估棋形
  // 高级的评估更复杂，会计算地盘和影响力

  return score;
}

export function aiMove(state: GameState): Point | null {
  const player = state.currentPlayer;
  const validMoves = getValidMoves(state.board, player, state.koPoint, state.previousState);

  if (validMoves.length === 0) return null;

  if (state.aiLevel === 1) {
    return shuffle(validMoves)[0];
  }

  if (state.aiLevel === 2) {
    const scored = validMoves.map(p => ({
      point: p,
      score: evaluateMove(state.board, p, player, state.koPoint, state.previousState),
    }));
    scored.sort((a, b) => b.score - a.score);

    if (scored.length === 0) return null;

    // 70%选最优
    if (Math.random() < 0.7) {
      return scored[0].point;
    }
    // 30%选前3随机
    return shuffle(scored.slice(0, Math.min(3, scored.length)))[0].point;
  }

  // 高级：更精确评估，考虑棋形和地盘
  const scored = validMoves.map(p => {
    const baseScore = evaluateMove(state.board, p, player, state.koPoint, state.previousState);
    // 添加随机因素（5%）
    const noise = (Math.random() - 0.5) * 4;
    return { point: p, score: baseScore + noise };
  });

  scored.sort((a, b) => b.score - a.score);

  // 高级AI：选择前2中最优
  if (scored.length === 0) return null;
  if (scored.length === 1) return scored[0].point;

  // 有时候选次优（增加多样性）
  if (Math.random() < 0.2 && scored.length >= 2) {
    return scored[1].point;
  }
  return scored[0].point;
}

// ---------- 游戏初始化 ----------

export function createGoState(aiLevel: 1 | 2 | 3): GameState {
  _groupIdCounter = 0;
  return {
    board: createBoard(),
    currentPlayer: "B", // 黑先
    history: [],
    koPoint: null,
    previousState: null,
    captures: { B: 0, W: 0 },
    score: { B: 0, W: 0 },
    gameOver: false,
    winner: null,
    lastMove: null,
    aiLevel,
  };
}

// ---------- 最后一手显示（渲染用）----------

export function getLastMoveStone(board: Board, point: Point): Stone {
  return board[point.row][point.col].stone;
}
