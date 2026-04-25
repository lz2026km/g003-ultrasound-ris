import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spade, Heart, Diamond, Club, ArrowLeft } from "lucide-react";
import {
  createInitialState,
  dealCards,
  applyCall,
  startPlay,
  playCard,
  aiPlay,
  analyzeHand,
  aiBid,
  type GameState,
  type Player,
  type Card,
  type CallType,
  type AuctionState,
  callDisplay,
  suitToIndex,
  rankValue,
} from "@/lib/bridge";

// ============================================================
// 背景音乐
// ============================================================
const MUSIC_URL =
  "https://cdn.pixabay.com/audio/2024/11/04/audio_8f7a3f2fa3.mp3";

function useBgMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.18;
    audio.play().catch(() => {});
    audioRef.current = audio;
  }, []);

  const toggle = useCallback((on: boolean) => {
    if (!audioRef.current) return;
    audioRef.current.muted = !on;
  }, []);

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  return { start, toggle };
}

// ============================================================
// 桥牌卡牌组件
// ============================================================
function BridgeCard({
  card,
  small = false,
  faceDown = false,
  highlight = false,
}: {
  card: Card | null;
  small?: boolean;
  faceDown?: boolean;
  highlight?: boolean;
}) {
  if (!card || faceDown) {
    return (
      <div
        className={`rounded flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 border-2 border-blue-400/50 shadow-lg ${small ? "w-8 h-12" : "w-12 h-16"} ${highlight ? "ring-2 ring-yellow-400" : ""}`}
      >
        <span className="text-blue-200/30 text-xl font-bold">?</span>
      </div>
    );
  }

  const isRed = card.suit === "♥" || card.suit === "♦";

  return (
    <div
      className={`relative rounded flex flex-col items-center justify-between bg-gradient-to-br from-stone-100 to-stone-200 border border-stone-300 shadow-lg ${small ? "w-8 h-12 p-0.5" : "w-12 h-16 p-1"} ${highlight ? "ring-2 ring-yellow-400 ring-offset-1 ring-offset-black" : ""}`}
    >
      <div className={`self-start leading-none ${small ? "text-xs" : "text-sm"} font-bold ${isRed ? "text-red-600" : "text-black"}`}>
        {card.rank}<span className={small ? "text-xs" : "text-sm"}>{card.suit}</span>
      </div>
      <div className={`${small ? "text-lg" : "text-2xl"} ${isRed ? "text-red-600" : "text-black"}`}>
        {card.suit === "♠" && <Spade size={small ? 14 : 22} />}
        {card.suit === "♥" && <Heart size={small ? 14 : 22} />}
        {card.suit === "♦" && <Diamond size={small ? 14 : 22} />}
        {card.suit === "♣" && <Club size={small ? 14 : 22} />}
      </div>
      <div className={`self-end leading-none rotate-180 ${small ? "text-xs" : "text-sm"} font-bold ${isRed ? "text-red-600" : "text-black"}`}>
        {card.rank}<span className={small ? "text-xs" : "text-sm"}>{card.suit}</span>
      </div>
    </div>
  );
}

