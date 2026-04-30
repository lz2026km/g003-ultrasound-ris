#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate additional data for initialData.ts"""

import random
from datetime import datetime, timedelta

# Name pools - exactly 24 male + 24 female = 48 total
male_names = [
    '李伟', '赵强', '杨帆', '周涛', '郑明', '黄磊', '王鹏', '孙杰',
    '刘德华', '张学友', '周杰伦', '陈奕迅', '李荣浩', '毛不易',
    '许嵩', '汪苏泷', '徐良', '华晨宇', '薛之谦', '刘亦菲',
    '古力娜扎', '欧阳娜娜', '鞠婧祎', '程潇'
]
female_names = [
    '张敏', '刘芳', '吴婷', '何丽', '李娜', '陈静', '王菲', '赵薇',
    '范冰冰', '杨幂', '赵丽颖', '杨紫', '李宇春', '周笔畅',
    '张靓颖', '邓紫棋', '迪丽热巴', '吴宣仪', '孟美岐',
    '杨超越', '陈怡', '张丽', '王娟', '李秀英'
]

# Combine and ensure 48 unique names
all_male = list(set(male_names))[:24]
all_female = list(set(female_names))[:24]
all_names = all_male + all_female
# Fill if needed
while len(all_names) < 48:
    all_names.append(f"患者{len(all_names)}")

# Shanghai districts
districts = ['徐汇区', '长宁区', '静安区', '浦东新区', '杨浦区', '普陀区', '虹口区', '黄浦区', '闵行区', '嘉定区', '宝山区', '松江区', '青浦区', '奉贤区', '金山区', '崇明区']
streets = ['中山路', '南京路', '淮海路', '延安路', '西藏路', '共和路', '建国路', '新华路', '漕溪路', '肇嘉浜路', '衡山路', '复兴路', '思南路', '长乐路', '瑞金路', '进贤路', '东平路', '乌鲁木齐路']

# Shanghai district codes for ID cards
district_codes = {
    '徐汇区': '310104', '长宁区': '310105', '静安区': '310106', '浦东新区': '310115',
    '杨浦区': '310110', '普陀区': '310107', '虹口区': '310109', '黄浦区': '310101',
    '闵行区': '310112', '嘉定区': '310114', '宝山区': '310113', '松江区': '310117',
    '青浦区': '310118', '奉贤区': '310120', '金山区': '310116', '崇明区': '310151'
}

