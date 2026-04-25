// ============================================================
// 德州扑克核心逻辑 — poker.ts
// 包含：牌型判定 / AI决策 / 游戏状态机
// ============================================================

// ---------- 类型定义 ----------

export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
export type HandStatus = "active" | "folded" | "allin" | "out";

export interface Card {
  rank: Rank;
  suit: Suit;
  display: string;
}

export interface Player {
  id: string;
  name: string;
  holeCards: [Card | null, Card | null];
  chips: number;
  currentBet: number;
  status: HandStatus;
  isAI: boolean;
  aiRaiseLevel: number;
}

export type GamePhase = "idle" | "preflop" | "flop" | "turn" | "river" | "showdown";

export interface GameState {
  phase: GamePhase;
  deck: Card[];
  publicCards: Card[];
  pot: number;
  currentBet: number;
  players: Player[];
  dealerIdx: number;
  currentIdx: number;
  smallBlind: number;
  bigBlind: number;
  minRaise: number;
  hasRaised: boolean;
  winnerIds: string[];
  message: string;
  roundPot: number;
  /** 本轮下注回合中已完成行动的玩家数；达到活跃玩家数时意味着一轮结束 */
  playersActedThisRound: number;
}

// ---------- 工具函数 ----------

const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

function rankValue(r: Rank): number {
  if (r === "A") return 14;
  if (r === "K") return 13;
  if (r === "Q") return 12;
  if (r === "J") return 11;
  return parseInt(r);
}

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit, display: `${suit}${rank}` });
    }
  }
  return shuffle(deck);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- 牌型判定 ----------

export type HandRank =
  | "高牌" | "一对" | "两对" | "三条"
  | "顺子" | "同花" | "葫芦" | "四条"
  | "同花顺" | "皇家同花顺";

export interface HandScore {
  rank: number;
  tiebreakers: number[];
}

function isFlush(cards: Card[]): boolean {
  if (cards.length < 5) return false;
  return cards.every((c) => c.suit === cards[0].suit);
}

function getStraight(cards: Card[]): number | null {
  const rawVals = cards.map((c) => rankValue(c.rank));
  const unique: number[] = [];
  for (const v of rawVals) {
    if (!unique.includes(v)) unique.push(v);
  }
  unique.sort((a, b) => b - a);
  // A-5 轮椅顺子
  if (unique.includes(14) && unique.includes(2) && unique.includes(3) && unique.includes(4) && unique.includes(5)) {
    return 5;
  }
  for (let i = 0; i <= unique.length - 5; i++) {
    if (unique[i] - unique[i + 4] === 4) return unique[i];
  }
  return null;
}

function countByRank(cards: Card[]): Map<Rank, number> {
  const m = new Map<Rank, number>();
  for (const c of cards) {
    m.set(c.rank, (m.get(c.rank) ?? 0) + 1);
  }
  return m;
}

export function evaluateHand(hole: [Card | null, Card | null], publicCards: Card[]): HandScore {
  const all: Card[] = [];
  if (hole[0]) all.push(hole[0]);
  if (hole[1]) all.push(hole[1]);
  all.push(...publicCards);

  if (all.length < 5) return { rank: -1, tiebreakers: [] };

  const combo5 = getCombinations5(all);
  let best: HandScore = { rank: -1, tiebreakers: [] };

  for (const combo of combo5) {
    const score = evaluate5(combo);
    if (score.rank > best.rank || (score.rank === best.rank && scoreTie(score) > scoreTie(best))) {
      best = score;
    }
  }
  return best;
}

function scoreTie(s: HandScore): string {
  return s.tiebreakers.join(",");
}

