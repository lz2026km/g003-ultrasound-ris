// ============================================================
// 桥牌核心逻辑 — bridge.ts
// Standard American Yellow Card (SAYC) 约定卡
// ============================================================

export type Suit = "♣" | "♦" | "♥" | "♠" | "NT";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

export interface Card {
  rank: Rank;
  suit: Suit;
  display: string;
}

export type PlayerPos = "N" | "E" | "S" | "W";
export type HandStatus = "active" | "passed";

export interface Player {
  id: string;
  pos: PlayerPos;
  name: string;
  hand: Card[];
  status: HandStatus;
  isAI: boolean;
  aiLevel: number;
}

export type CallType =
  | { type: "pass" }
  | { type: "bid"; level: number; suit: Suit }
  | { type: "double" }
  | { type: "redouble" };

export interface AuctionState {
  currentIdx: number;
  dealerIdx: number;
  calls: CallType[];
  lastBid: CallType | null;
  lastBidIdx: number;
  doubled: boolean;
  redoubled: boolean;
  contract: CallType | null;
  declarer: number | null;
  passedOut: boolean;
}

export type GamePhase = "auction" | "play" | "score";

export interface Trick {
  cards: [Card | null, Card | null, Card | null, Card | null];
  winner: PlayerPos | null;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIdx: number;
  dealerIdx: number;
  auction: AuctionState;
  currentTrick: Trick;
  tricks: Trick[];
  leadIdx: number;
  tricksToWin: number;
  declarerIdx: number | null;
  dummyIdx: number | null;
  contract: CallType | null;
  vul: [boolean, boolean];
  message: string;
  score: [number, number];
  trickCounts: [number, number, number, number];
  trickWins: [number, number];
}

// ---------- 工具函数 ----------

export const SUITS: Suit[] = ["♣", "♦", "♥", "♠"];
const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export function suitToIndex(s: Suit): number {
  if (s === "♣") return 0;
  if (s === "♦") return 1;
  if (s === "♥") return 2;
  return 3;
}

export function rankValue(r: Rank): number {
  if (r === "A") return 14;
  if (r === "K") return 13;
  if (r === "Q") return 12;
  if (r === "J") return 11;
  if (r === "10") return 10;
  return parseInt(r as string);
}

export function formatChips(_n: number): string {
  return _n.toString();
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of (["♣", "♦", "♥", "♠"] as Suit[])) {
    for (const rank of RANKS) {
      deck.push({ rank, suit, display: `${suit}${rank}` });
    }
  }
  return shuffle(deck);
}

// ---------- 牌型分析 ----------

export interface HandShape {
  clubs: number;
  diamonds: number;
  hearts: number;
  spades: number;
  hcp: number;
  totalPoints: number;
  isBalanced: boolean;
  hasStopper: Record<Suit, boolean>;
  longestSuit: Suit | null;
  suitLengths: number[];
}

export function analyzeHand(cards: Card[]): HandShape {
  const bySuit: Record<string, number> = { "♣": 0, "♦": 0, "♥": 0, "♠": 0 };
  const hcpMap: Record<string, number> = { "♣": 0, "♦": 0, "♥": 0, "♠": 0 };

  for (const c of cards) {
    bySuit[c.suit]++;
    if (c.rank === "A") hcpMap[c.suit] = 4;
    else if (c.rank === "K") hcpMap[c.suit] = 3;
    else if (c.rank === "Q") hcpMap[c.suit] = 2;
    else if (c.rank === "J") hcpMap[c.suit] = 1;
  }

  const hcp = hcpMap["♣"] + hcpMap["♦"] + hcpMap["♥"] + hcpMap["♠"];

  let longPoints = 0;
  for (const s of ["♣", "♦", "♥", "♠"]) {
    if (bySuit[s] >= 5) longPoints += bySuit[s] - 4;
  }

  let shortPoints = 0;
  for (const s of ["♣", "♦", "♥", "♠"]) {
    if (bySuit[s] === 1) shortPoints += 3;
    else if (bySuit[s] === 2) shortPoints += 1;
  }

  const totalPoints = hcp + longPoints + shortPoints;
  const vals = [bySuit["♣"], bySuit["♦"], bySuit["♥"], bySuit["♠"]].sort((a, b) => b - a);
  const isBalanced = vals[3] >= 1 && vals[0] <= 5 && vals[1] <= 4 && vals[2] <= 4;

  const hasStopper: Record<Suit, boolean> = { "♣": false, "♦": false, "♥": false, "♠": false, "NT": false };
  for (const s of ["♣", "♦", "♥", "♠"] as Suit[]) {
    hasStopper[s] = bySuit[s] >= 2;
  }

  let maxLen = 0;
  let maxSuit: Suit | null = null;
  for (const s of ["♣", "♦", "♥", "♠"] as Suit[]) {
    if (bySuit[s] > maxLen) { maxLen = bySuit[s]; maxSuit = s; }
  }

  return {
    clubs: bySuit["♣"],
    diamonds: bySuit["♦"],
    hearts: bySuit["♥"],
    spades: bySuit["♠"],
    hcp,
    totalPoints,
    isBalanced,
    hasStopper,
    longestSuit: maxSuit,
    suitLengths: [bySuit["♣"], bySuit["♦"], bySuit["♥"], bySuit["♠"]],
  };
}