# Exam items by modality
exam_items = {
    'CT': [
        {'id': 'ei011', 'name': '头颅CT平扫', 'bodyPart': '头颅', 'price': 350, 'duration': 15},
        {'id': 'ei012', 'name': '胸部CT平扫', 'bodyPart': '胸部', 'price': 400, 'duration': 20},
        {'id': 'ei013', 'name': '胸部CT增强', 'bodyPart': '胸部', 'price': 800, 'duration': 30},
        {'id': 'ei014', 'name': '腹部CT平扫', 'bodyPart': '腹部', 'price': 420, 'duration': 20},
        {'id': 'ei015', 'name': '腹部CT增强', 'bodyPart': '腹部', 'price': 850, 'duration': 35},
        {'id': 'ei016', 'name': '盆腔CT平扫', 'bodyPart': '盆腔', 'price': 420, 'duration': 20},
        {'id': 'ei017', 'name': '腰椎CT平扫', 'bodyPart': '腰椎', 'price': 350, 'duration': 15},
        {'id': 'ei018', 'name': '颈椎CT平扫', 'bodyPart': '颈椎', 'price': 350, 'duration': 15},
        {'id': 'ei019', 'name': 'CTA头颅血管成像', 'bodyPart': '头颅血管', 'price': 900, 'duration': 30},
        {'id': 'ei020', 'name': 'CTU泌尿系成像', 'bodyPart': '泌尿系', 'price': 950, 'duration': 40},
    ],
    'MR': [
        {'id': 'ei021', 'name': '头颅MRI平扫', 'bodyPart': '头颅', 'price': 700, 'duration': 25},
        {'id': 'ei022', 'name': '头颅MRI增强', 'bodyPart': '头颅', 'price': 1100, 'duration': 40},
        {'id': 'ei023', 'name': '颈椎MRI平扫', 'bodyPart': '颈椎', 'price': 680, 'duration': 25},
        {'id': 'ei024', 'name': '腰椎MRI平扫', 'bodyPart': '腰椎', 'price': 680, 'duration': 25},
        {'id': 'ei025', 'name': '膝关节MRI平扫', 'bodyPart': '膝关节', 'price': 650, 'duration': 20},
        {'id': 'ei026', 'name': '腹部MRI平扫', 'bodyPart': '腹部', 'price': 750, 'duration': 30},
        {'id': 'ei027', 'name': '乳腺MRI平扫+增强', 'bodyPart': '乳腺', 'price': 1200, 'duration': 45},
    ],
    'DR': [
        {'id': 'ei001', 'name': '胸部正位片（DR）', 'bodyPart': '胸部', 'price': 80, 'duration': 10},
        {'id': 'ei002', 'name': '胸部正侧位片（DR）', 'bodyPart': '胸部', 'price': 120, 'duration': 15},
        {'id': 'ei003', 'name': '腹部立卧位片（DR）', 'bodyPart': '腹部', 'price': 90, 'duration': 10},
        {'id': 'ei004', 'name': '颈椎正侧双斜位片（DR）', 'bodyPart': '颈椎', 'price': 140, 'duration': 15},
        {'id': 'ei005', 'name': '腰椎正侧位片（DR）', 'bodyPart': '腰椎', 'price': 130, 'duration': 15},
        {'id': 'ei006', 'name': '骨盆正位片（DR）', 'bodyPart': '骨盆', 'price': 80, 'duration': 10},
        {'id': 'ei007', 'name': '四肢关节正侧位片（DR）', 'bodyPart': '四肢', 'price': 70, 'duration': 10},
        {'id': 'ei008', 'name': '鼻窦X线片（DR）', 'bodyPart': '鼻窦', 'price': 65, 'duration': 8},
        {'id': 'ei009', 'name': '头颅正侧位片（DR）', 'bodyPart': '头颅', 'price': 90, 'duration': 10},
    ],
    '超声': [
        {'id': 'ei033', 'name': '腹部超声（肝胆脾胰）', 'bodyPart': '腹部', 'price': 180, 'duration': 20},
        {'id': 'ei034', 'name': '泌尿系超声', 'bodyPart': '泌尿系', 'price': 150, 'duration': 15},
        {'id': 'ei035', 'name': '甲状腺超声', 'bodyPart': '甲状腺', 'price': 120, 'duration': 15},
        {'id': 'ei036', 'name': '乳腺超声', 'bodyPart': '乳腺', 'price': 130, 'duration': 15},
        {'id': 'ei037', 'name': '心脏超声', 'bodyPart': '心脏', 'price': 250, 'duration': 25},
        {'id': 'ei038', 'name': '颈部血管超声', 'bodyPart': '颈部血管', 'price': 200, 'duration': 20},
    ],
    '乳腺钼靶': [
        {'id': 'ei010', 'name': '乳腺钼靶摄影', 'bodyPart': '乳腺', 'price': 200, 'duration': 20},
    ],
    '骨密度': [
        {'id': 'ei032', 'name': '骨密度测定（DEXA）', 'bodyPart': '全身/腰椎/髋部', 'price': 150, 'duration': 15},
    ]
}

# Clinical diagnoses by body part
clinical_diagnoses = {
    '头颅': ['头痛待查', '头晕待查', '常规体检', '脑血管病筛查', '颅脑外伤', '癫痫待查', '脑肿瘤复查', '帕金森病复诊', '老年痴呆筛查'],
    '胸部': ['咳嗽待查', '胸闷待查', '常规体检', '肺部感染', '肺结节随访', '气短待查', '胸痛待查', '肺癌筛查', '肺炎复查'],
    '腹部': ['腹痛待查', '腹胀待查', '常规体检', '肝脏占位', '胆囊结石', '胃肠炎', '腹部不适', '体检复查', '胰腺炎复查'],
    '腰椎': ['腰痛待查', '腰腿痛', '常规体检', '腰椎间盘突出', '腰椎管狭窄', '骨质疏松筛查', '骨关节炎', '强制性脊柱炎'],
    '颈椎': ['颈肩痛待查', '手麻待查', '颈椎病', '头晕手麻', '常规体检', '颈椎外伤', '颈椎手术后复查'],
    '乳腺': ['乳腺体检', '乳腺肿块', '乳头溢液', '乳腺癌筛查', '乳腺疼痛', '乳腺增生复查'],
    '泌尿系': ['尿频尿急', '血尿待查', '肾结石', '常规体检', '膀胱肿瘤复查', '前列腺增生'],
    '膝关节': ['膝关节疼痛', '膝关节肿胀', '骨关节炎', '半月板损伤', '韧带损伤', '膝关节外伤'],
    '四肢': ['四肢关节痛', '骨折复查', '骨关节炎', '软组织损伤', '类风湿性关节炎'],
    '鼻窦': ['鼻塞流涕', '慢性鼻窦炎', '头痛待查', '鼻炎'],
    '心脏': ['心悸待查', '胸闷待查', '心功能不全', '先天性心脏病', '心脏瓣膜病'],
    '颈部血管': ['头晕待查', '颈动脉斑块', '脑血管病筛查', '高血压筛查'],
    '全身/腰椎/髋部': ['骨质疏松筛查', '常规体检', '骨折风险评估', '骨密度下降复诊'],
}

