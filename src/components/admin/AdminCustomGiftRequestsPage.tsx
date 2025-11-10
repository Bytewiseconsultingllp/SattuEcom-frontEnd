import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getAllAdminCustomGiftRequests,
  updateCustomGiftRequest,
  deleteCustomGiftRequest,
  type CustomGiftRequest,
} from "@/lib/api/gifts";
import { Textarea } from "../ui/textarea";

function AdminCustomGiftRequestsPage() {
  const [requests, setRequests] = useState<CustomGiftRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CustomGiftRequest | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | string>("all");

  // Edit form state
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDate, setEditDate] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);
      const res = await getAllAdminCustomGiftRequests();
      if (res.success) {
        setRequests(res.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch custom gift requests");
    } finally {
      setLoading(false);
    }
  }

  function handleViewRequest(request: CustomGiftRequest) {
    setSelectedRequest(request);
    setEditStatus(request.status);
    setEditNotes(request.admin_notes || "");
    setEditPrice(request.estimated_price?.toString() || "");
    setEditDate(request.estimated_completion_date?.split("T")[0] || "");
    setIsViewOpen(true);
  }

  async function handleUpdateRequest() {
    if (!selectedRequest) return;

    try {
      const payload: any = {
        status: editStatus,
      };
      if (editNotes) payload.admin_notes = editNotes;
      if (editPrice) payload.estimated_price = Number(editPrice);
      if (editDate) payload.estimated_completion_date = new Date(editDate).toISOString();

      const res = await updateCustomGiftRequest(selectedRequest.id, payload);
      if (res.success) {
        toast.success("Custom gift request updated successfully");
        setIsViewOpen(false);
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update request");
    }
  }

  async function handleDeleteRequest(requestId: string) {
    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      const res = await deleteCustomGiftRequest(requestId);
      if (res.success) {
        toast.success("Custom gift request deleted successfully");
        fetchRequests();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete request");
    }
  }

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch = searchQuery.trim()
        ? r.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          r.recipient_name?.toLowerCase().includes(searchQuery.trim().toLowerCase())
        : true;
      const matchesStatus = filterStatus === "all" ? true : r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Custom Gift Requests</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input
          placeholder="Search by title or recipient name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("all");
            }}
          >
            Reset
          </Button>
          <Button variant="outline" className="flex-1" onClick={fetchRequests}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading requests...</p>
        ) : filteredRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No custom gift requests found.</p>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Title</p>
                    <p className="text-base font-semibold">{request.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recipient</p>
                    <p className="text-base">{request.recipient_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Occasion</p>
                    <p className="text-base capitalize">{request.occasion || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge className={`${getStatusColor(request.status)} capitalize`}>
                      {request.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                {request.description && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{request.description}</p>
                  </div>
                )}

                {(request.budget_min || request.budget_max) && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-muted-foreground">Budget</p>
                    <p className="text-sm">
                      ₹{request.budget_min || "0"} - ₹{request.budget_max || "∞"}
                    </p>
                  </div>
                )}

                {request.estimated_price != null && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-muted-foreground">Estimated Price</p>
                    <p className="text-sm font-semibold">₹{request.estimated_price}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => handleViewRequest(request)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View & Update
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRequest(request.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View & Edit Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Custom Gift Request Details</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="text-base font-semibold">{selectedRequest.title}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm text-gray-700">{selectedRequest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recipient Name</p>
                  <p className="text-sm">{selectedRequest.recipient_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Occasion</p>
                  <p className="text-sm capitalize">{selectedRequest.occasion || "N/A"}</p>
                </div>
              </div>

              {selectedRequest.recipient_preferences && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recipient Preferences</p>
                  <p className="text-sm text-gray-700">{selectedRequest.recipient_preferences}</p>
                </div>
              )}

              {(selectedRequest.budget_min || selectedRequest.budget_max) && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Budget Range</p>
                  <p className="text-sm">
                    ₹{selectedRequest.budget_min || "0"} - ₹{selectedRequest.budget_max || "∞"}
                  </p>
                </div>
              )}

              {selectedRequest.design_images && selectedRequest.design_images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Design Images</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedRequest.design_images.map((img, idx) => (
                      <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm underline">
                        Image {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <hr className="my-4" />

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Admin Notes</label>
                <Textarea
                  placeholder="Add notes for this request..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estimated Price (₹)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 2999"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estimated Completion Date</label>
                  <Input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateRequest}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminCustomGiftRequestsPage;
