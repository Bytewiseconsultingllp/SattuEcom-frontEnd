import axiosInstance from '../axiosInstance';

export interface CustomReportData {
  period: {
    type: string;
    startDate: string;
    endDate: string;
    label: string;
  };
  summary: {
    totalRevenue: number;
    grossProfit: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    totalTax: number;
    yoyGrowth?: number;
  };
  sales: any;
  expenses: any;
  customers: any;
  inventory: any;
  financial: any;
  monthlyBreakdown?: any[];
  quarterlyBreakdown?: any[];
  generatedAt: string;
  reportType: string;
  isGovernmentReady: boolean;
  complianceNotes?: {
    taxCompliance: string;
    dataAccuracy: string;
    auditTrail: string;
    financialYear: number;
  };
}

/**
 * Generate Monthly Performance Report
 */
export const generateMonthlyPerformanceReport = async () => {
  const response = await axiosInstance.post('/admin/reports/custom/monthly');
  return response.data;
};

/**
 * Generate Quarterly Financial Report
 */
export const generateQuarterlyFinancialReport = async () => {
  const response = await axiosInstance.post('/admin/reports/custom/quarterly');
  return response.data;
};

/**
 * Generate Annual Business Report
 */
export const generateAnnualBusinessReport = async () => {
  const response = await axiosInstance.post('/admin/reports/custom/annual');
  return response.data;
};
