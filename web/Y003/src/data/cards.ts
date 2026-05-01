// ============================================================
// 三国杀牌堆数据 v0.2
// ============================================================

export type CardSuit = 'spade' | 'heart' | 'club' | 'diamond';
export type CardType = 'basic' | 'trick' | 'equip';

export interface CardDef {
  id: string;          // 牌ID，如 'sha_1'
  name: string;        // 显示名，如 '杀'
  suit: CardSuit;
  point: number;       // 点数 1-13
  type: CardType;
  subType?: string;    // 如 'slash', 'jink', 'peach', 'wine'
  desc: string;        // 描述文本
  range?: number;      // 武器攻击范围（0=无）
  equipType?: 'weapon' | 'armor' | 'horse';  // 装备牌类型
  canReact?: (player: PlayerState, game: GameState) => boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  role?: 'lord' | 'loyalist' | 'rebel' | 'traitor';
  alive: boolean;
  hand: string[];       // 手牌ID数组
  equip: {
    weapon?: string;
    armor?: string;
    horse?: string;     // +1马/-1马
  };
  skills: string[];     // 已触发技能
  marks: Record<string, number>; // 标记，如 duelTarget
  chained?: boolean;   // 是否被铁索连环横置
  distance: number;      // 到当前玩家的距离
}

export interface GameState {
  players: PlayerState[];
  currentPlayerIdx: number;
  deck: string[];       // 剩余牌堆
  discard: string[];    // 弃牌堆
  phase: GamePhase;
  subPhase: string;
  currentPlayerId: string;
  targetPlayerId?: string;
  askPlayerId?: string;  // 当前等待响应的玩家
  askCardIds?: string[]; // 可选牌列表
  logs: string[];
  turnCount: number;
  winners?: string[];   // 本局获胜者
  deckData?: CardDef[];  // 完整牌堆数据（运行时注入）
  // 回合追踪（用于规则限制）
  shaUsedThisTurn?: Record<string, number>;  // 每回合杀的使用次数 {playerId: count}
  wineUsedThisTurn?: Record<string, number>; // 每回合酒的使用次数
  wineDamageBoost?: Record<string, number>;  // 本回合酒增加伤害标记 {playerId: boostCount}
  turnStartHp?: Record<string, number>;       // 回合开始时体力（用于桃的限制）
  judgeArea?: string[];  // 判定区的牌ID列表
  lastDamageSource?: string; // 最后造成伤害的来源ID（用于反馈等技能）
  lastDamageCardId?: string; // 最后造成伤害的卡牌ID（用于奸雄等技能）
}

export type GamePhase =
  | 'start'        // 游戏开始
  | 'role_select' // 选身份
  | 'main'         // 回合开始/判定/摸牌/出牌/弃牌
  | 'respond'      // 等待响应
  | 'play_card'    // 出牌阶段
  | 'discard'      // 弃牌阶段
  | 'end'          // 回合结束
  | 'game_over';   // 游戏结束

// ============================================================
// 牌堆定义
// ============================================================

function makeCard(id: string, name: string, suit: CardSuit, point: number, type: CardType, desc: string, extra?: Partial<CardDef>): CardDef {
  return { id, name, suit, point, type, desc, ...extra };
}

function genCards(
  maker: (suit: CardSuit, point: number, idx: number) => CardDef
): CardDef[] {
  const suits: CardSuit[] = ['spade', 'club', 'heart', 'diamond'];
  const points = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const cards: CardDef[] = [];
  let counter = 0;
  for (const suit of suits) {
    for (const point of points) {
      cards.push(maker(suit, point, counter++));
    }
  }
  return cards;
}

