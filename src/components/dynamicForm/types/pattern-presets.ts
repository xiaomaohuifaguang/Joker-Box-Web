export interface PatternPreset {
  id: string
  name: string
  category: string
  pattern: string
  patternTips: string
}

export const PATTERN_PRESETS: PatternPreset[] = [
  {
    id: 'cn_name',
    name: '汉字姓名',
    category: '基础信息',
    pattern: '^[一-龥·]{2,16}$',
    patternTips: '请输入2-16位汉字姓名',
  },
  {
    id: 'en_name',
    name: '英文姓名',
    category: '基础信息',
    pattern: "^[a-zA-Z\\s\\-']{2,32}$",
    patternTips: '请输入正确的英文姓名',
  },
  {
    id: 'mobile',
    name: '手机号',
    category: '联系方式',
    pattern: '^1[3-9]\\d{9}$',
    patternTips: '请输入正确的11位手机号',
  },
  {
    id: 'email',
    name: '邮箱',
    category: '联系方式',
    pattern: '^[\\w.-]+@[\\w.-]+\\.\\w+$',
    patternTips: '请输入正确的邮箱地址',
  },
  {
    id: 'idcard',
    name: '身份证号（18位）',
    category: '证件',
    pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$',
    patternTips: '请输入正确的18位身份证号',
  },
  {
    id: 'passport',
    name: '护照号',
    category: '证件',
    pattern: '^[a-zA-Z0-9]{5,20}$',
    patternTips: '请输入正确的护照号',
  },
  {
    id: 'zipcode',
    name: '邮编',
    category: '其他',
    pattern: '^\\d{6}$',
    patternTips: '请输入正确的6位邮编',
  },
  {
    id: 'bankcard',
    name: '银行卡号',
    category: '其他',
    pattern: '^\\d{16,19}$',
    patternTips: '请输入正确的银行卡号',
  },
]

export const PATTERN_PRESET_CATEGORIES: string[] = [
  '全部',
  ...Array.from(new Set(PATTERN_PRESETS.map(p => p.category))),
]
