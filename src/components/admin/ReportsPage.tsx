import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileBarChart,
  Users,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Clock,
  History,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
import { getAdminDashboardStats } from "@/lib/api/dashboardStats";
import { exportOfflineSales } from "@/lib/api/offlineSales";
import { getCompanySettings } from "@/lib/api/companySettings";
import { getExpenses } from "@/lib/api/expenses";
import { generateReport, downloadAllReports } from "@/lib/api/reports";
import { 
  generateMonthlyPerformanceReport,
  generateQuarterlyFinancialReport,
  generateAnnualBusinessReport
} from "@/lib/api/customReports";
import { ScheduleReportsDialog } from "./ScheduleReportsDialog";
import { ReportHistoryDialog } from "./ReportHistoryDialog";
import {
  generateSalesReportPDF,
  generateOrdersReportPDF,
  generateCustomersReportPDF,
  generateRevenueReportPDF,
  generateTaxReportPDF,
  openPDFWindow,
} from "@/utils/pdfReportGenerator";
import {
  generateMonthlyPerformanceReportPDF,
  generateQuarterlyFinancialReportPDF,
  generateAnnualBusinessReportPDF,
  openCustomReportWindow,
} from "@/utils/customReportPDFGenerator";

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  delivery: "Delivery Charges",
  packaging: "Packaging Materials",
  maintenance: "Maintenance",
  utilities: "Utilities",
  marketing: "Marketing",
  salaries: "Salaries",
  rent: "Rent",
  miscellaneous: "Miscellaneous",
  rawMaterials: "Raw Materials",
  other: "Other",
};

