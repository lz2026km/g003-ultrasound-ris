/**
 * 超声检查协议库（30+ 协议）
 * @version v0.17.0
 * 对标开立 SonoAssistant
 */

export const ULTRASOUND_PROTOCOLS = [
  // 腹部
  { id: 'P001', name: '甲状腺常规超声', category: '浅表器官', probe: '线阵 L9-3', frequency: '5-10MHz', depth: 4, gain: 65, presets: ['甲状腺'], measurements: ['甲状腺长径', '甲状腺宽径', '甲状腺厚径', '峡部厚度', '结节大小'], indications: '甲状腺疾病筛查、结节评估' },
  { id: 'P002', name: '颈部淋巴结', category: '浅表器官', probe: '线阵 L9-3', frequency: '5-10MHz', depth: 4, gain: 60, presets: ['浅表'], measurements: ['淋巴结长径', '淋巴结宽径', '纵横比'], indications: '淋巴结肿大、肿瘤分期' },
  { id: 'P003', name: '乳腺常规', category: '浅表器官', probe: '线阵 L9-3', frequency: '5-12MHz', depth: 4, gain: 60, presets: ['乳腺'], measurements: ['肿块大小', '纵横比', '血流分级'], indications: '乳腺肿块、筛查' },
  { id: 'P004', name: '腹部常规', category: '腹部', probe: '凸阵 C5-2', frequency: '2-5MHz', depth: 15, gain: 70, presets: ['腹部'], measurements: ['肝脏大小', '胆囊', '脾脏', '肾脏'], indications: '腹痛、肝胆疾病筛查' },
  { id: 'P005', name: '肝脏专项', category: '腹部', probe: '凸阵 C5-2', frequency: '2-5MHz', depth: 18, gain: 75, presets: ['肝脏'], measurements: ['肝脏各径', '门脉内径', '肝静脉'], indications: '肝脏占位、肝硬化' },
  { id: 'P006', name: '胆道系统', category: '腹部', probe: '凸阵 C5-2', frequency: '2-5MHz', depth: 12, gain: 70, presets: ['胆道'], measurements: ['胆囊大小', '胆总管内径', '胆囊壁厚度'], indications: '胆囊结石、胆道梗阻' },
  { id: 'P007', name: '泌尿系统', category: '腹部', probe: '凸阵 C5-2', frequency: '2-5MHz', depth: 15, gain: 70, presets: ['泌尿'], measurements: ['肾脏长径', '肾盂分离', '膀胱容量'], indications: '肾结石、肾积水' },
  { id: 'P008', name: '妇产科-子宫附件', category: '妇产', probe: '腔内/凸阵', frequency: '3-7MHz', depth: 10, gain: 65, presets: ['妇科'], measurements: ['子宫大小', '内膜厚度', '卵巢大小'], indications: '妇科疾病、肿瘤筛查' },
  { id: 'P009', name: '产科-胎儿生长', category: '妇产', probe: '凸阵 C5-2', frequency: '2-5MHz', depth: 20, gain: 70, presets: ['产科'], measurements: ['双顶径BPD', '头围HC', '腹围AC', '股骨长FL'], indications: '胎儿生长评估' },
  { id: 'P010', name: '产科-胎儿心脏', category: '妇产', probe: '扇阵', frequency: '3-5MHz', depth: 15, gain: 60, presets: ['胎儿心'], measurements: ['心胸比', '四腔心切面'], indications: '胎儿心脏畸形筛查' },
  // 心脏
  { id: 'P011', name: '心脏常规-经胸', category: '心脏', probe: '相控阵 S5-1', frequency: '2-4MHz', depth: 16, gain: 60, presets: ['心脏'], measurements: ['LVIDd', 'LVIDs', 'EF', 'FS', 'E/A'], indications: '心脏功能评估、瓣膜病' },
  { id: 'P012', name: '心脏-胸骨旁长轴', category: '心脏', probe: '相控阵 S5-1', frequency: '2-4MHz', depth: 16, gain: 60, presets: ['心PLAX'], measurements: ['LVIDd', 'LVPWd', 'IVSd', '主动脉根部'], indications: '左室功能、瓣膜评估' },
  { id: 'P013', name: '心脏-心尖四腔心', category: '心脏', probe: '相控阵 S5-1', frequency: '2-4MHz', depth: 20, gain: 60, presets: ['心A4C'], measurements: ['LVEF', 'TAPSE', '二尖瓣E/A'], indications: '心功能、瓣膜反流' },
  // 血管
  { id: 'P014', name: '颈动脉', category: '血管', probe: '线阵 L9-3', frequency: '5-10MHz', depth: 4, gain: 60, presets: ['血管'], measurements: ['IMT', '斑块大小', '狭窄率', 'PSV', 'EDV'], indications: '颈动脉斑块、狭窄评估' },
  { id: 'P015', name: '椎动脉', category: '血管', probe: '线阵 L9-3', frequency: '5-10MHz', depth: 4, gain: 60, presets: ['血管'], measurements: ['椎动脉内径', 'PSV', 'EDV'], indications: '后循环缺血、眩晕' },
  { id: 'P016', name: '下肢动脉', category: '血管', probe: '线阵 L9-3', frequency: '5-10MHz', depth: 5, gain: 60, presets: ['血管'], measurements: ['PSV', 'ABI', '狭窄率'], indications: '下肢动脉硬化、闭塞' },
  { id: 'P017', name: '下肢静脉', category: '血管', probe: '线阵 L9-3', frequency: '5-10MHz', depth: 5, gain: 60, presets: ['血管'], measurements: ['静脉内径', '血流速度', '反流时间'], indications: 'DVT、静脉曲张' },
  // 浅表其他
  { id: 'P018', name: '阴囊/睾丸', category: '浅表器官', probe: '线阵 L9-3', frequency: '5-12MHz', depth: 5, gain: 60, presets: ['浅表'], measurements: ['睾丸大小', '附睾', '精索静脉'], indications: '睾丸肿瘤、鞘膜积液' },
  { id: 'P019', name: '肌骨-肩关节', category: '肌骨', probe: '线阵 L9-3', frequency: '5-12MHz', depth: 5, gain: 60, presets: ['肌骨'], measurements: ['肌腱厚度', '滑囊'], indications: '肩袖损伤、肩周炎' },
  { id: 'P020', name: '肌骨-膝关节', category: '肌骨', probe: '线阵 L9-3', frequency: '5-12MHz', depth: 5, gain: 60, presets: ['肌骨'], measurements: ['关节积液', '半月板'], indications: '关节积液、半月板损伤' },
  { id: 'P021', name: '眼超声', category: '浅表器官', probe: '专用小探头', frequency: '10MHz', depth: 3, gain: 70, presets: ['眼科'], measurements: ['眼球轴径', '视网膜'], indications: '眼内疾病、异物' },
  // 急诊
  { id: 'P022', name: 'FAST-急诊', category: '急诊', probe: '凸阵 C5-2', frequency: '2-5MHz', depth: 18, gain: 70, presets: ['急诊'], measurements: ['肝周', '脾周', '盆腔'], indications: '腹部外伤快速评估' },
  { id: 'P023', name: '床旁-肺部', category: '急诊', probe: '凸阵 C5-2', frequency: '2-5MHz', depth: 12, gain: 65, presets: ['肺部'], measurements: ['B线', 'A线', '胸膜'], indications: '肺炎、气胸、肺水肿' },
  // 儿科
  { id: 'P024', name: '小儿髋关节', category: '儿科', probe: '线阵 L9-3', frequency: '5-10MHz', depth: 5, gain: 60, presets: ['儿科'], measurements: ['α角', 'β角', '髋臼覆盖率'], indications: '发育性髋关节发育不良' },
  { id: 'P025', name: '小儿颅脑', category: '儿科', probe: '扇阵', frequency: '3-5MHz', depth: 8, gain: 60, presets: ['儿科'], measurements: ['侧脑室', '第三脑室'], indications: '颅内出血、脑积水' },
  // 介入
  { id: 'P026', name: '超声引导-穿刺', category: '介入', probe: '凸阵/线阵', frequency: '2-7MHz', depth: 10, gain: 65, presets: ['介入'], measurements: ['目标病灶', '进针角度'], indications: '组织活检、囊肿穿刺' },
  { id: 'P027', name: '超声引导-置管', category: '介入', probe: '凸阵/线阵', frequency: '2-7MHz', depth: 10, gain: 65, presets: ['介入'], measurements: ['积液深度', '导管位置'], indications: 'PICC、胸腔/腹腔置管' },
  // 造影
  { id: 'P028', name: '超声造影-肝脏', category: '造影', probe: '凸阵 C5-2', frequency: '2-5MHz', depth: 16, gain: 75, presets: ['造影'], measurements: ['增强时相', '廓清时间'], indications: '肝脏占位定性' },
  { id: 'P029', name: '弹性成像-甲状腺', category: '弹性', probe: '线阵 L9-3', frequency: '5-10MHz', depth: 4, gain: 65, presets: ['弹性'], measurements: ['弹性模量', 'Emean', 'SR'], indications: '甲状腺结节良恶性鉴别' },
  { id: 'P030', name: '弹性成像-肝脏', category: '弹性', probe: '凸阵 C5-2', frequency: '2-5MHz', depth: 12, gain: 70, presets: ['弹性'], measurements: ['LSM', 'CAP', '硬度评分'], indications: '肝纤维化、脂肪肝定量' },
]
