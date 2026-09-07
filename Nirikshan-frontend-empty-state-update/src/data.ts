import { generateInspectionResult } from './engine';
import type { AuditEntry, CaptureMethod, Inspection, RegulationEntry, UserAccount } from './types';

interface SeedInput {
  id: string;
  product: string;
  brand: string;
  category: string;
  manufacturer: string;
  sku: string;
  location: string;
  officer: string;
  date: string;
  capture: CaptureMethod;
  capturedCount?: number;
}

const SEED_INPUTS: SeedInput[] = [
  { id: 'INS-2026-1003', product: 'Premium Basmati Rice 5kg', brand: 'ABC Foods', category: 'Food grains', manufacturer: 'ABC Grain Mills Ltd.', sku: 'BR-5KG-118', location: 'Lajpat Nagar Market, Delhi', officer: 'Priya Sharma', date: '05 Sep 2026', capture: 'QR-PAIRED PHONE' },
  { id: 'INS-2026-1016', product: 'Packaged Drinking Water 1L', brand: 'PureSpring', category: 'Beverages', manufacturer: 'PureSpring Beverages Pvt. Ltd.', sku: 'PW-1L-004', location: 'Connaught Place, Delhi', officer: 'Ravi Kumar', date: '02 Sep 2026', capture: 'DIRECT UPLOAD' },
  { id: 'INS-2026-1020', product: 'Iodized Salt 1kg', brand: 'SunRise', category: 'Food grains', manufacturer: 'SunRise Salt Works', sku: 'IS-1KG-221', location: 'Rohini Sector 7, Delhi', officer: 'Ananya Iyer', date: '30 Aug 2026', capture: 'QR-PAIRED PHONE' },
  { id: 'INS-2026-1007', product: 'Kachi Ghani Mustard Oil 1L', brand: 'Suhana', category: 'Edible oils', manufacturer: 'Suhana Agro Foods Pvt. Ltd.', sku: 'MO-1L-556', location: 'Chandni Chowk, Delhi', officer: 'Priya Sharma', date: '06 Sep 2026', capture: 'QR-PAIRED PHONE' },
  { id: 'INS-2026-1011', product: 'Refined Wheat Atta 5kg', brand: 'WhiteCloud', category: 'Food grains', manufacturer: 'WhiteCloud Flour Mills', sku: 'WA-5KG-772', location: 'Karol Bagh, Delhi', officer: 'Vikram Rathore', date: '03 Sep 2026', capture: 'DIRECT UPLOAD' },
  { id: 'INS-2026-1014', product: 'LED Bulb 9W (Pack of 2)', brand: 'BrightHome', category: 'Electricals', manufacturer: 'BrightHome Electricals Ltd.', sku: 'LB-9W-330', location: 'Nehru Place, Delhi', officer: 'Ravi Kumar', date: '28 Aug 2026', capture: 'DIRECT UPLOAD' },
  { id: 'INS-2026-1017', product: 'Detergent Powder 1kg', brand: 'SparkleClean', category: 'Household', manufacturer: 'SparkleClean Home Products', sku: 'DP-1KG-901', location: 'Janakpuri, Delhi', officer: 'Ananya Iyer', date: '26 Aug 2026', capture: 'QR-PAIRED PHONE' },
  { id: 'INS-2026-1001', product: 'Herbal Soap 100g (Pack of 3)', brand: 'FreshGlow', category: 'Personal care', manufacturer: 'FreshGlow Cosmetics Pvt. Ltd.', sku: 'HS-100G-045', location: 'Dwarka Sector 12, Delhi', officer: 'Priya Sharma', date: '04 Sep 2026', capture: 'QR-PAIRED PHONE' },
  { id: 'INS-2026-1002', product: 'Digestive Biscuits 200g', brand: 'GoldenCrisp', category: 'Packaged food', manufacturer: 'GoldenCrisp Foods Ltd.', sku: 'DB-200G-183', location: 'Lajpat Nagar Market, Delhi', officer: 'Vikram Rathore', date: '01 Sep 2026', capture: 'DIRECT UPLOAD' },
  { id: 'INS-2026-1005', product: 'Silk Repair Shampoo 340ml', brand: 'SilkTouch', category: 'Personal care', manufacturer: 'SilkTouch Personal Care Ltd.', sku: 'SH-340ML-267', location: 'Connaught Place, Delhi', officer: 'Ravi Kumar', date: '31 Aug 2026', capture: 'QR-PAIRED PHONE' },
  { id: 'INS-2026-1009', product: 'Assam Tea 250g', brand: 'FreshLeaf', category: 'Beverages', manufacturer: 'FreshLeaf Tea Estates', sku: 'AT-250G-410', location: 'Karol Bagh, Delhi', officer: 'Ananya Iyer', date: '29 Aug 2026', capture: 'DIRECT UPLOAD' },
  { id: 'INS-2026-1013', product: 'Pure Ghee 1L', brand: 'GoldDrop', category: 'Dairy', manufacturer: 'GoldDrop Dairy Pvt. Ltd.', sku: 'GH-1L-598', location: 'Rohini Sector 7, Delhi', officer: 'Priya Sharma', date: '27 Aug 2026', capture: 'QR-PAIRED PHONE' },
  { id: 'INS-2026-1019', product: 'Mint Fresh Toothpaste 150g', brand: 'MintFresh', category: 'Personal care', manufacturer: 'MintFresh Oral Care Ltd.', sku: 'TP-150G-732', location: 'Nehru Place, Delhi', officer: 'Vikram Rathore', date: '19 Aug 2026', capture: 'DIRECT UPLOAD' },
  { id: 'INS-2026-1006', product: 'Toned Milk Powder 500g', brand: 'NutriPlus', category: 'Dairy', manufacturer: 'NutriPlus Dairy Foods', sku: 'MP-500G-861', location: 'Dwarka Sector 12, Delhi', officer: 'Ravi Kumar', date: '18 Aug 2026', capture: 'QR-PAIRED PHONE' },
  { id: 'INS-2026-1021', product: 'Garam Masala 100g', brand: 'RoyalTaste', category: 'Spices', manufacturer: 'RoyalTaste Spice Co.', sku: 'GM-100G-509', location: 'Chandni Chowk, Delhi', officer: 'Ananya Iyer', date: '06 Sep 2026', capture: 'DIRECT UPLOAD', capturedCount: 2 },
  { id: 'INS-2026-1022', product: 'Room Freshener Spray 200ml', brand: 'CoolBreeze', category: 'Household', manufacturer: 'CoolBreeze Home Fragrances', sku: 'RF-200ML-654', location: 'Janakpuri, Delhi', officer: 'Vikram Rathore', date: '05 Sep 2026', capture: 'QR-PAIRED PHONE', capturedCount: 1 },
];