// ---------- 叫牌系统 ----------

export function createAuction(dealerIdx = 0): AuctionState {
  return {
    currentIdx: dealerIdx,
    dealerIdx,
    calls: [],
    lastBid: null,
    lastBidIdx: -1,
    doubled: false,
    redoubled: false,
    contract: null,
    declarer: null,
    passedOut: false,
  };
}

export function applyCall(auction: AuctionState, playerIdx: number, call: CallType): AuctionState {
  const calls = [...auction.calls, call];
  let a: AuctionState = { ...auction, calls, currentIdx: (playerIdx + 1) % 4 };

  if (call.type === "bid") {
    a = { ...a, lastBid: call, lastBidIdx: playerIdx, doubled: false, redoubled: false };
  } else if (call.type === "double") {
    a = { ...a, doubled: true };
  } else if (call.type === "redouble") {
    a = { ...a, redoubled: true, doubled: false };
  }

  const bids = calls.filter(c => c.type === "bid");
  const passCount = calls.filter(c => c.type === "pass").length;

  if (bids.length >= 1 && passCount >= 3) {
    a = { ...a, contract: a.lastBid };
  }

  if (bids.length === 0 && calls.length === 4) {
    a = { ...a, passedOut: true };
  }

  return a;
}

// ---------- AI叫牌（SAYC）----------

export function aiBid(auction: AuctionState, _player: Player, hand: HandShape): CallType {
  const { hcp, totalPoints, isBalanced, suitLengths } = hand;
  const [c, d, h, s] = suitLengths;
  const isOpener = auction.calls.length === 0;
  const bids = auction.calls.filter(cc => cc.type === "bid");

  // ---- 开叫 ----
  if (isOpener) {
    if (hcp >= 22) return { type: "bid", level: 2, suit: "♣" };

    if (hcp >= 6 && hcp <= 10) {
      if (h >= 6) return { type: "bid", level: 2, suit: "♥" };
      if (s >= 6) return { type: "bid", level: 2, suit: "♠" };
    }

    if (isBalanced && hcp >= 20 && hcp <= 21) return { type: "bid", level: 2, suit: "NT" };
    if (isBalanced && hcp >= 16 && hcp <= 18) return { type: "bid", level: 1, suit: "NT" };
    if (isBalanced && hcp >= 13 && hcp <= 15) return { type: "bid", level: 1, suit: "NT" };

    if (hcp >= 13) {
      if (s >= 5) return { type: "bid", level: 1, suit: "♠" };
      if (h >= 5) return { type: "bid", level: 1, suit: "♥" };
      if (d >= 5) return { type: "bid", level: 1, suit: "♦" };
      if (c >= 5) return { type: "bid", level: 1, suit: "♣" };
    }

    return { type: "pass" };
  }

  // ---- 应叫 ----
  if (bids.length === 1) {
    const openerBid = bids[0];
    if (openerBid.type !== "bid") return { type: "pass" };

    if (openerBid.suit === "NT" && hcp >= 8) {
      if (h >= 4) return { type: "bid", level: 2, suit: "♥" };
      if (s >= 4) return { type: "bid", level: 2, suit: "♠" };
    }

    if (hcp < 6) return { type: "pass" };

    const oppSuit = openerBid.suit as Suit;
    if (oppSuit !== "NT" && oppSuit !== undefined) {
      const myLen = oppSuit === "♥" ? h : oppSuit === "♠" ? s : oppSuit === "♦" ? d : c;
      if (myLen >= 3 && hcp >= 6 && hcp <= 10) {
        return { type: "bid", level: openerBid.level + 1, suit: oppSuit };
      }
      if (myLen >= 4 && hcp >= 13) {
        return { type: "bid", level: openerBid.level + 2, suit: oppSuit };
      }
    }

    if (s >= 4) return { type: "bid", level: 1, suit: "♠" };
    if (h >= 4) return { type: "bid", level: 1, suit: "♥" };
    if (isBalanced && hcp >= 13) return { type: "bid", level: 1, suit: "NT" };

    return { type: "pass" };
  }

  // ---- 后续叫牌 ----
  if (hcp >= 18) return { type: "bid", level: 2, suit: "NT" };
  if (totalPoints >= 19) return { type: "bid", level: 2, suit: "♣" };

  return { type: "pass" };
}