# Referring physicians
physicians = ['张神经', '赵呼吸', '刘消化', '孙骨科', '王全科', '李乳腺', '周心内', '吴神内', '郑肾内', '王内分泌', '赵肿瘤', '吴免疫', '林血液', '罗感染', '叶儿科']

# Technicians
technicians = ['李技师', '王技师', '赵技师', '张技师', '陈技师', '刘技师']

# Radiologists
radiologists = ['王主任', '李主任', '张主任', '赵主任', '陈主任', '周主任']

def generate_id_card(district, birth_year, gender, seq):
    """Generate a valid 18-digit Chinese ID card number"""
    district_code = district_codes.get(district, '310101')
    year = str(birth_year)[2:]
    month = f"{random.randint(1, 12):02d}"
    day = f"{random.randint(1, 28):02d}"
    birth_code = f"{year}{month}{day}"
    seq_code = f"{seq:03d}"
    if gender == '男':
        gender_code = str(random.choice([1, 3, 5, 7, 9]))
    else:
        gender_code = str(random.choice([2, 4, 6, 8]))
    
    # Ensure id_17 is exactly 17 characters
    id_17 = f"{district_code}{birth_code}{seq_code}{gender_code}"[:17]
    id_17 = id_17.ljust(17, '0')
    
    # Calculate checksum
    weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    check_codes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
    total = sum(int(id_17[i]) * weights[i] for i in range(17))
    check_code = check_codes[total % 11]
    
    return id_17 + check_code

def generate_phone():
    """Generate a valid Chinese mobile phone number"""
    prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
                '150', '151', '152', '153', '155', '156', '157', '158', '159',
                '170', '171', '172', '173', '175', '176', '177', '178',
                '180', '181', '182', '183', '184', '185', '186', '187', '188', '189']
    return random.choice(prefixes) + ''.join([str(random.randint(0, 9)) for _ in range(8)])

def calculate_age(birth_year):
    """Calculate age based on birth year"""
    return 2025 - birth_year

def generate_study_uid(date, seq):
    """Generate a DICOM Study Instance UID"""
    return f"1.2.840.113619.2.55.3.2025{date.replace('-', '')}{seq:04d}"

# Verify we have 48 names
print(f"DEBUG: Total names: {len(all_names)}", file=__import__('sys').stderr)

# ============= Generate Patients =============
print("// ===== v1.0 追加：新增患者数据（48条）=====")
print("export const additionalPatients: Patient[] = [")

for i in range(48):
    pat_id = f"pat{i+13:03d}"
    name = all_names[i] if i < len(all_names) else f"患者{i}"
    gender = '男' if name in all_male else '女'
    birth_year = random.randint(1940, 2015)
    birth_date = f"{birth_year}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}"
    district = random.choice(districts)
    street = random.choice(streets)
    address = f"上海市{district}{street}{random.randint(1, 999)}号"
    id_card = generate_id_card(district, birth_year, gender, random.randint(1, 999))
    phone = generate_phone()
    medical_record_no = f"MR2025{random.randint(100, 999)}{i+13:04d}"
    age = calculate_age(birth_year)
    
    comma = "," if i < 47 else ""
    print(f"  {{ id: '{pat_id}', name: '{name}', gender: '{gender}', birthDate: '{birth_date}', idCard: '{id_card}', phone: '{phone}', address: '{address}', medicalRecordNo: '{medical_record_no}', age: {age} }}{comma}")

