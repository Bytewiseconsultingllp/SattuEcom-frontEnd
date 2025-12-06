import axiosInstance from '../axiosInstance';

export interface ReportGenerateParams {
  reportType: 'sales' | 'orders' | 'customers' | 'profit-loss' | 'revenue' | 'expenses' | 'tax';
  format: 'PDF' | 'Excel' | 'CSV';
  dateRange: string;
  startDate?: string;
  endDate?: string;
}

export interface ReportScheduleParams {
  reportTypes: string[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  emailRecipients: string[];
  formats: string[];
}

export interface ReportSchedule {
  _id: string;
  report_types: string[];
  frequency: string;
  email_recipients: string[];
  formats: string[];
  next_run: string;
  last_run: string | null;
  is_active: boolean;
  created_by: any;
  createdAt: string;
  updatedAt: string;
}

export interface ReportHistoryItem {
  _id: string;
  report_type: string;
  format: string;
  date_range: {
    start_date: string;
    end_date: string;
    label: string;
  };
  file_url: string | null;
  file_size: number;
  generated_by: any;
  is_scheduled: boolean;
  schedule_id: string | null;
  status: 'pending' | 'completed' | 'failed';
  error_message: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generate a report on-demand
 */
export const generateReport = async (params: ReportGenerateParams) => {
  const response = await axiosInstance.post('/admin/reports/generate', params);
  return response.data;
};

/**
 * Schedule automated reports
 */
export const scheduleReport = async (params: ReportScheduleParams) => {
  const response = await axiosInstance.post('/admin/reports/schedule', params);
  return response.data;
};

/**
 * Get all report schedules
 */
export const getReportSchedules = async () => {
  const response = await axiosInstance.get('/admin/reports/schedules');
  return response.data;
};

/**
 * Update a report schedule
 */
export const updateReportSchedule = async (id: string, updates: Partial<ReportSchedule>) => {
  const response = await axiosInstance.put(`/admin/reports/schedules/${id}`, updates);
  return response.data;
};

/**
 * Delete a report schedule
 */
export const deleteReportSchedule = async (id: string) => {
  const response = await axiosInstance.delete(`/admin/reports/schedules/${id}`);
  return response.data;
};

/**
 * Get report generation history
 */
export const getReportHistory = async (params?: { page?: number; limit?: number; reportType?: string }) => {
  const response = await axiosInstance.get('/admin/reports/history', { params });
  return response.data;
};

/**
 * Download all reports as ZIP
 */
export const downloadAllReports = async (params: { dateRange: string; startDate?: string; endDate?: string }) => {
  const response = await axiosInstance.post('/admin/reports/download-all', params);
  return response.data;
};