// ---------- 打牌判定 ----------

export function getLeadCard(player: Player, _trumpSuit: Suit | null): Card | null {
  if (player.hand.length === 0) return null;
  for (const c of player.hand) {
    if (c.rank === "A" || c.rank === "K" || c.rank === "Q") return c;
  }
  const shapes = [
    { suit: "♣" as Suit, len: player.hand.filter(x => x.suit === "♣").length },
    { suit: "♦" as Suit, len: player.hand.filter(x => x.suit === "♦").length },
    { suit: "♥" as Suit, len: player.hand.filter(x => x.suit === "♥").length },
    { suit: "♠" as Suit, len: player.hand.filter(x => x.suit === "♠").length },
  ];
  const longest = shapes.reduce((a, b) => a.len > b.len ? a : b);
  return player.hand.find(c => c.suit === longest.suit) ?? player.hand[0];
}

export function getPlayCard(
  player: Player,
  _currentTrick: Trick,
  leadSuit: Suit | null,
  trumpSuit: Suit | null,
): Card | null {
  const hand = player.hand;
  if (hand.length === 0) return null;

  if (leadSuit) {
    const haveSuit = hand.filter(c => c.suit === leadSuit);
    if (haveSuit.length > 0) {
      const sorted = haveSuit.sort((a, b) => rankValue(a.rank) - rankValue(b.rank));
      return sorted[0];
    }
  }

  if (trumpSuit) {
    const trump = hand.filter(c => c.suit === trumpSuit);
    if (trump.length > 0) {
      const sorted = trump.sort((a, b) => rankValue(b.rank) - rankValue(a.rank));
      return sorted[0];
    }
  }

  const sorted = hand.sort((a, b) => rankValue(a.rank) - rankValue(b.rank));
  return sorted[0];
}

export function determineTrickWinner(
  trick: Trick,
  leadIdx: number,
  trumpSuit: Suit | null,
): number {
  const cards = trick.cards;
  let winnerIdx = leadIdx;
  let winnerCard: Card | null = cards[leadIdx];

  for (let i = 0; i < 4; i++) {
    if (i === leadIdx) continue;
    const card = cards[i];
    if (!card) continue;

    const isTrump = trumpSuit !== null && card.suit === trumpSuit;
    const leadIsTrump = trumpSuit !== null && winnerCard?.suit === trumpSuit;

    if (isTrump && !leadIsTrump) {
      winnerIdx = i;
      winnerCard = card;
    } else if (!isTrump && !leadIsTrump && card.suit === winnerCard?.suit) {
      if (rankValue(card.rank) > rankValue(winnerCard!.rank)) {
        winnerIdx = i;
        winnerCard = card;
      }
    }
  }

  return winnerIdx;
}

// ---------- 积分 ----------

export function calcScore(
  contract: CallType,
  declarerIdx: number,
  tricksWon: number,
): [number, number] {
  if (contract.type !== "bid") return [0, 0];

  const { level, suit } = contract;
  const required = level + 6;
  const made = tricksWon >= required;
  const nsWins = declarerIdx % 2 === 0;

  if (!made) {
    const under = required - tricksWon;
    const penalty = under * 50;
    return nsWins ? [-penalty, 0] : [0, -penalty];
  }

  const trickValue = suit === "♣" || suit === "♦" ? 20 : 30;
  const baseScore = level * trickValue + (suit === "NT" ? 10 : 0);
  const gameBonus = baseScore >= 100 ? 100 : 0;
  const over = tricksWon - required;
  const overScore = over * (suit === "♣" || suit === "♦" ? 20 : 30);

  return nsWins
    ? [baseScore + gameBonus + overScore, 0]
    : [0, baseScore + gameBonus + overScore];
}

// ---------- 游戏初始化 ----------

export function createInitialState(vul: [boolean, boolean] = [false, false]): GameState {
  const positions: PlayerPos[] = ["N", "E", "S", "W"];
  const names = ["北凤雏", "东卧龙", "南", "西玄德"];
  const players: Player[] = positions.map((pos, i) => ({
    id: `p${i}`,
    pos,
    name: names[i] ?? `玩家${i}`,
    hand: [],
    status: "active",
    isAI: i !== 2,
    aiLevel: Math.floor(Math.random() * 3),
  }));

  return {
    phase: "auction",
    players,
    currentPlayerIdx: 0,
    dealerIdx: 0,
    auction: createAuction(),
    currentTrick: { cards: [null, null, null, null], winner: null },
    tricks: [],
    leadIdx: -1,
    tricksToWin: 0,
    declarerIdx: null,
    dummyIdx: null,
    contract: null,
    vul,
    message: "叫牌阶段 — 北开叫",
    score: [0, 0],
    trickCounts: [0, 0, 0, 0],
    trickWins: [0, 0],
  };
}

