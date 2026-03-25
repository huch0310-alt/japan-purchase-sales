// Test users for authentication - using actual credentials from database
export const testUsers = {
  super_admin: { username: 'admin', password: 'admin123', name: '管理员' },
  admin: { username: 'admin', password: 'admin123', name: '管理员' },
  sales: { username: 'sales', password: 'sales123', name: '销售员' },
  procurement: { username: 'procurement', password: 'procurement123', name: '采购员' },
};

// Original TEST_USERS for reference
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
  { companyName: '株式会社日本食品', invoiceName: '日本食品株式会社', contactPerson: '田中太郎', phone: '090-1111-1111', invoicePhone: '090-1111-1111', address: '東京都港区虎ノ門1-1-1', invoiceAddress: '東京都港区虎ノ門1-1-1' },
  { companyName: '東京レストラン株式会社', invoiceName: '東京レストラン', contactPerson: '佐藤二郎', phone: '090-2222-2222', invoicePhone: '090-2222-2222', address: '東京都渋谷区渋谷2-2-2', invoiceAddress: '東京都渋谷区渋谷2-2-2' },
  { companyName: '大阪商店株式会社', invoiceName: '大阪商店', contactPerson: '鈴木三郎', phone: '090-3333-3333', invoicePhone: '090-3333-3333', address: '大阪府大阪市北区大阪3-3-3', invoiceAddress: '大阪府大阪市北区大阪3-3-3' },
  { companyName: '京都フーズ株式会社', invoiceName: '京都フーズ', contactPerson: '高橋四郎', phone: '090-4444-4444', invoicePhone: '090-4444-4444', address: '京都府京都市下京四条4-4-4', invoiceAddress: '京都府京都市下京四条4-4-4' },
  { companyName: '名古屋商事株式会社', invoiceName: '名古屋商事', contactPerson: '伊藤五郎', phone: '090-5555-5555', invoicePhone: '090-5555-5555', address: '愛知県名古屋市中区栄5-5-5', invoiceAddress: '愛知県名古屋市中区栄5-5-5' },
  { companyName: '福岡屋台株式会社', invoiceName: '福岡屋台', contactPerson: '渡辺六郎', phone: '090-6666-6666', invoicePhone: '090-6666-6666', address: '福岡県福岡市博多区博多6-6-6', invoiceAddress: '福岡県福岡市博多区博多6-6-6' },
  { companyName: '札幌グルメ株式会社', invoiceName: '札幌グルメ', contactPerson: '加藤七郎', phone: '090-7777-7777', invoicePhone: '090-7777-7777', address: '北海道札幌市中央区大通7-7-7', invoiceAddress: '北海道札幌市中央区大通7-7-7' },
  { companyName: '広島きっと株式会社', invoiceName: '広島きっと', contactPerson: '山田八郎', phone: '090-8888-8888', invoicePhone: '090-8888-8888', address: '広島県広島市南区八丁鮎8-8-8', invoiceAddress: '広島県広島市南区八丁鮎8-8-8' },
  { companyName: '仙台物産株式会社', invoiceName: '仙台物産', contactPerson: '山口九郎', phone: '090-9999-9999', invoicePhone: '090-9999-9999', address: '宮城県仙台市青葉区中央9-9-9', invoiceAddress: '宮城県仙台市青葉区中央9-9-9' },
  { companyName: '新潟名刺株式会社', invoiceName: '新潟名刺', contactPerson: '黒木十郎', phone: '090-0000-0000', invoicePhone: '090-0000-0000', address: '新潟県新潟市中央区十万島10-10-10', invoiceAddress: '新潟県新潟市中央区十万島10-10-10' },
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

// Helper functions for generating dynamic test data
export function generateStaffData() {
  const random = Math.floor(Math.random() * 10000);
  return {
    username: `staff_${random}`,
    password: 'Staff123!',
    name: `员工${random}`,
    role: 'admin',
  };
}

export function generateCustomerData() {
  const random = Math.floor(Math.random() * 10000);
  return {
    username: `customer_${random}`,
    companyName: `株式会社テスト${random}`,
    invoiceName: `テスト株式会社${random}`,
    contactPerson: `担当者${random}`,
    phone: `090-${String(random).padStart(4, '0')}-${String(random).padStart(4, '0')}`,
    invoicePhone: `090-${String(random).padStart(4, '0')}-${String(random).padStart(4, '0')}`,
    address: `住所${random}`,
    invoiceAddress: `請求先住所${random}`,
  };
}

export function generateCategoryData() {
  const random = Math.floor(Math.random() * 10000);
  return {
    name: `カテゴリ${random}`,
    sort: random,
  };
}

export function generateProductData() {
  const random = Math.floor(Math.random() * 10000);
  return {
    name: `商品${random}`,
    category: '肉类',
    unit: '盒',
    purchasePrice: 100 + random % 400,
    salePrice: 150 + random % 500,
    quantity: 50 + random % 200,
  };
}