function evaluate5(cards: Card[]): HandScore {
  const flush = isFlush(cards);
  const straightHigh = getStraight(cards);
  const isStraight = straightHigh !== null;

  const counts = countByRank(cards);
  const sortedEntries: [Rank, number][] = [];
  counts.forEach((cnt, r) => sortedEntries.push([r, cnt]));
  sortedEntries.sort((a, b) => b[1] - a[1] || rankValue(b[0]) - rankValue(a[0]));

  const topRank = sortedEntries[0]?.[0];
  const topCount = sortedEntries[0]?.[1] ?? 0;
  const secondCount = sortedEntries[1]?.[1] ?? 0;

  // kickers: sort by rank value
  const kickerRanks: number[] = [];
  sortedEntries.forEach(([r, cnt]) => {
    if (cnt === 1) kickerRanks.push(rankValue(r));
  });
  // 包含重复rank的kicker（用于特定牌型）
  const allRanksSorted: number[] = [];
  sortedEntries.forEach(([r, cnt]) => {
    for (let i = 0; i < cnt; i++) allRanksSorted.push(rankValue(r));
  });

  // 皇家同花顺
  if (flush && isStraight && straightHigh === 14) return { rank: 9, tiebreakers: [] };
  // 同花顺
  if (flush && isStraight) return { rank: 8, tiebreakers: [straightHigh] };
  // 四条
  if (topCount === 4) {
    const kicker = allRanksSorted.find((v) => v !== rankValue(topRank!)) ?? 0;
    return { rank: 7, tiebreakers: [rankValue(topRank!), kicker] };
  }
  // 葫芦
  if (topCount === 3 && secondCount === 2) {
    return { rank: 6, tiebreakers: [rankValue(topRank!), rankValue(sortedEntries[1]![0])] };
  }
  // 同花
  if (flush) {
    const h = cards.map((c) => rankValue(c.rank)).sort((a, b) => b - a);
    return { rank: 5, tiebreakers: h };
  }
  // 顺子
  if (isStraight) return { rank: 4, tiebreakers: [straightHigh] };
  // 三条
  if (topCount === 3) {
    const kicker1 = allRanksSorted.find((v) => v !== rankValue(topRank!)) ?? 0;
    const kicker2 = allRanksSorted.filter((v) => v !== rankValue(topRank!))[1] ?? 0;
    return { rank: 3, tiebreakers: [rankValue(topRank!), kicker1, kicker2] };
  }
  // 两对
  if (topCount === 2 && secondCount === 2) {
    const bigPair = rankValue(sortedEntries[0]![0]);
    const smPair = rankValue(sortedEntries[1]![0]);
    const kicker = kickerRanks[0] ?? 0;
    return { rank: 2, tiebreakers: [bigPair, smPair, kicker] };
  }
  // 一对
  if (topCount === 2) {
    const pairR = rankValue(topRank!);
    const k1 = kickerRanks[0] ?? 0;
    const k2 = kickerRanks[1] ?? 0;
    const k3 = kickerRanks[2] ?? 0;
    return { rank: 1, tiebreakers: [pairR, k1, k2, k3] };
  }
  // 高牌
  const hi = kickerRanks.slice(0, 5);
  return { rank: 0, tiebreakers: hi };
}

/** 从n个元素中取5个的所有组合 */
function getCombinations5(arr: Card[]): Card[][] {
  const result: Card[][] = [];
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        for (let l = k + 1; l < n; l++) {
          for (let m = l + 1; m < n; m++) {
            result.push([arr[i], arr[j], arr[k], arr[l], arr[m]]);
          }
        }
      }
    }
  }
  return result;
}

export function handRankLabel(rank: number): HandRank {
  return ["高牌", "一对", "两对", "三条", "顺子", "同花", "葫芦", "四条", "同花顺", "皇家同花顺"][rank] as HandRank;
}

// ---------- AI 决策 ----------

export type AIAction =
  | { type: "fold" }
  | { type: "check" }
  | { type: "call" }
  | { type: "raise"; amount: number }
  | { type: "allin" };