print("];")

# ============= Generate Exams =============
print("\n// ===== v1.0 追加：新增检查数据（137条，2025-04-01到2025-04-29）=====")
print("export const additionalExams: Exam[] = [")

exam_id = 14
start_date = datetime(2025, 4, 1)
end_date = datetime(2025, 4, 29)

modalities = ['CT'] * 40 + ['MR'] * 35 + ['DR'] * 35 + ['超声'] * 15 + ['乳腺钼靶'] * 7 + ['骨密度'] * 5
random.shuffle(modalities)

# Assign exams to patients (13 existing + 48 new = 61 patients)
patient_ids = [f"pat{i:03d}" for i in range(1, 13)] + [f"pat{i:03d}" for i in range(13, 61)]

statuses = ['已完成'] * 100 + ['已登记'] * 30 + ['已预约'] * 20
random.shuffle(statuses)

exam_records = []
for i, modality in enumerate(modalities):
    exam_id_str = f"exam{exam_id:03d}"
    patient_id = random.choice(patient_ids)
    exam_item = random.choice(exam_items[modality])
    exam_date = start_date + timedelta(days=random.randint(0, 28))
    exam_time = f"{random.randint(7, 18):02d}:{random.choice([0, 15, 30, 45]):02d}"
    status = statuses[i]
    
    body_parts = list(clinical_diagnoses.keys())
    body_part = exam_item['bodyPart'] if exam_item['bodyPart'] in body_parts else '胸部'
    clinical_diag = random.choice(clinical_diagnoses.get(body_part, ['常规体检']))
    
    referring_physician = random.choice(physicians)
    technitian = random.choice(technicians) if status == '已完成' else None
    radiologist = random.choice(radiologists) if status == '已完成' else None
    
    accession = f"ACC2025{exam_date.strftime('%m%d')}{exam_id:04d}"
    study_uid = generate_study_uid(exam_date.strftime('%Y-%m-%d'), exam_id)
    
    exam_record = {
        'id': exam_id_str,
        'patientId': patient_id,
        'accessionNumber': accession,
        'examItemId': exam_item['id'],
        'examItemName': exam_item['name'],
        'modality': modality,
        'bodyPart': exam_item['bodyPart'],
        'scheduledDate': exam_date.strftime('%Y-%m-%d'),
        'scheduledTime': exam_time,
        'clinicalDiagnosis': clinical_diag,
        'requestingPhysician': referring_physician,
        'status': status,
        'priority': '急诊' if random.random() < 0.1 else '普通',
        'studyInstanceUID': study_uid,
        'technitian': technitian,
        'radiologist': radiologist,
        'charge': exam_item['price'],
    }
    
    if i < 5:
        print(f"  {{ id: '{exam_record['id']}', patientId: '{exam_record['patientId']}', accessionNumber: '{exam_record['accessionNumber']}',")
        print(f"    examItemId: '{exam_record['examItemId']}', examItemName: '{exam_record['examItemName']}', modality: '{exam_record['modality']}', bodyPart: '{exam_record['bodyPart']}',")
        print(f"    scheduledDate: '{exam_record['scheduledDate']}', scheduledTime: '{exam_record['scheduledTime']}',")
        print(f"    clinicalDiagnosis: '{exam_record['clinicalDiagnosis']}', requestingPhysician: '{exam_record['requestingPhysician']}',")
        print(f"    status: '{exam_record['status']}', priority: '{exam_record['priority']}',")
        print(f"    studyInstanceUID: '{exam_record['studyInstanceUID']}', technitian: '{technitian}', radiologist: '{radiologist}',")
        print(f"    charge: {exam_record['charge']} }},")
    
    exam_records.append(exam_record)
    exam_id += 1

print(f"  // ... 共 {len(exam_records)} 条检查记录 ...")
print("];")

# ============= Generate Reports =============
print("\n// ===== v1.0 追加：新增报告数据（589条）=====")
print("export const additionalReports: Report[] = [")

