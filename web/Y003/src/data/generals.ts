// ============================================================
// 三国杀武将数据 v0.1
// ============================================================

export interface General {
  id: string;
  name: string;
  nation: string;       // 'shu' | 'wei' | 'wu' | 'qun'
  hp: number;
  maxHp: number;
  skills: GeneralSkill[];
  desc: string;
  gender: 'male' | 'female';
  avatar?: string;       // 颜色/emoji表现（可选）
  color: string;         // 血条颜色
}

export interface GeneralSkill {
  id: string;
  name: string;
  desc: string;
  triggered: boolean;    // 是否为触发型（需响应）
  // 触发时调用：(playerId, game) => GameStateChange | null
  onTrigger?: (playerId: string, game: import('./cards').GameState) => boolean;
  // 回合开始时调用
  onPhaseStart?: (playerId: string, phase: string, game: import('./cards').GameState) => import('./cards').GameState;
  // 造成伤害时
  onDamage?: (sourceId: string, targetId: string, damage: number, game: import('./cards').GameState) => { damage: number; game: import('./cards').GameState };
  // 受到伤害时
  onHurt?: (targetId: string, damage: number, game: import('./cards').GameState) => { damage: number; game: import('./cards').GameState };
  // 使用牌时
  onUseCard?: (playerId: string, cardId: string, game: import('./cards').GameState) => boolean;
  // 判定阶段
  onJudge?: (playerId: string, cardId: string, game: import('./cards').GameState) => boolean;
  // 出牌阶段开始
  onPlayPhase?: (playerId: string, game: import('./cards').GameState) => import('./cards').GameState;
}

// ============================================================
// 工具函数（避免循环导入，在数据文件内复用）
// ============================================================
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function getCardById(id: string, allCards: import('./cards').CardDef[]): import('./cards').CardDef | undefined {
  return allCards.find((c) => c.id === id);
}

// ============================================================
// 武将列表 v0.1（6名经典武将）
// ============================================================