export function aiDecision(player: Player, state: GameState): AIAction {
  if (player.status === "folded" || player.status === "out") return { type: "fold" };
  if (player.chips === 0) return { type: "allin" };
  if (state.phase === "showdown" || state.phase === "idle") return { type: "call" };

  const hole = player.holeCards;
  if (!hole[0] || !hole[1]) return { type: "fold" };

  const toCall = state.currentBet - player.currentBet;
  const numPublic = state.publicCards.length;
  const handScore = evaluateHand(hole, state.publicCards);

  // ---- 翻牌前 ----
  if (numPublic === 0) {
    const r1 = rankValue(hole[0].rank);
    const r2 = rankValue(hole[1].rank);
    const maxR = Math.max(r1, r2);
    const suited = hole[0].suit === hole[1].suit;
    const pair = r1 === r2;

    // 强牌：AA-KK, AK, AQ
    if (pair && maxR >= 13) {
      if (toCall === 0) {
        const amt = Math.min(player.chips, state.bigBlind * 4);
        return amt >= player.chips ? { type: "allin" } : { type: "raise", amount: amt };
      }
      if (toCall >= player.chips) return { type: "allin" };
      return { type: "call" };
    }
    if (maxR >= 13 && !pair) {
      if (toCall === 0) return { type: "check" };
      if (toCall <= player.chips * 0.25) return { type: "call" };
      return { type: "fold" };
    }
    if (pair || suited) {
      if (toCall === 0) return { type: "check" };
      if (toCall <= player.chips * 0.12) return { type: "call" };
      return { type: "fold" };
    }
    return { type: "fold" };
  }

  // ---- 翻牌后 ----
  if (toCall === 0) {
    // 没人加注：强牌下注，弱牌过牌
    if (handScore.rank >= 4) {
      const amt = Math.min(player.chips, Math.round(state.pot * 0.6));
      return amt >= player.chips ? { type: "allin" } : { type: "raise", amount: amt };
    }
    if (handScore.rank >= 2) {
      const amt = Math.min(player.chips, Math.round(state.pot * 0.35));
      return amt >= state.bigBlind ? { type: "raise", amount: amt } : { type: "check" };
    }
    return { type: "check" };
  }

  // 有人加注
  if (handScore.rank >= 6) {
    const amt = Math.min(player.chips, Math.round(toCall * 2.5));
    return amt >= player.chips ? { type: "allin" } : { type: "raise", amount: amt };
  }
  if (handScore.rank >= 3) {
    if (toCall < player.chips * 0.3) return { type: "call" };
    return { type: "fold" };
  }
  if (toCall < player.chips * 0.12) return { type: "call" };
  return { type: "fold" };
}

// ---------- 游戏状态机 ----------

export function createInitialState(numPlayers: number, smallBlind = 10, bigBlind = 20): GameState {
  const names = ["你", "小凤雏", "卧龙", "玄德", "孟德"];
  const players: Player[] = Array.from({ length: numPlayers }, (_, i) => ({
    id: `p${i}`,
    name: names[i] ?? `玩家${i + 1}`,
    holeCards: [null, null],
    chips: 1000,
    currentBet: 0,
    status: "active",
    isAI: i > 0,
    aiRaiseLevel: Math.floor(Math.random() * 3),
  }));

  return {
    phase: "idle",
    deck: [],
    publicCards: [],
    pot: 0,
    currentBet: 0,
    players,
    dealerIdx: 0,
    currentIdx: 0,
    smallBlind,
    bigBlind,
    minRaise: bigBlind,
    hasRaised: false,
    winnerIds: [],
    message: "等待开始...",
    roundPot: 0,
    playersActedThisRound: 0,
  };
}

