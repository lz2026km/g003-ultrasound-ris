import { useState, useEffect, useRef, useCallback } from 'react';
import { ALL_GENERALS, getGeneralById, General, NATION_COLORS, NATION_NAMES } from '../data/generals';
import { CardDef, PlayerState, GameState, GamePhase, buildDeck, shuffleDeck, getCardById } from '../data/cards';
import {
  initGame, useCard, drawCards, discardCard, equipCard,
  damagePlayer, healPlayer, killPlayer,
  canAttack, aiDecide, checkVictory, doJudgePhase,
  doDrawPhase, doPlayPhase, doDiscardPhase, aiDiscardExcess, endTurn,
  startTurn, genId, Role, ROLES,
} from '../lib/sanguosha';

const VERSION = 'v0.2';

// ============================================================
// 场次配置
// ============================================================

type GameMode = 5 | 8;

interface ModeConfig {
  players: number;
  aiCount: number;
  roles: Role['role'][];
  title: string;
  desc: string;
}

const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
  5: {
    players: 5,
    aiCount: 4,
    roles: ['lord', 'rebel', 'rebel', 'loyalist', 'traitor'],
    title: '五 人 场',
    desc: '主公 + 忠臣 + 反贼×2 + 内奸',
  },
  8: {
    players: 8,
    aiCount: 7,
    roles: ['lord', 'loyalist', 'loyalist', 'rebel', 'rebel', 'rebel', 'rebel', 'traitor'],
    title: '八 人 场',
    desc: '主公 + 忠臣×2 + 反贼×4 + 内奸',
  },
};

// ============================================================
// 辅助函数
// ============================================================

function getCardDisplayName(cardId: string, deckData: CardDef[]): string {
  const card = deckData.find(c => c.id === cardId);
  return card ? card.name : cardId;
}

function SuitSymbol({ suit }: { suit: string }) {
  const symbols: Record<string, string> = {
    spade: '♠', heart: '♥', club: '♣', diamond: '♦',
  };
  const colors: Record<string, string> = {
    spade: '#222', heart: '#cc0000', club: '#222', diamond: '#cc0000',
  };
  return <span style={{ color: colors[suit] || '#222' }}>{symbols[suit] || suit}</span>;
}

function PointDisplay({ point }: { point: number }) {
  const pts = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  return <span>{pts[point - 1] || point}</span>;
}

// ============================================================
// 技能描述Tooltip
// ============================================================

function SkillTooltip({ skill, children }: { skill: { name: string; desc: string }; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="skill-tooltip-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
      <span onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
        {children}
      </span>
      {visible && (
        <div className="skill-tooltip">
          <div className="skill-tooltip-name">{skill.name}</div>
          <div className="skill-tooltip-desc">{skill.desc}</div>
        </div>
      )}
    </div>
  );
}

function CardMini({ cardId, deckData }: { cardId: string; deckData: CardDef[] }) {
  const card = deckData.find(c => c.id === cardId);
  if (!card) return <div className="card-mini">?</div>;
  const isRed = card.suit === 'heart' || card.suit === 'diamond';
  return (
    <div className="card-mini" style={{ borderColor: isRed ? '#cc0000' : '#222', color: isRed ? '#cc0000' : '#222' }}>
      <div className="card-mini-name">{card.name}</div>
      <div className="card-mini-suit">
        <SuitSymbol suit={card.suit} /><PointDisplay point={card.point} />
      </div>
    </div>
  );
}

function PlayerAvatar({ player, isCurrent, isPlayer, game, general }: {
  player: PlayerState;
  isCurrent: boolean;
  isPlayer: boolean;
  game: GameState;
  general?: General;
}) {
  const borderColor = isCurrent ? '#ffff00' : player.alive ? '#555' : '#222';
  const nation = general?.nation || 'qun';
  const nationColor = NATION_COLORS[nation] || '#888';
  const nationName = NATION_NAMES[nation] || nation;
  const roleInfo = ROLES.find(r => r.role === player.role);
  const hpPercent = player.maxHp > 0 ? (player.hp / player.maxHp) * 100 : 0;
  const hpColor = hpPercent > 60 ? '#44cc44' : hpPercent > 30 ? '#ffcc00' : '#ff4444';

  return (
    <div className={`player-avatar ${isCurrent ? 'current-turn' : ''} ${!player.alive ? 'dead' : ''}`}
      style={{ borderColor, background: isPlayer ? '#1a2a1a' : '#1a1a2a' }}>
      <div className="avatar-name" style={{ color: isPlayer ? '#88ff88' : '#aaa' }}>
        {isPlayer ? '【你】' : ''}{player.name}
      </div>
      <div className="avatar-nation" style={{ color: nationColor }}>{nationName}</div>
      <div className="avatar-hp-bar">
        <div className="hp-bar-bg">
          <div className="hp-bar-fill" style={{ width: `${hpPercent}%`, background: hpColor }} />
        </div>
        <span className="hp-text">{player.hp}/{player.maxHp}</span>
      </div>
      {player.role && (
        <div className="avatar-role" style={{ color: roleInfo?.color || '#888' }}>
          {roleInfo?.name || player.role}
        </div>
      )}
      <div className="avatar-hand-count" style={{ color: '#aaa' }}>
        手牌: {player.hand.length}
      </div>
      {general?.skills && general.skills.length > 0 && (
        <div className="avatar-skills">
          {general.skills.map(skill => (
            <SkillTooltip key={skill.id} skill={skill}>
              <span className="skill-tag" style={{ cursor: 'help', borderBottom: '1px dotted #888' }}>
                【{skill.name}】
              </span>
            </SkillTooltip>
          ))}
        </div>
      )}
      {player.equip.weapon && (
        <div className="avatar-equip" style={{ color: '#ffaa00' }}>⚔️</div>
      )}
      {player.equip.armor && (
        <div className="avatar-equip" style={{ color: '#00aaff' }}>🛡</div>
      )}
    </div>
  );
}

// ============================================================
// 游戏阶段
// ============================================================

type GameScreen = 'select' | 'playing' | 'game_over';

export default function SanguoshaPage() {
  const [screen, setScreen] = useState<GameScreen>('select');
  const [selectedMode, setSelectedMode] = useState<GameMode>(5);
  const [selectedGeneral, setSelectedGeneral] = useState<string>('guanyu');
  const [selectedRole, setSelectedRole] = useState<Role['role']>('lord');
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [targetPlayerId, setTargetPlayerId] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<'none' | 'sha' | 'card' | 'discard'>('none');
  const [aiThinking, setAiThinking] = useState(false);
  const [gameWinners, setGameWinners] = useState<string[]>([]);
  const [deckData, setDeckData] = useState<CardDef[]>([]);
  const [hoveredCard, setHoveredCard] = useState<{ card: CardDef; x: number; y: number } | null>(null);

  const gameRef = useRef<GameState | null>(null);
  const deckDataRef = useRef<CardDef[]>([]);

  // 初始化牌堆数据
  useEffect(() => {
    const deck = buildDeck();
    setDeckData(deck);
    deckDataRef.current = deck;
  }, []);

  // ========== 选将/选身份 ==========

  // useCallback 包裹，确保引用稳定
  const handleStartGame = useCallback(() => {
    try {
      const allCards = buildDeck();
      deckDataRef.current = allCards;

      const modeConfig = MODE_CONFIGS[selectedMode];
      // 分配AI武将
      const availableGenerals = ALL_GENERALS.filter(g => g.id !== selectedGeneral);
      const shuffledGens = [...availableGenerals].sort(() => Math.random() - 0.5).slice(0, modeConfig.aiCount);
      const aiGenIds = shuffledGens.map(g => g.id);

      // 身份分配：根据模式
      const roles = [...modeConfig.roles].sort(() => Math.random() - 0.5);
      const aiRoles = roles.slice(1); // 玩家固定主公

      const newGame = initGame(selectedGeneral, selectedRole, aiGenIds, aiRoles);
      // 注入deckData
      newGame.deckData = allCards;

      setGame(newGame);
      gameRef.current = newGame;
      setScreen('playing');
      setAiThinking(false);
      setSelectedCardIds([]);
      setTargetPlayerId(null);
      setActionMode('none');

      // 回合开始
      setTimeout(() => processTurn(newGame), 300);
    } catch (err) {
      console.error('handleStartGame error:', err);
      alert('游戏初始化失败: ' + (err instanceof Error ? err.message : String(err)));
    }
  }, [selectedMode, selectedGeneral, selectedRole]);

  // ========== 回合处理 ==========

  function processTurn(currentGame: GameState) {
    if (!currentGame) return;
    const currentPlayer = currentGame.players[currentGame.currentPlayerIdx];
    if (!currentPlayer?.alive) {
      // 跳过死亡玩家
      const next = getNextAliveIdx(currentGame);
      const g2 = { ...currentGame, currentPlayerIdx: next };
      gameRef.current = g2;
      setGame(g2);
      setTimeout(() => processTurn(g2), 200);
      return;
    }

    if (currentPlayer.id === 'player') {
      setAiThinking(false);
      setGame({ ...currentGame });
      return; // 玩家回合，等待操作
    }

    // AI回合
    setAiThinking(true);
    setGame({ ...currentGame });
    setTimeout(() => aiTurn(currentGame), 800);
  }

  function aiTurn(currentGame: GameState) {
    let g = currentGame;
    const aiId = g.players[g.currentPlayerIdx].id;
    if (!aiId.startsWith('ai_')) {
      gameRef.current = g;
      setGame(g);
      return;
    }

    // 回合流程
    // 1. 判定阶段
    g = { ...g, subPhase: 'judge', currentPlayerId: aiId };
    gameRef.current = g;
    setGame({ ...g });

    // 2. 摸牌阶段
    setTimeout(() => {
      g = doDrawPhase(g);
      g.deckData = deckDataRef.current;
      gameRef.current = g;
      setGame({ ...g });

      // 3. 出牌阶段（AI决策）
      setTimeout(() => aiPlayCards(g, aiId), 600);
    }, 400);
  }

  function aiPlayCards(g: GameState, aiId: string) {
    const result = aiDecide(g, aiId);
    if (!result.action || result.action === 'end_turn') {
      // 弃牌并结束回合
      let g2 = aiDiscardExcess(g, aiId);
      gameRef.current = g2;
      setGame({ ...g2 });
      setTimeout(() => finishAiTurn(g2), 400);
      return;
    }
    if (result.action === 'use_card' && result.cardId) {
      g = useCard(g, aiId, result.cardId, result.targetIds || []);
      g.deckData = deckDataRef.current;
      // 检查胜利
      const winners = checkVictory(g);
      if (winners) {
        setGameWinners(winners);
        setGame(g);
        setScreen('game_over');
        return;
      }
      gameRef.current = g;
      setGame({ ...g });
      // 继续尝试出牌
      setTimeout(() => aiPlayCards(g, aiId), 400);
      return;
    }
    setTimeout(() => finishAiTurn(g), 200);
  }

  function finishAiTurn(g: GameState) {
    let g2 = endTurn(g);
    g2.deckData = deckDataRef.current;
    gameRef.current = g2;
    setGame({ ...g2 });
    setAiThinking(false);
    setTimeout(() => processTurn(g2), 300);
  }

  // ========== 玩家操作 ==========

  function handleCardSelect(cardId: string) {
    if (actionMode === 'discard') {
      // 弃牌模式：点哪张弃哪张
      return;
    }
    const card = deckDataRef.current.find(c => c.id === cardId);
    if (!card) return;

    // 自动判断操作模式
    if (card.type === 'basic' && (card.subType === 'slash' || card.subType === 'fire_slash' || card.subType === 'thunder_slash')) {
      // 杀
      if (selectedCardIds.includes(cardId)) {
        setSelectedCardIds(selectedCardIds.filter(id => id !== cardId));
        setActionMode('none');
      } else {
        setSelectedCardIds([cardId]);
        setActionMode('sha');
      }
    } else if (card.type === 'equip') {
      // 装备牌：直接装备
      if (game) {
        let g2 = useCard(game, 'player', cardId, []);
        g2.deckData = deckDataRef.current;
        gameRef.current = g2;
        setGame({ ...g2 });
      }
    } else if (card.subType === 'peach') {
      // 桃：对自己使用
      if (game) {
        let g2 = useCard(game, 'player', cardId, ['player']);
        g2.deckData = deckDataRef.current;
        gameRef.current = g2;
        setGame({ ...g2 });
      }
    } else {
      // 其他锦囊：选中
      if (selectedCardIds.includes(cardId)) {
        setSelectedCardIds(selectedCardIds.filter(id => id !== cardId));
        setActionMode('none');
      } else {
        setSelectedCardIds([cardId]);
        setActionMode('card');
      }
    }
  }

  function handlePlayerSelect(targetId: string) {
    if (!game) return;
    const target = game.players.find(p => p.id === targetId);
    if (!target || !target.alive) return;

    if (actionMode === 'sha' && selectedCardIds.length > 0) {
      // 出杀
      const player = game.players.find(p => p.id === 'player');
      if (!player) return;
      if (!canAttack(player, target, game)) {
        alert('目标不在攻击范围内！');
        return;
      }
      const cardId = selectedCardIds[0];
      let g2 = useCard(game, 'player', cardId, [targetId]);
      g2.deckData = deckDataRef.current;
      const winners = checkVictory(g2);
      if (winners) {
        setGameWinners(winners);
        setGame(g2);
        setScreen('game_over');
        return;
      }
      gameRef.current = g2;
      setGame({ ...g2 });
      setSelectedCardIds([]);
      setActionMode('none');
      return;
    }
    setTargetPlayerId(targetId);
  }

  function handleUseSelectedCard() {
    if (!game || selectedCardIds.length === 0) return;
    const cardId = selectedCardIds[0];
    const targets = targetPlayerId ? [targetPlayerId] : [];
    let g2 = useCard(game, 'player', cardId, targets);
    g2.deckData = deckDataRef.current;
    gameRef.current = g2;
    setGame({ ...g2 });
    setSelectedCardIds([]);
    setTargetPlayerId(null);
    setActionMode('none');
  }

  function handleEndTurn() {
    if (!game) return;
    setSelectedCardIds([]);
    setTargetPlayerId(null);
    setActionMode('none');
    let g2 = endTurn(game);
    g2.deckData = deckDataRef.current;
    gameRef.current = g2;
    setGame({ ...g2 });
    setAiThinking(true);
    setTimeout(() => processTurn(g2), 300);
  }

  function handleStartDiscard() {
    setActionMode('discard');
    const player = game?.players.find(p => p.id === 'player');
    if (!player) return;
    // 选中了需要弃的牌
  }

  function handleDiscardSelected() {
    if (!game || actionMode !== 'discard' || selectedCardIds.length === 0) return;
    let g2 = game;
    for (const cardId of selectedCardIds) {
      g2 = discardCard(g2, 'player', cardId);
    }
    g2.deckData = deckDataRef.current;
    gameRef.current = g2;
    setGame({ ...g2 });
    setSelectedCardIds([]);
    setActionMode('none');
    // 结束弃牌阶段
    setTimeout(() => finishPlayerTurn(g2), 200);
  }

  function finishPlayerTurn(g: GameState) {
    let g2 = endTurn(g);
    g2.deckData = deckDataRef.current;
    gameRef.current = g2;
    setGame({ ...g2 });
    setAiThinking(true);
    setTimeout(() => processTurn(g2), 300);
  }

  function getNextAliveIdx(g: GameState): number {
    let idx = (g.currentPlayerIdx + 1) % g.players.length;
    let attempts = 0;
    while (!g.players[idx].alive && attempts < g.players.length) {
      idx = (idx + 1) % g.players.length;
      attempts++;
    }
    return idx;
  }

  function handleRestart() {
    setScreen('select');
    setGame(null);
    setSelectedCardIds([]);
    setTargetPlayerId(null);
    setActionMode('none');
    setAiThinking(false);
    setGameWinners([]);
    setSelectedMode(5);
  }

  // ============================================================
  // 渲染：选将/选身份界面
  // ============================================================

  if (screen === 'select') {
    return (
      <div className="sanguosha-select">
        <style>{SELECT_CSS}</style>
        <div className="select-header">
          <h1>🀄 三国杀</h1>
          <div className="version">{VERSION}</div>
        </div>

        {/* 场次选择 */}
        <div className="section">
          <h2>选择场次</h2>
          <div className="mode-grid">
            {([5, 8] as GameMode[]).map(mode => {
              const cfg = MODE_CONFIGS[mode];
              return (
                <div
                  key={mode}
                  className={`mode-card ${selectedMode === mode ? 'selected' : ''}`}
                  onClick={() => setSelectedMode(mode)}
                  style={{ borderColor: selectedMode === mode ? '#c9a84c' : '#333' }}
                >
                  <div className="mode-title">{cfg.title}</div>
                  <div className="mode-desc">{cfg.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="section">
          <h2>选择武将</h2>
          <div className="general-grid">
            {ALL_GENERALS.map(gen => (
              <div
                key={gen.id}
                className={`general-card ${selectedGeneral === gen.id ? 'selected' : ''}`}
                onClick={() => setSelectedGeneral(gen.id)}
                style={{ borderColor: selectedGeneral === gen.id ? NATION_COLORS[gen.nation] : '#333' }}
              >
                <div className="gen-name" style={{ color: NATION_COLORS[gen.nation] }}>{gen.name}</div>
                <div className="gen-nation">{NATION_NAMES[gen.nation]}</div>
                <div className="gen-hp">❤ {gen.hp}</div>
                <div className="gen-skills">
                  {gen.skills.map(s => (
                    <SkillTooltip key={s.id} skill={s}>
                      <span className="gen-skill-tag">【{s.name}】</span>
                    </SkillTooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h2>选择身份</h2>
          <div className="role-grid">
            {ROLES.map(r => (
              <div
                key={r.role}
                className={`role-card ${selectedRole === r.role ? 'selected' : ''}`}
                onClick={() => setSelectedRole(r.role)}
                style={{ borderColor: selectedRole === r.role ? r.color : '#333', color: r.color }}
              >
                {r.name}
              </div>
            ))}
          </div>
        </div>

        <button
          className="start-btn"
          onClick={() => {
            try {
              handleStartGame();
            } catch(e) {
              console.error('Button onClick error:', e);
              alert('游戏初始化失败: ' + (e instanceof Error ? e.message : String(e)));
            }
          }}
        >
          开始游戏
        </button>
      </div>
    );
  }

  // ============================================================
  // 渲染：游戏结束
  // ============================================================

  if (screen === 'game_over' && game) {
    const winnerNames = gameWinners.map(id => {
      const p = game.players.find(pl => pl.id === id);
      return p?.name || id;
    });
    const winnerRoles = gameWinners.map(id => {
      const p = game.players.find(pl => pl.id === id);
      return p?.role;
    });

    return (
      <div className="sanguosha-gameover">
        <style>{GAME_CSS}</style>
        <div className="gameover-panel">
          <h1>🎉 游戏结束</h1>
          <h2>获胜者：{winnerNames.join('、')}</h2>
          <p style={{ color: ROLES.find(r => r.role === winnerRoles[0])?.color }}>
            身份：{ROLES.find(r => r.role === winnerRoles[0])?.name}
          </p>
          <div className="final-scores">
            {game.players.map(p => {
              const role = ROLES.find(r => r.role === p.role);
              return (
                <div key={p.id} className="score-row" style={{ opacity: p.alive ? 1 : 0.4 }}>
                  <span style={{ color: role?.color }}>{p.name}</span>
                  <span>❤ {p.hp}/{p.maxHp}</span>
                  <span>{role?.name}</span>
                </div>
              );
            })}
          </div>
          <button className="start-btn" onClick={handleRestart}>再来一局</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // 渲染：游戏中
  // ============================================================

  if (!game) return null;
  const currentPlayer = game.players[game.currentPlayerIdx];
  const isPlayerTurn = currentPlayer?.id === 'player';
  const player = game.players.find(p => p.id === 'player')!;
  const maxHand = player.hp;
  const needsDiscard = !isPlayerTurn === false && player.hand.length > maxHand && actionMode !== 'discard';

  const playerCount = game.players.length;
  const playerIdx = game.players.findIndex(p => p.id === 'player');

  // 获取武将信息
  function getPlayerGeneral(p: PlayerState): General | undefined {
    if (p.id === 'player') {
      return ALL_GENERALS.find(g => g.id === selectedGeneral);
    }
    return getGeneralById(p.name.toLowerCase().replace(/\s/g, ''));
  }

  // 座位布局：根据人数动态调整
  // 玩家(主公)在底部 index=0，其他玩家环绕排列
  const seatLayout = (() => {
    if (playerCount === 5) {
      // 5人场：上方1个，左右各1个，额外1个在左上方
      return {
        topPlayers: [2],
        leftPlayers: [1, 4], // 2个在左边
        rightPlayers: [3],
      };
    } else if (playerCount === 8) {
      // 8人场：上方3个，左右各2个
      return {
        topPlayers: [3, 4, 5],
        leftPlayers: [1, 2],
        rightPlayers: [6, 7],
      };
    }
    // 默认4人
    return {
      topPlayers: [2],
      leftPlayers: [1],
      rightPlayers: [3],
    };
  })();

  return (
    <div className="sanguosha-game">
      <style>{GAME_CSS}</style>

      {/* 顶栏 */}
      <div className="topbar">
        <span className="turn-info">
          第{game.turnCount}回合 · <span style={{ color: isPlayerTurn ? '#ffff00' : '#aaa' }}>
            {currentPlayer?.name}的{isPlayerTurn ? '回合' : '回合(AI思考中)'}
          </span>
        </span>
        <span className="phase-info">{game.subPhase === 'play' ? '出牌阶段' : game.subPhase === 'draw' ? '摸牌阶段' : game.subPhase === 'judge' ? '判定阶段' : game.subPhase === 'discard' ? '弃牌阶段' : '等待'}</span>
        <span className="deck-info">牌堆: {game.deck.length} | 弃牌: {game.discard.length}</span>
        <span className="mode-tag">{playerCount}人场</span>
        <span className="version-tag">{VERSION}</span>
      </div>

      {/* 玩家区域 */}
      <div className="game-table">
        {/* 对面玩家 */}
        <div className="player-row opponent-top">
          {seatLayout.topPlayers.map(idx => {
            const p = game.players[idx];
            if (!p) return null;
            return (
              <div
                key={p.id}
                className={`player-avatar-wrapper ${targetPlayerId === p.id && actionMode === 'sha' ? 'targeted' : ''}`}
                onClick={() => isPlayerTurn && handlePlayerSelect(p.id)}
              >
                <PlayerAvatar
                  player={p}
                  isCurrent={currentPlayer?.id === p.id}
                  isPlayer={false}
                  game={game}
                  general={getPlayerGeneral(p)}
                />
              </div>
            );
          })}
        </div>

        {/* 左右玩家 */}
        <div className="player-sides">
          <div className="player-column opponent-left">
            {seatLayout.leftPlayers.map(idx => {
              const p = game.players[idx];
              if (!p) return null;
              return (
                <div
                  key={p.id}
                  className={`player-avatar-wrapper ${targetPlayerId === p.id && actionMode === 'sha' ? 'targeted' : ''}`}
                  onClick={() => isPlayerTurn && handlePlayerSelect(p.id)}
                >
                  <PlayerAvatar
                    player={p}
                    isCurrent={currentPlayer?.id === p.id}
                    isPlayer={false}
                    game={game}
                    general={getPlayerGeneral(p)}
                  />
                </div>
              );
            })}
          </div>

          <div className="center-area">
            <div className="game-log">
              {game.logs.slice(-8).map((log, i) => (
                <div key={i} className={`log-line ${i === game.logs.slice(-8).length - 1 ? 'log-new' : ''}`}>{log}</div>
              ))}
            </div>
            {aiThinking && (
              <div className="ai-thinking">
                <span className="dot-anim">⚡ AI思考中...</span>
              </div>
            )}
            {!isPlayerTurn && !aiThinking && (
              <div className="ai-thinking" style={{ color: '#aaa' }}>等待 {currentPlayer?.name} 出牌...</div>
            )}
          </div>

          <div className="player-column opponent-right">
            {seatLayout.rightPlayers.map(idx => {
              const p = game.players[idx];
              if (!p) return null;
              return (
                <div
                  key={p.id}
                  className={`player-avatar-wrapper ${targetPlayerId === p.id && actionMode === 'sha' ? 'targeted' : ''}`}
                  onClick={() => isPlayerTurn && handlePlayerSelect(p.id)}
                >
                  <PlayerAvatar
                    player={p}
                    isCurrent={currentPlayer?.id === p.id}
                    isPlayer={false}
                    game={game}
                    general={getPlayerGeneral(p)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* 玩家信息 */}
        <div className="player-area">
          <div className="player-main-info">
            <PlayerAvatar
              player={player}
              isCurrent={isPlayerTurn}
              isPlayer={true}
              game={game}
              general={getPlayerGeneral(player)}
            />
          </div>
          <div className="player-hand">
            <div className="hand-label">
              手牌 ({player.hand.length}/{maxHand})
              {player.hand.length > maxHand && <span style={{ color: '#ff4444' }}> — 需弃{Math.max(0, player.hand.length - maxHand)}张</span>}
            </div>
            <div className="hand-cards">
              {player.hand.map((cardId) => {
                const card = deckData.find(c => c.id === cardId);
                return (
                  <div
                    key={cardId}
                    className={`hand-card ${selectedCardIds.includes(cardId) ? 'selected' : ''}`}
                    onClick={() => isPlayerTurn && !aiThinking && handleCardSelect(cardId)}
                    onMouseEnter={(e) => {
                      if (card) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCard({ card, x: rect.left, y: rect.top });
                      }
                    }}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      borderColor: selectedCardIds.includes(cardId) ? '#ffff00' : undefined,
                      boxShadow: selectedCardIds.includes(cardId) ? '0 0 8px #ffff00' : undefined,
                    }}
                  >
                    <CardMini cardId={cardId} deckData={deckData} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 卡牌hover提示 */}
      {hoveredCard && (
        <div className="card-tooltip" style={{ left: hoveredCard.x + 60, top: hoveredCard.y }}>
          <div className="card-tooltip-name" style={{ color: hoveredCard.card.suit === 'heart' || hoveredCard.card.suit === 'diamond' ? '#cc0000' : '#222' }}>
            {hoveredCard.card.name}
          </div>
          <div className="card-tooltip-type">
            {hoveredCard.card.type === 'basic' ? '基本牌' : hoveredCard.card.type === 'equip' ? '装备牌' : '锦囊牌'}
            {hoveredCard.card.subType && ` · ${hoveredCard.card.subType}`}
          </div>
          <div className="card-tooltip-desc">{hoveredCard.card.desc || '无描述'}</div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="action-bar">
        {isPlayerTurn && !aiThinking && (
          <>
            {actionMode === 'discard' ? (
              <>
                <button className="action-btn confirm" onClick={handleDiscardSelected}
                  disabled={selectedCardIds.length !== Math.max(0, player.hand.length - maxHand)}>
                  确认弃牌 ({selectedCardIds.length}/{Math.max(0, player.hand.length - maxHand)})
                </button>
                <button className="action-btn cancel" onClick={() => { setActionMode('none'); setSelectedCardIds([]); }}>取消</button>
              </>
            ) : (
              <>
                {selectedCardIds.length > 0 && (
                  <button className="action-btn confirm" onClick={handleUseSelectedCard}>
                    使用 {deckData.find(c => c.id === selectedCardIds[0])?.name}
                    {targetPlayerId ? ` → ${game.players.find(p => p.id === targetPlayerId)?.name}` : ''}
                  </button>
                )}
                <button className="action-btn" onClick={() => { setSelectedCardIds([]); setActionMode('none'); }}>
                  取消选择
                </button>
                {needsDiscard && (
                  <button className="action-btn discard" onClick={handleStartDiscard}>
                    弃牌 ({player.hand.length - maxHand})
                  </button>
                )}
                {isPlayerTurn && game.subPhase === 'play' && (
                  <button className="action-btn end-turn" onClick={handleEndTurn}>结束回合</button>
                )}
              </>
            )}
          </>
        )}
        {!isPlayerTurn && (
          <span style={{ color: '#aaa' }}>等待 {currentPlayer?.name} 出牌...</span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 样式
// ============================================================

const SELECT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #0a0a14;
  color: #e0d8c8;
  font-family: 'Noto Serif SC', serif;
  min-height: 100vh;
}

.sanguosha-select {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.select-header {
  text-align: center;
  padding: 20px;
  border-bottom: 1px solid #333;
  margin-bottom: 20px;
}

.select-header h1 { font-size: 2.5em; color: #c9a84c; margin-bottom: 4px; }
.version { color: #666; font-size: 0.9em; }

.section { margin-bottom: 24px; }
.section h2 { color: #c9a84c; margin-bottom: 12px; font-size: 1.2em; border-left: 3px solid #c9a84c; padding-left: 8px; }

/* 场次选择 */
.mode-grid {
  display: flex;
  gap: 16px;
}

.mode-card {
  flex: 1;
  background: #1a1a2a;
  border: 2px solid #333;
  border-radius: 10px;
  padding: 16px 20px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}
.mode-card:hover { background: #2a2a3a; transform: translateY(-2px); }
.mode-card.selected { background: #2a3a2a; box-shadow: 0 0 12px rgba(201,168,76,0.3); }
.mode-title { font-size: 1.4em; font-weight: bold; color: #c9a84c; margin-bottom: 6px; }
.mode-desc { font-size: 0.85em; color: #888; }

.general-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
}

.general-card {
  background: #1a1a2a;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}
.general-card:hover { background: #2a2a3a; transform: translateY(-2px); }
.general-card.selected { background: #2a3a2a; box-shadow: 0 0 10px rgba(201,168,76,0.3); }
.gen-name { font-size: 1.1em; font-weight: bold; margin-bottom: 2px; }
.gen-nation { font-size: 0.8em; color: #888; margin-bottom: 4px; }
.gen-hp { color: #ff6666; font-size: 0.85em; margin-bottom: 4px; }
.gen-skills { display: flex; flex-wrap: wrap; justify-content: center; gap: 2px; }
.gen-skill-tag { font-size: 0.7em; color: #aaa; cursor: help; }

/* 技能Tooltip */
.skill-tooltip-wrapper { display: inline; }
.skill-tooltip {
  position: absolute;
  left: 50%;
  bottom: 100%;
  transform: translateX(-50%);
  background: #1a1a2a;
  border: 1px solid #c9a84c;
  border-radius: 6px;
  padding: 8px 12px;
  min-width: 180px;
  max-width: 280px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  margin-bottom: 8px;
}
.skill-tooltip-name { font-weight: bold; color: #c9a84c; margin-bottom: 4px; }
.skill-tooltip-desc { font-size: 0.85em; color: #ccc; line-height: 1.4; }

.role-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.role-card {
  background: #1a1a2a;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 1.1em;
  transition: all 0.2s;
}
.role-card:hover { background: #2a2a3a; }
.role-card.selected { background: #2a2a1a; box-shadow: 0 0 8px rgba(255,255,255,0.1); }

.start-btn {
  display: block;
  width: 100%;
  max-width: 300px;
  margin: 24px auto;
  padding: 14px 32px;
  background: linear-gradient(135deg, #8b0000, #cc0000);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.2em;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.start-btn:hover { background: linear-gradient(135deg, #aa0000, #ee0000); transform: translateY(-1px); }
`;

const GAME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.sanguosha-game, .sanguosha-gameover {
  background: #0a0a14;
  color: #e0d8c8;
  font-family: 'Noto Serif SC', serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶栏 */
.topbar {
  background: linear-gradient(180deg, #1a1a2a 0%, #151525 100%);
  border-bottom: 2px solid #333;
  padding: 8px 16px;
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 0.9em;
  flex-wrap: wrap;
}
.turn-info { color: #c9a84c; font-weight: bold; }
.phase-info { color: #88aaff; }
.deck-info { color: #888; }
.mode-tag { background: #2a2a3a; padding: 2px 8px; border-radius: 4px; color: #aaa; font-size: 0.85em; }
.version-tag { color: #555; margin-left: auto; }

/* 牌桌 */
.game-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 玩家行 */
.player-row {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.player-sides {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1;
  gap: 10px;
}

.player-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.center-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-height: 120px;
}

/* 游戏日志 */
.game-log {
  background: rgba(0,0,0,0.6);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 10px 14px;
  width: 100%;
  max-width: 450px;
  font-size: 0.82em;
  max-height: 140px;
  overflow-y: auto;
}
.log-line { color: #888; line-height: 1.5; padding: 2px 0; }
.log-line.log-new { color: #e0d8c8; font-weight: bold; }

.ai-thinking {
  font-size: 0.9em;
  color: #ffcc00;
  padding: 4px 12px;
}

.dot-anim::after {
  content: '';
  animation: dots 1.5s infinite;
}
@keyframes dots {
  0%,20% { content: ''; }
  40% { content: '.'; }
  60% { content: '..'; }
  80%,100% { content: '...'; }
}

/* 玩家头像 */
.player-avatar-wrapper { cursor: pointer; }
.player-avatar-wrapper.targeted .player-avatar {
  box-shadow: 0 0 15px rgba(255,100,100,0.8);
}

.player-avatar {
  border: 2px solid #555;
  border-radius: 10px;
  padding: 8px 12px;
  background: linear-gradient(180deg, #1a1a2a 0%, #151525 100%);
  min-width: 90px;
  text-align: center;
  transition: all 0.2s;
  position: relative;
}
.player-avatar.current-turn {
  box-shadow: 0 0 15px rgba(255,255,0,0.6);
  border-color: #ffff00 !important;
}
.player-avatar.dead { opacity: 0.4; filter: grayscale(0.5); }
.avatar-name { font-size: 0.95em; font-weight: bold; margin-bottom: 2px; }
.avatar-nation { font-size: 0.7em; margin-bottom: 4px; }

/* 血条 */
.avatar-hp-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.hp-bar-bg {
  flex: 1;
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
}
.hp-bar-fill {
  height: 100%;
  transition: width 0.3s ease, background 0.3s ease;
  border-radius: 4px;
}
.hp-text { font-size: 0.8em; color: #fff; min-width: 36px; text-align: left; }

.avatar-role { font-size: 0.75em; }
.avatar-hand-count { font-size: 0.75em; margin-top: 2px; }
.avatar-skills { display: flex; flex-wrap: wrap; justify-content: center; gap: 2px; margin-top: 4px; }
.skill-tag { font-size: 0.65em; color: #aaa; cursor: help; }
.avatar-equip { font-size: 0.8em; margin-top: 2px; }

/* 玩家区域 */
.player-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: linear-gradient(180deg, #111122 0%, #0d0d1a 100%);
  border-radius: 12px;
  border: 1px solid #333;
}
.player-main-info { display: flex; justify-content: flex-start; }
.hand-label {
  font-size: 0.85em;
  color: #aaa;
  margin-bottom: 8px;
}
.hand-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.hand-card {
  cursor: pointer;
  transition: all 0.15s;
  border-radius: 4px;
  border: 2px solid transparent;
}
.hand-card:hover { transform: translateY(-6px); box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
.hand-card.selected { transform: translateY(-10px); border-color: #ffff00; }

/* 小卡牌 */
.card-mini {
  width: 52px;
  height: 72px;
  border: 1px solid #555;
  border-radius: 4px;
  background: linear-gradient(180deg, #f5f0e0 0%, #e8e0c8 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3px;
  font-size: 0.7em;
  font-family: sans-serif;
}
.card-mini-name {
  font-weight: bold;
  text-align: center;
  font-size: 0.85em;
  line-height: 1.2;
}
.card-mini-suit {
  text-align: center;
  font-size: 1em;
}

/* 卡牌Tooltip */
.card-tooltip {
  position: fixed;
  background: #1a1a2a;
  border: 1px solid #c9a84c;
  border-radius: 8px;
  padding: 10px 14px;
  min-width: 160px;
  max-width: 220px;
  z-index: 1000;
  box-shadow: 0 4px 16px rgba(0,0,0,0.6);
}
.card-tooltip-name { font-weight: bold; font-size: 1.1em; margin-bottom: 4px; }
.card-tooltip-type { font-size: 0.8em; color: #888; margin-bottom: 6px; }
.card-tooltip-desc { font-size: 0.85em; color: #ccc; line-height: 1.4; }

/* 操作栏 */
.action-bar {
  background: linear-gradient(180deg, #151525 0%, #1a1a2a 100%);
  border-top: 2px solid #333;
  padding: 10px 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.15s;
}
.action-btn.confirm { background: linear-gradient(135deg, #006600, #008800); color: #fff; }
.action-btn.confirm:hover { background: linear-gradient(135deg, #008800, #00aa00); }
.action-btn.confirm:disabled { background: #333; color: #666; cursor: not-allowed; }
.action-btn.cancel { background: #444; color: #ccc; }
.action-btn.cancel:hover { background: #555; }
.action-btn.discard { background: linear-gradient(135deg, #880000, #aa0000); color: #fff; }
.action-btn.discard:hover { background: linear-gradient(135deg, #aa0000, #cc0000); }
.action-btn.end-turn { background: linear-gradient(135deg, #003366, #004488); color: #fff; }
.action-btn.end-turn:hover { background: linear-gradient(135deg, #004488, #0055aa); }
.action-btn:not(.confirm):not(.cancel):not(.discard):not(.end-turn) { background: #333; color: #ccc; }
.action-btn:not(.confirm):not(.cancel):not(.discard):not(.end-turn):hover { background: #444; }

/* 游戏结束 */
.sanguosha-gameover {
  justify-content: center;
  align-items: center;
}
.gameover-panel {
  background: linear-gradient(180deg, #1a1a2a 0%, #151525 100%);
  border: 2px solid #c9a84c;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  width: 90%;
}
.gameover-panel h1 { font-size: 2.5em; color: #c9a84c; margin-bottom: 16px; }
.gameover-panel h2 { font-size: 1.3em; color: #e0d8c8; margin-bottom: 8px; }
.final-scores { margin: 20px 0; text-align: left; }
.score-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid #333;
  font-size: 0.9em;
}
`;
