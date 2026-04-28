// ============================================================
// 三国杀核心游戏逻辑 v0.1
// ============================================================

import { ALL_GENERALS, General, getGeneralById } from '../data/generals';
import { buildDeck, shuffleDeck, shuffleDeckIds, getCardById } from '../data/cards';
import type { CardDef, PlayerState, GameState, GamePhase } from '../data/cards';

// ============================================================
// 工具函数
// ============================================================

let _idCounter = 0;
export function genId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${_idCounter++}`;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ============================================================
// 距离计算（完善版）
// ============================================================

/**
 * 计算两名角色之间的距离（考虑座位顺序）
 * 游戏采用环形座位，相邻距离为1
 */
export function getDistance(from: PlayerState, to: PlayerState, players: PlayerState[]): number {
  if (from.id === to.id) return 0;
  
  // 获取座位索引
  const fromIdx = players.findIndex(p => p.id === from.id);
  const toIdx = players.findIndex(p => p.id === to.id);
  if (fromIdx === -1 || toIdx === -1) return 999;
  
  // 计算环形距离（两个方向取较小值）
  const playerCount = players.length;
  let clockwise = (toIdx - fromIdx + playerCount) % playerCount;
  let counterClockwise = (fromIdx - toIdx + playerCount) % playerCount;
  let seatDistance = Math.min(clockwise, counterClockwise);
  
  // 特殊座位模式：8人场分为主场和副场（上下家为近位）
  // 简化处理：基础座位距离
  let baseDistance = seatDistance;
  
  // 马的影响：
  // 己方-1马：己方到对方距离-1
  // 己方+1马：对方到己方距离+1（即己方到对方不受影响）
  const fromMinus = from.equip.horse ? from.equip.horse.includes('minus') ? 1 : 0 : 0;
  const toMinus = to.equip.horse ? to.equip.horse.includes('minus') ? 1 : 0 : 0;
  
  // 实际距离 = 基础距离 + 马匹修正
  // -1马使攻击距离-1（攻击者装备）
  // +1马使目标被攻击距离+1（目标装备）
  return Math.max(1, baseDistance - fromMinus + toMinus);
}

/**
 * 计算攻击距离（考虑武器范围）
 */
export function getAttackRange(attacker: PlayerState, game: GameState): number {
  let range = 1; // 默认近战范围
  
  // 武器范围
  if (attacker.equip.weapon) {
    const wCard = game.deckData?.find((c: CardDef) => c.id === attacker.equip.weapon);
    if (wCard?.range) range = wCard.range;
  }
  
  // -1马加成攻击范围
  if (attacker.equip.horse?.includes('minus')) {
    range += 1;
  }
  
  return range;
}

/**
 * 判断攻击者是否可以攻击目标
 */
export function canAttack(attacker: PlayerState, target: PlayerState, game: GameState): boolean {
  if (!attacker.alive || !target.alive || attacker.id === target.id) return false;
  
  const dist = getDistance(attacker, target, game.players);
  const range = getAttackRange(attacker, game);
  
  return dist <= range;
}

// ============================================================
// 牌堆操作
// ============================================================

export function drawCards(game: GameState, playerId: string, count: number): GameState {
  const g = deepClone(game);
  const player = g.players.find(p => p.id === playerId);
  if (!player) return game;
  for (let i = 0; i < count; i++) {
    if (g.deck.length === 0) {
      // 弃牌堆洗牌进入牌堆（从deckData过滤出discard中的牌，再洗牌，取ID）
      const discardCardDefs = (g.deckData || []).filter((c: CardDef) => g.discard.includes(c.id));
      const shuffled = shuffleDeck(discardCardDefs);
      g.deck = shuffled.map(c => c.id);
      g.discard = [];
      if (g.deck.length === 0) break;
    }
    const cardId = g.deck.pop()!;
    player.hand.push(cardId);
  }
  return g;
}

export function discardCard(game: GameState, playerId: string, cardId: string): GameState {
  const g = deepClone(game);
  const player = g.players.find(p => p.id === playerId);
  if (!player) return game;
  const idx = player.hand.indexOf(cardId);
  if (idx >= 0) {
    player.hand.splice(idx, 1);
    g.discard.push(cardId);
  }
  return g;
}

export function equipCard(game: GameState, playerId: string, cardId: string, slot: 'weapon' | 'armor' | 'horse'): GameState {
  const g = deepClone(game);
  const player = g.players.find(p => p.id === playerId);
  if (!player) return game;
  const idx = player.hand.indexOf(cardId);
  if (idx >= 0) {
    // 若已有同槽位装备，先卸下
    if (player.equip[slot]) g.discard.push(player.equip[slot]!);
    player.hand.splice(idx, 1);
    player.equip[slot] = cardId;
  }
  return g;
}

// ============================================================
// 伤害与回复
// ============================================================

export function damagePlayer(game: GameState, sourceId: string, targetId: string, damage: number, nature: 'normal' | 'fire' | 'thunder' = 'normal'): GameState {
  const g = deepClone(game);
  const target = g.players.find(p => p.id === targetId);
  if (!target || !target.alive) return game;
  g.lastDamageSource = sourceId;
  
  // 护甲/技能处理（简化：直接扣体力）
  target.hp -= damage;
  g.logs.push(`${target.name}受到了${damage}点${nature === 'fire' ? '火' : nature === 'thunder' ? '雷' : ''}伤害。`);

  if (target.hp <= 0) {
    // 濒死状态，等待桃救助
    target.hp = 0;
    // 若无桃可救，直接死亡（简化处理：自动判定死亡）
    // 完整处理见 handleDying
  }
  return g;
}

export function healPlayer(game: GameState, targetId: string, amount: number): GameState {
  const g = deepClone(game);
  const target = g.players.find(p => p.id === targetId);
  if (!target || !target.alive) return game;
  const oldHp = target.hp;
  target.hp = Math.min(target.hp + amount, target.maxHp);
  const healed = target.hp - oldHp;
  if (healed > 0) g.logs.push(`${target.name}回复了${healed}点体力。`);
  return g;
}

export function killPlayer(game: GameState, playerId: string): GameState {
  const g = deepClone(game);
  const player = g.players.find(p => p.id === playerId);
  if (!player) return game;
  player.alive = false;
  player.hp = 0;
  // 所有手牌和装备进入弃牌堆
  g.discard.push(...player.hand, ...Object.values(player.equip).filter(Boolean) as string[]);
  player.hand = [];
  player.equip = { weapon: undefined, armor: undefined, horse: undefined };
  g.logs.push(`${player.name}阵亡。`);
  return g;
}

// ============================================================
// 牌的可用性判断（UI层调用）
// ============================================================

export function canUseAsSha(game: GameState, playerId: string, cardId: string): boolean {
  const card = getCardById(cardId, game.deckData || []);
  if (!card) return false;
  // 杀/火杀/雷杀 可当杀使用
  return card.type === 'basic' && (card.subType === 'slash' || card.subType === 'fire_slash' || card.subType === 'thunder_slash' || card.name === '杀');
}

export function canUseJink(game: GameState, playerId: string, cardId: string): boolean {
  const card = getCardById(cardId, game.deckData || []);
  if (!card) return false;
  return card.subType === 'jink';
}

export function canUsePeach(game: GameState, playerId: string, cardId: string): boolean {
  const card = getCardById(cardId, game.deckData || []);
  if (!card) return false;
  if (card.subType !== 'peach') return false;

  // 桃只能用于：1. 濒死角色(hp<=0) 2. 体力未满的角色
  const player = game.players.find(p => p.id === playerId);
  if (!player) return false;

  // 濒死状态可以吃桃（hp <= 0）
  // 或者体力不满时可以吃桃回血
  return player.hp < player.maxHp;
}

// ============================================================
// 角色分配（支持5人/8人场）
// ============================================================

export interface RoleConfig {
  totalPlayers: number;
  lord: number;
  loyalist: number;
  rebel: number;
  traitor: number;
}

/**
 * 不同人数场的身份配置
 * 5人场：主公1 + 忠臣1 + 反贼2 + 内奸1 = 5
 * 8人场：主公1 + 忠臣2 + 反贼4 + 内奸1 = 8
 * 标准配置参考三国杀online
 */
export const ROLE_CONFIGS: RoleConfig[] = [
  { totalPlayers: 5, lord: 1, loyalist: 1, rebel: 2, traitor: 1 },  // 5人场
  { totalPlayers: 8, lord: 1, loyalist: 2, rebel: 4, traitor: 1 },  // 8人场
];

/**
 * 根据玩家人数获取默认角色分配
 */
export function getDefaultRoleDistribution(totalPlayers: number): RoleConfig {
  const config = ROLE_CONFIGS.find(r => r.totalPlayers === totalPlayers);
  if (config) return config;
  // 默认5人场
  return ROLE_CONFIGS[0];
}

/**
 * 生成随机角色分配（AI使用）
 */
export function generateAIRoles(totalPlayers: number, playerRole: Role['role']): Role['role'][] {
  const config = getDefaultRoleDistribution(totalPlayers);
  const roles: Role['role'][] = [];
  
  // 玩家角色已确定
  let remainingSlots = totalPlayers - 1;
  
  // 根据玩家身份决定AI角色池
  const availableRoles: Role['role'][] = [];
  if (playerRole === 'lord') {
    // 主公局：忠臣、反贼、内奸
    for (let i = 0; i < config.loyalist; i++) availableRoles.push('loyalist');
    for (let i = 0; i < config.rebel; i++) availableRoles.push('rebel');
    for (let i = 0; i < config.traitor; i++) availableRoles.push('traitor');
  } else {
    // 非主公局
    availableRoles.push('lord');
    for (let i = 0; i < config.loyalist; i++) availableRoles.push('loyalist');
    for (let i = 0; i < config.rebel; i++) availableRoles.push('rebel');
    for (let i = 0; i < config.traitor; i++) availableRoles.push('traitor');
  }
  
  // 随机分配剩余角色
  const shuffled = [...availableRoles].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, totalPlayers - 1);
}

// ============================================================
// 游戏初始化
// ============================================================

export interface Role {
  role: 'lord' | 'loyalist' | 'rebel' | 'traitor';
  name: string;
  color: string;
}

export const ROLES: Role[] = [
  { role: 'lord', name: '主公', color: '#ff4444' },
  { role: 'loyalist', name: '忠臣', color: '#ffaa00' },
  { role: 'rebel', name: '反贼', color: '#44cc44' },
  { role: 'traitor', name: '内奸', color: '#aaaaaa' },
];

export function initGame(
  playerGeneralId: string,
  role: 'lord' | 'loyalist' | 'rebel' | 'traitor',
  aiGeneralIds: string[],
  aiRoles: Role['role'][]
): GameState {
  const deckData = buildDeck();
  let deck = shuffleDeckIds(deckData.map(c => c.id));

  const players: PlayerState[] = [];

  // 玩家
  const playerGen = getGeneralById(playerGeneralId);
  players.push({
    id: 'player',
    name: playerGen?.name || '玩家',
    hp: playerGen?.hp || 4,
    maxHp: playerGen?.maxHp || 4,
    role,
    alive: true,
    hand: [],
    equip: { weapon: undefined, armor: undefined, horse: undefined },
    skills: (playerGen?.skills || []).map((s: { id: string }) => s.id),
    marks: {},
    distance: 0,
  });

  // AI
  for (let i = 0; i < aiGeneralIds.length; i++) {
    const gen = getGeneralById(aiGeneralIds[i]);
    const aiRole = aiRoles[i];
    players.push({
      id: `ai_${i}`,
      name: gen?.name || `AI${i}`,
      hp: gen?.hp || 4,
      maxHp: gen?.maxHp || 4,
      role: aiRole,
      alive: true,
      hand: [],
      equip: { weapon: undefined, armor: undefined, horse: undefined },
      skills: (gen?.skills || []).map((s: { id: string }) => s.id),
      marks: {},
      distance: 0,
    });
  }

  // 主公面朝所有玩家
  const lordIdx = players.findIndex(p => p.role === 'lord');
  // 调整顺序：主公在第一位
  if (lordIdx > 0) {
    players.splice(0, 0, players.splice(lordIdx, 1)[0]);
  }

  // 根据人数决定初始手牌数
  // 5人场起手4张，8人场起手3张
  const initHandCount = players.length === 5 ? 4 : 3;
  
  // 分配初始手牌
  for (const p of players) {
    for (let i = 0; i < initHandCount; i++) {
      if (deck.length > 0) p.hand.push(deck.pop()!);
    }
  }

  return {
    players,
    currentPlayerIdx: 0,
    deck,
    discard: [],
    judgeArea: [],
    phase: 'main',
    subPhase: 'start',
    currentPlayerId: players[0].id,
    deckData,
    logs: ['游戏开始！'],
    turnCount: 0,
  };
}

// ============================================================
// 回合流程
// ============================================================

export function startTurn(game: GameState): GameState {
  let g = deepClone(game);
  const player = g.players[g.currentPlayerIdx];
  if (!player.alive) {
    // 跳过死亡玩家
    g.currentPlayerIdx = (g.currentPlayerIdx + 1) % g.players.length;
    return startTurn(g);
  }
  g.phase = 'main';
  g.subPhase = 'start';
  g.currentPlayerId = player.id;
  g.turnCount++;
  // 重置回合追踪数据
  if (!g.shaUsedThisTurn) g.shaUsedThisTurn = {};
  if (!g.wineUsedThisTurn) g.wineUsedThisTurn = {};
  if (!g.turnStartHp) g.turnStartHp = {};
  g.shaUsedThisTurn[player.id] = 0;
  g.wineUsedThisTurn[player.id] = 0;
  g.turnStartHp[player.id] = player.hp;
  g.logs.push(`--- 第${g.turnCount}回合：${player.name} ---`);
  return g;
}

// 判定阶段
export function doJudgePhase(game: GameState): GameState {
  let g = deepClone(game);
  g.subPhase = 'judge';
  // 处理闪电、乐不思蜀等判定区牌
  g = processJudge(g, g.currentPlayerId);
  return g;
}

// 摸牌阶段：默认摸2张
export function doDrawPhase(game: GameState): GameState {
  let g = deepClone(game);
  g.subPhase = 'draw';
  const player = g.players.find(p => p.id === g.currentPlayerId);
  if (!player) return game;
  // 检查英姿（周瑜）等技能，可多摸
  let drawCount = 2;
  // 咆哮（张飞）已装备杀后可在出牌阶段额外杀，见playCardPhase
  g = drawCards(g, player.id, drawCount);
  g.subPhase = 'play';
  return g;
}

// 出牌阶段
export function doPlayPhase(game: GameState): GameState {
  let g = deepClone(game);
  g.subPhase = 'play';
  g.phase = 'play_card';
  return g;
}

// 弃牌阶段：手牌上限=当前体力值
export function doDiscardPhase(game: GameState): GameState {
  let g = deepClone(game);
  g.subPhase = 'discard';
  const player = g.players.find(p => p.id === g.currentPlayerId);
  if (!player) return game;
  const maxHand = player.hp;
  if (player.hand.length <= maxHand) {
    g.subPhase = 'end';
    return g;
  }
  // UI 需要处理弃牌，这里直接让AI自动处理
  return g;
}

// AI自动弃牌
export function aiDiscardExcess(game: GameState, playerId: string): GameState {
  let g = deepClone(game);
  const player = g.players.find(p => p.id === playerId);
  if (!player) return game;
  const maxHand = player.hp;
  while (player.hand.length > maxHand && player.hand.length > 0) {
    const cardId = player.hand[player.hand.length - 1];
    g = discardCard(g, playerId, cardId);
  }
  return g;
}

// 结束回合
export function endTurn(game: GameState): GameState {
  let g = deepClone(game);
  g.subPhase = 'end';
  // 闭月（貂蝉）技能：回合结束摸1张
  const player = g.players.find(p => p.id === g.currentPlayerId);
  if (player) {
    const gen = getGeneralById(player.id);
    // 暂时跳过闭月处理
  }
  // 下一玩家
  let nextIdx = (g.currentPlayerIdx + 1) % g.players.length;
  let attempts = 0;
  while (!g.players[nextIdx].alive && attempts < g.players.length) {
    nextIdx = (nextIdx + 1) % g.players.length;
    attempts++;
  }
  g.currentPlayerIdx = nextIdx;
  return startTurn(g);
}

function playerGeneralId(playerId: string): string {
  // 这个函数需要从玩家对象获取，这里先给出默认实现
  if (playerId === 'player') return 'guanyu';
  if (playerId.startsWith('ai_0')) return 'caocao';
  if (playerId.startsWith('ai_1')) return 'zhouyu';
  if (playerId.startsWith('ai_2')) return 'lvbu';
  return 'guanyu';
}

// ============================================================
// 使用牌
// ============================================================

export function useCard(
  game: GameState,
  playerId: string,
  cardId: string,
  targetIds: string[]
): GameState {
  let g = deepClone(game);
  const card = (g.deckData || []).find((c: CardDef) => c.id === cardId);
  if (!card) return game;

  const player = g.players.find(p => p.id === playerId);
  if (!player) return game;

  // === 规则检查 ===

  // 杀的使用限制：每回合只能使用1次杀（除非有连弩武器）
  if (card.subType === 'slash' || card.subType === 'fire_slash' || card.subType === 'thunder_slash') {
    const hasSpear = player.equip.weapon && (() => {
      const wCard = g.deckData?.find((c: CardDef) => c.id === player.equip.weapon);
      return wCard?.name?.includes('连弩') || wCard?.name?.includes('ak-47');
    })();
    const shaCount = g.shaUsedThisTurn?.[playerId] || 0;
    if (shaCount >= 1 && !hasSpear) {
      g.logs.push(`${player.name}本回合已使用过杀，无法再次使用。`);
      return game; // 阻止使用
    }
  }

  // 酒的使用限制：每回合限一次
  if (card.subType === 'wine') {
    const wineCount = g.wineUsedThisTurn?.[playerId] || 0;
    if (wineCount >= 1) {
      g.logs.push(`${player.name}本回合已使用过酒。`);
      return game;
    }
  }

  // 顺手牵羊：距离必须为1
  if (card.subType === 'snatch' && targetIds.length > 0) {
    const target = g.players.find(p => p.id === targetIds[0]);
    if (target && getDistance(player, target, g.players) !== 1) {
      g.logs.push(`${player.name}与${target.name}距离不为1，无法使用顺手牵羊。`);
      return game;
    }
  }

  // 从手牌移除
  const handIdx = player.hand.indexOf(cardId);
  if (handIdx >= 0) player.hand.splice(handIdx, 1);

  // 装备牌：放入对应槽位
  if (card.type === 'equip') {
    if (card.name.includes('马')) {
      g = equipCard(g, playerId, cardId, 'horse');
    } else if (card.name.includes('八卦') || card.name.includes('仁王')) {
      g = equipCard(g, playerId, cardId, 'armor');
    } else {
      g = equipCard(g, playerId, cardId, 'weapon');
    }
    // 注意：equipCard内部已处理原装备的弃牌，不需再次push
    g.logs.push(`${player.name}装备了${card.name}。`);
    return g;
  }

  // 基本牌/锦囊：使用后进弃牌堆
  g.discard.push(cardId);
  g.logs.push(`${player.name}使用了${card.name}。`);

  // 更新回合使用次数
  if (card.subType === 'slash' || card.subType === 'fire_slash' || card.subType === 'thunder_slash') {
    if (!g.shaUsedThisTurn) g.shaUsedThisTurn = {};
    g.shaUsedThisTurn[playerId] = (g.shaUsedThisTurn[playerId] || 0) + 1;
  }
  if (card.subType === 'wine') {
    if (!g.wineUsedThisTurn) g.wineUsedThisTurn = {};
    g.wineUsedThisTurn[playerId] = (g.wineUsedThisTurn[playerId] || 0) + 1;
  }

  // 按牌类型处理效果
  if (card.subType === 'slash' || card.subType === 'fire_slash' || card.subType === 'thunder_slash') {
    // 杀：造成伤害
    for (const targetId of targetIds) {
      const nature = card.subType === 'fire_slash' ? 'fire' : card.subType === 'thunder_slash' ? 'thunder' : 'normal';
      g = damagePlayer(g, playerId, targetId, 1, nature);
    }
  } else if (card.subType === 'peach') {
    // 桃：回复体力（体力满时不能吃，除非濒死）
    const target = g.players.find(p => p.id === targetIds[0]);
    if (target && target.hp >= target.maxHp) {
      g.logs.push(`${target.name}体力已满，无法使用桃。`);
      // 桃已使用但未产生效果，仍在弃牌堆
    } else {
      for (const targetId of targetIds) {
        g = healPlayer(g, targetId, 1);
      }
    }
  } else if (card.subType === 'jink') {
    // 闪：由系统处理
  } else if (card.subType === 'wine') {
    // 酒：+1伤害（简化处理，本回合杀伤害+1暂不实现）
  } else if (card.subType === 'dismantle') {
    // 过河拆桥（目标已选择，由UI处理具体拆哪张牌）
  } else if (card.subType === 'snatch') {
    // 顺手牵羊（目标已选择，由UI处理具体拿哪张牌）
  } else if (card.subType === 'duel') {
    // 决斗
    if (targetIds.length > 0) {
      const targetId = targetIds[0];
      g.logs.push(`${player.name}对${g.players.find(p => p.id === targetId)?.name}发起决斗。`);
      // AI响应：默认AI会尝试打杀（简化：若AI有杀则打出，否则掉血）
      // 实际由respondDuel处理
    }
  } else if (card.subType === 'savage') {
    // 南蛮入侵
    for (const p of g.players) {
      if (p.id !== playerId && p.alive) {
        const hasSha = p.hand.some(cid => canUseAsSha(g, p.id, cid));
        if (!hasSha) {
          g = damagePlayer(g, playerId, p.id, 1);
        }
      }
    }
  } else if (card.subType === 'archery') {
    // 万箭齐发
    for (const p of g.players) {
      if (p.id !== playerId && p.alive) {
        const hasJink = p.hand.some(cid => canUseJink(g, p.id, cid));
        if (!hasJink) {
          g = damagePlayer(g, playerId, p.id, 1);
        }
      }
    }
  } else if (card.subType === 'burning') {
    // 无中生有
    g = drawCards(g, playerId, 2);
  } else if (card.subType === 'peach_garden') {
    // 桃园结义
    for (const p of g.players) {
      if (p.alive) {
        g = healPlayer(g, p.id, 1);
      }
    }
  } else if (card.subType === 'fire_attack') {
    // 火攻
  }

  return g;
}

// ============================================================
// AI决策（升级版）
// ============================================================

export interface AIAction {
  action: 'use_card' | 'discard' | 'end_turn' | 'response' | null;
  cardId?: string;
  targetIds?: string[];
  reasoning?: string;
}

/**
 * AI决策核心函数
 * 策略优先级：
 * 1. 濒死时使用桃
 * 2. 响应他人生效的卡牌（闪、杀响应等）
 * 3. 锦囊牌优先（群体锦囊>单体锦囊>无中生有）
 * 4. 装备牌（武器>防具>马）
 * 5. 杀（优先攻击威胁目标）
 * 6. 弃牌（选择无用手牌）
 */
export function aiDecide(game: GameState, aiId: string): AIAction {
  const player = game.players.find(p => p.id === aiId);
  if (!player) return { action: null };

  const otherPlayers = game.players.filter(p => p.id !== aiId && p.alive);
  
  // 1. 濒死时使用桃
  if (player.hp <= 2 && player.hp < player.maxHp) {
    const peachCard = findCardInHand(player, card => canUsePeach(game, aiId, card));
    if (peachCard) {
      return { action: 'use_card', cardId: peachCard, targetIds: [aiId], reasoning: '濒死，使用桃回血' };
    }
  }
  
  // 2. 使用防御型锦囊（优先高收益）
  const groupTrick = findBestGroupTrick(game, player, aiId);
  if (groupTrick) {
    return groupTrick;
  }
  
  // 3. 单体锦囊牌
  const singleTrick = findSingleTargetTrick(game, player, aiId);
  if (singleTrick) {
    return singleTrick;
  }
  
  // 4. 使用武器（优先高范围武器）
  const weaponCard = findBestWeapon(player);
  if (weaponCard) {
    return { action: 'use_card', cardId: weaponCard, reasoning: '装备武器' };
  }
  
  // 5. 使用防具
  const armorCard = findArmorCard(player);
  if (armorCard) {
    return { action: 'use_card', cardId: armorCard, reasoning: '装备防具' };
  }
  
  // 6. 使用-1马
  const minusHorse = findMinusHorse(player);
  if (minusHorse) {
    return { action: 'use_card', cardId: minusHorse, reasoning: '装备-1马' };
  }
  
  // 7. 杀（优先攻击策略目标）
  const slashAction = findBestSlashTarget(game, player, aiId);
  if (slashAction) {
    return slashAction;
  }
  
  // 8. 结束回合
  return { action: 'end_turn', reasoning: '无可用动作' };
}

/**
 * 查找手牌中符合条件的牌
 */
function findCardInHand(player: PlayerState, predicate: (cardId: string) => boolean): string | null {
  return player.hand.find(cid => predicate(cid)) || null;
}

/**
 * 查找最佳群体锦囊（南蛮、万箭、桃园等）
 */
function findBestGroupTrick(game: GameState, player: PlayerState, aiId: string): AIAction | null {
  const cardIds = player.hand;
  
  // 无中生有（肯定用）
  const burningCard = findCardInHand(player, cid => {
    const card = getCardById(cid, game.deckData || []);
    return card?.subType === 'burning';
  });
  if (burningCard) {
    return { action: 'use_card', cardId: burningCard, reasoning: '无中生有摸牌' };
  }
  
  // 南蛮入侵（敌方多时使用）
  const savageCard = findCardInHand(player, cid => {
    const card = getCardById(cid, game.deckData || []);
    return card?.subType === 'savage';
  });
  if (savageCard) {
    const enemyCount = game.players.filter(p => p.alive && p.id !== aiId && !isAlly(player, p, game)).length;
    if (enemyCount >= 2) {
      return { action: 'use_card', cardId: savageCard, reasoning: '南蛮入侵群体伤害' };
    }
  }
  
  // 万箭齐发
  const archeryCard = findCardInHand(player, cid => {
    const card = getCardById(cid, game.deckData || []);
    return card?.subType === 'archery';
  });
  if (archeryCard) {
    const enemyCount = game.players.filter(p => p.alive && p.id !== aiId && !isAlly(player, p, game)).length;
    if (enemyCount >= 2) {
      return { action: 'use_card', cardId: archeryCard, reasoning: '万箭齐发群体伤害' };
    }
  }
  
  // 桃园结义（己方血量低时使用）
  const peachGardenCard = findCardInHand(player, cid => {
    const card = getCardById(cid, game.deckData || []);
    return card?.subType === 'peach_garden';
  });
  if (peachGardenCard) {
    const allyCount = game.players.filter(p => p.alive && p.id !== aiId && isAlly(player, p, game) && p.hp < p.maxHp).length;
    if (allyCount >= 1) {
      return { action: 'use_card', cardId: peachGardenCard, reasoning: '桃园结义治疗' };
    }
  }
  
  return null;
}

/**
 * 查找最佳单体锦囊（过河拆桥、顺手牵羊、决斗、火攻等）
 */
function findSingleTargetTrick(game: GameState, player: PlayerState, aiId: string): AIAction | null {
  // 顺手牵羊（优先拿敌方装备）
  const snatchCard = findCardInHand(player, cid => {
    const card = getCardById(cid, game.deckData || []);
    return card?.subType === 'snatch';
  });
  if (snatchCard) {
    const target = findBestSnatchTarget(game, player, aiId);
    if (target) {
      return { action: 'use_card', cardId: snatchCard, targetIds: [target.id], reasoning: '顺手牵羊拿牌' };
    }
  }
  
  // 过河拆桥（优先拆敌方装备）
  const dismantCard = findCardInHand(player, cid => {
    const card = getCardById(cid, game.deckData || []);
    return card?.subType === 'dismantle';
  });
  if (dismantCard) {
    const target = findBestDismantleTarget(game, player, aiId);
    if (target) {
      return { action: 'use_card', cardId: dismantCard, targetIds: [target.id], reasoning: '过河拆桥拆装备' };
    }
  }
  
  // 决斗（优先攻击敌方脆皮）
  const duelCard = findCardInHand(player, cid => {
    const card = getCardById(cid, game.deckData || []);
    return card?.subType === 'duel';
  });
  if (duelCard) {
    const target = findBestDuelTarget(game, player, aiId);
    if (target) {
      return { action: 'use_card', cardId: duelCard, targetIds: [target.id], reasoning: '决斗攻击' };
    }
  }
  
  // 火攻
  const fireAttackCard = findCardInHand(player, cid => {
    const card = getCardById(cid, game.deckData || []);
    return card?.subType === 'fire_attack';
  });
  if (fireAttackCard) {
    const target = findBestFireAttackTarget(game, player, aiId);
    if (target) {
      return { action: 'use_card', cardId: fireAttackCard, targetIds: [target.id], reasoning: '火攻' };
    }
  }
  
  return null;
}

/**
 * 查找最佳武器
 */
function findBestWeapon(player: PlayerState): string | null {
  const weapons = player.hand.filter(cid => {
    const card = getCardById(cid, []);
    return card?.type === 'equip' && (card.name.includes('杀') || card.name.includes('弓') || card.name.includes('矛'));
  });
  if (weapons.length === 0) return null;
  
  // 优先长武器（范围大）
  // 简化：返回第一把
  return weapons[0] || null;
}

/**
 * 查找防具牌
 */
function findArmorCard(player: PlayerState): string | null {
  return player.hand.find(cid => {
    const card = getCardById(cid, []);
    return card?.type === 'equip' && (card.name.includes('八卦') || card.name.includes('仁王') || card.name.includes('白银'));
  }) || null;
}

/**
 * 查找-1马
 */
function findMinusHorse(player: PlayerState): string | null {
  return player.hand.find(cid => {
    const card = getCardById(cid, []);
    return card?.type === 'equip' && card.name.includes('马') && card.name.includes('-1');
  }) || null;
}

/**
 * 查找最佳杀的目标
 */
function findBestSlashTarget(game: GameState, player: PlayerState, aiId: string): AIAction | null {
  const slashCards = player.hand.filter(cid => canUseAsSha(game, aiId, cid));
  if (slashCards.length === 0) return null;

  // 检查杀的使用次数限制（咆哮技能除外）
  const hasPaoXiao = player.skills.includes('paoxiao');
  const shaCount = game.shaUsedThisTurn?.[aiId] || 0;
  if (shaCount >= 1 && !hasPaoXiao) return null; // 已用过杀，本回合不能再用

  // 检查是否有连弩
  const hasSpear = player.equip.weapon && (() => {
    const wCard = getCardById(player.equip.weapon, game.deckData || []);
    return wCard?.name?.includes('连弩') || wCard?.name?.includes('ak-47');
  })();

  // 按策略排序目标
  const validTargets = game.players.filter(target => {
    if (!canAttack(player, target, game)) return false;
    return true;
  });

  if (validTargets.length === 0) return null;

  // 策略：优先攻击脆皮/敌方
  validTargets.sort((a, b) => {
    // 优先攻击低血量敌人
    const aIsEnemy = !isAlly(player, a, game);
    const bIsEnemy = !isAlly(player, b, game);
    if (aIsEnemy && !bIsEnemy) return -1;
    if (!aIsEnemy && bIsEnemy) return 1;

    // 都是敌人，优先打低血量
    return a.hp - b.hp;
  });

  const target = validTargets[0];
  return {
    action: 'use_card',
    cardId: slashCards[0],
    targetIds: [target.id],
    reasoning: `杀${target.name}`
  };
}

/**
 * 判断两名玩家是否为友方
 */
function isAlly(attacker: PlayerState, target: PlayerState, game: GameState): boolean {
  // 主公和忠臣
  if ((attacker.role === 'lord' || attacker.role === 'loyalist') && 
      (target.role === 'lord' || target.role === 'loyalist')) {
    return true;
  }
  // 反贼之间
  if (attacker.role === 'rebel' && target.role === 'rebel') {
    return true;
  }
  // 内奸（敌我不明时视为非友方）
  return false;
}

/**
 * 查找顺手牵羊的最佳目标（优先拿装备）
 */
function findBestSnatchTarget(game: GameState, player: PlayerState, aiId: string): PlayerState | null {
  const enemies = game.players.filter(p => p.alive && p.id !== aiId && !isAlly(player, p, game));
  
  // 优先找有装备的敌方
  for (const enemy of enemies) {
    if (enemy.equip.weapon || enemy.equip.armor || enemy.equip.horse) {
      // 验证顺手牵羊距离（1距离内）
      if (getDistance(player, enemy, game.players) === 1) {
        return enemy;
      }
    }
  }
  
  // 次选手牌多的敌方
  enemies.sort((a, b) => b.hand.length - a.hand.length);
  for (const enemy of enemies) {
    if (getDistance(player, enemy, game.players) === 1) {
      return enemy;
    }
  }
  
  return null;
}

/**
 * 查找过河拆桥的最佳目标（优先拆装备）
 */
function findBestDismantleTarget(game: GameState, player: PlayerState, aiId: string): PlayerState | null {
  const enemies = game.players.filter(p => p.alive && p.id !== aiId && !isAlly(player, p, game));
  
  // 优先拆武器（威胁最大）
  for (const enemy of enemies) {
    if (enemy.equip.weapon && getDistance(player, enemy, game.players) === 1) {
      return enemy;
    }
  }
  
  // 拆防具
  for (const enemy of enemies) {
    if (enemy.equip.armor && getDistance(player, enemy, game.players) === 1) {
      return enemy;
    }
  }
  
  // 拆马
  for (const enemy of enemies) {
    if (enemy.equip.horse && getDistance(player, enemy, game.players) === 1) {
      return enemy;
    }
  }
  
  return null;
}

/**
 * 查找决斗的最佳目标
 */
function findBestDuelTarget(game: GameState, player: PlayerState, aiId: string): PlayerState | null {
  const enemies = game.players.filter(p => p.alive && p.id !== aiId && !isAlly(player, p, game));
  
  // 优先攻击手牌少的敌人（容易获胜）
  enemies.sort((a, b) => a.hand.length - b.hand.length);
  
  for (const enemy of enemies) {
    // 验证距离
    if (getDistance(player, enemy, game.players) <= 3) {
      return enemy;
    }
  }
  
  return enemies[0] || null;
}

/**
 * 查找火攻的最佳目标
 */
function findBestFireAttackTarget(game: GameState, player: PlayerState, aiId: string): PlayerState | null {
  const enemies = game.players.filter(p => p.alive && p.id !== aiId && !isAlly(player, p, game));
  
  // 优先攻击没有防具的（八卦阵等）
  for (const enemy of enemies) {
    if (!enemy.equip.armor && enemy.hand.length > 0) {
      return enemy;
    }
  }
  
  // 攻击手牌多的
  enemies.sort((a, b) => b.hand.length - a.hand.length);
  return enemies[0] || null;
}

/**
 * AI响应卡牌（响应杀、闪等）
 */
export function aiRespond(game: GameState, aiId: string, event: 'slash' | 'duel' | 'savage' | 'archery'): string | null {
  const player = game.players.find(p => p.id === aiId);
  if (!player) return null;
  
  if (event === 'slash' || event === 'duel') {
    // 寻找闪
    return player.hand.find(cid => canUseJink(game, aiId, cid)) || null;
  }
  
  if (event === 'savage') {
    // 寻找杀
    return player.hand.find(cid => canUseAsSha(game, aiId, cid)) || null;
  }
  
  if (event === 'archery') {
    // 寻找闪
    return player.hand.find(cid => canUseJink(game, aiId, cid)) || null;
  }
  
  return null;
}

/**
 * AI弃牌决策（选择无用手牌）
 */
export function aiDiscard(game: GameState, aiId: string, count: number): string[] {
  const player = game.players.find(p => p.id === aiId);
  if (!player) return [];
  
  const toDiscard: string[] = [];
  const hand = [...player.hand];
  
  // 弃牌优先级（从低到高）：
  // 1. 武器（已有装备）
  // 2. 防具（已有装备）
  // 3. 马（已有装备）
  // 4. 基本牌（非杀、非闪、非桃）
  // 5. 杀（但有多张时保留至少一张）
  // 6. 闪
  // 7. 桃（保留用于急救）
  
  const categories: { [key: string]: number } = {
    'equip_weapon': 1,
    'equip_armor': 2,
    'equip_horse': 3,
    'basic_other': 4,
    'basic_slash': 5,
    'basic_jink': 6,
    'basic_peach': 7,
  };
  
  const getPriority = (cardId: string): number => {
    const card = getCardById(cardId, game.deckData || []);
    if (!card) return 0;
    
    if (card.type === 'equip') {
      if (card.name.includes('杀') || card.name.includes('弓')) return categories['equip_weapon'];
      if (card.name.includes('八卦') || card.name.includes('仁王')) return categories['equip_armor'];
      return categories['equip_horse'];
    }
    
    if (card.type === 'basic') {
      if (card.subType === 'slash') return categories['basic_slash'];
      if (card.subType === 'jink') return categories['basic_jink'];
      if (card.subType === 'peach') return categories['basic_peach'];
      return categories['basic_other'];
    }
    
    return 4;
  };
  
  // 已有装备的手牌优先弃
  if (player.equip.weapon) {
    const equippedWeapon = player.hand.find(cid => {
      const card = getCardById(cid, game.deckData || []);
      return card?.type === 'equip' && (card.name.includes('杀') || card.name.includes('弓'));
    });
    if (equippedWeapon) {
      toDiscard.push(equippedWeapon);
    }
  }
  
  // 按优先级排序手牌
  hand.sort((a, b) => getPriority(a) - getPriority(b));
  
  // 杀的特殊处理：如果有多张杀，可以弃多余的；如果只有一张，保留
  const slashCount = hand.filter(cid => {
    const card = getCardById(cid, game.deckData || []);
    return card?.subType === 'slash' || card?.subType === 'fire_slash' || card?.subType === 'thunder_slash';
  }).length;
  
  let slashKept = slashCount > 1 ? 1 : slashCount;
  
  for (const cardId of hand) {
    if (toDiscard.length >= count) break;
    
    const card = getCardById(cardId, game.deckData || []);
    if (!card) continue;
    
    // 保留桃用于濒死
    if (card.subType === 'peach') continue;
    
    // 保留最后一张杀
    if ((card.subType === 'slash' || card.subType === 'fire_slash' || card.subType === 'thunder_slash') && slashKept > 0) {
      slashKept--;
      continue;
    }
    
    toDiscard.push(cardId);
  }
  
  return toDiscard.slice(0, count);
}

// ============================================================
// 胜利判定
// ============================================================

export function checkVictory(game: GameState): string[] | null {
  const g = deepClone(game);
  const alivePlayers = g.players.filter(p => p.alive);

  // 主公死亡 → 内奸单独获胜
  const lord = g.players.find(p => p.role === 'lord');
  if (!lord?.alive) {
    const traitor = g.players.find(p => p.role === 'traitor');
    return traitor ? [traitor.id] : ['rebel'];
  }

  // 反贼/内奸全死 → 主公+忠臣获胜
  const rebels = g.players.filter(p => p.role === 'rebel' && p.alive);
  const traitors = g.players.filter(p => p.role === 'traitor' && p.alive);
  if (rebels.length === 0 && traitors.length === 0) {
    const winners = g.players.filter(p => (p.role === 'lord' || p.role === 'loyalist') && p.alive);
    return winners.map(p => p.id);
  }

  // 忠臣死亡后只剩主公+内奸→单挑
  const loyalists = g.players.filter(p => p.role === 'loyalist' && p.alive);
  if (rebels.length === 0 && loyalists.length === 0 && traitors.length === 1 && alivePlayers.length === 2) {
    // 单挑模式，后续扩展
  }

  return null;
}

// ============================================================
// 技能效果处理（完善版）
// ============================================================

/**
 * 技能类型枚举
 */
export type SkillType = 'passive' | 'trigger' | 'active';

/**
 * 技能效果接口
 */
export interface SkillEffect {
  name: string;
  description: string;
  type: SkillType;
  // 触发条件
  triggerOn?: 'draw' | 'use_card' | 'damage' | 'kill' | 'end_turn' | 'start_turn' | 'judge';
  // 效果处理
  handler: (game: GameState, playerId: string, ...args: any[]) => GameState;
  // 效果描述（用于日志）
  effectDesc?: string;
}

/**
 * 常见技能效果库
 */
export const SKILL_EFFECTS: { [skillName: string]: SkillEffect } = {
  // 周瑜-英姿：摸牌阶段多摸一张
  yingzi: {
    name: '英姿',
    description: '摸牌阶段，你可以多摸一张牌',
    type: 'passive',
    triggerOn: 'draw',
    handler: (game, playerId) => {
      // 额外摸一张已在doDrawPhase中处理
      return game;
    },
    effectDesc: '英姿额外摸牌'
  },
  
  // 貂蝉-闭月：回合结束摸一张
  biyue: {
    name: '闭月',
    description: '回合结束阶段，你可以摸一张牌',
    type: 'passive',
    triggerOn: 'end_turn',
    handler: (game, playerId) => {
      return drawCards(game, playerId, 1);
    },
    effectDesc: '闭月摸牌'
  },
  
  // 关羽-武圣：可以将红桃当杀使用
  wusheng: {
    name: '武圣',
    description: '你可以将一张红桃手牌当杀使用',
    type: 'active',
    triggerOn: 'use_card',
    handler: (game, playerId, cardId) => {
      // 转化效果由UI层处理
      return game;
    },
    effectDesc: '武圣转化杀'
  },
  
  // 张飞-咆哮：出牌阶段可多次使用杀
  paoxiao: {
    name: '咆哮',
    description: '出牌阶段，你可以多次使用杀',
    type: 'passive',
    triggerOn: 'use_card',
    handler: (game, playerId) => {
      // 解除杀的使用次数限制由系统处理
      return game;
    },
    effectDesc: '咆哮无次数限制'
  },
  
  // 吕布-无双：杀需要两张闪响应
  wushuang: {
    name: '无双',
    description: '你的杀需要对方使用两张闪才能响应',
    type: 'passive',
    triggerOn: 'use_card',
    handler: (game, playerId) => {
      // 无双效果由响应逻辑处理
      return game;
    },
    effectDesc: '无双影响杀响应'
  },
  
  // 曹操-奸雄：获得对自己造成伤害的牌
  jianxiong: {
    name: '奸雄',
    description: '当你受到伤害后，可获得造成伤害的牌',
    type: 'trigger',
    triggerOn: 'damage',
    handler: (game, playerId, sourceId, cardId) => {
      if (cardId && game.discard.includes(cardId)) {
        const idx = game.discard.indexOf(cardId);
        if (idx >= 0) {
          game.discard.splice(idx, 1);
          const player = game.players.find(p => p.id === playerId);
          if (player) player.hand.push(cardId);
        }
      }
      return game;
    },
    effectDesc: '奸雄获得伤牌'
  },
  
  // 郭嘉-遗计：受到伤害时摸两张牌
  yiji: {
    name: '遗计',
    description: '当你受到1点伤害时，可摸两张牌',
    type: 'trigger',
    triggerOn: 'damage',
    handler: (game, playerId, sourceId, damage) => {
      if (damage >= 1) {
        game = drawCards(game, playerId, 2);
        game.logs.push(`${game.players.find(p => p.id === playerId)?.name}发动遗计，摸了两张牌`);
      }
      return game;
    },
    effectDesc: '遗计摸牌'
  },
  
  // 司马懿-反馈：伤害时交换手牌
  fankui: {
    name: '反馈',
    description: '当你受到伤害时，可与伤害来源交换手牌',
    type: 'trigger',
    triggerOn: 'damage',
    handler: (game, playerId, sourceId) => {
      const target = game.players.find(p => p.id === playerId);
      const source = game.players.find(p => p.id === sourceId);
      if (target && source) {
        const tempHand = [...target.hand];
        target.hand = [...source.hand];
        source.hand = tempHand;
        game.logs.push(`${target.name}发动反馈，与${source.name}交换了手牌`);
      }
      return game;
    },
    effectDesc: '反馈交换手牌'
  },
  
  // 夏侯惇-刚烈：伤害时判定，失败则返还伤害
  ganglie: {
    name: '刚烈',
    description: '当你受到伤害时，进行判定，失败则对伤害来源造成1点伤害',
    type: 'trigger',
    triggerOn: 'damage',
    handler: (game, playerId, sourceId) => {
      // 简化判定：随机判定
      const success = Math.random() > 0.5;
      if (!success && sourceId) {
        game = damagePlayer(game, playerId, sourceId, 1);
        game.logs.push(`${game.players.find(p => p.id === playerId)?.name}发动刚烈，反击了${sourceId}`);
      }
      return game;
    },
    effectDesc: '刚烈反击'
  },
  
  // 孙尚香-枭姬：装备替换时摸牌
  xiaoji: {
    name: '枭姬',
    description: '当你失去装备区的一张牌时，可摸两张牌',
    type: 'trigger',
    triggerOn: 'use_card',
    handler: (game, playerId) => {
      game = drawCards(game, playerId, 2);
      game.logs.push(`${game.players.find(p => p.id === playerId)?.name}发动枭姬，摸了两张牌`);
      return game;
    },
    effectDesc: '枭姬摸牌'
  },
  
  // 黄月英-集智：使用锦囊时摸牌
  jizhi: {
    name: '集智',
    description: '当你使用锦囊牌时，可摸一张牌',
    type: 'trigger',
    triggerOn: 'use_card',
    handler: (game, playerId, cardId) => {
      const card = getCardById(cardId, game.deckData || []);
      if (card?.type === 'trick') {
        game = drawCards(game, playerId, 1);
        game.logs.push(`${game.players.find(p => p.id === playerId)?.name}发动集智，摸了一张牌`);
      }
      return game;
    },
    effectDesc: '集智摸牌'
  },
  
  // 陆逊-谦逊：不能被顺手和过河
  qianxun: {
    name: '谦逊',
    description: '你不能被顺手牵羊和过河拆桥',
    type: 'passive',
    triggerOn: 'use_card',
    handler: (game, playerId) => {
      // 免疫效果由锦囊目标选择时处理
      return game;
    },
    effectDesc: '谦逊免疫锦囊'
  },
};

/**
 * 检查玩家是否拥有某个技能
 */
export function hasSkill(player: PlayerState, skillName: string): boolean {
  return player.skills.includes(skillName);
}

/**
 * 触发技能效果
 */
export function triggerSkill(
  game: GameState,
  playerId: string,
  skillName: string,
  event: string,
  ...args: any[]
): GameState {
  const player = game.players.find(p => p.id === playerId);
  if (!player || !hasSkill(player, skillName)) return game;
  
  const skill = SKILL_EFFECTS[skillName];
  if (!skill || skill.triggerOn !== event) return game;
  
  return skill.handler(game, playerId, ...args);
}

/**
 * 处理濒死状态
 */
export function handleDying(game: GameState, targetId: string): GameState {
  let g = deepClone(game);
  const target = g.players.find(p => p.id === targetId);
  if (!target || target.hp > 0) return game;
  
  // 检查是否有桃可救
  let saved = false;
  
  // 遍历所有玩家（包括自己）
  for (const p of g.players) {
    if (!p.alive) continue;
    for (const cardId of p.hand) {
      if (canUsePeach(g, p.id, cardId)) {
        // 使用桃救人
        g = useCard(g, p.id, cardId, [targetId]);
        saved = true;
        break;
      }
    }
    if (saved) break;
  }
  
  // 如果没人救，判定死亡
  if (!saved) {
    g = killPlayer(g, targetId);
  }
  
  return g;
}

/**
 * 处理判定阶段（闪电、乐不思蜀等）
 */
export function processJudge(game: GameState, playerId: string): GameState {
  let g = deepClone(game);
  const player = g.players.find(p => p.id === playerId);
  if (!player || !player.alive) return game;
  
  // 检查判定区的闪电
  if (g.judgeArea && g.judgeArea.length > 0) {
    for (const cardId of g.judgeArea) {
      const card = getCardById(cardId, g.deckData || []);
      if (!card) continue;
      if (card.subType === 'lightning') {
        // 闪电判定：黑桃2-9 受伤3点，否则移到下家
        if (g.deck.length === 0) {
          g.deck = shuffleDeckIds(g.deckData?.filter((c: CardDef) => g.discard.includes(c.id)).map(c => c.id) || []);
          g.discard = [];
        }
        const judgeCardId = g.deck.pop()!;
        const judgeCard = getCardById(judgeCardId, g.deckData || []);
        g.discard.push(judgeCardId);
        g.judgeArea = g.judgeArea.filter((id: string) => id !== cardId);
        
        if (judgeCard && judgeCard.suit === 'spade' && judgeCard.point >= 2 && judgeCard.point <= 9) {
          // 判定失败，受到3点伤害
          const sourceId = player.id; // 闪电对自己造成伤害
          g = damagePlayer(g, sourceId, playerId, 3, 'thunder');
          g.discard.push(cardId);
          g.logs.push(`${player.name}判定闪电，受到3点雷属性伤害！`);
        } else {
          // 判定成功，移到下家
          const nextIdx = (g.players.findIndex(p => p.id === playerId) + 1) % g.players.length;
          const nextPlayer = g.players[nextIdx];
          if (!g.judgeArea) g.judgeArea = [];
          g.judgeArea.push(cardId);
          g.logs.push(`闪电转移到${nextPlayer.name}的判定区。`);
        }
        break; // 只处理第一张闪电
      }
      if (card.subType === 'indulgence') {
        // 乐不思蜀判定：非红桃跳过出牌阶段
        if (g.deck.length === 0) {
          g.deck = shuffleDeckIds(g.deckData?.filter((c: CardDef) => g.discard.includes(c.id)).map(c => c.id) || []);
          g.discard = [];
        }
        const judgeCardId = g.deck.pop()!;
        const judgeCard = getCardById(judgeCardId, g.deckData || []);
        g.discard.push(judgeCardId);
        g.judgeArea = (g.judgeArea || []).filter((id: string) => id !== cardId);
        
        if (judgeCard && !(judgeCard.suit === 'heart' && judgeCard.point === 1)) {
          // 非红桃A，跳过出牌阶段
          g.players.find(p => p.id === playerId).marks.skipPlayPhase = 1;
          g.logs.push(`${player.name}判定乐不思蜀，跳过出牌阶段。`);
        } else {
          g.logs.push(`${player.name}判定乐不思蜀，判定结果为红桃A，继续出牌阶段。`);
        }
        break;
      }
    }
  }
  
  return g;
}

/**
 * 获取可攻击目标列表
 */
export function getAttackableTargets(
  attacker: PlayerState,
  game: GameState
): PlayerState[] {
  return game.players.filter(target => 
    target.alive && canAttack(attacker, target, game)
  );
}

/**
 * 获取特定距离内的目标
 */
export function getTargetsInDistance(
  player: PlayerState,
  game: GameState,
  maxDistance: number
): PlayerState[] {
  return game.players.filter(target => {
    if (!target.alive || target.id === player.id) return false;
    const dist = getDistance(player, target, game.players);
    return dist <= maxDistance;
  });
}

/**
 * 计算对特定目标的最佳攻击方式
 */
export function getBestAttackAction(
  attacker: PlayerState,
  target: PlayerState,
  game: GameState
): { cardId: string; damage: number; nature: 'normal' | 'fire' | 'thunder' } | null {
  // 检查是否有杀可用
  const slashCards = attacker.hand.filter(cid => canUseAsSha(game, attacker.id, cid));
  if (slashCards.length > 0 && canAttack(attacker, target, game)) {
    const cardId = slashCards[0];
    const card = getCardById(cardId, game.deckData || []);
    const nature = card?.subType === 'fire_slash' ? 'fire' 
      : card?.subType === 'thunder_slash' ? 'thunder' : 'normal';
    return { cardId, damage: 1, nature };
  }
  
  // 检查决斗
  const duelCard = attacker.hand.find(cid => {
    const card = getCardById(cid, game.deckData || []);
    return card?.subType === 'duel';
  });
  if (duelCard) {
    return { cardId: duelCard, damage: 1, nature: 'normal' };
  }
  
  return null;
}