export const inspections: Inspection[] = SEED_INPUTS.map((s) => {
  const result = generateInspectionResult(s.id, s.capture, s.capturedCount ?? 4);
  return {
    id: s.id,
    product: s.product,
    brand: s.brand,
    category: s.category,
    manufacturer: s.manufacturer,
    sku: s.sku,
    location: s.location,
    officer: s.officer,
    date: s.date,
    status: result.status,
    score: result.score,
    confidence: result.confidence,
    severity: result.severity,
    capture: s.capture,
    violations: result.violationDetails.length,
    action: result.action,
    ruleSet: 'LMPC 2011',
    rules: result.rules,
    violationDetails: result.violationDetails,
    evidence: result.evidence,
  };
}).sort((a, b) => (a.date < b.date ? 1 : -1));

export const users: UserAccount[] = [
  { id: 'USR-01', name: 'Priya Sharma', role: 'Inspector', region: 'Delhi North', email: 'priya.sharma@consumeraffairs.gov.in', status: 'Active', initials: 'PS' },
  { id: 'USR-02', name: 'Ravi Kumar', role: 'Inspector', region: 'Delhi South', email: 'ravi.kumar@consumeraffairs.gov.in', status: 'Active', initials: 'RK' },
  { id: 'USR-03', name: 'Ananya Iyer', role: 'Inspector', region: 'Delhi East', email: 'ananya.iyer@consumeraffairs.gov.in', status: 'Active', initials: 'AI' },
  { id: 'USR-04', name: 'Vikram Rathore', role: 'Inspector', region: 'Delhi West', email: 'vikram.rathore@consumeraffairs.gov.in', status: 'Active', initials: 'VR' },
  { id: 'USR-05', name: 'Meera Nair', role: 'Reviewer', region: 'Delhi HQ', email: 'meera.nair@consumeraffairs.gov.in', status: 'Active', initials: 'MN' },
  { id: 'USR-06', name: 'Arjun Desai', role: 'Administrator', region: 'Delhi HQ', email: 'arjun.desai@consumeraffairs.gov.in', status: 'Active', initials: 'AD' },
  { id: 'USR-07', name: 'Kavita Menon', role: 'Reviewer', region: 'Delhi HQ', email: 'kavita.menon@consumeraffairs.gov.in', status: 'Invited', initials: 'KM' },
];