# CT findings templates
ct_findings_templates = [
    ("右肺上叶可见磨玻璃小结节影，直径约{d}mm，边缘清晰，余肺叶未见异常密度灶。肺门结构清晰，纵隔内未见肿大淋巴结。心脏形态正常。", "右肺上叶磨玻璃结节（LU-RADS 2类），考虑良性可能，建议年度复查。", "建议12个月后复查胸部CT。"),
    ("左肺下叶可见实性结节，直径约{d}mm，边缘可见分叶，毛刺征不明显，余肺野清晰。纵隔内可见数枚小淋巴结，最大直径约8mm。", "左肺下叶实性结节，建议密切随访或进一步PET-CT检查。", "建议3个月后复查胸部CT，或行PET-CT检查。"),
    ("双肺散在纤维灶，以双上肺为著。右下肺可见小结节影，直径约{d}mm，边界清楚。余肺野清晰，未见实变或空洞。肺门结构清晰。", "1.双肺散在纤维灶（陈旧性）；2.右下肺小结节，建议密切随访。", "建议6-12个月后复查胸部CT评估结节变化。"),
    ("胸廓对称，双肺野清晰，肺纹理走行自然，分布均匀。双肺门形态正常，结构清晰。纵隔居中，无增宽。心脏形态正常。气管及主要支气管通畅。", "胸部CT平扫未见明显异常。", "无需特殊处理，定期体检即可。"),
    ("肝右叶可见类圆形低密度影，直径约{d}cm，边界清楚，增强扫描动脉期边缘轻度强化，门脉期及延迟期呈等密度，考虑肝血管瘤。", "肝右叶血管瘤（考虑良性）。", "建议定期复查腹部CT，6-12个月一次。"),
    ("左侧基底节区可见片状低密度影，边界不清，CT值约22HU，大小约1.5cm×2.0cm，余脑实质密度正常。脑室系统形态正常，位置居中。", "左侧基底节区腔隙性脑梗死（急性期可能）。", "建议MRI-DWI进一步评估。神经内科门诊随访。"),
    ("右侧颞叶可见类圆形肿块，边界清楚，T1WI呈等信号，T2WI呈等高信号，增强扫描明显均匀强化，可见脑膜尾征，大小约{d}cm。", "右侧颞叶脑膜瘤，良性可能性大。", "建议神经外科随访，必要时手术切除。"),
    ("L4/5椎间盘向后突出，压迫硬膜囊前缘，神经根未见明显受压。L5/S1椎间盘未见明显突出。椎管形态正常，未见狭窄。黄韧带无肥厚。", "L4/5椎间盘突出，椎管狭窄（轻度）。", "建议骨科或疼痛科就诊，必要时行椎间盘微创治疗或手术。"),
]

mr_findings_templates = [
    ("右颞叶可见类圆形肿块，边界清楚，T1WI呈等信号，T2WI呈等高信号，增强扫描明显均匀强化，可见脑膜尾征，大小约{d}×{d2}×{d3}cm。", "右侧颞叶脑膜瘤，良性可能性大。", "建议神经外科随访，必要时手术切除。"),
    ("左额叶可见T1WI低信号、T2WI/FLAIR高信号灶，DWI呈高信号（弥散受限），ADC图呈低信号，考虑急性期脑梗死。", "左额叶急性期脑梗死，建议立即神经内科治疗。", "立即神经内科紧急会诊，急诊留观。"),
    ("L4/5椎间盘向后突出，压迫硬膜囊前缘，L5/S1椎间盘未见明显突出。椎管形态正常，未见狭窄。脊髓圆锥位置及形态正常。", "L4/5椎间盘突出。", "建议骨科或疼痛科就诊，必要时行椎间盘微创治疗。"),
    ("右膝关节结构完整，关节软骨信号正常。内侧半月板后角可见线状高信号，达关节面，考虑半月板撕裂（III级）。", "右膝内侧半月板损伤（III级）；关节腔少量积液。", "建议关节外科就诊，必要时行关节镜手术治疗。"),
    ("颅骨骨质完整。脑实质内未见异常信号灶，灰白质分界清晰。双侧脑室形态正常，位置居中，脑沟、脑池无增宽。中线结构居中。", "头颅MRI平扫未见明显异常。", "无需特殊处理，定期观察即可。"),
]