export function startGame(state: GameState): GameState {
  const numPlayers = state.players.length;
  const dealerIdx = state.dealerIdx;
  const smallBlindIdx = (dealerIdx + 1) % numPlayers;
  const bigBlindIdx = (dealerIdx + 2) % numPlayers;

  const players: Player[] = state.players.map((p) => ({
    ...p,
    holeCards: [null, null] as [Card | null, Card | null],
    currentBet: 0,
    status: "active" as HandStatus,
  }));

  const sbChips = Math.min(players[smallBlindIdx].chips, state.smallBlind);
  const bbChips = Math.min(players[bigBlindIdx].chips, state.bigBlind);
  players[smallBlindIdx].chips -= sbChips;
  players[smallBlindIdx].currentBet = sbChips;
  players[bigBlindIdx].chips -= bbChips;
  players[bigBlindIdx].currentBet = bbChips;

  const deck = buildDeck();

  for (let i = 0; i < numPlayers; i++) {
    const idx = (dealerIdx + 1 + i) % numPlayers;
    players[idx].holeCards = [deck[i * 2], deck[i * 2 + 1]];
  }

  const firstIdx = (bigBlindIdx + 1) % numPlayers;

  return {
    ...state,
    players,
    deck,
    publicCards: [],
    pot: sbChips + bbChips,
    currentBet: bbChips,
    phase: "preflop",
    hasRaised: false,
    currentIdx: firstIdx,
    winnerIds: [],
    message: `翻牌前 — ${players[smallBlindIdx].name}小盲${sbChips} | ${players[bigBlindIdx].name}大盲${bbChips}`,
    roundPot: sbChips + bbChips,
    minRaise: state.bigBlind,
    playersActedThisRound: 0, // 新一轮下注回合开始，计数器归零
  };
}

export function applyAction(
  state: GameState,
  playerId: string,
  action: AIAction,
): GameState {
  const playerIdx = state.players.findIndex((p) => p.id === playerId);
  if (playerIdx < 0) return state;

  const players = [...state.players];
  const player = { ...players[playerIdx] };

  switch (action.type) {
    case "fold":
      player.status = "folded";
      player.currentBet = 0;
      break;
    case "check":
      break;
    case "call": {
      const toCall = state.currentBet - player.currentBet;
      const callAmt = Math.min(toCall, player.chips);
      player.chips -= callAmt;
      player.currentBet += callAmt;
      break;
    }
    case "raise": {
      const totalNeeded = (state.currentBet - player.currentBet) + action.amount;
      const betAmt = Math.min(totalNeeded, player.chips);
      player.chips -= betAmt;
      player.currentBet += betAmt;
      break;
    }
    case "allin": {
      const allInAmt = player.chips;
      player.chips = 0;
      player.currentBet += allInAmt;
      player.status = "allin";
      break;
    }
  }

  players[playerIdx] = player;

  let newBet = state.currentBet;
  let newHasRaised = state.hasRaised;
  let newMinRaise = state.minRaise;

  if (action.type === "raise" || action.type === "allin") {
    newBet = Math.max(state.currentBet, player.currentBet);
    newHasRaised = true;
    newMinRaise = Math.max(state.minRaise, player.currentBet - state.currentBet);
  }

  // 计算下一个该行动的玩家索引（用更新后的状态）
  const nextIdx = getNextPlayerIdx({ ...state, players, currentBet: newBet, hasRaised: newHasRaised, minRaise: newMinRaise });

  // 追踪本轮已行动人数：raise 重置为1（抬注者算第一个），否则+1
  const newActed = (action.type === "raise" || action.type === "allin")
    ? 1
    : (state.playersActedThisRound ?? 0) + 1;

  return {
    ...state,
    players,
    currentBet: newBet,
    hasRaised: newHasRaised,
    minRaise: newMinRaise,
    currentIdx: nextIdx,
    playersActedThisRound: newActed,
  };
}

