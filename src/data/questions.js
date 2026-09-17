// 題庫：翻譯自 8values（https://github.com/8values/8values.github.io，MIT License）
// effect：答「同意」時對各軸的分數變化量（正 → 邁向該軸 right 端，負 → left 端）
// econ: 市場(-) ←→ 平等(+) / dipl: 民族(-) ←→ 世界(+)
// govt: 權威(-) ←→ 自由(+) / scty: 傳統(-) ←→ 進步(+)

export const QUESTIONS = [
  { text: '企業的壓迫比政府的壓迫更值得擔憂。', effect: { econ: 10, dipl: 0, govt: -5, scty: 0 } },
  { text: '政府有必要介入經濟以保護消費者。', effect: { econ: 10, dipl: 0, govt: 0, scty: 0 } },
  { text: '市場越自由，人民就越自由。', effect: { econ: -10, dipl: 0, govt: 0, scty: 0 } },
  {
    text: '維持收支平衡比保障全體國民的福利更重要。',
    effect: { econ: -10, dipl: 0, govt: 0, scty: 0 },
  },
  {
    text: '由公部門出資的研究，比交給市場更有利於人民。',
    effect: { econ: 10, dipl: 0, govt: 0, scty: 10 },
  },
  {
    text: '對國際貿易課徵關稅，對振興本地生產很重要。',
    effect: { econ: 5, dipl: 0, govt: -10, scty: 0 },
  },
  { text: '各盡所能，各取所需。', effect: { econ: 10, dipl: 0, govt: 0, scty: 0 } },
  {
    text: '最好的做法是廢除社會福利計畫，改由私人慈善來替代。',
    effect: { econ: -10, dipl: 0, govt: 0, scty: 0 },
  },
  { text: '應該增加富人的稅負，用來照顧窮人。', effect: { econ: 10, dipl: 0, govt: 0, scty: 0 } },
  { text: '遺產是正當的財富形式。', effect: { econ: -10, dipl: 0, govt: 0, scty: -5 } },
  {
    text: '道路、電力等基本公共事業應該由公家擁有。',
    effect: { econ: 10, dipl: 0, govt: 0, scty: 0 },
  },
  { text: '政府干預是對經濟的威脅。', effect: { econ: -10, dipl: 0, govt: 0, scty: 0 } },
  { text: '付得起錢的人應該得到更好的醫療。', effect: { econ: -10, dipl: 0, govt: 0, scty: 0 } },
  { text: '優質教育是所有人應有的權利。', effect: { econ: 10, dipl: 0, govt: 0, scty: 5 } },
  { text: '生產工具應該屬於使用它們的勞工。', effect: { econ: 10, dipl: 0, govt: 0, scty: 0 } },
  { text: '聯合國應該被廢除。', effect: { econ: 0, dipl: -10, govt: -5, scty: 0 } },
  {
    text: '我國採取軍事行動，往往是保衛國家所必需的。',
    effect: { econ: 0, dipl: -10, govt: -10, scty: 0 },
  },
  { text: '我支持區域聯盟，例如歐洲聯盟。', effect: { econ: -5, dipl: 10, govt: 10, scty: 5 } },
  { text: '維護國家主權是很重要的。', effect: { econ: 0, dipl: -10, govt: -5, scty: 0 } },
  { text: '統一的世界政府會對人類有益。', effect: { econ: 0, dipl: 10, govt: 0, scty: 0 } },
  { text: '維持和平關係比增強自身實力更重要。', effect: { econ: 0, dipl: 10, govt: 0, scty: 0 } },
  { text: '戰爭不需要向其他國家交代正當性。', effect: { econ: 0, dipl: -10, govt: -10, scty: 0 } },
  { text: '軍事開支是浪費錢。', effect: { econ: 0, dipl: 10, govt: 10, scty: 0 } },
  { text: '國際援助是浪費錢。', effect: { econ: -5, dipl: -10, govt: 0, scty: 0 } },
  { text: '我的國家是偉大的。', effect: { econ: 0, dipl: -10, govt: 0, scty: 0 } },
  { text: '研究應該在國際層面上進行。', effect: { econ: 0, dipl: 10, govt: 0, scty: 10 } },
  { text: '政府應該對國際社會負責。', effect: { econ: 0, dipl: 10, govt: 5, scty: 0 } },
  { text: '即使是抗議威權政府，暴力也不可接受。', effect: { econ: 0, dipl: 5, govt: -5, scty: 0 } },
  {
    text: '我的宗教信仰應該盡可能地傳播出去。',
    effect: { econ: 0, dipl: -5, govt: -10, scty: -10 },
  },
  { text: '我國的價值觀應該盡可能地傳播出去。', effect: { econ: 0, dipl: -10, govt: -5, scty: 0 } },
  { text: '維持法律與秩序非常重要。', effect: { econ: 0, dipl: -5, govt: -10, scty: -5 } },
  { text: '一般民眾會做出糟糕的決定。', effect: { econ: 0, dipl: 0, govt: -10, scty: 0 } },
  { text: '醫師協助自殺（安樂死）應該合法。', effect: { econ: 0, dipl: 0, govt: 10, scty: 0 } },
  {
    text: '犧牲部分公民自由，是保護我們免受恐怖攻擊所必需的。',
    effect: { econ: 0, dipl: 0, govt: -10, scty: 0 },
  },
  { text: '在現代世界，政府監控是必要的。', effect: { econ: 0, dipl: 0, govt: -10, scty: 0 } },
  {
    text: '國家的存在本身，就是對我們自由的威脅。',
    effect: { econ: 0, dipl: 0, govt: 10, scty: 0 },
  },
  {
    text: '無論政治立場為何，與國家站在同一邊是很重要的。',
    effect: { econ: 0, dipl: -10, govt: -10, scty: -5 },
  },
  { text: '一切權威都應該被質疑。', effect: { econ: 0, dipl: 0, govt: 10, scty: 5 } },
  { text: '階層分明的國家是最好的。', effect: { econ: 0, dipl: 0, govt: -10, scty: 0 } },
  {
    text: '政府遵循多數意見很重要，即使那個意見是錯的。',
    effect: { econ: 0, dipl: 0, govt: 10, scty: 0 },
  },
  { text: '領導者越強勢越好。', effect: { econ: 0, dipl: -10, govt: -10, scty: 0 } },
  { text: '民主不只是一種決策程序而已。', effect: { econ: 0, dipl: 0, govt: 10, scty: 0 } },
  { text: '環境法規是不可或缺的。', effect: { econ: 5, dipl: 0, govt: 0, scty: 10 } },
  { text: '更好的世界將來自自動化、科學與科技。', effect: { econ: 0, dipl: 0, govt: 0, scty: 10 } },
  {
    text: '兒童應該接受宗教或傳統價值觀的教育。',
    effect: { econ: 0, dipl: 0, govt: -5, scty: -10 },
  },
  { text: '傳統本身沒有什麼價值。', effect: { econ: 0, dipl: 0, govt: 0, scty: 10 } },
  { text: '宗教應該在政府中扮演一定角色。', effect: { econ: 0, dipl: 0, govt: -10, scty: -10 } },
  { text: '教會應該和其他機構一樣被課稅。', effect: { econ: 5, dipl: 0, govt: 0, scty: 10 } },
  {
    text: '氣候變遷是當前對我們生活方式最大的威脅之一。',
    effect: { econ: 0, dipl: 0, govt: 0, scty: 10 },
  },
  {
    text: '全世界團結一致對抗氣候變遷是很重要的。',
    effect: { econ: 0, dipl: 10, govt: 0, scty: 10 },
  },
  { text: '社會在多年前比現在更好。', effect: { econ: 0, dipl: 0, govt: 0, scty: -10 } },
  { text: '維護過去的傳統是很重要的。', effect: { econ: 0, dipl: 0, govt: 0, scty: -10 } },
  {
    text: '以超越自身壽命的長遠眼光來思考是很重要的。',
    effect: { econ: 0, dipl: 0, govt: 0, scty: 10 },
  },
  { text: '理性比維護自身文化更重要。', effect: { econ: 0, dipl: 0, govt: 0, scty: 10 } },
  { text: '藥物使用應該合法化或除罪化。', effect: { econ: 0, dipl: 0, govt: 10, scty: 2 } },
  { text: '同性婚姻應該合法。', effect: { econ: 0, dipl: 0, govt: 10, scty: 10 } },
  { text: '沒有任何文化比其他文化優越。', effect: { econ: 0, dipl: 10, govt: 5, scty: 10 } },
  { text: '婚外性行為是不道德的。', effect: { econ: 0, dipl: 0, govt: -5, scty: -10 } },
  {
    text: '如果我們接受移民，那麼他們融入我們的文化是很重要的。',
    effect: { econ: 0, dipl: 0, govt: -5, scty: -10 },
  },
  {
    text: '墮胎在大多數或所有情況下都應該被禁止。',
    effect: { econ: 0, dipl: 0, govt: -10, scty: -10 },
  },
  {
    text: '沒有正當理由的人應該被禁止持有槍械。',
    effect: { econ: 0, dipl: 0, govt: -10, scty: 0 },
  },
  { text: '我支持由單一保險人辦理的全民健保。', effect: { econ: 10, dipl: 0, govt: 0, scty: 0 } },
  { text: '性交易應該違法。', effect: { econ: 0, dipl: 0, govt: -10, scty: -10 } },
  { text: '維護家庭價值是不可或缺的。', effect: { econ: 0, dipl: 0, govt: 0, scty: -10 } },
  { text: '不計一切代價追求進步是危險的。', effect: { econ: 0, dipl: 0, govt: 0, scty: -10 } },
  {
    text: '基因改造是良善的力量，即使應用在人類身上也一樣。',
    effect: { econ: 0, dipl: 0, govt: 0, scty: 10 },
  },
  { text: '我們應該開放邊境接納移民。', effect: { econ: 0, dipl: 10, govt: 10, scty: 0 } },
  {
    text: '政府對外國人的關心，應該和對本國公民一樣多。',
    effect: { econ: 0, dipl: 10, govt: 0, scty: 0 },
  },
  {
    text: '所有人——不論文化或性傾向等因素——都應該被平等對待。',
    effect: { econ: 10, dipl: 10, govt: 10, scty: 10 },
  },
  {
    text: '把我們自己群體的目標放在其他一切之上，是很重要的。',
    effect: { econ: -10, dipl: -10, govt: -10, scty: -10 },
  },
]