export function dealCards(state: GameState): GameState {
  const deck = buildDeck();
  const players = state.players.map((p, i) => ({
    ...p,
    hand: deck.slice(i * 13, (i + 1) * 13),
    status: "active" as HandStatus,
  }));
  return { ...state, players, auction: createAuction(state.dealerIdx) };
}

export function startPlay(state: GameState): GameState {
  const contract = state.auction.contract ?? { type: "bid", level: 1, suit: "NT" as Suit };
  const declarerIdx = state.auction.declarer ?? 0;
  const dummyIdx = (declarerIdx + 2) % 4;
  const leadIdx = (declarerIdx + 3) % 4;
  const tricksToWin = contract.type === "bid" ? contract.level + 6 : 7;
  const declarer = state.players[declarerIdx];

  return {
    ...state,
    phase: "play",
    currentPlayerIdx: leadIdx,
    leadIdx,
    declarerIdx,
    dummyIdx,
    contract,
    tricksToWin,
    message: `打牌 — ${declarer.name}定约${contract.type === "bid" ? `${contract.level}${contract.suit}` : "NT"}，${state.players[leadIdx].name}首攻`,
  };
}

export function playCard(state: GameState, playerIdx: number, card: Card): GameState {
  const players = [...state.players];
  const player = { ...players[playerIdx] };
  player.hand = player.hand.filter(c => c.display !== card.display);
  players[playerIdx] = player;

  const trick = { ...state.currentTrick };
  const cards: [Card | null, Card | null, Card | null, Card | null] = [...trick.cards] as any;
  cards[playerIdx] = card;
  trick.cards = cards;

  let newState = { ...state, players, currentTrick: trick };

  if (cards.every(c => c !== null)) {
    const trumpSuit = state.contract?.type === "bid" && state.contract.suit !== "NT"
      ? state.contract.suit
      : null;
    const winnerIdx = determineTrickWinner(trick, state.leadIdx, trumpSuit);

    const newTricks = [...state.tricks, { ...trick, winner: state.players[winnerIdx].pos }];
    const newTrickCounts: [number, number, number, number] = [...state.trickCounts] as any;
    newTrickCounts[winnerIdx]++;

    const nsWins = winnerIdx % 2 === 0;
    const newTrickWins: [number, number] = [...state.trickWins] as any;
    newTrickWins[nsWins ? 0 : 1]++;

    if (newTricks.length === 13) {
      const declarerIdx = state.declarerIdx ?? 0;
      const nsTotal = newTrickWins[0];
      const contract = state.contract;
      if (contract?.type === "bid") {
        const scores = calcScore(contract, declarerIdx, nsTotal);
        const required = contract.level + 6;
        const made = nsTotal >= required;
        const msg = made
          ? `✅ 定约完成！${nsTotal}墩，NS +${scores[0]}`
          : `❌ 定约宕${required - nsTotal}，EW +${Math.abs(scores[1])}`;
        return {
          ...newState,
          tricks: newTricks,
          phase: "score",
          trickCounts: newTrickCounts,
          trickWins: newTrickWins,
          currentPlayerIdx: -1,
          message: msg,
          score: [state.score[0] + scores[0], state.score[1] + scores[1]],
        };
      }
    }

    return {
      ...newState,
      tricks: newTricks,
      currentTrick: { cards: [null, null, null, null], winner: null },
      currentPlayerIdx: winnerIdx,
      leadIdx: winnerIdx,
      trickCounts: newTrickCounts,
      trickWins: newTrickWins,
      message: `${state.players[winnerIdx].name}赢得第${newTricks.length}墩`,
    };
  }

  return {
    ...newState,
    currentPlayerIdx: (playerIdx + 1) % 4,
    message: `${player.name}出牌 ${card.display}`,
  };
}

export function aiPlay(player: Player, state: GameState): Card | null {
  if (player.hand.length === 0) return null;

  const contract = state.contract;
  const trumpSuit = contract?.type === "bid" && contract.suit !== "NT"
    ? contract.suit
    : null;

  if (state.tricks.length === 0) {
    return getLeadCard(player, trumpSuit);
  }

  const leadCard = state.currentTrick.cards[state.leadIdx];
  const leadSuit = leadCard?.suit ?? null;

  return getPlayCard(player, state.currentTrick, leadSuit, trumpSuit);
}

// ---------- 渲染工具 ----------

export function callDisplay(call: CallType): string {
  if (call.type === "pass") return "Pass";
  if (call.type === "double") return "X";
  if (call.type === "redouble") return "XX";
  if (call.type === "bid") return `${call.level}${call.suit}`;
  return "?";
}