// 杀：军争标准45张
// 组成：黑桃12 + 草花12 + 火杀3 + 雷杀3 + 红桃15 = 45张
function makeShaCards(): CardDef[] {
  const result: CardDef[] = [];
  let n = 0;

  // 黑桃普通杀：1-K各1张（13张），其中10-J为普通杀，Q/K保留给火杀
  for (let p = 1; p <= 9; p++) {
    result.push(makeCard(`sha_${n++}`, '杀', 'spade', p, 'basic', '出牌阶段，对一名你有距离的目标使用，造成1点伤害。', {
      subType: 'slash',
    }));
  }
  // 黑桃10-K（4张普通杀）
  for (const p of [10, 11, 13]) {
    result.push(makeCard(`sha_${n++}`, '杀', 'spade', p, 'basic', '出牌阶段，对一名你有距离的目标使用，造成1点伤害。', {
      subType: 'slash',
    }));
  }
  // 草花普通杀：1-9各1张（9张）
  for (let p = 1; p <= 9; p++) {
    result.push(makeCard(`sha_${n++}`, '杀', 'club', p, 'basic', '出牌阶段，对一名你有距离的目标使用，造成1点伤害。', {
      subType: 'slash',
    }));
  }
  // 草花10-K（3张普通杀）
  for (const p of [10, 11, 13]) {
    result.push(makeCard(`sha_${n++}`, '杀', 'club', p, 'basic', '出牌阶段，对一名你有距离的目标使用，造成1点伤害。', {
      subType: 'slash',
    }));
  }
  // 火杀：黑桃Q/6/3各1张（3张）
  for (const p of [3, 6, 12]) {
    result.push(makeCard(`sha_${n++}`, '杀', 'spade', p, 'basic', '火属性杀', { subType: 'fire_slash' }));
  }
  // 雷杀：草花Q/6/3各1张（3张）
  for (const p of [3, 6, 12]) {
    result.push(makeCard(`sha_${n++}`, '杀', 'club', p, 'basic', '雷属性杀', { subType: 'thunder_slash' }));
  }
  // 红桃杀：1-K各1张（13张）
  for (let p = 1; p <= 13; p++) {
    result.push(makeCard(`sha_${n++}`, '杀', 'heart', p, 'basic', '出牌阶段，对一名你有距离的目标使用，造成1点伤害。', {
      subType: 'slash',
    }));
  }
  // 额外2张红桃7/8（凑足15张红杀）
  result.push(makeCard(`sha_${n++}`, '杀', 'heart', 7, 'basic', '出牌阶段，对一名你有距离的目标使用，造成1点伤害。', { subType: 'slash' }));
  result.push(makeCard(`sha_${n++}`, '杀', 'heart', 8, 'basic', '出牌阶段，对一名你有距离的目标使用，造成1点伤害。', { subType: 'slash' }));

  // 总计：黑桃普通12 + 草花普通12 + 火杀3 + 雷杀3 + 红桃15 = 45张 ✓
  return result;
}

// 闪 (Jink) — 15张（方块1-13各1张 + 方块额外2张）
function makeJinkCards(): CardDef[] {
  const result: CardDef[] = [];
  // 方块1-13各1张（13张）
  for (let i = 0; i < 13; i++) {
    result.push(makeCard(`jink_${i}`, '闪', 'diamond', i + 1, 'basic', '当你受到杀伤害时，打出此牌，抵消1点伤害。', { subType: 'jink' }));
  }
  // 额外2张（方块7/8各1张凑15张）
  result.push(makeCard('jink_13', '闪', 'diamond', 7, 'basic', '当你受到杀伤害时，打出此牌，抵消1点伤害。', { subType: 'jink' }));
  result.push(makeCard('jink_14', '闪', 'diamond', 8, 'basic', '当你受到杀伤害时，打出此牌，抵消1点伤害。', { subType: 'jink' }));
  return result;
}

// 桃 (Peach) — 5张（方块1-5各1张）
function makePeachCards(): CardDef[] {
  const result: CardDef[] = [];
  // 方块1-5各1张（5张）
  for (let i = 0; i < 5; i++) {
    result.push(makeCard(`peach_${i}`, '桃', 'diamond', i + 1, 'basic', '你或你攻击范围内的一名濒死角色回复1点体力。', { subType: 'peach' }));
  }
  return result;
}

// 酒 (Wine) — 2张（黑桃6、草花6）
function makeWineCards(): CardDef[] {
  return [
    makeCard('wine_0', '酒', 'spade', 6, 'basic', '使用时机①：出牌阶段限一次，你使用此牌，然后本回合你使用杀伤害+1。时机②：当你处于濒死状态时，你使用此牌，回复1点体力。', { subType: 'wine' }),
    makeCard('wine_1', '酒', 'club', 6, 'basic', '使用时机①：出牌阶段限一次，你使用此牌，然后本回合你使用杀伤害+1。时机②：当你处于濒死状态时，你使用此牌，回复1点体力。', { subType: 'wine' }),
  ];
}

