export const TEST_USERS = {
  admins: [
    { username: 'admin1', password: 'Admin123!', name: '管理员一', role: 'super_admin' },
    { username: 'admin2', password: 'Admin123!', name: '管理员二', role: 'admin' },
    { username: 'admin3', password: 'Admin123!', name: '管理员三', role: 'admin' },
  ],
  procurement: [
    { username: 'procure1', password: 'Procure123!', name: '采购员一', role: 'procurement' },
    { username: 'procure2', password: 'Procure123!', name: '采购员二', role: 'procurement' },
    { username: 'procure3', password: 'Procure123!', name: '采购员三', role: 'procurement' },
  ],
  sales: [
    { username: 'sales1', password: 'Sales123!', name: '销售员一', role: 'sales' },
    { username: 'sales2', password: 'Sales123!', name: '销售员二', role: 'sales' },
    { username: 'sales3', password: 'Sales123!', name: '销售员三', role: 'sales' },
  ],
};

export const TEST_CUSTOMERS = [
  { username: 'cust1', companyName: '株式会社日本食品', contactPerson: '田中太郎', phone: '090-1111-1111' },
  { username: 'cust2', companyName: '東京レストラン株式会社', contactPerson: '佐藤二郎', phone: '090-2222-2222' },
  { username: 'cust3', companyName: '大阪商店株式会社', contactPerson: '鈴木三郎', phone: '090-3333-3333' },
  { username: 'cust4', companyName: '京都フーズ株式会社', contactPerson: '高橋四郎', phone: '090-4444-4444' },
  { username: 'cust5', companyName: '名古屋商事株式会社', contactPerson: '伊藤五郎', phone: '090-5555-5555' },
  { username: 'cust6', companyName: '福岡屋台株式会社', contactPerson: '渡辺六郎', phone: '090-6666-6666' },
  { username: 'cust7', companyName: '札幌グルメ株式会社', contactPerson: '加藤七郎', phone: '090-7777-7777' },
  { username: 'cust8', companyName: '広島きっと株式会社', contactPerson: '山田八郎', phone: '090-8888-8888' },
  { username: 'cust9', companyName: '仙台物産株式会社', contactPerson: '山口九郎', phone: '090-9999-9999' },
  { username: 'cust10', companyName: '新潟名刺株式会社', contactPerson: '黒木十郎', phone: '090-0000-0000' },
];

export const TEST_CATEGORIES = ['肉类', '蛋品', '生鲜蔬果', '海鲜', '调料'];

export const TEST_PRODUCTS = [
  { name: '和牛切片 500g', category: '肉类', unit: '盒', purchasePrice: 150, salePrice: 200, quantity: 100 },
  { name: '猪五花肉 1kg', category: '肉类', unit: '包', purchasePrice: 80, salePrice: 120, quantity: 200 },
  { name: '鸡胸肉 1kg', category: '肉类', unit: '包', purchasePrice: 50, salePrice: 75, quantity: 150 },
  { name: '羊排 500g', category: '肉类', unit: '盒', purchasePrice: 120, salePrice: 180, quantity: 80 },
  { name: '培根 200g', category: '肉类', unit: '包', purchasePrice: 40, salePrice: 60, quantity: 120 },
  { name: '鸡蛋 30個', category: '蛋品', unit: '盒', purchasePrice: 45, salePrice: 65, quantity: 300 },
  { name: '鸭蛋 20個', category: '蛋品', unit: '盒', purchasePrice: 55, salePrice: 80, quantity: 100 },
  { name: '鹌鹑蛋 40個', category: '蛋品', unit: '盒', purchasePrice: 35, salePrice: 50, quantity: 90 },
  { name: '有机大米 5kg', category: '生鲜蔬果', unit: '袋', purchasePrice: 120, salePrice: 180, quantity: 200 },
  { name: '新鲜菠菜 300g', category: '生鲜蔬果', unit: '袋', purchasePrice: 15, salePrice: 25, quantity: 150 },
  { name: '胡萝卜 1kg', category: '生鲜蔬果', unit: '袋', purchasePrice: 12, salePrice: 20, quantity: 200 },
  { name: '苹果 1kg', category: '生鲜蔬果', unit: '袋', purchasePrice: 25, salePrice: 40, quantity: 180 },
  { name: '番茄 1kg', category: '生鲜蔬果', unit: '袋', purchasePrice: 18, salePrice: 28, quantity: 160 },
  { name: '三文鱼切片 300g', category: '海鲜', unit: '盒', purchasePrice: 120, salePrice: 180, quantity: 60 },
  { name: '虾仁 500g', category: '海鲜', unit: '袋', purchasePrice: 80, salePrice: 120, quantity: 80 },
  { name: '螃蟹 1kg', category: '海鲜', unit: '只', purchasePrice: 200, salePrice: 300, quantity: 40 },
  { name: '金枪鱼 500g', category: '海鲜', unit: '盒', purchasePrice: 150, salePrice: 220, quantity: 50 },
  { name: '酱油 1L', category: '调料', unit: '瓶', purchasePrice: 25, salePrice: 38, quantity: 250 },
  { name: '味淋 500ml', category: '调料', unit: '瓶', purchasePrice: 30, salePrice: 45, quantity: 180 },
  { name: '味噌 1kg', category: '调料', unit: '盒', purchasePrice: 35, salePrice: 52, quantity: 140 },
];