export const auditLogSeed: AuditEntry[] = [
  { id: 'AUD-1001', actor: 'Priya Sharma', action: 'Started inspection', target: 'INS-2026-1007 · Kachi Ghani Mustard Oil 1L', timestamp: '06 Sep 2026, 09:14' },
  { id: 'AUD-1002', actor: 'System', action: 'Decision routed to review', target: 'INS-2026-1002 · Digestive Biscuits 200g', timestamp: '01 Sep 2026, 14:02' },
  { id: 'AUD-1003', actor: 'Meera Nair', action: 'Confirmed non-compliant finding', target: 'INS-2026-1011 · Refined Wheat Atta 5kg', timestamp: '03 Sep 2026, 16:41' },
  { id: 'AUD-1004', actor: 'Ravi Kumar', action: 'Uploaded evidence via direct upload', target: 'INS-2026-1014 · LED Bulb 9W', timestamp: '28 Aug 2026, 11:22' },
  { id: 'AUD-1005', actor: 'System', action: 'Auto-approved compliant decision', target: 'INS-2026-1003 · Premium Basmati Rice 5kg', timestamp: '05 Sep 2026, 10:37' },
  { id: 'AUD-1006', actor: 'Arjun Desai', action: 'Added inspector account', target: 'USR-04 · Vikram Rathore', timestamp: '15 Aug 2026, 09:00' },
  { id: 'AUD-1007', actor: 'Ananya Iyer', action: 'Flagged insufficient evidence', target: 'INS-2026-1021 · Garam Masala 100g', timestamp: '06 Sep 2026, 12:05' },
  { id: 'AUD-1008', actor: 'Vikram Rathore', action: 'Requested recapture', target: 'INS-2026-1022 · Room Freshener Spray 200ml', timestamp: '05 Sep 2026, 17:48' },
];

export const regulations: RegulationEntry[] = [
  { id: 'LMPC-04', section: 'Rule 6', title: 'Manufacturer / packer / importer declaration', summary: 'Every package must declare the name and address of the manufacturer, packer or importer in a manner that is clear and conspicuous.' },
  { id: 'LMPC-06', section: 'Rule 6(1)(f)', title: 'Retail sale price (MRP) declaration', summary: 'MRP must be declared inclusive of all taxes, in Indian currency, and printed in a legible manner on the principal display panel.' },
  { id: 'LMPC-08', section: 'Rule 7', title: 'Standard declaration character height', summary: 'Character height for mandatory declarations scales with net quantity — minimum 2mm for smaller packages, increasing for larger ones.' },
  { id: 'LMPC-10', section: 'Rule 6(1)(e)', title: 'Consumer care details', summary: 'Name, address, telephone number and (where available) email address of a person or office to handle consumer complaints.' },
  { id: 'LMPC-11', section: 'Rule 6(1)(g)', title: 'Month and year of manufacture / import', summary: 'The month and year in which the commodity was manufactured, packed or imported must be declared on the package.' },
  { id: 'LMPC-13', section: 'Rule 6(1)(b)', title: 'Net quantity declaration', summary: 'Net quantity must be declared in standard units of weight, measure or number, following prescribed rounding conventions.' },
  { id: 'LMPC-21', section: 'Rule 18', title: 'Wrong / incorrect declarations', summary: 'Sets out penalties applicable when a declaration on a package is found to be false or misleading in a material particular.' },
  { id: 'LMPC-23', section: 'Rule 23', title: 'Sale of packages without declarations', summary: 'Prohibits the sale, distribution or delivery of any pre-packaged commodity that omits a mandatory declaration under these rules.' },
];

export const PHOTO_LABELS = ['Front panel', 'Back panel', 'Side panel', 'MRP close-up'];

export const categoryData = [
  { name: 'Food grains', value: 18 },
  { name: 'Beverages', value: 12 },
  { name: 'Personal care', value: 9 },
  { name: 'Dairy', value: 7 },
  { name: 'Household', value: 5 },
  { name: 'Other', value: 4 },
];

export const trendData = [
  { month: 'Jan', compliant: 62, review: 18, flagged: 7 },
  { month: 'Feb', compliant: 65, review: 16, flagged: 9 },
  { month: 'Mar', compliant: 68, review: 15, flagged: 8 },
  { month: 'Apr', compliant: 71, review: 14, flagged: 7 },
  { month: 'May', compliant: 73, review: 12, flagged: 6 },
  { month: 'Jun', compliant: 76, review: 11, flagged: 5 },
];