// 装备牌
function makeEquipCards(): CardDef[] {
  const cards: CardDef[] = [];
  // 武器（军争标准14种）
  const weapons = [
    { id: 'zhangba_sheomao', name: '丈八蛇矛', desc: '你可将两张手牌当杀使用或打出。', range: 4 },
    { id: 'zhuge_liannu', name: '诸葛连弩', desc: '攻击范围1，每回合可额外使用一张杀。', range: 1 },
    { id: 'qilin_gong', name: '麒麟弓', desc: '你使用杀对手牌角色造成伤害后，可弃置其一张装备区的马。', range: 5 },
    { id: 'qinglong_yanyue', name: '青龙偃月刀', desc: '你使用杀被目标抵消后，可继续对同一目标使用杀。', range: 3 },
    { id: 'fangtian_huaji', name: '方天画戟', desc: '你使用的杀可额外指定至多两个目标。', range: 4 },
    { id: 'guanshi_fu', name: '贯石斧', desc: '你使用的杀被目标抵消后，可弃两张牌，强制命中。', range: 3 },
    { id: 'cixiong_shuanggu', name: '雌雄双股剑', desc: '当你使用杀指定一名异性角色时，可令其弃一张牌或失去一点体力。', range: 2 },
    { id: 'hanbing_sword', name: '寒冰剑', desc: '你使用杀对目标造成伤害时，可改为弃置其两张牌。', range: 3 },
    { id: 'guding_dao', name: '古锭刀', desc: '当你使用杀对没有装备牌的角色造成伤害时，伤害+1。', range: 3 },
    { id: 'zhuque_fan', name: '朱雀羽扇', desc: '你可以将一张手牌当火杀使用。', range: 3 },
    { id: 'qinagang_sword', name: '青冈剑', desc: '锁定技，你使用杀时，伤害+1。', range: 3 },
    { id: 'shandian_bian', name: '闪电鞭', desc: '你使用的杀伤害+1。', range: 3 },
    { id: 'wuliu_sword', name: '吴六剑', desc: '你与一名角色计算距离时，始终将其视为在你的攻击范围内。', range: 2 },
    { id: 'hanbing_axe', name: '寒冰矛', desc: '你使用杀对手牌角色造成伤害时，可改为弃置其两张牌。', range: 3 },
  ];
  for (const w of weapons) {
    cards.push(makeCard(w.id, w.name, 'spade', 2, 'equip', w.desc, { range: w.range, equipType: 'weapon' }));
  }
  // 防具（军争标准6种）
  cards.push(makeCard('bagua_zhen', '八卦阵', 'club', 2, 'equip', '每当你需要使用或打出闪时，可弃1体力，视为使用或打出闪。', { equipType: 'armor' }));
  cards.push(makeCard('renwang_dun', '仁王盾', 'heart', 2, 'equip', '锁定技，黑色杀对你无效。', { equipType: 'armor' }));
  cards.push(makeCard('tengjia', '藤甲', 'spade', 1, 'equip', '锁定技，火焰伤害-1；普通杀和普通锦囊伤害+1。', { equipType: 'armor' }));
  cards.push(makeCard('baiyin_shizi', '白银狮子', 'diamond', 1, 'equip', '锁定技，受到伤害时伤害-1，至少承受1点伤害。', { equipType: 'armor' }));
  cards.push(makeCard('huxin_jing', '护心镜', 'club', 5, 'equip', '受到伤害时，伤害-1。', { equipType: 'armor' }));
  cards.push(makeCard('huxin_fu', '护心符', 'heart', 5, 'equip', '受到伤害时，伤害-1。', { equipType: 'armor' }));
  // +1马（防御马，2匹）
  cards.push(makeCard('horse_plus_1', '+1马', 'diamond', 5, 'equip', '其他角色与你计算距离+1。', { equipType: 'horse' }));
  cards.push(makeCard('horse_plus_2', '+1马', 'spade', 5, 'equip', '其他角色与你计算距离+1。', { equipType: 'horse' }));
  // -1马（攻击马，2匹）
  cards.push(makeCard('horse_minus_1', '-1马', 'heart', 5, 'equip', '你与其他角色计算距离-1。', { equipType: 'horse' }));
  cards.push(makeCard('horse_minus_2', '-1马', 'club', 5, 'equip', '你与其他角色计算距离-1。', { equipType: 'horse' }));
  return cards;
}