// ============================================================
// 叫牌框
// ============================================================
function AuctionBoard({
  auction,
  currentIdx,
  myIdx,
}: {
  auction: AuctionState;
  currentIdx: number;
  myIdx: number;
}) {
  const positions = ["N", "E", "S", "W"];
  const names = ["北", "东", "南", "西"];

  // 构建4xN叫牌格
  const rows: Array<Array<{ pos: string; call: CallType | null }>> = [];
  const totalCalls = auction.calls.length;
  const rowCount = Math.ceil(totalCalls / 4) + 2;

  // 填入叫牌记录
  for (let r = 0; r < rowCount; r++) {
    const row: Array<{ pos: string; call: CallType | null }> = [];
    for (let p = 0; p < 4; p++) {
      const callIdx = r * 4 + p;
      row.push({
        pos: positions[p],
        call: callIdx < totalCalls ? auction.calls[callIdx] : null,
      });
    }
    rows.push(row);
  }

  // 当前行：已确定轮到谁
  const curRow = Math.floor(auction.calls.length / 4);
  const curCol = auction.calls.length % 4;

  return (
    <div className="bg-emerald-950/80 rounded-xl border border-emerald-700 p-3">
      <div className="text-center text-yellow-300 text-xs font-bold mb-2">叫牌板</div>
      <div className="grid" style={{ gridTemplateColumns: "40px repeat(4,1fr)" }}>
        {/* 列头 */}
        {names.map((n, i) => (
          <div key={i} className="text-center text-xs text-stone-400 font-bold">{n}</div>
        ))}

        {/* 叫牌记录行 */}
        {rows.map((row, ri) => (
          <div key={ri} className="contents">
            {row.map(({ call }, ci) => {
              const isCurrentCell = ri === curRow && ci === curCol;
              return (
                <div
                  key={ci}
                  className={`
                    h-8 flex items-center justify-center text-sm font-mono font-bold border border-emerald-800/50
                    ${call ? "bg-emerald-900/60 text-emerald-200" : "bg-black/30 text-stone-600"}
                    ${isCurrentCell && currentIdx === myIdx ? "bg-yellow-900/40 border-yellow-600" : ""}
                    ${isCurrentCell && currentIdx !== myIdx ? "bg-stone-800/40" : ""}
                  `}
                >
                  {call ? (
                    <span className={call.type === "pass" ? "text-stone-400" : call.type === "double" ? "text-red-400" : "text-yellow-300"}>
                      {callDisplay(call)}
                    </span>
                  ) : isCurrentCell ? (
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse inline-block" />
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 定约显示 */}
      {auction.contract && (
        <div className="mt-2 text-center text-yellow-400 text-sm font-bold">
          定约: {callDisplay(auction.contract)}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 叫牌按钮
// ============================================================
function BiddingBox({
  auction,
  myTurn,
  onCall,
}: {
  auction: AuctionState;
  myTurn: boolean;
  onCall: (c: CallType) => void;
}) {
  const levels = [1, 2, 3, 4, 5, 6, 7];
  const suits: Array<{ s: string; label: string; cls: string }> = [
    { s: "♣", label: "♣", cls: "text-stone-300 border-stone-500 bg-stone-800 hover:bg-stone-700" },
    { s: "♦", label: "♦", cls: "text-orange-400 border-orange-600 bg-orange-950 hover:bg-orange-900" },
    { s: "♥", label: "♥", cls: "text-red-500 border-red-600 bg-red-950 hover:bg-red-900" },
    { s: "♠", label: "♠", cls: "text-blue-300 border-blue-500 bg-blue-900 hover:bg-blue-800" },
    { s: "NT", label: "NT", cls: "text-yellow-300 border-yellow-600 bg-yellow-950 hover:bg-yellow-900" },
  ];

  const lastBid = auction.lastBid;
  const canDouble = auction.lastBid && auction.lastBid.type === "bid" && !auction.doubled && auction.calls.filter(c => c.type === "bid").length > 0;
  const canRedouble = auction.doubled;
  const minLevel = lastBid && lastBid.type === "bid" ? lastBid.level : 0;

  function isValidBid(level: number, suit: string): boolean {
    if (!lastBid || lastBid.type === "pass") return level >= 1;
    if (lastBid.type === "bid") {
      if (level > lastBid.level) return true;
      if (level === lastBid.level) {
        const suitIdx = suits.findIndex(s => s.s === suit);
        const lastSuitIdx = suits.findIndex(s => s.s === lastBid.suit);
        return suitIdx > lastSuitIdx;
      }
    }
    return false;
  }

  if (!myTurn) {
    return (
      <div className="bg-black/60 rounded-xl border border-stone-700 p-4 text-center text-stone-500 text-sm">
        等待其他玩家叫牌...
      </div>
    );
  }

  return (
    <div className="bg-black/70 rounded-xl border border-stone-600 p-4 flex flex-col gap-3">
      <div className="text-yellow-300 text-xs font-bold text-center mb-1">你的叫牌</div>

      {/* Pass / Double / Redouble */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => onCall({ type: "pass" })}
          className="px-4 py-2 rounded-lg bg-stone-700/80 border border-stone-500 text-stone-300 text-sm font-bold hover:bg-stone-600"
        >
          Pass
        </button>

        {canDouble && (
          <button
            onClick={() => onCall({ type: "double" })}
            className="px-4 py-2 rounded-lg bg-red-900/60 border border-red-600 text-red-300 text-sm font-bold hover:bg-red-800"
          >
            加倍 X
          </button>
        )}

        {canRedouble && (
          <button
            onClick={() => onCall({ type: "redouble" })}
            className="px-4 py-2 rounded-lg bg-orange-900/60 border border-orange-600 text-orange-300 text-sm font-bold hover:bg-orange-800"
          >
            再加倍 XX
          </button>
        )}
      </div>

      {/* 叫牌阶数 x 花色 */}
      <div className="flex gap-2 items-center justify-center">
        <div className="flex gap-1">
          {levels.filter(l => l >= minLevel + 1 || (minLevel === 0 && l === 1)).map(l => (
            <div key={l} className="flex flex-col gap-1">
              {suits.map(({ s, label, cls }) => (
                <button
                  key={`${l}${s}`}
                  onClick={() => onCall({ type: "bid", level: l, suit: s as any })}
                  disabled={!isValidBid(l, s)}
                  className={`
                    px-2 py-1 rounded text-xs font-bold border transition-colors
                    ${cls}
                    ${isValidBid(l, s) ? "opacity-100 cursor-pointer" : "opacity-20 cursor-not-allowed"}
                  `}
                >
                  {l}{label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 出牌界面
// ============================================================
function PlayArea({
  state,
  myIdx,
  onPlayCard,
}: {
  state: GameState;
  myIdx: number;
  onPlayCard: (card: Card) => void;
}) {
  const myPlayer = state.players[myIdx];
  const isMyTurn = state.currentPlayerIdx === myIdx;
  const leadCard = state.currentTrick.cards[state.leadIdx];
  const leadSuit = leadCard?.suit ?? null;

  // 排序手牌：按花色分组，再按大小排序
  const sortedHand = [...myPlayer.hand].sort((a, b) => {
    const si = suitToIndex(a.suit) - suitToIndex(b.suit);
    if (si !== 0) return si;
    return rankValue(b.rank) - rankValue(a.rank);
  });

  // 按花色分组
  const bySuit: Record<string, Card[]> = { "♣": [], "♦": [], "♥": [], "♠": [] };
  for (const c of sortedHand) {
    bySuit[c.suit].push(c);
  }

  // 必须跟牌的花色
  const mustFollowSuit = leadSuit;

  return (
    <div className="flex flex-col gap-3">
      {/* 当前墩 */}
      <div className="bg-emerald-950/70 rounded-xl border border-emerald-700 p-3">
        <div className="text-center text-yellow-300 text-xs font-bold mb-2">当前墩</div>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3].map(idx => {
            const card = state.currentTrick.cards[idx];
            return (
              <div key={idx} className="flex flex-col items-center gap-0.5">
                <div className="text-xs text-stone-500">{state.players[idx].name}</div>
                <BridgeCard card={card} small />
              </div>
            );
          })}
        </div>
        {state.currentTrick.winner && (
          <div className="text-center text-yellow-400 text-xs mt-1">
            赢墩: {state.players[state.currentTrick.winner === "N" ? 0 : state.currentTrick.winner === "E" ? 1 : state.currentTrick.winner === "S" ? 2 : 3]?.name}
          </div>
        )}
      </div>

      {/* 叫牌结果（定约信息） */}
      {state.contract && state.contract.type === "bid" && (
        <div className="text-center text-yellow-300 text-sm font-bold">
          {state.players[state.declarerIdx ?? 0]?.name}定约
          <span className="text-yellow-400 text-lg ml-1">{state.contract.level}{state.contract.suit}</span>
          <span className="ml-2 text-stone-400 text-xs">
            需{state.tricksToWin}墩 | 已赢{state.trickWins[myIdx % 2 === 0 ? 0 : 1]}墩
          </span>
        </div>
      )}

      {/* 手牌区 */}
      <div className="bg-black/50 rounded-xl border border-stone-700 p-3">
        <div className="text-center text-stone-400 text-xs mb-2">
          {isMyTurn ? "🟢 你的回合 — 点击一张牌出牌" : "等待出牌..."}
        </div>

        {/* 按花色分组展示 */}
        {(["♠", "♥", "♦", "♣"] as const).map(suit => {
          const suitCards = bySuit[suit];
          if (suitCards.length === 0) return null;
          const isRequired = mustFollowSuit === suit;
          return (
            <div key={suit} className="flex items-center gap-1 mb-1">
              <span className={`text-xs w-4 ${suit === "♥" || suit === "♦" ? "text-red-500" : "text-stone-400"}`}>
                {suit}
              </span>
              <div className="flex gap-0.5 flex-wrap">
                {suitCards.map(c => {
                  const playable = !mustFollowSuit || suit === mustFollowSuit;
                  return (
                    <button
                      key={c.display}
                      onClick={() => playable && isMyTurn && onPlayCard(c)}
                      disabled={!playable || !isMyTurn}
                      className={`
                        transition-transform
                        ${playable && isMyTurn ? "hover:scale-110 cursor-pointer opacity-100" : "opacity-30 cursor-not-allowed"}
                        ${isRequired ? "ring-1 ring-yellow-400" : ""}
                      `}
                    >
                      <BridgeCard card={c} small />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// 牌桌布局（4人，东西南北）
// ============================================================
function BridgeTable({
  state,
}: {
  state: GameState;
}) {
  const { players, currentPlayerIdx } = state;

  return (
    <div className="relative w-full max-w-2xl mx-auto" style={{ height: 300 }}>
      {/* 牌桌背景 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-[560px] h-[280px] rounded-[140px] bg-emerald-900 border-8 border-amber-700 shadow-2xl">
          <div className="absolute inset-3 rounded-[130px] border-2 border-amber-600/30 bg-gradient-to-br from-emerald-800 to-emerald-950" />
        </div>
      </div>

      {/* 4个方位 */}
      {/* N - 顶部 */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
        <PlayerPip player={players[0]} isCurrent={currentPlayerIdx === 0} />
      </div>
      {/* E - 右侧 */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
        <PlayerPip player={players[1]} isCurrent={currentPlayerIdx === 1} />
      </div>
      {/* S - 底部（人类）*/}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
        <PlayerPip player={players[2]} isCurrent={currentPlayerIdx === 2} />
      </div>
      {/* W - 左侧 */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
        <PlayerPip player={players[3]} isCurrent={currentPlayerIdx === 3} />
      </div>

      {/* 已完成的墩数 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-black/60 rounded-full w-16 h-16 flex flex-col items-center justify-center">
        <div className="text-xs text-stone-400">墩数</div>
        <div className="text-yellow-300 font-bold text-lg">
          {state.trickWins[0]}/{state.trickWins[1]}
        </div>
      </div>
    </div>
  );
}

function PlayerPip({
  player,
  isCurrent,
}: {
  player: Player;
  isCurrent: boolean;
}) {
  return (
    <div className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg ${isCurrent ? "bg-yellow-500/20 border border-yellow-500/60" : "bg-black/50 border border-white/10"}`}>
      <span className={`text-xs font-bold ${isCurrent ? "text-yellow-300" : "text-stone-300"}`}>
        {player.name}
        {player.isAI && " 🤖"}
      </span>
      <span className="text-xs text-stone-500">
        {player.hand.length}张
      </span>
      {isCurrent && <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}
    </div>
  );
}

// ============================================================
// 结算面板
// ============================================================
function ScorePanel({
  state,
  onNewGame,
}: {
  state: GameState;
  onNewGame: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-black/80 rounded-xl border border-yellow-600/40">
      <div className="text-2xl font-bold text-yellow-400">{state.message}</div>

      {/* 积分 */}
      <div className="flex gap-8">
        <div className="text-center">
          <div className="text-stone-400 text-xs mb-1">NS</div>
          <div className="text-2xl font-bold text-green-400">{state.score[0]}</div>
        </div>
        <div className="text-center">
          <div className="text-stone-400 text-xs mb-1">EW</div>
          <div className="text-2xl font-bold text-red-400">{state.score[1]}</div>
        </div>
      </div>

      {/* 本局各玩家赢墩 */}
      <div className="flex gap-4">
        {state.players.map((p, i) => (
          <div key={p.id} className="text-center">
            <div className="text-xs text-stone-400">{p.name}</div>
            <div className="text-sm font-bold text-yellow-300">{state.trickCounts[i]}墩</div>
          </div>
        ))}
      </div>

      <button
        onClick={onNewGame}
        className="px-6 py-3 rounded-lg bg-emerald-800/80 border border-emerald-500 text-emerald-300 font-bold hover:bg-emerald-700/80 transition-colors"
      >
        新的一局
      </button>
    </div>
  );
}

// ============================================================
// 顶部导航栏 v3.5
// ============================================================
function TopNavBar() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-black/80 border-b border-amber-700/40">
      <button
        onClick={() => navigate("/y002/home")}
        className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm font-bold transition-colors"
      >
        <ArrowLeft size={16} />
        <span>返回大厅</span>
      </button>
      <span className="text-stone-500 text-xs">|</span>
      <span className="text-lg font-bold text-amber-300">🎴 激动的牌桌 · 桥牌</span>
      <span className="ml-auto text-xs px-2 py-0.5 rounded bg-amber-900/60 text-amber-400 border border-amber-700/50 font-bold">
        v3.5
      </span>
      <span className="text-stone-400 text-xs">
        玩家: <span className="text-yellow-400 font-bold">南</span>
      </span>
    </div>
  );
}

// ============================================================
// 主页面
// ============================================================
export default function BridgePage() {
  const [gameKey, setGameKey] = useState(0);
  const [state, setState] = useState<GameState | null>(null);
  const [musicOn, setMusicOn] = useState(false);
  const [started, setStarted] = useState(false);
  const { start: startMusic, toggle: toggleMusic } = useBgMusic();

  // 人类玩家在players[2]（南位）
  const MY_IDX = 2;

  // 开始游戏
  const handleStart = useCallback(() => {
    startMusic();
    setMusicOn(true);
    const s = dealCards(createInitialState());
    setState(s);
    setStarted(true);
    setGameKey(k => k + 1);
  }, [startMusic]);

  // 人类叫牌
  const handleCall = useCallback((call: CallType) => {
    if (!state || state.phase !== "auction") return;
    if (state.auction.currentIdx !== MY_IDX) return;

    const newAuction = applyCall(state.auction, MY_IDX, call);
    const newState = { ...state, auction: newAuction };
    setState(newState);

    // 检测叫牌结束
    if (newAuction.contract || newAuction.passedOut) {
      if (newAuction.passedOut) {
        // 4人都pass，重新发牌
        setTimeout(() => {
          const s2 = dealCards(createInitialState());
          setState(s2);
          setGameKey(k => k + 1);
        }, 1500);
        return;
      }
      // 进入打牌
      setTimeout(() => {
        const s3 = startPlay(newState);
        setState(s3);
      }, 800);
      return;
    }

    // AI叫牌
    setTimeout(() => runAIAuction(newState), 150);
  }, [state]);

  // AI叫牌循环
  const runAIAuction = useCallback((st: GameState) => {
    const step = (auction: AuctionState): AuctionState | null => {
      if (auction.contract || auction.passedOut) return null;
      if (auction.currentIdx === MY_IDX) return null;

      const player = st.players[auction.currentIdx];
      if (!player.isAI) return null;

      const hand = analyzeHand(player.hand);
      // 模拟AI叫牌延迟
      return applyCall(auction, auction.currentIdx, aiBid(auction, player, hand));
    };

    let currentAuction = st.auction;
    let currentState = st;

    const tick = () => {
      const next = step(currentAuction);
      if (!next) {
        // AI叫牌结束（检测是否进入打牌）
        if (currentAuction.contract || currentAuction.passedOut) {
          if (currentAuction.passedOut) {
            const s2 = dealCards(createInitialState());
            setState(s2);
            setGameKey(k => k + 1);
            return;
          }
          const s3 = startPlay({ ...currentState, auction: currentAuction });
          setState(s3);
          return;
        }
        // 轮到人类
        setState({ ...currentState, auction: currentAuction });
        return;
      }

      currentAuction = next;
      currentState = { ...currentState, auction: currentAuction };
      setState({ ...currentState });

      if (next.currentIdx !== MY_IDX && !next.contract && !next.passedOut) {
        setTimeout(tick, 150);
      } else {
        // 进入打牌或轮到人类
        if (next.contract || next.passedOut) {
          if (next.passedOut) {
            const s2 = dealCards(createInitialState());
            setState(s2);
            setGameKey(k => k + 1);
            return;
          }
          // 修复：把最新 auction 直接注入到 currentState，避免闭包过时问题
          setTimeout(() => {
            const s3 = startPlay({ ...currentState, auction: currentAuction });
            setState(s3);
          }, 500);
          return;
        }
        setState({ ...currentState });
      }
    };

    setTimeout(tick, 150);
  }, []);

  // 人类出牌
  const handlePlayCard = useCallback((card: Card) => {
    if (!state || state.phase !== "play") return;
    if (state.currentPlayerIdx !== MY_IDX) return;

    const newState = playCard(state, MY_IDX, card);
    setState(newState);

    // AI出牌
    if (newState.phase === "play") {
      setTimeout(() => runAIPlay(newState), 120);
    }
  }, [state]);

  // AI出牌循环
  const runAIPlay = useCallback((st: GameState) => {
    let current = st;

    const tick = () => {
      if (current.phase !== "play") {
        setState(current);
        return;
      }

      if (current.currentPlayerIdx === MY_IDX) {
        setState(current);
        return;
      }

      const player = current.players[current.currentPlayerIdx];
      const card = aiPlay(player, current);
      if (!card) {
        setState(current);
        return;
      }

      const next = playCard(current, current.currentPlayerIdx, card);
      current = next;
      setState({ ...current });

      if (next.phase === "play" && next.currentPlayerIdx !== MY_IDX) {
        setTimeout(tick, 120);
      } else if (next.phase === "score") {
        setState(next);
      }
    };

    setTimeout(tick, 120);
  }, []);

  // 重新开始
  const handleNewGame = useCallback(() => {
    const s = dealCards(createInitialState());
    setState(s);
    setGameKey(k => k + 1);
  }, []);

  // 叫牌阶段AI自动叫牌（直到轮到人类）
  useEffect(() => {
    if (!state || state.phase !== "auction" || started === false) return;
    if (state.auction.currentIdx === MY_IDX) return;
    if (state.auction.contract || state.auction.passedOut) return;

    const timer = setTimeout(() => {
      // 必须在定时器内部读取最新 state，避免 stale closure
      setState(prev => {
        if (!prev || prev.phase !== "auction" || prev.auction.currentIdx === MY_IDX) return prev;
        const player = prev.players[prev.auction.currentIdx];
        if (!player.isAI) return prev;

        const hand = analyzeHand(player.hand);
        const newAuction = applyCall(prev.auction, prev.auction.currentIdx, aiBid(prev.auction, player, hand));
        const nextState = { ...prev, auction: newAuction };

        if (newAuction.contract || newAuction.passedOut) {
          if (newAuction.passedOut) {
            const s2 = dealCards(createInitialState());
            return s2;
          }
          return startPlay(nextState);
        }

        return nextState;
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [state, started]);

  // ============ 渲染 ============

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-300 mb-2">🎴 激动的牌桌</h1>
          <p className="text-stone-400 text-sm">Bridge · 桥牌</p>
        </div>
        <div className="text-stone-500 text-sm text-center max-w-md">
          <p className="mb-4">♠ 你坐在<strong className="text-yellow-300">南</strong>位，与随机一名AI组队。</p>
          <p className="mb-4">叫牌阶段选择叫牌、加倍或Pass；打牌阶段点击手中纸牌出牌。</p>
          <p>叫牌采用 <strong className="text-green-400">SAYC</strong>（标准美式黄卡）约定。</p>
        </div>
        <button
          onClick={handleStart}
          className="px-8 py-4 rounded-xl bg-gradient-to-b from-amber-800 to-amber-950 border-2 border-amber-600 text-amber-300 text-xl font-bold hover:border-amber-400 hover:scale-105 transition-all shadow-xl"
        >
          🎴 开始桥牌
        </button>
      </div>
    );
  }

  if (!state) return null;

  const myAuction = state.auction;

  return (
    <div key={gameKey} className="max-w-3xl mx-auto flex flex-col gap-3">
      <TopNavBar />

      {/* 标题栏 */}
      <div className="flex items-center justify-between px-2">
        <div className="text-lg font-bold text-amber-300">🎴 激动的牌桌 · 桥牌</div>
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span>NS: <b className="text-green-400">{state.score[0]}</b></span>
          <span>EW: <b className="text-red-400">{state.score[1]}</b></span>
          <span>阶段: <b className="text-yellow-400">{state.phase === "auction" ? "叫牌" : state.phase === "play" ? "打牌" : "结算"}</b></span>
        </div>
      </div>

      {/* 音乐开关 */}
      <button
        onClick={() => { const on = !musicOn; toggleMusic(on); setMusicOn(on); }}
        className={`text-xs px-3 py-1 rounded self-end ${musicOn ? "text-green-400 bg-green-900/30" : "text-stone-500 bg-stone-800/50"}`}
      >
        🎵 {musicOn ? "音乐ON" : "音乐OFF"}
      </button>

      {/* 叫牌阶段 */}
      {state.phase === "auction" && (
        <div className="flex flex-col gap-3">
          <AuctionBoard auction={myAuction} currentIdx={myAuction.currentIdx} myIdx={MY_IDX} />
          <BiddingBox
            auction={myAuction}
            myTurn={myAuction.currentIdx === MY_IDX}
            onCall={handleCall}
          />
        </div>
      )}

      {/* 打牌阶段 */}
      {state.phase === "play" && (
        <div className="flex flex-col gap-3">
          <BridgeTable state={state} />
          <PlayArea state={state} myIdx={MY_IDX} onPlayCard={handlePlayCard} />
        </div>
      )}

      {/* 结算 */}
      {state.phase === "score" && (
        <ScorePanel state={state} onNewGame={handleNewGame} />
      )}
    </div>
  );
}
