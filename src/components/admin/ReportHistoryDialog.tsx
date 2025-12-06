import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getReportHistory, ReportHistoryItem } from "@/lib/api/reports";
import { toast } from "sonner";
import { FileText, Calendar, User, Download } from "lucide-react";

interface ReportHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportHistoryDialog({ open, onOpenChange }: ReportHistoryDialogProps) {
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open, currentPage]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await getReportHistory({ page: currentPage, limit: 10 });
      setHistory(response.data.history);
      setTotalPages(response.data.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sales: "Sales Report",
      orders: "Orders Report",
      customers: "Customer Base Report",
      "profit-loss": "Profit & Loss",
      revenue: "Revenue Report",
      expenses: "Expenses Report",
      tax: "Tax Report",
    };
    return labels[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "N/A";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Generation History</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No reports generated yet</div>
          ) : (
            <>
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item._id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">
                              {getReportTypeLabel(item.report_type)}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {item.date_range.label}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                          {item.generated_by && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {item.generated_by.name || item.generated_by.email}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.format}</Badge>
                          <Badge
                            variant={
                              item.status === "completed"
                                ? "default"
                                : item.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {item.status}
                          </Badge>
                          {item.is_scheduled && (
                            <Badge variant="secondary">Scheduled</Badge>
                          )}
                          {item.file_size > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(item.file_size)}
                            </span>
                          )}
                        </div>

                        {item.error_message && (
                          <p className="text-sm text-destructive">{item.error_message}</p>
                        )}
                      </div>

                      {item.file_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={item.file_url} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