export function advancePhase(state: GameState): GameState {
  const { phase, deck, players, publicCards } = state;
  let nextPhase: GamePhase;
  let newPublic: Card[];
  let newMessage = "";

  if (phase === "preflop") {
    nextPhase = "flop";
    newPublic = [deck[4], deck[5], deck[6]];
    newMessage = `翻牌 — ${newPublic.map((c) => c.display).join(" ")}`;
  } else if (phase === "flop") {
    nextPhase = "turn";
    newPublic = [...publicCards, deck[7]];
    newMessage = `转牌 — ${newPublic.map((c) => c.display).join(" ")}`;
  } else if (phase === "turn") {
    nextPhase = "river";
    newPublic = [...publicCards, deck[8]];
    newMessage = `河牌 — ${newPublic.map((c) => c.display).join(" ")}`;
  } else {
    return state;
  }

  const resetPlayers = players.map((p) => ({ ...p, currentBet: 0 }));

  return {
    ...state,
    phase: nextPhase,
    publicCards: newPublic,
    players: resetPlayers,
    currentBet: 0,
    hasRaised: false,
    minRaise: state.bigBlind,
    roundPot: 0,
    message: newMessage,
    currentIdx: -1,
    playersActedThisRound: 0, // 进入新 phase，新一轮下注
  };
}

export function checkEarlyWin(state: GameState): GameState | null {
  const active = state.players.filter((p) => p.status !== "folded");
  if (active.length === 1) {
    const winner = active[0];
    const players = state.players.map((p) =>
      p.id === winner.id ? { ...p, chips: p.chips + state.pot } : p
    );
    return {
      ...state,
      players,
      winnerIds: [winner.id],
      phase: "showdown",
      message: `🏆 「${winner.name}」无人竞争获胜，赢得底池 ${state.pot}！`,
    };
  }
  return null;
}

export function determineShowdown(state: GameState): GameState {
  const active = state.players.filter((p) => p.status !== "folded");
  if (active.length === 0) return state;

  const scores = active.map((p) => ({
    player: p,
    score: evaluateHand(p.holeCards, state.publicCards),
  }));

  scores.sort((a, b) => {
    if (a.score.rank !== b.score.rank) return b.score.rank - a.score.rank;
    for (let i = 0; i < a.score.tiebreakers.length; i++) {
      if (a.score.tiebreakers[i] !== b.score.tiebreakers[i]) {
        return (b.score.tiebreakers[i] ?? 0) - (a.score.tiebreakers[i] ?? 0);
      }
    }
    return 0;
  });

  const topScore = scores[0].score;
  const winners = scores.filter((s) =>
    s.score.rank === topScore.rank &&
    s.score.tiebreakers.every((v, i) => v === topScore.tiebreakers[i])
  );

  const winnerIds = winners.map((w) => w.player.id);
  const winPerPlayer = Math.floor(state.pot / winners.length);

  const players = state.players.map((p) => {
    if (winnerIds.includes(p.id)) {
      return { ...p, chips: p.chips + winPerPlayer };
    }
    return p;
  });

  const msg = `🏆 胜者: ${winners.map((w) => `「${w.player.name}」`).join(" ")} — ${handRankLabel(winners[0].score.rank)}${winners.length > 1 ? "（平分）" : ""}`;

  return { ...state, players, winnerIds, phase: "showdown", message: msg };
}

export function getNextPlayerIdx(state: GameState): number {
  const n = state.players.length;
  for (let offset = 1; offset <= n; offset++) {
    const idx = (state.currentIdx + offset) % n;
    const p = state.players[idx];
    if (p.status === "active" || p.status === "allin") {
      const toCall = state.currentBet - p.currentBet;
      // Preflop：已付到大盲的玩家（toCall=0）可以 check；其他人需跟注
      // 非 Preflop：toCall>0 需跟注；无人 raise 时所有人都可 check（toCall=0 但 !hasRaised）
      if (toCall > 0) return idx;
      if (!state.hasRaised) return idx; // 没人加注时，任何人都可以行动（包括 check）
    }
  }
  return -1;
}

// ---------- 工具 ----------

export function formatChips(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function bestHandLabel(hole: [Card | null, Card | null], publicCards: Card[]): string {
  if (!hole[0] || !hole[1] || publicCards.length === 0) return "—";
  const score = evaluateHand(hole, publicCards);
  return handRankLabel(score.rank);
}