export function ReportsPage() {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [generatingCustomReport, setGeneratingCustomReport] = useState<string | null>(null);
  const [overview, setOverview] = useState({
    totalSales: 0,
    onlineSales: 0,
    offlineSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    profit: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    expenses: 0,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getAdminDashboardStats();
        const data: any = (res as any)?.data || res;
        const onlineSales = data?.onlineSales || 0;
        const offlineSales = data?.offlineSales || 0;
        const expenses = data?.expenses || 0;
        const totalSales = onlineSales + offlineSales;
        const profit = totalSales - expenses;
        setOverview({
          totalSales,
          onlineSales,
          offlineSales,
          totalOrders: data?.totalOrders || 0,
          totalCustomers: data?.totalCustomers || 0,
          profit,
          revenueChange: data?.revenueChange ?? 0,
          ordersChange: data?.ordersChange ?? 0,
          customersChange: data?.customersChange ?? 0,
          expenses,
        });
      } catch (error: any) {
        toast.error(error.message || "Failed to load report statistics");
      }
    })();
  }, []);

  const reports = [
    {
      id: "sales",
      title: "Sales Report",
      description: "Detailed sales data with revenue breakdown",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
      formats: ["PDF", "Excel", "CSV"],
    },
    {
      id: "orders",
      title: "Orders Report",
      description: "Complete order history and status",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      formats: ["PDF", "Excel", "CSV"],
    },
    {
      id: "customers",
      title: "Customer Base Report",
      description: "Customer demographics and statistics",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      formats: ["PDF", "Excel", "CSV"],
    },
    {
      id: "profit-loss",
      title: "Profit & Loss Statement",
      description: "Financial performance analysis",
      icon: FileBarChart,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      formats: ["PDF", "Excel"],
    },
    {
      id: "revenue",
      title: "Revenue Report",
      description: "Revenue trends and projections",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      formats: ["PDF", "Excel"],
    },
    {
      id: "expenses",
      title: "Expenses Report",
      description: "All business expenses and costs",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
      formats: ["PDF", "Excel", "CSV"],
    },
    {
      id: "tax",
      title: "Tax Report",
      description: "Tax calculations and GST details",
      icon: FileText,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      formats: ["PDF", "Excel"],
    },
  ];

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    try {
      const response = await downloadAllReports({
        dateRange,
        startDate: dateRange === "custom" ? startDate : undefined,
        endDate: dateRange === "custom" ? endDate : undefined,
      });
      toast.success("All reports data generated successfully");
      console.log("All reports data:", response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to download all reports");
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleGenerateCustomReport = async (reportType: 'monthly' | 'quarterly' | 'annual') => {
    setGeneratingCustomReport(reportType);
    try {
      toast.info(`Generating ${reportType} performance report...`);
      
      let response;
      if (reportType === 'monthly') {
        response = await generateMonthlyPerformanceReport();
      } else if (reportType === 'quarterly') {
        response = await generateQuarterlyFinancialReport();
      } else {
        response = await generateAnnualBusinessReport();
      }

      const reportData = response.data;
      const company = await getCompanySettings().catch(() => null);

      let html = '';
      if (reportType === 'monthly') {
        html = generateMonthlyPerformanceReportPDF(reportData, company || {});
      } else if (reportType === 'quarterly') {
        html = generateQuarterlyFinancialReportPDF(reportData, company || {});
      } else {
        html = generateAnnualBusinessReportPDF(reportData, company || {});
      }

      openCustomReportWindow(html);
      toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to generate ${reportType} report`);
      console.error('Custom report error:', error);
    } finally {
      setGeneratingCustomReport(null);
    }
  };

  const handleDownload = async (reportId: string, format: string) => {
    // Get common data needed for all reports
    let periodLabel = "Overall";
    if (dateRange === "custom" && startDate && endDate) {
      periodLabel = `${startDate} to ${endDate}`;
    } else {
      const map: Record<string, string> = {
        "today": "Today",
        "yesterday": "Yesterday",
        "last-7-days": "Last 7 Days",
        "last-30-days": "Last 30 Days",
        "this-month": "This Month",
        "last-month": "Last Month",
        "this-quarter": "This Quarter",
        "this-year": "This Year",
      };
      periodLabel = map[dateRange] || "Overall";
    }

    if (reportId === "profit-loss" && format === "PDF") {
      try {
        const company = await getCompanySettings().catch(() => null);

        const totalSales = overview.totalSales || 0;
        const totalExpenses = overview.expenses || 0;
        const netProfit = typeof overview.profit === "number"
          ? overview.profit
          : totalSales - totalExpenses;

        const profitIsPositive = netProfit >= 0;
        const netLabel = profitIsPositive ? "Net Profit" : "Net Loss";
        const salesStr = formatCurrency(totalSales);
        const expensesStr = formatCurrency(totalExpenses);
        const netStr = formatCurrency(Math.abs(netProfit));
        const onlineStr = formatCurrency(overview.onlineSales || 0);
        const offlineStr = formatCurrency(overview.offlineSales || 0);

        let periodLabel = "Overall";
        if (dateRange === "custom" && startDate && endDate) {
          periodLabel = `${startDate} to ${endDate}`;
        } else {
          const map: Record<string, string> = {
            "today": "Today",
            "yesterday": "Yesterday",
            "last-7-days": "Last 7 Days",
            "last-30-days": "Last 30 Days",
            "this-month": "This Month",
            "last-month": "Last Month",
            "this-quarter": "This Quarter",
            "this-year": "This Year",
          };
          periodLabel = map[dateRange] || "Overall";
        }

        let expensesByCategory: Record<string, number> = {};
        try {
          const expenseList = await getExpenses();
          expensesByCategory = (expenseList || []).reduce((acc: Record<string, number>, e: any) => {
            const key = e.category || "other";
            const amount = typeof e.amount === "number" ? e.amount : 0;
            acc[key] = (acc[key] || 0) + amount;
            return acc;
          }, {});
        } catch {
          expensesByCategory = {};
        }

        const expenseRowsHtml = Object.entries(expensesByCategory)
          .filter(([, amount]) => amount > 0)
          .map(([cat, amount]) => {
            const label = EXPENSE_CATEGORY_LABELS[cat] || cat;
            return `<tr><td>${label}</td><td class="right">${formatCurrency(amount)}</td></tr>`;
          })
          .join("");

        const expenseTableBody = expenseRowsHtml || '<tr><td colspan="2" class="right">No expense data available</td></tr>';

        const now = new Date();
        const generatedOn = now.toLocaleString();
        const companyName = company?.companyName || "Company Name";
        const companyAddress = company?.address || "";
        const companyEmail = company?.email || "";
        const companyPhone = company?.phone || "";
        const gstNumber = company?.gstNumber || "";
        const companyLogo = company?.logo || "";

        const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="UTF-8" />
    <title>Profit & Loss Statement</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 40px; background-color: #f3f4f6; color: #111827; }
      .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
      .logo { height: 56px; width: auto; object-fit: contain; margin-bottom: 8px; }
      .company-name { font-size: 24px; font-weight: 700; margin-top: 4px; }
      .company-meta { font-size: 12px; color: #4b5563; margin-top: 4px; line-height: 1.5; max-width: 520px; margin-left: auto; margin-right: auto; }
      .title { font-size: 20px; font-weight: 600; margin-top: 24px; margin-bottom: 4px; }
      .subtitle { font-size: 13px; color: #4b5563; margin-bottom: 16px; }
      .section { margin-top: 24px; }
      .section-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; border-radius: 12px; overflow: hidden; }
      th, td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: left; }
      th { background-color: #f9fafb; font-weight: 600; }
      tr:nth-child(even) td { background-color: #f9fafb; }
      .right { text-align: right; }
      .net-profit { font-weight: 700; color: #16a34a; }
      .net-loss { font-weight: 700; color: #b91c1c; }
      .footer { margin-top: 32px; font-size: 11px; color: #6b7280; text-align: right; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    </style>
  </head>
  <body onload="window.print(); window.close();">
    <div class="header">
      ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo" class="logo" />` : ""}
      <div class="company-name">${companyName}</div>
      <div class="company-meta">
        ${companyAddress ? `${companyAddress}<br/>` : ""}
        ${companyEmail ? `Email: ${companyEmail} | ` : ""}
        ${companyPhone ? `Phone: ${companyPhone}` : ""}
        ${gstNumber ? `<br/>GST: ${gstNumber}` : ""}
      </div>
    </div>

    <div class="title">Profit & Loss Statement</div>
    <div class="subtitle">Reporting Period: ${periodLabel}</div>

    <div class="section">
      <div class="section-title">Summary</div>
      <table>
        <tr>
          <th>Description</th>
          <th class="right">Amount (INR)</th>
        </tr>
        <tr>
          <td>Online Sales</td>
          <td class="right">${onlineStr}</td>
        </tr>
        <tr>
          <td>Offline Sales</td>
          <td class="right">${offlineStr}</td>
        </tr>
        <tr>
          <td><strong>Total Sales</strong></td>
          <td class="right"><strong>${salesStr}</strong></td>
        </tr>
        <tr>
          <td>Total Expenses</td>
          <td class="right">${expensesStr}</td>
        </tr>
        <tr>
          <td>${netLabel}</td>
          <td class="right ${profitIsPositive ? "net-profit" : "net-loss"}">${netStr}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Expense Breakdown</div>
      <table>
        <tr>
          <th>Category</th>
          <th class="right">Amount (INR)</th>
        </tr>
        ${expenseTableBody}
      </table>
    </div>

    <div class="footer">
      Generated on ${generatedOn}
    </div>
  </body>
</html>`;

        const printWindow = window.open("", "_blank", "width=900,height=650");
        if (!printWindow) {
          toast.error("Popup blocked. Please allow popups to export the PDF.");
          return;
        }
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
      } catch (error: any) {
        toast.error(error.message || "Failed to generate Profit & Loss PDF");
      }
      return;
    }

    if (reportId === "expenses" && format === "PDF") {
      try {
        const company = await getCompanySettings().catch(() => null);

        let expensesByCategory: Record<string, number> = {};
        let totalExpenses = 0;
        try {
          const expenseList = await getExpenses();
          expensesByCategory = (expenseList || []).reduce((acc: Record<string, number>, e: any) => {
            const key = e.category || "other";
            const amount = typeof e.amount === "number" ? e.amount : 0;
            acc[key] = (acc[key] || 0) + amount;
            totalExpenses += amount;
            return acc;
          }, {});
        } catch {
          expensesByCategory = {};
        }

        const expenseRowsHtml = Object.entries(expensesByCategory)
          .filter(([, amount]) => amount > 0)
          .map(([cat, amount]) => {
            const label = EXPENSE_CATEGORY_LABELS[cat] || cat;
            return `<tr><td>${label}</td><td class="right">${formatCurrency(amount)}</td></tr>`;
          })
          .join("");

        const expenseTableBody = expenseRowsHtml || '<tr><td colspan="2" class="right">No expense data available</td></tr>';

        let periodLabel = "Overall";
        if (dateRange === "custom" && startDate && endDate) {
          periodLabel = `${startDate} to ${endDate}`;
        } else {
          const map: Record<string, string> = {
            "today": "Today",
            "yesterday": "Yesterday",
            "last-7-days": "Last 7 Days",
            "last-30-days": "Last 30 Days",
            "this-month": "This Month",
            "last-month": "Last Month",
            "this-quarter": "This Quarter",
            "this-year": "This Year",
          };
          periodLabel = map[dateRange] || "Overall";
        }

        const now = new Date();
        const generatedOn = now.toLocaleString();
        const companyName = company?.companyName || "Company Name";
        const companyAddress = company?.address || "";
        const companyEmail = company?.email || "";
        const companyPhone = company?.phone || "";
        const gstNumber = company?.gstNumber || "";
        const companyLogo = company?.logo || "";

        const totalExpensesStr = formatCurrency(totalExpenses || overview.expenses || 0);

        const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="UTF-8" />
    <title>Expenses Report</title>
    <style>
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 40px; background-color: #f3f4f6; color: #111827; }
      .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
      .logo { height: 56px; width: auto; object-fit: contain; margin-bottom: 8px; }
      .company-name { font-size: 24px; font-weight: 700; margin-top: 4px; }
      .company-meta { font-size: 12px; color: #4b5563; margin-top: 4px; line-height: 1.5; max-width: 520px; margin-left: auto; margin-right: auto; }
      .title { font-size: 20px; font-weight: 600; margin-top: 24px; margin-bottom: 4px; }
      .subtitle { font-size: 13px; color: #4b5563; margin-bottom: 16px; }
      .section { margin-top: 24px; }
      .section-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #6b7280; margin-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; border-radius: 12px; overflow: hidden; }
      th, td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: left; }
      th { background-color: #f9fafb; font-weight: 600; }
      tr:nth-child(even) td { background-color: #f9fafb; }
      .right { text-align: right; }
      .footer { margin-top: 32px; font-size: 11px; color: #6b7280; text-align: right; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    </style>
  </head>
  <body onload="window.print(); window.close();">
    <div class="header">
      ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo" class="logo" />` : ""}
      <div class="company-name">${companyName}</div>
      <div class="company-meta">
        ${companyAddress ? `${companyAddress}<br/>` : ""}
        ${companyEmail ? `Email: ${companyEmail} | ` : ""}
        ${companyPhone ? `Phone: ${companyPhone}` : ""}
        ${gstNumber ? `<br/>GST: ${gstNumber}` : ""}
      </div>
    </div>

    <div class="title">Expenses Report</div>
    <div class="subtitle">Reporting Period: ${periodLabel}</div>

    <div class="section">
      <div class="section-title">Summary</div>
      <table>
        <tr>
          <th>Description</th>
          <th class="right">Amount (INR)</th>
        </tr>
        <tr>
          <td>Total Expenses</td>
          <td class="right">${totalExpensesStr}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Expense Breakdown</div>
      <table>
        <tr>
          <th>Category</th>
          <th class="right">Amount (INR)</th>
        </tr>
        ${expenseTableBody}
      </table>
    </div>

    <div class="footer">
      Generated on ${generatedOn}
    </div>
  </body>
</html>`;

        const printWindow = window.open("", "_blank", "width=900,height=650");
        if (!printWindow) {
          toast.error("Popup blocked. Please allow popups to export the PDF.");
          return;
        }
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
      } catch (error: any) {
        toast.error(error.message || "Failed to generate Expenses PDF");
      }
      return;
    }

    // For non-PDF formats, use the backend API
    if (format === "CSV" || format === "Excel") {
      try {
        if (reportId === "sales") {
          const period: "weekly" | "monthly" | "quarterly" | "annually" = "monthly";
          const blob = await exportOfflineSales(period);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `sales-report-${period}-${new Date()
            .toISOString()
            .split("T")[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          toast.success("Sales report downloaded");
          return;
        }

        toast.info("This report download is not implemented yet.");
      } catch (error: any) {
        toast.error(error.message || "Failed to download report");
      }
      return;
    }

    // For PDF format, generate client-side PDFs for all report types
    if (format === "PDF") {
      try {
        toast.info("Generating PDF report...");
        const company = await getCompanySettings().catch(() => null);
        
        // Generate report data from backend
        const response = await generateReport({
          reportType: reportId as any,
          format: "PDF",
          dateRange,
          startDate: dateRange === "custom" ? startDate : undefined,
          endDate: dateRange === "custom" ? endDate : undefined,
        });

        const reportData = response.data.reportData;
        let html = "";

        // Generate appropriate PDF based on report type
        switch (reportId) {
          case "sales":
            html = generateSalesReportPDF(reportData, company || {}, periodLabel);
            break;
          case "orders":
            html = generateOrdersReportPDF(reportData, company || {}, periodLabel);
            break;
          case "customers":
            html = generateCustomersReportPDF(reportData, company || {}, periodLabel);
            break;
          case "revenue":
            html = generateRevenueReportPDF(reportData, company || {}, periodLabel);
            break;
          case "tax":
            html = generateTaxReportPDF(reportData, company || {}, periodLabel);
            break;
          default:
            toast.error("PDF generation not implemented for this report type");
            return;
        }

        openPDFWindow(html);
        toast.success("PDF report generated successfully");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to generate PDF report");
      }
      return;
    }

    toast.info("This format is not supported yet.");
  };

  const stats = [
    {
      label: "Total Sales",
      value: formatCurrency(overview.totalSales),
      change:
        overview.revenueChange !== 0
          ? `${overview.revenueChange.toFixed(1)}%`
          : undefined,
      trend: overview.revenueChange >= 0 ? "up" : "down",
    },
    {
      label: "Total Orders",
      value: overview.totalOrders.toLocaleString(),
      change:
        overview.ordersChange !== 0
          ? `${overview.ordersChange.toFixed(1)}%`
          : undefined,
      trend: overview.ordersChange >= 0 ? "up" : "down",
    },
    {
      label: "Customers",
      value: overview.totalCustomers.toLocaleString(),
      change:
        overview.customersChange !== 0
          ? `${overview.customersChange.toFixed(1)}%`
          : undefined,
      trend: overview.customersChange >= 0 ? "up" : "down",
    },
    {
      label: "Profit",
      value: formatCurrency(overview.profit),
      change:
        overview.revenueChange !== 0
          ? `${overview.revenueChange.toFixed(1)}%`
          : undefined,
      trend: overview.revenueChange >= 0 ? "up" : "down",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-blue-100">
              Download comprehensive business reports
            </p>
          </div>
          <FileBarChart className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {stat.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p
                className={`text-xs ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change} from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className={`h-12 w-12 rounded-lg ${report.bgColor} flex items-center justify-center`}
                  >
                    <Icon className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <Badge variant="secondary">{report.formats.length} formats</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">{report.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {report.description}
                </p>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Download as:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {report.formats.map((format) => (
                      <Button
                        key={format}
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(report.id, format)}
                        className="flex-1"
                      >
                        {format === "PDF" && <FileText className="h-4 w-4 mr-1" />}
                        {format === "Excel" && (
                          <FileSpreadsheet className="h-4 w-4 mr-1" />
                        )}
                        {format === "CSV" && <Download className="h-4 w-4 mr-1" />}
                        {format}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={handleDownloadAll}
              disabled={downloadingAll}
            >
              <Archive className="h-4 w-4 mr-2" />
              {downloadingAll ? "Generating..." : "Download All Reports"}
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => setScheduleDialogOpen(true)}
            >
              <Clock className="h-4 w-4 mr-2" />
              Schedule Automated Reports
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => setHistoryDialogOpen(true)}
            >
              <History className="h-4 w-4 mr-2" />
              View Report History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Report Templates - Government Ready */}
      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-blue-600" />
            Government-Ready Performance Reports
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Professional reports with charts, graphs, and compliance certifications - Ready for government submission
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border-2 border-blue-300 rounded-lg bg-white">
              <div className="flex-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  📊 Monthly Performance Report
                  <Badge variant="default" className="bg-green-600">With Charts</Badge>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete monthly analysis with sales trends, expense breakdowns, customer analytics, inventory status, and payment insights. Includes bar charts, pie charts, and line graphs.
                </p>
                <p className="text-xs text-blue-600 font-medium mt-2">
                  ✓ Government Certified | ✓ Tax Compliant | ✓ Audit Ready
                </p>
              </div>
              <Button 
                variant="default" 
                className="ml-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => handleGenerateCustomReport('monthly')}
                disabled={generatingCustomReport === 'monthly'}
              >
                {generatingCustomReport === 'monthly' ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border-2 border-blue-300 rounded-lg bg-white">
              <div className="flex-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  📈 Quarterly Financial Report
                  <Badge variant="default" className="bg-green-600">With Charts</Badge>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Detailed 3-month financial analysis with month-by-month breakdown, financial ratios, KPIs, and comparative performance charts. Includes monthly sales comparison and profit trends.
                </p>
                <p className="text-xs text-blue-600 font-medium mt-2">
                  ✓ Statutory Compliance | ✓ GST Ready | ✓ Professional Format
                </p>
              </div>
              <Button 
                variant="default" 
                className="ml-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => handleGenerateCustomReport('quarterly')}
                disabled={generatingCustomReport === 'quarterly'}
              >
                {generatingCustomReport === 'quarterly' ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border-2 border-red-300 rounded-lg bg-red-50">
              <div className="flex-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  🏛️ Annual Business Report
                  <Badge variant="destructive">Official Document</Badge>
                  <Badge variant="default" className="bg-green-600">With Charts</Badge>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Complete FY report for government submission.</strong> Includes quarterly breakdown, YoY growth analysis, comprehensive financial ratios, tax statements, and management declarations. Features quarterly sales and profit trend charts.
                </p>
                <p className="text-xs text-red-600 font-bold mt-2">
                  🏛️ CERTIFIED FOR GOVERNMENT AUTHORITIES | Companies Act 2013 | IT Act 1961 | GST Act 2017
                </p>
              </div>
              <Button 
                variant="destructive" 
                className="ml-4"
                onClick={() => handleGenerateCustomReport('annual')}
                disabled={generatingCustomReport === 'annual'}
              >
                {generatingCustomReport === 'annual' ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              ℹ️ What's Included in Custom Reports:
            </h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>✓ <strong>Executive Summary</strong> with key financial metrics</li>
              <li>✓ <strong>Visual Charts & Graphs</strong> - Bar charts, pie charts, line graphs</li>
              <li>✓ <strong>Sales Analysis</strong> - Online/Offline breakdown with trends</li>
              <li>✓ <strong>Expense Analysis</strong> - Category-wise with pie chart distribution</li>
              <li>✓ <strong>Customer Analytics</strong> - Growth, retention, top customers</li>
              <li>✓ <strong>Inventory Status</strong> - Stock levels and product performance</li>
              <li>✓ <strong>Payment Analysis</strong> - Methods, success rates, transaction volumes</li>
              <li>✓ <strong>Financial Ratios</strong> - Profit margins, expense ratios, benchmarks</li>
              <li>✓ <strong>Tax Compliance</strong> - GST calculations and tax statements</li>
              <li>✓ <strong>Government Certification</strong> - Compliance notes and digital signatures</li>
              <li>✓ <strong>Professional Formatting</strong> - Suitable for official submission</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ScheduleReportsDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onSuccess={() => {
          toast.success("Report schedule created successfully");
        }}
      />
      <ReportHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
      />
    </div>
  );
}
