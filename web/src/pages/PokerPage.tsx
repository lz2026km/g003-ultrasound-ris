import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Spade, Heart, Diamond, Club } from "lucide-react";
import {
  createInitialState,
  startGame,
  applyAction,
  advancePhase,
  determineShowdown,
  checkEarlyWin,
  aiDecision,
  getNextPlayerIdx,
  type GameState,
  type Player,
  type Card,
  bestHandLabel,
  formatChips,
} from "@/lib/poker";

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
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return { start, toggle };
}

// ============================================================
// 扑克牌视觉组件
// ============================================================
function PokerCard({
  card,
  faceDown = false,
  small = false,
  winner = false,
}: {
  card: Card | null;
  faceDown?: boolean;
  small?: boolean;
  winner?: boolean;
}) {
  if (!card || faceDown) {
    return (
      <div
        className={`
          rounded flex items-center justify-center
          bg-gradient-to-br from-blue-900 to-blue-700
          border-2 border-blue-400/50 shadow-lg
          ${small ? "w-10 h-14" : "w-14 h-20"}
          ${winner ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-black" : ""}
        `}
      >
        <div className="text-blue-200/30 text-2xl font-bold">?</div>
      </div>
    );
  }

  const isRed = card.suit === "♥" || card.suit === "♦";

  return (
    <div
      className={`
        relative rounded flex flex-col items-center justify-between
        bg-gradient-to-br from-stone-100 to-stone-200
        border border-stone-300 shadow-lg
        ${small ? "w-10 h-14 p-0.5" : "w-14 h-20 p-1"}
        ${winner ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-black" : ""}
      `}
    >
      <div className={`self-start leading-none ${small ? "text-xs" : "text-sm"} font-bold ${isRed ? "text-red-600" : "text-black"}`}>
        {card.rank}
        <span className={small ? "text-xs" : "text-sm"}>{card.suit}</span>
      </div>
      <div className={`${small ? "text-xl" : "text-3xl"} ${isRed ? "text-red-600" : "text-black"}`}>
        {card.suit === "♠" && <Spade size={small ? 16 : 28} />}
        {card.suit === "♥" && <Heart size={small ? 16 : 28} />}
        {card.suit === "♦" && <Diamond size={small ? 16 : 28} />}
        {card.suit === "♣" && <Club size={small ? 16 : 28} />}
      </div>
      <div className={`self-end leading-none rotate-180 ${small ? "text-xs" : "text-sm"} font-bold ${isRed ? "text-red-600" : "text-black"}`}>
        {card.rank}
        <span className={small ? "text-xs" : "text-sm"}>{card.suit}</span>
      </div>
    </div>
  );
}

// ============================================================
// 玩家座位
// ============================================================
function PlayerSeat({
  player,
  isDealer,
  isCurrent,
  showCards,
  publicCards,
}: {
  player: Player;
  isDealer: boolean;
  isCurrent: boolean;
  showCards: boolean;
  publicCards: Card[];
}) {
  const isAllIn = player.status === "allin";
  const isFolded = player.status === "folded";

  return (
    <div className="flex flex-col items-center gap-1">
      {isDealer && (
        <div className="w-6 h-6 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center shadow">
          D
        </div>
      )}

      <div
        className={`
          flex flex-col items-center rounded px-2 py-1 min-w-[80px]
          ${isCurrent ? "bg-yellow-500/20 border border-yellow-500/60" : "bg-black/40 border border-white/10"}
          ${isFolded ? "opacity-50" : ""}
        `}
      >
        <span className={`text-xs font-bold truncate max-w-[80px] ${isCurrent ? "text-yellow-400" : "text-stone-300"}`}>
          {player.name}
          {player.isAI && <span className="ml-1 text-purple-400">🤖</span>}
        </span>
        <span className="text-sm font-mono font-bold text-green-400">
          💰 {formatChips(player.chips)}
        </span>
        {isAllIn && (
          <span className="text-xs text-red-400">ALL IN</span>
        )}
        {isFolded && (
          <span className="text-xs text-stone-500">弃牌</span>
        )}
      </div>

      <div className="flex gap-0.5">
        {showCards
          ? player.holeCards.map((c, i) => <PokerCard key={i} card={c} small />)
          : player.holeCards.map((c, i) => <PokerCard key={i} card={c} faceDown small />)}
      </div>

      {showCards && publicCards.length >= 3 && !player.isAI && (
        <span className="text-xs text-yellow-300/70">
          {bestHandLabel(player.holeCards, publicCards)}
        </span>
      )}

      {isCurrent && (
        <div className="animate-pulse w-2 h-2 rounded-full bg-yellow-400" />
      )}
    </div>
  );
}

// ============================================================
// 椭圆形牌桌
// ============================================================
function OvalTable({
  players,
  dealerIdx,
  currentIdx,
  publicCards,
  gamePhase,
}: {
  players: Player[];
  dealerIdx: number;
  currentIdx: number;
  publicCards: Card[];
  gamePhase: string;
}) {
  const n = players.length;
  const showAll = gamePhase === "showdown";

  // 座位排列（按人数）
  const positions = n === 2
    ? ["bottom-center", "top-center"]
    : n === 3
    ? ["bottom-center", "top-left", "top-right"]
    : n === 4
    ? ["bottom-center", "top-left", "top-right", "bottom-right"]
    : ["bottom-center", "bottom-right", "right", "top-right", "top-left", "bottom-left"];

  const posClasses: Record<string, string> = {
    "top-center":   "absolute top-4 left-1/2 -translate-x-1/2",
    "top-left":     "absolute top-4 left-12",
    "top-right":    "absolute top-4 right-12",
    "right":        "absolute right-4 top-1/2 -translate-y-1/2",
    "bottom-right": "absolute bottom-20 right-8",
    "bottom-left":  "absolute bottom-20 left-8",
    "bottom-center":"absolute bottom-2 left-1/2 -translate-x-1/2",
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto" style={{ height: 420 }}>
      {/* 牌桌 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-[680px] h-[360px] rounded-[180px] bg-emerald-900 border-8 border-amber-700 shadow-2xl overflow-hidden">
          <div className="absolute inset-4 rounded-[160px] border-2 border-amber-600/40" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-[172px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-300/80 font-mono">💰</div>
              <div className="text-xs text-amber-400/60 mt-1">底池</div>
            </div>
          </div>
        </div>
      </div>

      {/* 公共牌 */}
      {publicCards.length > 0 && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex gap-1 bg-black/30 rounded p-2 backdrop-blur-sm">
          {publicCards.map((c, i) => (
            <PokerCard key={i} card={c} small={publicCards.length > 3} />
          ))}
        </div>
      )}

      {/* 玩家座位 */}
      {players.map((player, idx) => {
        const pos = positions[idx] ?? "bottom-center";
        return (
          <div key={player.id} className={`absolute z-20 ${posClasses[pos]}`}>
            <PlayerSeat
              player={player}
              isDealer={idx === dealerIdx}
              isCurrent={idx === currentIdx}
              showCards={showAll || (!player.isAI)}
              publicCards={publicCards}
            />
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// 模式选择
// ============================================================
function ModeSelect({
  onSelect,
  onMusicStart,
}: {
  onSelect: (n: number) => void;
  onMusicStart: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-amber-300 mb-2">🃏 激动的牌桌</h1>
        <p className="text-stone-400 text-sm">Texas Hold'em Poker</p>
      </div>

      <div className="flex gap-6">
        <button
          onClick={() => { onMusicStart(); onSelect(2); }}
          className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-b from-emerald-800 to-emerald-950 border-2 border-emerald-600 hover:border-emerald-400 transition-all hover:scale-105 shadow-xl"
        >
          <div className="text-5xl">⚡</div>
          <div className="text-lg font-bold text-emerald-300">快速对战</div>
          <div className="text-xs text-emerald-500">你 vs 2个AI对手</div>
        </button>

        <button
          onClick={() => { onMusicStart(); onSelect(5); }}
          className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-b from-amber-800 to-amber-950 border-2 border-amber-600 hover:border-amber-400 transition-all hover:scale-105 shadow-xl"
        >
          <div className="text-5xl">🪑</div>
          <div className="text-lg font-bold text-amber-300">满桌体验</div>
          <div className="text-xs text-amber-500">你 vs 5个AI对手</div>
        </button>
      </div>

      <p className="text-stone-600 text-xs">💰 每人初始筹码 1000 | 小盲10 大盲20</p>
    </div>
  );
}

// ============================================================
// 操作栏
// ============================================================
function ActionBar({
  state,
  onFold,
  onCheck,
  onCall,
  onRaise,
  onAllIn,
  musicOn,
  onToggleMusic,
}: {
  state: GameState;
  onFold: () => void;
  onCheck: () => void;
  onCall: () => void;
  onRaise: (amt: number) => void;
  onAllIn: () => void;
  musicOn: boolean;
  onToggleMusic: (on: boolean) => void;
}) {
  const human = state.players.find((p) => !p.isAI);
  if (!human) return null;

  const toCall = state.currentBet - human.currentBet;
  const canCheck = !state.hasRaised || toCall === 0;
  const raiseAmounts = [state.minRaise * 2, state.minRaise * 3, state.minRaise * 5].filter(
    (a) => a <= human.chips - toCall
  );

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-black/60 rounded-xl border border-white/10">
      {/* 音乐开关 */}
      <button
        onClick={() => onToggleMusic(!musicOn)}
        className={`text-xs px-2 py-1 rounded ${musicOn ? "text-green-400 bg-green-900/30" : "text-stone-500 bg-stone-800/50"}`}
      >
        🎵 {musicOn ? "音乐ON" : "音乐OFF"}
      </button>

      {/* 状态信息 */}
      <div className="text-center">
        <div className="text-yellow-300/80 text-sm font-mono">{state.message}</div>
        <div className="text-stone-500 text-xs mt-1">
          你的筹码: <span className="text-green-400 font-bold">{human.chips}</span>
          {toCall > 0 && (
            <span className="ml-3">需跟注: <span className="text-yellow-400 font-bold">{toCall}</span></span>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={onFold}
          className="px-4 py-2 rounded-lg bg-red-900/60 border border-red-700 text-red-300 text-sm font-bold hover:bg-red-800/80 transition-colors"
        >
          弃牌
        </button>

        {canCheck && (
          <button
            onClick={onCheck}
            className="px-4 py-2 rounded-lg bg-stone-700/60 border border-stone-600 text-stone-300 text-sm font-bold hover:bg-stone-600/80 transition-colors"
          >
            过牌
          </button>
        )}

        {toCall > 0 && (
          <button
            onClick={onCall}
            className="px-4 py-2 rounded-lg bg-blue-900/60 border border-blue-600 text-blue-300 text-sm font-bold hover:bg-blue-800/80 transition-colors"
          >
            跟注 {toCall}
          </button>
        )}

        {raiseAmounts.map((amt) => (
          <button
            key={amt}
            onClick={() => onRaise(amt)}
            className="px-4 py-2 rounded-lg bg-emerald-900/60 border border-emerald-600 text-emerald-300 text-sm font-bold hover:bg-emerald-800/80 transition-colors"
          >
            加注 {amt}
          </button>
        ))}

        {human.chips > 0 && (
          <button
            onClick={onAllIn}
            className="px-4 py-2 rounded-lg bg-yellow-900/60 border border-yellow-600 text-yellow-300 text-sm font-bold hover:bg-yellow-800/80 transition-colors animate-pulse"
          >
            ALL IN 💥
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 摊牌结算
// ============================================================
function ShowdownPanel({
  state,
  onNextHand,
  onNewGame,
}: {
  state: GameState;
  onNextHand: () => void;
  onNewGame: () => void;
}) {
  const winnerIds = state.winnerIds;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-black/80 rounded-xl border border-yellow-600/40">
      <div className="text-2xl font-bold text-yellow-400">{state.message}</div>

      <div className="flex gap-4 flex-wrap justify-center">
        {state.players.map((p) => {
          const isWinner = winnerIds.includes(p.id);
          return (
            <div
              key={p.id}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg ${
                isWinner ? "bg-yellow-900/30 border border-yellow-500/50" : "bg-black/40 border border-white/10"
              }`}
            >
              <div className="text-sm font-bold text-stone-300">
                {p.name} {isWinner && "🏆"}
              </div>
              <div className="flex gap-1">
                {(p.status === "folded" ? [null, null] : p.holeCards).map((c, i) => (
                  <PokerCard key={i} card={c} small winner={isWinner} />
                ))}
              </div>
              <div className="text-xs text-yellow-300">
                {bestHandLabel(p.holeCards, state.publicCards)}
              </div>
              <div className="text-sm font-mono text-green-400">
                +{isWinner ? Math.floor(state.pot / winnerIds.length) : 0}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onNextHand}
          className="px-6 py-3 rounded-lg bg-emerald-800/80 border border-emerald-500 text-emerald-300 font-bold hover:bg-emerald-700/80 transition-colors"
        >
          下一局
        </button>
        <button
          onClick={onNewGame}
          className="px-6 py-3 rounded-lg bg-stone-800/80 border border-stone-600 text-stone-300 font-bold hover:bg-stone-700/80 transition-colors"
        >
          重新开始
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 主页面
// ============================================================
export default function PokerPage() {
  const [numPlayers, setNumPlayers] = useState<number | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const { start: startMusic, toggle: toggleMusic } = useBgMusic();
  const navigate = useNavigate();
  const playerName = sessionStorage.getItem("y002_player") || "游客";

  const handleMusicStart = useCallback(() => {
    startMusic();
    setMusicOn(true);
  }, [startMusic]);

  const handleToggleMusic = useCallback((on: boolean) => {
    toggleMusic(on);
    setMusicOn(on);
  }, [toggleMusic]);

  // 运行下注轮（先定义，避免闭包问题）
  const runBettingRound = useCallback((st: GameState) => {
    console.log('[POKER] runBettingRound called');
    const step = (s: GameState): GameState => {
      if (s.phase === "idle" || s.phase === "showdown") return s;
      const nextIdx = getNextPlayerIdx(s);
      if (nextIdx < 0) {
        let ns = { ...s, currentIdx: -1, roundPot: 0 };
        ns = advancePhase(ns);
        if (ns.phase === "showdown") ns = determineShowdown(ns);
        return ns;
      }
      const player = s.players[nextIdx];
      if (!player.isAI) {
        // 人类玩家操作，递增本轮已行动计数
        return { ...s, currentIdx: nextIdx, playersActedThisRound: (s.playersActedThisRound ?? 0) + 1 };
      }
      const action = aiDecision(player, s);
      const ns = applyAction(s, player.id, action);
      let msg = s.message;
      if (action.type === "fold") msg = `🤖 ${player.name} 弃牌`;
      else if (action.type === "check") msg = `🤖 ${player.name} 过牌`;
      else if (action.type === "call") msg = `🤖 ${player.name} 跟注 ${s.currentBet - player.currentBet}`;
      else if (action.type === "raise") msg = `🤖 ${player.name} 加注 ${action.amount}`;
      else if (action.type === "allin") msg = `🤖 ${player.name} ALL IN！`;
      return { ...ns, message: msg };
    };
    let current = st;
    const run = () => {
      const next = step(current);
      console.log('[POKER] step result: nextIdx=', next.currentIdx, 'phase=', next.phase, 'AI next?', next.players[next.currentIdx]?.isAI, 'actedThisRound=', next.playersActedThisRound);
      current = next;

      // 统计本轮还有几个活跃玩家需要行动
      const activePlayers = current.players.filter((p) => p.status === "active" || p.status === "allin");
      const roundComplete = (current.playersActedThisRound ?? 0) >= activePlayers.length;

      if (roundComplete) {
        // 所有人都已行动完：进入下一阶段
        let ns = { ...current, currentIdx: -1, roundPot: 0 };
        ns = advancePhase(ns);
        if (ns.phase === "showdown") ns = determineShowdown(ns);
        const early = checkEarlyWin(ns);
        setState(early ?? ns);
        if (ns.phase !== "showdown") {
          setTimeout(run, 120);
        }
        return;
      }

      // 轮次未完成：检查当前是否轮到人类
      if (current.currentIdx < 0 || !current.players[current.currentIdx]?.isAI) {
        const early = checkEarlyWin(current);
        setState(early ?? current);
        return;
      }

      // AI 继续行动
      setState(next);
      setTimeout(run, 120);
    };
    setTimeout(run, 120);
  }, []);

  // 开始新游戏
  const startNewGame = useCallback((n: number) => {
    console.log('[POKER] startNewGame called with n=', n);
    setNumPlayers(n);
    const s = startGame(createInitialState(n));
    console.log('[POKER] initialState:', JSON.stringify(s.players.map(p => ({ id: p.id, isAI: p.isAI }))));
    console.log('[POKER] firstIdx=', s.currentIdx, 'phase=', s.phase);
    setState(s);
    setGameKey((k) => k + 1);
    // 触发AI下注轮（直接调用，闭包捕获的是 runBettingRound 本身而非 ref）
    setTimeout(() => { console.log('[POKER] timer calling runBettingRound'); runBettingRound(s); }, 200);
  }, [runBettingRound]);

  // 玩家动作
  const doAction = useCallback((action: { type: "fold" } | { type: "check" } | { type: "call" } | { type: "raise"; amount: number } | { type: "allin" }) => {
    console.log('[POKER] doAction called, type=', action.type);
    if (!state) return;
    const human = state.players.find((p) => !p.isAI);
    if (!human) return;
    const s1 = applyAction(state, human.id, action);
    console.log('[POKER] doAction result: new currentIdx=', s1.currentIdx, 'playersActedThisRound=', s1.playersActedThisRound);
    setState(s1);
    setTimeout(() => runBettingRound(s1), 120);
  }, [state, runBettingRound]);

  // 动作快捷函数
  const handleFold   = useCallback(() => doAction({ type: "fold" }), [doAction]);
  const handleCheck  = useCallback(() => doAction({ type: "check" }), [doAction]);
  const handleCall   = useCallback(() => doAction({ type: "call" }), [doAction]);
  const handleRaise  = useCallback((amt: number) => doAction({ type: "raise", amount: amt }), [doAction]);
  const handleAllIn  = useCallback(() => doAction({ type: "allin" }), [doAction]);

  // 下一局
  const handleNextHand = useCallback(() => {
    if (!state) return;
    const nextDealer = (state.dealerIdx + 1) % state.players.length;
    const nextState: GameState = {
      ...createInitialState(state.players.length),
      dealerIdx: nextDealer,
      players: state.players.map((p) => ({ ...p, chips: Math.max(p.chips, 0) })),
    };
    const s = startGame(nextState);
    setState(s);
    setTimeout(() => runBettingRound(s), 120);
  }, [state, runBettingRound]);

  // 重新开始
  const handleNewGame = useCallback(() => {
    setState(null);
    setNumPlayers(null);
    setMusicOn(false);
  }, []);

  // ============ 渲染 ============

  if (!numPlayers) {
    return (
      <div className="max-w-3xl mx-auto">
        <ModeSelect onSelect={startNewGame} onMusicStart={handleMusicStart} />
      </div>
    );
  }

  if (!state) return null;

  const human = state.players.find((p) => !p.isAI);
  const isMyTurn = human && state.currentIdx === state.players.findIndex((p) => p.id === human.id);
  const canAct = isMyTurn && state.phase !== "idle" && state.phase !== "showdown";

  return (
    <div key={gameKey} className="min-h-screen max-w-4xl mx-auto flex flex-col gap-4">
      {/* === v3.5 顶部导航栏 === */}
      <nav className="flex items-center justify-between px-4 py-3 bg-emerald-950/80 border-b border-emerald-700/40 shadow-md">
        <button
          onClick={() => navigate("/y002/home")}
          className="flex items-center gap-1 text-sm text-emerald-300 hover:text-emerald-100 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>返回大厅</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-amber-300">🃏 德州扑克</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500 text-black">v3.5</span>
        </div>
        <div className="text-sm text-stone-300">
          👤 <span className="text-emerald-300 font-medium">{playerName}</span>
        </div>
      </nav>

      {/* 标题栏 */}
      <div className="flex items-center justify-between px-2">
        <div className="text-lg font-bold text-amber-300">🃏 激动的牌桌</div>
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span>💰 底池: <b className="text-green-400">{state.pot}</b></span>
          <span>阶段: <b className="text-yellow-400">{state.phase}</b></span>
          <span>小盲<b className="text-white">{state.smallBlind}</b> 大盲<b className="text-white">{state.bigBlind}</b></span>
        </div>
      </div>

      {/* 牌桌 */}
      <OvalTable
        players={state.players}
        dealerIdx={state.dealerIdx}
        currentIdx={state.currentIdx}
        publicCards={state.publicCards}
        gamePhase={state.phase}
      />

      {/* 摊牌结果 */}
      {state.phase === "showdown" ? (
        <ShowdownPanel
          state={state}
          onNextHand={handleNextHand}
          onNewGame={handleNewGame}
        />
      ) : (
        <div>
          {canAct ? (
            <ActionBar
              state={state}
              onFold={handleFold}
              onCheck={handleCheck}
              onCall={handleCall}
              onRaise={handleRaise}
              onAllIn={handleAllIn}
              musicOn={musicOn}
              onToggleMusic={handleToggleMusic}
            />
          ) : (
            <div className="flex items-center justify-center py-4 text-stone-500 text-sm">
              {state.phase === "idle"
                ? "等待开始..."
                : "🤖 AI思考中..."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
