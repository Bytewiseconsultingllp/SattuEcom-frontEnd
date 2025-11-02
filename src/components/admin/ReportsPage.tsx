import { useState } from "react";
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

export function ReportsPage() {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
      id: "inventory",
      title: "Inventory Report",
      description: "Stock levels and product availability",
      icon: FileText,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      formats: ["PDF", "Excel", "CSV"],
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

  const handleDownload = (reportId: string, format: string) => {
    toast.success(`Downloading ${reportId} report as ${format}...`);
    // TODO: Implement actual download logic
  };

  const stats = [
    {
      label: "Total Sales",
      value: "₹2,45,890",
      change: "+12.5%",
      trend: "up",
    },
    {
      label: "Total Orders",
      value: "1,234",
      change: "+8.2%",
      trend: "up",
    },
    {
      label: "Customers",
      value: "856",
      change: "+15.3%",
      trend: "up",
    },
    {
      label: "Profit",
      value: "₹45,230",
      change: "-2.1%",
      trend: "down",
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