// 锦囊牌
function makeTrickCards(): CardDef[] {
  const cards: CardDef[] = [];
  // 过河拆桥 (Dismantling) — 4张（原5张改为4张）
  for (let i = 0; i < 4; i++) cards.push(makeCard(`dismantle_${i}`, '过河拆桥', 'spade', 3 + i % 7, 'trick', '出牌阶段，对一名有牌的角色使用，弃置其一张手牌或装备区的一张牌。', { subType: 'dismantle' }));
  // 顺手牵羊 (Snatch) — 2张（原5张改为2张）
  for (let i = 0; i < 2; i++) cards.push(makeCard(`snatch_${i}`, '顺手牵羊', 'club', 2 + i % 8, 'trick', '出牌阶段，对一名有牌的与你距离1的角色使用，获得其一张手牌或装备区的一张牌。', { subType: 'snatch' }));
  // 决斗 (Duel) — 2张
  for (let i = 0; i < 2; i++) cards.push(makeCard(`duel_${i}`, '决斗', 'spade', 7, 'trick', '出牌阶段，对一名角色使用。由目标开始，双方轮流打出一张杀，不打出杀的一方受到1点伤害。', { subType: 'duel' }));
  // 南蛮入侵 (Savage) — 3张
  for (let i = 0; i < 3; i++) cards.push(makeCard(`savage_${i}`, '南蛮入侵', 'spade', 7, 'trick', '出牌阶段，对所有其他角色使用。每个角色需打出一张杀，否则受到1点伤害。', { subType: 'savage' }));
  // 万箭齐发 (Archery) — 1张
  cards.push(makeCard('archery_0', '万箭齐发', 'heart', 7, 'trick', '出牌阶段，对所有其他角色使用。每个角色需打出一张闪，不打出闪者受到1点伤害。', { subType: 'archery' }));
  // 桃园结义 (PeachGarden) — 1张
  cards.push(makeCard('peach_garden_0', '桃园结义', 'heart', 1, 'trick', '出牌阶段，对所有角色使用。每个目标回复1点体力。', { subType: 'peach_garden' }));
  // 无中生有 (Burning) — 2张
  for (let i = 0; i < 2; i++) cards.push(makeCard(`burning_${i}`, '无中生有', 'heart', 1, 'trick', '出牌阶段，对你自己使用。摸两张牌。', { subType: 'burning' }));
  // 无懈可击 (Cancel) — 4张
  for (let i = 0; i < 4; i++) cards.push(makeCard(`cancel_${i}`, '无懈可击', 'spade', 7, 'trick', '当你成为锦囊的目标时，可打出此牌，取消此锦囊对你产生的效果。', { subType: 'cancel' }));
  // 借刀杀人 (Collateral) — 1张（原2张改为1张）
  cards.push(makeCard('collateral_0', '借刀杀人', 'club', 9, 'trick', '出牌阶段，对有武器牌的角色使用。令其对你指定的另一名角色使用一张杀，否则将其武器牌交给你。', { subType: 'collateral' }));
  // 乐不思蜀 (Indulgence) — 2张
  for (let i = 0; i < 2; i++) cards.push(makeCard(`indulgence_${i}`, '乐不思蜀', 'spade', 3, 'trick', '出牌阶段，对一名角色使用。判定，若结果不为红桃，跳过该角色的出牌阶段。', { subType: 'indulgence' }));
  // 兵粮寸断 (Supply) — 2张
  for (let i = 0; i < 2; i++) cards.push(makeCard(`supply_${i}`, '兵粮寸断', 'club', 9, 'trick', '出牌阶段，对距离1的一名角色使用。判定，若结果不为草花，跳过该角色的摸牌阶段。', { subType: 'supply' }));
  // 闪电 (Lightning) — 1张
  cards.push(makeCard('lightning_0', '闪电', 'spade', 1, 'trick', '出牌阶段，将此牌放置于你的武将牌上。开始判定阶段，进行判定，若结果为黑桃2-9，受到3点伤害，此牌移至弃牌堆；否则将此牌移至当前下家武将牌上。', { subType: 'lightning' }));
  // 火攻 (FireAttack) — 3张（原2张改为3张）
  for (let i = 0; i < 3; i++) cards.push(makeCard(`fire_attack_${i}`, '火攻', 'heart', 3, 'trick', '出牌阶段，对一名有手牌的角色使用。展示其一张手牌并弃置之，然后你可重复此流程。', { subType: 'fire_attack' }));
  // 铁索连环 (IronChain) — 3张（新增）
  for (let i = 0; i < 3; i++) cards.push(makeCard(`iron_chain_${i}`, '铁索连环', 'spade', 4 + i, 'trick', '出牌阶段，对一名角色使用，横置该角色。出牌阶段，对一名已横置的角色使用，解除其横置状态。', { subType: 'iron_chain' }));
  // 五谷丰登 (FiveGrain) — 2张（新增）
  for (let i = 0; i < 2; i++) cards.push(makeCard(`five_grain_${i}`, '五谷丰登', 'heart', 4, 'trick', '出牌阶段，对所有角色使用。每名目标选择一张手牌，依次弃置之。', { subType: 'five_grain' }));
  return cards;
}

// 合成完整牌堆
export function buildDeck(): CardDef[] {
  const cards: CardDef[] = [
    ...makeShaCards(),
    ...makeJinkCards(),
    ...makePeachCards(),
    ...makeWineCards(),
    ...makeEquipCards(),
    ...makeTrickCards(),
  ];
  return cards;
}

// 洗牌
export function shuffleDeck(cards: CardDef[]): CardDef[] {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 洗牌（牌ID数组版）
export function shuffleDeckIds(cardIds: string[]): string[] {
  const arr = [...cardIds];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 根据ID从牌堆查牌
export function getCardById(id: string, allCards: CardDef[]): CardDef | undefined {
  return allCards.find(c => c.id === id);
}

// 深拷贝工具
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