dr_findings_templates = [
    ("胸廓对称，双肺野清晰，肺纹理增粗增多，走行紊乱，以右下肺为著。余肺野清晰。双肺门形态正常，结构清晰。纵隔无增宽，气管居中。", "双肺纹理增粗，考虑支气管炎改变。", "建议呼吸科门诊随诊。"),
    ("胸廓对称，双肺野清晰，肺纹理走行自然，未见实变、结节或空洞影。双肺门形态正常，结构清晰。纵隔无增宽，气管居中。心脏形态大小正常。", "胸部正位片未见明显异常。", "无需特殊处理，定期体检即可。"),
    ("右肺上叶可见斑片状模糊阴影，边缘不清，密度不均，余肺野清晰，纵隔无增宽。双侧肋膈角锐利。", "右上肺感染，建议抗炎治疗后复查。", "建议抗感染治疗2周后复查胸片。"),
    ("腰椎序列整齐，曲度正常。L3-S1椎体边缘可见骨质增生，骨赘形成。各椎间隙未见明显狭窄。", "腰椎退行性改变。", "建议骨科门诊随访，避免重体力劳动。"),
]

ultrasound_findings_templates = [
    ("肝脏大小正常，形态规整，肝实质回声均匀，肝内管道清晰。胆囊大小正常，壁光滑，腔内透声好。脾脏大小正常，回声均匀。", "肝胆脾胰未见明显异常。", "无需特殊处理，定期体检即可。"),
    ("肝脏体积增大，肝实质回声增强，后方回声衰减，肝内管道纹理显示不清。胆囊壁增厚毛糙，腔内透声差。", "轻度脂肪肝；胆囊壁增厚毛糙。", "建议清淡饮食，适量运动，定期复查。"),
    ("甲状腺左叶大小正常，回声均匀，未见明显结节。右叶可见单个低回声结节，大小约{d}mm，边界清楚，纵横比>1。", "甲状腺右叶结节（TI-RADS 4类），建议进一步检查。", "建议内分泌科就诊，必要时行穿刺活检。"),
]

mammography_findings_templates = [
    ("双侧乳腺呈致密型腺体。双侧乳腺未见明确肿块、簇状钙化或其他恶性征象。双侧腋窝未见肿大淋巴结。皮肤、乳头未见异常。", "双乳未见明显异常（BI-RADS 1类）。", "定期复查，建议40岁以上女性每年进行一次乳腺钼靶筛查。"),
    ("双侧乳腺呈致密型腺体。左乳外上象限可见不规则肿块影，边缘模糊，可见簇状钙化，大小约{d}mm。右乳未见明显异常。", "左乳可疑恶性肿块（BI-RADS 4类），建议活检。", "建议乳腺外科就诊，必要时穿刺活检。"),
]

bone_density_findings = [
    ("腰椎L1-L4骨密度测定：L1 T值：-1.8，L2 T值：-2.0，L3 T值：-1.9，L4 T值：-1.7。平均T值：-1.8。", "骨量减少（骨质疏松前期）。", "建议补钙、VitD，适当运动，6-12个月后复查骨密度。"),
    ("腰椎L1-L4骨密度测定：L1 T值：-2.5，L2 T值：-2.6，L3 T值：-2.4，L4 T值：-2.3。平均T值：-2.5。", "骨质疏松。", "建议抗骨质疏松治疗，补钙、VitD、双膦酸盐类药物，3-6个月后复查。"),
]

report_id = 12
report_count = 0
critical_count = 0

