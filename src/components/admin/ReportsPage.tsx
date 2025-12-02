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
} from "lucide-react";
import { toast } from "sonner";
import { getAdminDashboardStats } from "@/lib/api/dashboardStats";
import { exportOfflineSales } from "@/lib/api/offlineSales";
import { getCompanySettings } from "@/lib/api/companySettings";
import { getExpenses } from "@/lib/api/expenses";

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

  const handleDownload = async (reportId: string, format: string) => {
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

    if (format !== "CSV" && format !== "Excel") {
      toast.info("Only CSV/Excel exports are supported at the moment.");
      return;
    }

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
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Download All Reports (ZIP)
            </Button>
            <Button variant="outline" className="justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Automated Reports
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              View Report History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Monthly Performance Report</p>
                <p className="text-sm text-muted-foreground">
                  Sales, Orders, Revenue combined
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Quarterly Financial Report</p>
                <p className="text-sm text-muted-foreground">
                  P&L, Revenue, Expenses combined
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Annual Business Report</p>
                <p className="text-sm text-muted-foreground">
                  Complete year overview with all metrics
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