export const ALL_GENERALS: General[] = [
  // ===== 蜀国 =====
  {
    id: 'guanyu',
    name: '关羽',
    nation: 'shu',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#00cc66',
    desc: '五虎上将之一，义薄云天',
    skills: [
      {
        id: 'guanyu_wusheng',
        name: '武圣',
        desc: '你可以将任意红色牌（红桃或方块）当杀使用或打出。',
        triggered: false,
        onUseCard: (playerId, cardId, game) => {
          // 武圣：将红色牌（红桃或方块）当杀使用
          // 由UI层在canUseAsSha中判断是否可当杀
          return false;
        },
      },
    ],
  },
  {
    id: 'zhangfei',
    name: '张飞',
    nation: 'shu',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#00cc66',
    desc: '五虎上将之一，百万军中取上将首级',
    skills: [
      {
        id: 'zhangfei_paoxiao',
        name: '咆哮',
        desc: '出牌阶段，你使用杀无次数限制。',
        triggered: false,
        onPlayPhase: (playerId, game) => {
          // 咆哮：本回合使用杀无次数限制
          // 实际实现需要在出牌阶段跳过杀的使用次数检查
          return game;
        },
      },
    ],
  },

  // ===== 魏国 =====
  {
    id: 'caocao',
    name: '曹操',
    nation: 'wei',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#4488ff',
    desc: '魏武帝，乱世奸雄',
    skills: [
      {
        id: 'caocao_jianxiong',
        name: '奸雄',
        desc: '当你受到伤害时，你可获得造成伤害的牌。',
        triggered: true,
        onHurt: (targetId, damage, game) => {
          // 奸雄：受到伤害时获得造成伤害的牌
          // 需要在伤害处理时获取来源的牌
          return { damage, game };
        },
      },
      {
        id: 'caocao_hujia',
        name: '护驾',
        desc: '当你需要使用或打闪时，可令魏势力其他角色帮你打出一张闪。',
        triggered: true,
      },
    ],
  },
  {
    id: 'xuchu',
    name: '许褚',
    nation: 'wei',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#4488ff',
    desc: '虎痴，裸衣斗战',
    skills: [
      {
        id: 'xuchu_luoyi',
        name: '裸衣',
        desc: '出牌阶段，若你未装备武器牌，可失去1点体力，视为使用一张决斗。',
        triggered: false,
      },
    ],
  },

  // ===== 吴国 =====
  {
    id: 'zhouyu',
    name: '周瑜',
    nation: 'wu',
    hp: 3,
    maxHp: 3,
    gender: 'male',
    color: '#ffcc00',
    desc: '东吴大都督，美周郎',
    skills: [
      {
        id: 'zhouyu_yingzi',
        name: '英姿',
        desc: '摸牌阶段，你可以多摸一张牌。',
        triggered: false,
      },
      {
        id: 'zhouyu_fanjian',
        name: '反间',
        desc: '出牌阶段限一次，你可令一名其他角色选择一种花色，获得其一张手牌。',
        triggered: true,
      },
    ],
  },
  {
    id: 'sunshangxiang',
    name: '孙尚香',
    nation: 'wu',
    hp: 3,
    maxHp: 3,
    gender: 'female',
    color: '#ffcc00',
    desc: '郡主，吴国霸王花',
    skills: [
      {
        id: 'sunshangxiang_jieyin',
        name: '结姻',
        desc: '出牌阶段，若你有装备牌，可弃置1张装备牌并选择一名已损失体力的男性角色，令其回复1点体力。',
        triggered: false,
      },
      {
        id: 'sunshangxiang_xiaoji',
        name: '枭姬',
        desc: '当你失去装备区的一张牌后，可摸一张牌。',
        triggered: false,
      },
    ],
  },

  // ===== 群雄 =====
  {
    id: 'lvbu',
    name: '吕布',
    nation: 'qun',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#cc6600',
    desc: '飞将，天下第一猛将',
    skills: [
      {
        id: 'lvbu_wushuang',
        name: '无双',
        desc: '锁定技，你使用的杀需要两张闪抵消；与你进行决斗的角色每次需打出两张杀。',
        triggered: false,
      },
    ],
  },
  {
    id: 'diaochan',
    name: '貂蝉',
    nation: 'qun',
    hp: 3,
    maxHp: 3,
    gender: 'female',
    color: '#cc6600',
    desc: '闭月，吕布之妻',
    skills: [
      {
        id: 'diaochon_liyu',
        name: '离间',
        desc: '出牌阶段限一次，你可弃置1张牌，选择两名其他男性角色，令其进行决斗。',
        triggered: true,
      },
      {
        id: 'diaochon_biyue',
        name: '闭月',
        desc: '回合结束阶段，可摸一张牌。',
        triggered: false,
      },
    ],
  },
  {
    id: 'huangyueying',
    name: '黄月英',
    nation: 'qun',
    hp: 3,
    maxHp: 3,
    gender: 'female',
    color: '#cc6600',
    desc: '蜀中才女，奇谋妙算',
    skills: [
      {
        id: 'huangyueying_jiyuan',
        name: '集智',
        desc: '当你使用锦囊牌时，可摸一张牌。',
        triggered: false,
        onUseCard: (playerId, cardId, game) => {
          const cardDef = (game as any).deckData?.find((c: any) => c.id === cardId);
          if (cardDef?.type === 'trick') return true; // 触发摸牌
          return false;
        },
      },
      {
        id: 'huangyueying_qicai',
        name: '奇才',
        desc: '你使用锦囊牌无距离限制。',
        triggered: false,
      },
    ],
  },

  // ===== 吴国 =====
  {
    id: 'sunquan',
    name: '孙权',
    nation: 'wu',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#ffcc00',
    desc: '东吴之主，知人善任',
    skills: [
      {
        id: 'sunquan_jiuyuan',
        name: '救援',
        desc: '吴势力角色对你使用桃时，其摸一张牌。',
        triggered: true,
      },
    ],
  },
  {
    id: 'luxun',
    name: '陆逊',
    nation: 'wu',
    hp: 3,
    maxHp: 3,
    gender: 'male',
    color: '#ffcc00',
    desc: '东吴大都督，儒将风范',
    skills: [
      {
        id: 'luxun_qianxin',
        name: '谦逊',
        desc: '锁定技，你不能被横置，且不能成为延时类锦囊的目标。',
        triggered: false,
      },
      {
        id: 'luxun_duoshi',
        name: '度势',
        desc: '出牌阶段限一次，你可以将一张红色牌当火攻使用。',
        triggered: false,
      },
    ],
  },
  {
    id: 'ganning',
    name: '甘宁',
    nation: 'wu',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#ffcc00',
    desc: '东吴猛将，劫营夜袭',
    skills: [
      {
        id: 'ganning_qixi',
        name: '奇袭',
        desc: '出牌阶段，你可以将任意黑色牌当过河拆桥使用。',
        triggered: false,
      },
    ],
  },
  {
    id: 'lvmeng',
    name: '吕蒙',
    nation: 'wu',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#ffcc00',
    desc: '东吴上将，士别三日',
    skills: [
      {
        id: 'lvmeng_keji',
        name: '克己',
        desc: '若你未损失体力，你可以跳过出牌阶段。',
        triggered: false,
      },
    ],
  },
  {
    id: 'daqiao',
    name: '大乔',
    nation: 'wu',
    hp: 3,
    maxHp: 3,
    gender: 'female',
    color: '#ffcc00',
    desc: '江东美女，国色天香',
    skills: [
      {
        id: 'daqiao_guose',
        name: '国色',
        desc: '出牌阶段，你可将任意方块牌当乐不思蜀使用。',
        triggered: false,
      },
      {
        id: 'daqiao_liuli',
        name: '流离',
        desc: '当你成为杀的目标时，可弃置一张牌并转移此杀给任意一名其他角色。',
        triggered: true,
      },
    ],
  },
  {
    id: 'zhouatai',
    name: '周泰',
    nation: 'wu',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#ffcc00',
    desc: '东吴忠勇，不屈不挠',
    skills: [
      {
        id: 'zhouatai_buqu',
        name: '不屈',
        desc: '当你扣减体力至0时，可将任意数量的手牌置于牌堆顶，使体力回复至1，每回合限一次。',
        triggered: true,
      },
    ],
  },

  // ===== 群雄 =====
  {
    id: 'huatuo',
    name: '华佗',
    nation: 'qun',
    hp: 3,
    maxHp: 3,
    gender: 'male',
    color: '#cc6600',
    desc: '神医妙手，悬壶济世',
    skills: [
      {
        id: 'huatuo_qianxin',
        name: '急救',
        desc: '你的回合外，你可以将任意红色牌当桃使用。',
        triggered: false,
      },
      {
        id: 'huatuo_chonglai',
        name: '青囊',
        desc: '出牌阶段限一次，你可弃置一张牌并选择一名已损失体力的角色，令其回复1点体力。',
        triggered: false,
      },
    ],
  },
  {
    id: 'yuanshao',
    name: '袁绍',
    nation: 'qun',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#cc6600',
    desc: '河北霸主，四世三公',
    skills: [
      {
        id: 'yuanshao_luanji',
        name: '乱击',
        desc: '出牌阶段，你可将任意两张相同花色的牌当万箭齐发使用。',
        triggered: false,
      },
    ],
  },
  {
    id: 'yanliangwenchou',
    name: '颜良文丑',
    nation: 'qun',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#cc6600',
    desc: '河北双雄，勇冠三军',
    skills: [
      {
        id: 'yanliangwenchou_wuji',
        name: '武继',
        desc: '出牌阶段，你可失去1点体力，视为使用一张决斗；当你因决斗杀死角色时，可回复1点体力。',
        triggered: false,
      },
    ],
  },
  {
    id: 'caiwenji',
    name: '蔡文姬',
    nation: 'qun',
    hp: 3,
    maxHp: 3,
    gender: 'female',
    color: '#cc6600',
    desc: '乱世才女，胡笳悲音',
    skills: [
      {
        id: 'caiwenji_beige',
        name: '悲歌',
        desc: '当一名角色死亡时，你可令其选择一项：弃置一张牌，或失去1点体力。',
        triggered: true,
      },
      {
        id: 'caiwenji_dufu',
        name: '断肠',
        desc: '锁定技，当你死亡时，所有角色弃置所有手牌。',
        triggered: false,
      },
    ],
  },
  {
    id: 'zuoci',
    name: '左慈',
    nation: 'qun',
    hp: 3,
    maxHp: 3,
    gender: 'male',
    color: '#cc6600',
    desc: '仙人方士，幻化无穷',
    skills: [
      {
        id: 'zuoci_xianhua',
        name: '化身',
        desc: '游戏开始时，你随机获得一个武将的技能直到游戏结束。',
        triggered: false,
      },
      {
        id: 'zuoci_qicai',
        name: '奇才',
        desc: '你使用锦囊牌无距离限制。',
        triggered: false,
      },
    ],
  },

  // ===== 蜀国新增 =====
  {
    id: 'zhaoyun',
    name: '赵云',
    nation: 'shu',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#00cc66',
    desc: '五虎上将之一，常山赵子龙',
    skills: [
      {
        id: 'zhaoyun_longdan',
        name: '龙胆',
        desc: '你可以将任意杀当闪使用，或将任意闪当杀使用。',
        triggered: false,
      },
    ],
  },
  {
    id: 'zhugeliang',
    name: '诸葛亮',
    nation: 'shu',
    hp: 3,
    maxHp: 3,
    gender: 'male',
    color: '#00cc66',
    desc: '蜀汉丞相，足智多谋',
    skills: [
      {
        id: 'zhugeliang_guanxing',
        name: '观星',
        desc: '回合开始阶段，你可以观看牌堆顶的X张牌（X为存活角色数且最多为5），将其中任意数量的牌以任意顺序放置于牌堆顶或牌堆底。',
        triggered: false,
      },
      {
        id: 'zhugeliang_bagua',
        name: '八阵',
        desc: '锁定技，若你的装备区没有防具牌，你视为装备着八卦阵。',
        triggered: false,
      },
    ],
  },
  {
    id: 'machao',
    name: '马超',
    nation: 'shu',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#00cc66',
    desc: '五虎上将之一，西凉马超',
    skills: [
      {
        id: 'machao_tieji',
        name: '铁骑',
        desc: '当你使用杀指定一名角色时，可进行判定，若结果为红色，此杀不可被闪避。',
        triggered: true,
      },
    ],
  },
  {
    id: 'weiyan',
    name: '魏延',
    nation: 'shu',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#00cc66',
    desc: '蜀汉名将，善养兵马',
    skills: [
      {
        id: 'weiyan_qimou',
        name: '奇谋',
        desc: '出牌阶段，可失去1点体力，视为使用一张杀。此杀不计入出牌阶段使用次数限制。',
        triggered: false,
      },
    ],
  },

  // ===== 魏国新增 =====
  {
    id: 'simayi',
    name: '司马懿',
    nation: 'wei',
    hp: 3,
    maxHp: 3,
    gender: 'male',
    color: '#4488ff',
    desc: '魏国太尉，冢虎',
    skills: [
      {
        id: 'simayi_fankui',
        name: '反馈',
        desc: '当你受到伤害时，你可获得伤害来源的一张牌。',
        triggered: true,
        onHurt: (targetId, damage, game) => {
          // 反馈：受到伤害时获得伤害来源的一张牌
          // 需要在伤害处理时获取来源信息
          return { damage, game };
        },
      },
      {
        id: 'simayi_guixin',
        name: '归心',
        desc: '回合结束阶段，可获得每名其他角色区域的一张牌。',
        triggered: false,
      },
    ],
  },
  {
    id: 'xiahouchun',
    name: '夏侯惇',
    nation: 'wei',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#4488ff',
    desc: '魏国宗室，虎侯',
    skills: [
      {
        id: 'xiahouchun_ganglie',
        name: '刚烈',
        desc: '当你受到伤害时，可进行判定，若结果为红色，伤害来源弃置一张牌；若结果为黑色，伤害来源失去1点体力。',
        triggered: true,
      },
    ],
  },
  {
    id: 'zhangliao',
    name: '张辽',
    nation: 'wei',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#4488ff',
    desc: '魏国名将，五子良将',
    skills: [
      {
        id: 'zhangliao_tuqi',
        name: '突袭',
        desc: '回合开始阶段，可跳过摸牌阶段，获得两名相邻角色各一张手牌。',
        triggered: false,
      },
    ],
  },
  {
    id: 'caoren',
    name: '曹仁',
    nation: 'wei',
    hp: 4,
    maxHp: 4,
    gender: 'male',
    color: '#4488ff',
    desc: '魏国名将，守城名将',
    skills: [
      {
        id: 'caoren_jushou',
        name: '据守',
        desc: '回合结束阶段，可翻面并摸四张牌。',
        triggered: false,
      },
    ],
  },
  {
    id: 'guojia',
    name: '郭嘉',
    nation: 'wei',
    hp: 3,
    maxHp: 3,
    gender: 'male',
    color: '#4488ff',
    desc: '魏国谋士，司马徽弟子，多智近妖',
    skills: [
      {
        id: 'guojia_tianyi',
        name: '天义',
        desc: '出牌阶段限一次，可弃置一张牌，然后与一名角色拼点，若赢，你本回合内攻击范围增加且可额外使用一张杀。',
        triggered: false,
      },
      {
        id: 'guojia_yiji',
        name: '遗计',
        desc: '当你受到伤害后，可观看牌堆顶的两张牌，将其中一张交给一名角色，另一张交给另一名角色。',
        triggered: false,
        onHurt: (targetId, damage, game) => {
          // 遗计：受到伤害后，分牌给自己和一名角色各1张
          // 实际实现在伤害处理时调用
          return { damage, game };
        },
      },
    ],
  },
  {
    id: 'zhenji',
    name: '甄姬',
    nation: 'wei',
    hp: 3,
    maxHp: 3,
    gender: 'female',
    color: '#4488ff',
    desc: '魏文昭皇后，洛神',
    skills: [
      {
        id: 'zhenji_luoshen',
        name: '洛神',
        desc: '回合开始阶段，可进行判定，若结果为黑色，获得此牌并可再次判定，直到出现红色为止。',
        triggered: false,
      },
      {
        id: 'zhenji_gupo',
        name: '骨牌',
        desc: '当你使用锦囊牌时，可弃置一张手牌，视为使用一张无距离限制的杀。',
        triggered: false,
      },
    ],
  },
// ===== 魏国 =====
{
  id: 'zhangliao',
  name: '张辽',
  nation: 'wei',
  hp: 4,
  maxHp: 4,
  gender: 'male',
  color: '#4488ff',
  desc: '五子良将，威震逍遥津',
  skills: [
    {
      id: 'zhangliao_tuxi',
      name: '突袭',
      desc: '摸牌阶段，你可以放弃摸牌，改为获得至多两名其他角色的各一张手牌。',
      triggered: false,
    },
  ],
},
{
  id: 'xiahouchang',
  name: '夏侯惇',
  nation: 'wei',
  hp: 4,
  maxHp: 4,
  gender: 'male',
  color: '#4488ff',
  desc: '独眼将军，刚烈不屈',
  skills: [
    {
      id: 'xiahouchang_ganglie',
      name: '刚烈',
      desc: '当你受到伤害时，进行判定，若结果为红色，伤害来源需要弃两张牌或失去1点体力。',
      triggered: false,
      onHurt: (targetId, damage, game) => {
        if (damage <= 0) return { damage, game };
        const g = deepClone(game);
        const source = g.players.find(p => p.id === game.lastDamageSource);
        if (source && source.alive) {
          const judgeCard = g.deck.pop()!;
          g.discard.push(judgeCard);
          const card = getCardById(judgeCard, g.deckData || []);
          if (card && (card.suit === 'heart' || card.suit === 'diamond')) {
            // 红色判定，伤害来源弃牌或失去体力
            if (source.hand.length >= 2) {
              g.discard.push(...source.hand.slice(0, 2));
              source.hand = source.hand.slice(2);
            } else {
              source.hp = Math.max(0, source.hp - 1);
            }
            g.logs.push(`${source.name}受到刚烈影响，弃两张牌或失去1点体力。`);
          }
        }
        return { damage, game: g };
      },
    },
  ],
},
{
  id: 'xiahouyuan',
  name: '夏侯渊',
  nation: 'wei',
  hp: 4,
  maxHp: 4,
  gender: 'male',
  color: '#4488ff',
  desc: '虎步关右，神速过人',
  skills: [
    {
      id: 'xiahouyuan_sunsu',
      name: '神速',
      desc: '回合开始阶段，你可以依次跳过判定阶段和摸牌阶段，视为使用了一张无距离限制的杀。',
      triggered: false,
    },
  ],
},
{
  id: 'caoren',
  name: '曹仁',
  nation: 'wei',
  hp: 4,
  maxHp: 4,
  gender: 'male',
  color: '#4488ff',
  desc: '据守待攻，八门金锁',
  skills: [
    {
      id: 'caoren_jushou',
      name: '据守',
      desc: '回合结束阶段，你可以翻面，然后跳过下一个回合。',
      triggered: false,
    },
  ],
},
{
  id: 'simayi',
  name: '司马懿',
  nation: 'wei',
  hp: 3,
  maxHp: 3,
  gender: 'male',
  color: '#4488ff',
  desc: '冢虎，鹰视狼顾',
  skills: [
    {
      id: 'simayi_fankui',
      name: '反馈',
      desc: '当你受到伤害时，可获得伤害来源的一张手牌。',
      triggered: false,
      onHurt: (targetId, damage, game) => {
        if (damage <= 0) return { damage, game };
        const g = deepClone(game);
        const source = g.players.find(p => p.id === game.lastDamageSource);
        if (source && source.alive && source.hand.length > 0) {
          const cardId = source.hand[Math.floor(Math.random() * source.hand.length)];
          const idx = source.hand.indexOf(cardId);
          if (idx >= 0) {
            source.hand.splice(idx, 1);
            g.players.find(p => p.id === targetId)?.hand.push(cardId);
            g.logs.push(`司马懿发动反馈，获得${source.name}一张手牌。`);
          }
        }
        return { damage, game: g };
      },
    },
    {
      id: 'simayi_guicai',
      name: '鬼才',
      desc: '当一名角色进行判定时，你可以弃一张牌，改变其判定结果。',
      triggered: false,
    },
  ],
},
// ===== 蜀国 =====
{
  id: 'zhaoyun',
  name: '赵云',
  nation: 'shu',
  hp: 4,
  maxHp: 4,
  gender: 'male',
  color: '#00cc66',
  desc: '常山赵子龙，一身是胆',
  skills: [
    {
      id: 'zhaoyun_longdan',
      name: '龙胆',
      desc: '你可以将杀当闪、闪当杀使用或打出。',
      triggered: false,
    },
  ],
},
{
  id: 'huangzhong',
  name: '黄忠',
  nation: 'shu',
  hp: 4,
  maxHp: 4,
  gender: 'male',
  color: '#00cc66',
  desc: '老当益壮，百步穿杨',
  skills: [
    {
      id: 'huangzhong_liegong',
      name: '烈弓',
      desc: '你的攻击范围+1；当你使用杀指定目标后，若你的手牌数<=目标的手牌数，杀的伤害+1。',
      triggered: false,
    },
  ],
},
{
  id: 'weiyan',
  name: '魏延',
  nation: 'shu',
  hp: 4,
  maxHp: 4,
  gender: 'male',
  color: '#00cc66',
  desc: '蜀中上将，狂骨伤人',
  skills: [
    {
      id: 'weiyan_kuanggu',
      name: '狂骨',
      desc: '当你对其他角色造成伤害后，若你与该角色的距离<=1，可以回复1点体力或摸一张牌。',
      triggered: false,
    },
  ],
},
{
  id: 'guiping',
  name: '关平',
  nation: 'shu',
  hp: 4,
  maxHp: 4,
  gender: 'male',
  color: '#00cc66',
  desc: '关平，武圣之子',
  skills: [
    {
      id: 'guiping_linjie',
      name: '凛节',
      desc: '出牌阶段开始时，可以展示一张手牌并指定一名其他角色，该角色本回合使用杀时必须弃置一张与你展示牌花色相同的牌。',
      triggered: false,
    },
  ],
},
{
  id: 'zhurike',
  name: '诸葛亮',
  nation: 'shu',
  hp: 3,
  maxHp: 3,
  gender: 'male',
  color: '#00cc66',
  desc: '卧龙先生，智慧化身',
  skills: [
    {
      id: 'zhurike_kongcheng',
      name: '空城',
      desc: '当你没有手牌时，不能成为杀和决斗的目标。',
      triggered: false,
    },
    {
      id: 'zhurike_guanxing',
      name: '观星',
      desc: '回合开始阶段，你可以观看牌堆顶的X张牌（X为存活角色数），将其中任意张以任意顺序放置于牌堆顶或牌堆底。',
      triggered: false,
    },
  ],
},
// ===== 吴国 =====
{
  id: 'zhouyu',
  name: '周瑜',
  nation: 'wu',
  hp: 4,
  maxHp: 4,
  gender: 'male',
  color: '#ffcc00',
  desc: '江东周郎，美姿颜',
  skills: [
    {
      id: 'zhouyu_yingzi',
      name: '英姿',
      desc: '摸牌阶段，多摸一张牌。',
      triggered: false,
    },
    {
      id: 'zhouyu_fanjian',
      name: '反间',
      desc: '出牌阶段，可以令一名其他角色选择一种花色，然后获得该角色一张手牌并亮出。',
      triggered: false,
    },
  ],
},
{
  id: 'luxun',
  name: '陆逊',
  nation: 'wu',
  hp: 3,
  maxHp: 3,
  gender: 'male',
  color: '#ffcc00',
  desc: '江东陆郎，连营火烧',
  skills: [
    {
      id: 'luxun_qianxun',
      name: '谦逊',
      desc: '不能被顺手牵羊。',
      triggered: false,
    },
    {
      id: 'luxun_lianying',
      name: '连营',
      desc: '当你失去最后一张手牌时，可以摸一张牌。',
      triggered: false,
    },
  ],
},
{
  id: 'ganning',
  name: '甘宁',
  nation: 'wu',
  hp: 4,
  maxHp: 4,
  gender: 'male',
  color: '#ffcc00',
  desc: '锦帆贼，奇袭断粮',
  skills: [
    {
      id: 'ganning_qinxi',
      name: '奇袭',
      desc: '出牌阶段，可以将任意张黑色手牌当过河拆桥使用。',
      triggered: false,
    },
  ],
},
{
  id: 'huanggai',
  name: '黄盖',
  nation: 'wu',
  hp: 4,
  maxHp: 4,
  gender: 'male',
  color: '#ffcc00',
  desc: '东吴老将，苦肉诈降',
  skills: [
    {
      id: 'huanggai_kurou',
      name: '苦肉',
      desc: '出牌阶段，可以失去1点体力，然后摸两张牌。',
      triggered: false,
    },
  ],
},
{
  id: 'lusu',
  name: '鲁肃',
  nation: 'wu',
  hp: 3,
  maxHp: 3,
  gender: 'male',
  color: '#ffcc00',
  desc: '江东英豪，缔盟大师',
  skills: [
    {
      id: 'lusu_dimeng',
      name: '缔盟',
      desc: '出牌阶段，可以与一名其他角色交换手牌（数量可以不同）。',
      triggered: false,
    },
  ],
},
{
  id: 'taishici',
  name: '太史慈',
  nation: 'wu',
  hp: 4,
  maxHp: 4,
  gender: 'male',
  color: '#ffcc00',
  desc: '东莱太史慈，北海相',
  skills: [
    {
      id: 'taishici_tianyi',
      name: '天义',
      desc: '出牌阶段，可以与一名角色拼点，若赢，本回合攻击范围无限且使用杀无次数限制。',
      triggered: false,
    },
  ],
},
{
  id: 'lvmen',
  name: '吕蒙',
  nation: 'wu',
  hp: 4,
  maxHp: 4,
  gender: 'male',
  color: '#ffcc00',
  desc: '白衣渡江，士别三日',
  skills: [
    {
      id: 'lvmen_keji',
      name: '克己',
      desc: '若你未于出牌阶段使用过杀，可以跳过弃牌阶段。',
      triggered: false,
    },
  ],
},
{
  id: 'daqiao',
  name: '大乔',
  nation: 'wu',
  hp: 3,
  maxHp: 3,
  gender: 'female',
  color: '#ffcc00',
  desc: '江东二乔，吴宫绝色',
  skills: [
    {
      id: 'daqiao_guose',
      name: '国色',
      desc: '可以将方块当桃使用。',
      triggered: false,
    },
    {
      id: 'daqiao_liuli',
      name: '流离',
      desc: '当你成为杀的目标时，可以将杀转移给你攻击范围内的另一名角色（不含来源）。',
      triggered: false,
    },
  ],
},
{
  id: 'xiaoqiao',
  name: '小乔',
  nation: 'wu',
  hp: 3,
  maxHp: 3,
  gender: 'female',
  color: '#ffcc00',
  desc: '江东二乔，吴宫绝色',
  skills: [
    {
      id: 'xiaoqiao_tianxiang',
      name: '天香',
      desc: '当你受到伤害时，可以将伤害转移给你攻击范围内的一名其他角色。',
      triggered: false,
    },
  ],
},
{
  id: 'sunshangxiang',
  name: '孙尚香',
  nation: 'wu',
  hp: 3,
  maxHp: 3,
  gender: 'female',
  color: '#ffcc00',
  desc: '郡主，吴楚英豪',
  skills: [
    {
      id: 'sunshangxiang_xiaoji',
      name: '枭姬',
      desc: '当你失去装备区的一张牌后，可以摸一张牌。',
      triggered: false,
    },
    {
      id: 'sunshangxiang_jieyin',
      name: '结姻',
      desc: '出牌阶段，可以弃两张牌并选择一名男性角色，分别对你们各造成1点伤害，然后你们各回复1点体力。',
      triggered: false,
    },
  ],
},
// ===== 群雄 =====
{
  id: 'lvbu',
  name: '吕布',
  nation: 'qun',
  hp: 5,
  maxHp: 5,
  gender: 'male',
  color: '#cc6600',
  desc: '人中吕布，马中赤兔',
  skills: [
    {
      id: 'lvbu_wushuang',
      name: '无双',
      desc: '锁定技，所有杀需要两张闪才能抵消；与你进行决斗的角色每次需要连续打出两张杀。',
      triggered: false,
    },
  ],
},
{
  id: 'dongzhuo',
  name: '董卓',
  nation: 'qun',
  hp: 8,
  maxHp: 8,
  gender: 'male',
  color: '#cc6600',
  desc: '汉末奸雄，酒池肉林',
  skills: [
    {
      id: 'dongzhuo_baoling',
      name: '暴凌',
      desc: '锁定技，回合开始时，你增加1点体力上限并回复1点体力。',
      triggered: false,
    },
    {
      id: 'dongzhuo_benghuai',
      name: '崩坏',
      desc: '锁定技，回合结束阶段，若你没有装备防具且已受伤，你须减1点体力。',
      triggered: false,
    },
    {
      id: 'dongzhuo_jiuchi',
      name: '酒池',
      desc: '你可将一张黑色手牌当酒使用。',
      triggered: false,
    },
  ],
},
{
  id: 'jiaxu',
  name: '贾诩',
  nation: 'qun',
  hp: 3,
  maxHp: 3,
  gender: 'male',
  color: '#cc6600',
  desc: '毒士，谋无遗策',
  skills: [
    {
      id: 'jiaxu_weimu',
      name: '帷幕',
      desc: '你不能成为锦囊牌的目标。',
      triggered: false,
    },
    {
      id: 'jiaxu_moui',
      name: '谋识',
      desc: '出牌阶段，若你的手牌数大于你的体力值，你可以将一张手牌交给一名其他角色，然后对另一名其他角色造成1点伤害。',
      triggered: false,
    },
  ],
},
];

export const NATION_COLORS: Record<string, string> = {
  shu: '#00cc66',
  wei: '#4488ff',
  wu: '#ffcc00',
  qun: '#cc6600',
};

export const NATION_NAMES: Record<string, string> = {
  shu: '蜀',
  wei: '魏',
  wu: '吴',
  qun: '群',
};

export function getGeneralById(id: string): General | undefined {
  return ALL_GENERALS.find(g => g.id === id);
}