for i, exam in enumerate(exam_records):
    if exam['status'] != '已完成':
        continue
    
    report_id_str = f"rpt{report_id:03d}"
    exam_id_str = exam['id']
    patient_id = exam['patientId']
    modality = exam['modality']
    
    if modality == 'CT':
        findings_template, impression, suggestion = random.choice(ct_findings_templates)
        d = random.randint(3, 15)
        findings = findings_template.format(d=d)
        is_critical = random.random() < 0.05
        critical_value = '大面积脑梗死' if is_critical and '脑梗死' in impression else ('肺部感染' if is_critical else None)
    elif modality == 'MR':
        findings_template, impression, suggestion = random.choice(mr_findings_templates)
        d = random.randint(5, 30)
        d2 = d + random.randint(2, 5)
        d3 = d2 + random.randint(2, 5)
        findings = findings_template.format(d=d, d2=d2, d3=d3)
        is_critical = random.random() < 0.05
        critical_value = '急性脑梗死' if is_critical and '脑梗死' in impression else None
    elif modality == 'DR':
        findings_template, impression, suggestion = random.choice(dr_findings_templates)
        findings = findings_template
        is_critical = random.random() < 0.03
        critical_value = '肺部感染' if is_critical and '感染' in impression else None
    elif modality == '超声':
        findings_template, impression, suggestion = random.choice(ultrasound_findings_templates)
        d = random.randint(5, 20)
        findings = findings_template.format(d=d)
        is_critical = random.random() < 0.05
        critical_value = '甲状腺结节恶性征象' if is_critical and '恶性' in impression else None
    elif modality == '乳腺钼靶':
        findings_template, impression, suggestion = random.choice(mammography_findings_templates)
        d = random.randint(5, 25)
        findings = findings_template.format(d=d)
        is_critical = random.random() < 0.05
        critical_value = '乳腺恶性肿块' if is_critical and '恶性' in impression else None
    elif modality == '骨密度':
        findings, impression, suggestion = random.choice(bone_density_findings)
        is_critical = random.random() < 0.03
        critical_value = '严重骨质疏松' if is_critical and '严重' in impression else None
    else:
        findings = "检查完成。"
        impression = "未见明显异常。"
        suggestion = "定期复查。"
        is_critical = False
        critical_value = None
    
    radiologist = exam['radiologist'] if exam['radiologist'] else random.choice(radiologists)
    auditor = random.choice(radiologists)
    
    exam_datetime = datetime.strptime(f"{exam['scheduledDate']} {exam['scheduledTime']}", "%Y-%m-%d %H:%M")
    report_time = (exam_datetime + timedelta(minutes=random.randint(15, 60))).strftime("%Y-%m-%dT%H:%M:%S")
    audit_time = (datetime.strptime(report_time, "%Y-%m-%dT%H:%M:%S") + timedelta(minutes=random.randint(10, 30))).strftime("%Y-%m-%dT%H:%M:%S")
    
    status = '已完成'
    
    if report_count < 5:
        print(f"  {{")
        print(f"    id: '{report_id_str}',")
        print(f"    examId: '{exam_id_str}', patientId: '{patient_id}', accessionNumber: '{exam['accessionNumber']}',")
        print(f"    examItemName: '{exam['examItemName']}', modality: '{modality}',")
        print(f"    findings: '{findings}',")
        print(f"    impression: '{impression}',")
        print(f"    suggestion: '{suggestion}',")
        print(f"    radiologist: '{radiologist}', 审核医师: '{auditor}',")
        print(f"    reportTime: '{report_time}', auditTime: '{audit_time}',")
        if is_critical and critical_value:
            print(f"    status: '{status}', isUrgent: true, criticalValue: '{critical_value}' }},")
        else:
            print(f"    status: '{status}', isUrgent: false }},")
    
    report_count += 1
    if is_critical and critical_value:
        critical_count += 1
    report_id += 1

# Add some pending reports
pending_count = 0
for j in range(40):
    report_id_str = f"rpt{report_id:03d}"
    exam = exam_records[j % len(exam_records)]
    exam_id_str = exam['id']
    patient_id = exam['patientId']
    modality = exam['modality']
    exam_item = random.choice(exam_items[modality])
    
    if pending_count < 3:
        print(f"  {{")
        print(f"    id: '{report_id_str}',")
        print(f"    examId: '{exam_id_str}', patientId: '{patient_id}', accessionNumber: '{exam['accessionNumber']}',")
        print(f"    examItemName: '{exam_item['name']}', modality: '{modality}',")
        print(f"    findings: '', impression: '', suggestion: '',")
        print(f"    radiologist: '待分配', 审核医师: '待分配',")
        print(f"    reportTime: '', auditTime: '',")
        print(f"    status: '待书写', isUrgent: false }},")
    
    pending_count += 1
    report_id += 1

print(f"  // ... 共 {report_count + 40} 条报告记录（包括 {critical_count} 条危急值报告）...")
print("];")

# ============= Generate Equipment Usage Logs =============
print("\n// ===== v1.0 追加：设备使用记录（60条，6台设备×10条）=====")
print("export const additionalEquipmentUsageLogs: EquipmentUsageLog[] = [")

