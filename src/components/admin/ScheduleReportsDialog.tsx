import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { scheduleReport } from "@/lib/api/reports";
import { X } from "lucide-react";

interface ScheduleReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ScheduleReportsDialog({ open, onOpenChange, onSuccess }: ScheduleReportsDialogProps) {
  const [frequency, setFrequency] = useState<string>("monthly");
  const [emailRecipients, setEmailRecipients] = useState<string[]>([""]);
  const [selectedReports, setSelectedReports] = useState<string[]>(["profit-loss"]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["PDF"]);
  const [loading, setLoading] = useState(false);

  const reportOptions = [
    { id: "sales", label: "Sales Report" },
    { id: "orders", label: "Orders Report" },
    { id: "customers", label: "Customer Base Report" },
    { id: "profit-loss", label: "Profit & Loss Statement" },
    { id: "revenue", label: "Revenue Report" },
    { id: "expenses", label: "Expenses Report" },
    { id: "tax", label: "Tax Report" },
  ];

  const formatOptions = [
    { id: "PDF", label: "PDF" },
    { id: "Excel", label: "Excel" },
    { id: "CSV", label: "CSV" },
  ];

  const handleAddEmail = () => {
    setEmailRecipients([...emailRecipients, ""]);
  };

  const handleRemoveEmail = (index: number) => {
    const newEmails = emailRecipients.filter((_, i) => i !== index);
    setEmailRecipients(newEmails);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emailRecipients];
    newEmails[index] = value;
    setEmailRecipients(newEmails);
  };

  const toggleReport = (reportId: string) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const toggleFormat = (formatId: string) => {
    setSelectedFormats(prev =>
      prev.includes(formatId)
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    );
  };

  const handleSubmit = async () => {
    // Validation
    const validEmails = emailRecipients.filter(email => email.trim() !== "");
    if (validEmails.length === 0) {
      toast.error("Please add at least one email recipient");
      return;
    }

    if (selectedReports.length === 0) {
      toast.error("Please select at least one report type");
      return;
    }

    if (selectedFormats.length === 0) {
      toast.error("Please select at least one format");
      return;
    }

    setLoading(true);
    try {
      await scheduleReport({
        reportTypes: selectedReports,
        frequency: frequency as any,
        emailRecipients: validEmails,
        formats: selectedFormats,
      });
      toast.success("Report schedule created successfully");
      onSuccess();
      onOpenChange(false);
      // Reset form
      setFrequency("monthly");
      setEmailRecipients([""]);
      setSelectedReports(["profit-loss"]);
      setSelectedFormats(["PDF"]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to schedule report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Automated Reports</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Report Types */}
          <div className="space-y-2">
            <Label>Report Types</Label>
            <div className="space-y-2 border rounded-lg p-4">
              {reportOptions.map((report) => (
                <div key={report.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`report-${report.id}`}
                    checked={selectedReports.includes(report.id)}
                    onCheckedChange={() => toggleReport(report.id)}
                  />
                  <label
                    htmlFor={`report-${report.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {report.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Formats */}
          <div className="space-y-2">
            <Label>Formats</Label>
            <div className="flex gap-4">
              {formatOptions.map((format) => (
                <div key={format.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`format-${format.id}`}
                    checked={selectedFormats.includes(format.id)}
                    onCheckedChange={() => toggleFormat(format.id)}
                  />
                  <label
                    htmlFor={`format-${format.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {format.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Email Recipients */}
          <div className="space-y-2">
            <Label>Email Recipients</Label>
            <div className="space-y-2">
              {emailRecipients.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                  />
                  {emailRecipients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveEmail(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddEmail}
              >
                + Add Email
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