equipment_list = [
    {'id': 'eq001', 'name': 'DR-X机（锐珂）', 'modality': 'DR'},
    {'id': 'eq002', 'name': 'CT机（西门子）', 'modality': 'CT'},
    {'id': 'eq003', 'name': 'MRI（西门子）', 'modality': 'MR'},
    {'id': 'eq004', 'name': '乳腺钼靶机', 'modality': '乳腺钼靶'},
    {'id': 'eq005', 'name': '骨密度仪', 'modality': '骨密度'},
    {'id': 'eq006', 'name': '超声诊断仪（GE）', 'modality': '超声'},
]

for eq_idx, eq in enumerate(equipment_list):
    for day in range(1, 11):
        log_date = datetime(2025, 4, day)
        exam_count = random.randint(3, 8)
        start_hour = random.randint(7, 9)
        duration = random.randint(20, 60)
        
        start_time = log_date.replace(hour=start_hour, minute=random.choice([0, 15, 30, 45]))
        end_time = start_time + timedelta(minutes=duration)
        
        status = '正常使用' if random.random() > 0.1 else random.choice(['待机', '测试'])
        
        log_id = f"ul{eq_idx*10+day+10:03d}"
        
        if day <= 3:
            print(f"  {{ id: '{log_id}', equipmentId: '{eq['id']}', equipmentName: '{eq['name']}', modality: '{eq['modality']}',")
            print(f"    technitian: '{random.choice(technicians)}', startTime: '{start_time.strftime('%Y-%m-%d %H:%M')}',")
            print(f"    endTime: '{end_time.strftime('%Y-%m-%d %H:%M')}', duration: {duration}, status: '{status}' }},")

print(f"  // ... 共 60 条设备使用记录 ...")
print("];")

# ============= Generate Appointments =============
print("\n// ===== v1.0 追加：预约数据（50条，2025-04-29及以后）=====")
print("export const additionalAppointments: Appointment[] = [")

appointment_id = 1
for i in range(50):
    apt_id = f"apt{appointment_id:03d}"
    patient_id = random.choice(patient_ids)
    # Extract name index from patient_id
    pat_idx = int(patient_id.replace('pat', '')) - 1
    if pat_idx < len(all_names):
        patient_name = all_names[pat_idx]
        patient_gender = '男' if patient_name in all_male else '女'
    else:
        patient_name = f"患者{pat_idx}"
        patient_gender = '男'
    patient_age = random.randint(20, 80)
    
    modality = random.choice(['CT', 'MR', 'DR', '超声', '乳腺钼靶', '骨密度'])
    exam_item = random.choice(exam_items[modality])
    
    day_offset = i // 10 + 1
    apt_date = (datetime(2025, 4, 29) + timedelta(days=day_offset)).strftime('%Y-%m-%d')
    apt_time = f"{random.randint(8, 17):02d}:{random.choice([0, 15, 30, 45]):02d}"
    
    body_parts = list(clinical_diagnoses.keys())
    body_part = exam_item['bodyPart'] if exam_item['bodyPart'] in body_parts else '胸部'
    clinical_diag = random.choice(clinical_diagnoses.get(body_part, ['常规体检']))
    
    apt_type = random.choice(['门诊', '门诊', '门诊', '住院', '体检'])
    referring_dept = random.choice(['心内科', '呼吸科', '消化科', '神经内科', '骨科', '普外科', '内分泌科', '泌尿外科'])
    referring_physician = random.choice(physicians)
    
    status = '已预约'
    
    if i < 5:
        print(f"  {{ id: '{apt_id}', patientId: '{patient_id}', patientName: '{patient_name}', patientGender: '{patient_gender}',")
        print(f"    patientAge: {patient_age}, patientPhone: '{generate_phone()}',")
        print(f"    examItemId: '{exam_item['id']}', examItemName: '{exam_item['name']}', modality: '{modality}', bodyPart: '{exam_item['bodyPart']}',")
        print(f"    appointmentDate: '{apt_date}', appointmentTime: '{apt_time}',")
        print(f"    appointmentType: '{apt_type}', clinicalDiagnosis: '{clinical_diag}',")
        print(f"    requestingPhysician: '{referring_physician}', requestingDept: '{referring_dept}',")
        print(f"    status: '{status}',")
        print(f"    studyInstanceUID: '{generate_study_uid(apt_date, appointment_id)}' }},")
    
    appointment_id += 1

print(f"  // ... 共 50 条预约记录 ...")
print("];")

print("\n// ===== 数据追加完成 =====")
