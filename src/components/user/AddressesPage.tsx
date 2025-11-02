import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Home,
  Briefcase,
  MapPinned,
  Phone,
  Mail,
  Star,
  CheckCircle2,
} from "lucide-react";
import {
  getAddresses as apiGetAddresses,
  createAddress as apiCreateAddress,
  updateAddress as apiUpdateAddress,
  deleteAddress as apiDeleteAddress,
  setDefaultAddress as apiSetDefaultAddress,
} from "@/lib/api/addresses";
import { toast } from "sonner";

export function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await apiGetAddresses();
      if (response?.success) {
        setAddresses(response.data || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch addresses:", error);
      toast.error(error.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      label: "Home",
      full_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      is_default: false,
    });
    setEditingId(null);
  };

  const handleOpenDialog = (address?: any) => {
    if (address) {
      setFormData({
        label: address.label || "Home",
        full_name: address.full_name || "",
        phone: address.phone || "",
        address_line1: address.address_line1 || "",
        address_line2: address.address_line2 || "",
        city: address.city || "",
        state: address.state || "",
        postal_code: address.postal_code || "",
        country: address.country || "India",
        is_default: address.is_default || false,
      });
      setEditingId(address.id);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSaveAddress = async () => {
    // Validation
    if (!formData.full_name || !formData.phone || !formData.address_line1 || !formData.city || !formData.state || !formData.postal_code) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await apiUpdateAddress(editingId, formData);
        toast.success("Address updated successfully");
      } else {
        await apiCreateAddress(formData);
        toast.success("Address added successfully");
      }
      setDialogOpen(false);
      resetForm();
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await apiDeleteAddress(id);
      toast.success("Address deleted successfully");
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiSetDefaultAddress(id);
      toast.success("Default address updated");
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.message || "Failed to set default address");
    }
  };

  const getLabelIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "home":
        return <Home className="h-4 w-4" />;
      case "work":
        return <Briefcase className="h-4 w-4" />;
      default:
        return <MapPinned className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Saved Addresses</h1>
            <p className="text-green-100">
              Manage your delivery addresses
            </p>
          </div>
          <MapPin className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Addresses</p>
                <p className="text-2xl font-bold">{addresses.length}</p>
              </div>
              <MapPin className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Default Address</p>
                <p className="text-2xl font-bold">
                  {addresses.filter((a) => a.is_default).length}
                </p>
              </div>
              <Star className="h-10 w-10 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Button onClick={() => handleOpenDialog()} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Address
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
              <p className="text-muted-foreground mb-4">
                Add your first delivery address to get started
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`overflow-hidden transition-all hover:shadow-lg ${
                address.is_default ? "border-2 border-primary" : ""
              }`}
            >
              <CardHeader className="bg-muted/30 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {getLabelIcon(address.label)}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {address.label}
                        {address.is_default && (
                          <Badge variant="default" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {address.full_name}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* Address */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p>{address.address_line1}</p>
                      {address.address_line2 && <p>{address.address_line2}</p>}
                      <p>
                        {address.city}, {address.state} - {address.postal_code}
                      </p>
                      <p className="text-muted-foreground">{address.country || "India"}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{address.phone}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    {!address.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                        className="flex-1"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(address)}
                      className={address.is_default ? "flex-1" : ""}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="label">Address Label *</Label>
              <Select
                value={formData.label}
                onValueChange={(value) => setFormData({ ...formData, label: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Home
                    </div>
                  </SelectItem>
                  <SelectItem value="Work">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Work
                    </div>
                  </SelectItem>
                  <SelectItem value="Other">
                    <div className="flex items-center gap-2">
                      <MapPinned className="h-4 w-4" />
                      Other
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Address Line 1 */}
            <div className="space-y-2">
              <Label htmlFor="address_line1">Address Line 1 *</Label>
              <Textarea
                id="address_line1"
                placeholder="House/Flat No., Building Name, Street"
                rows={2}
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              />
            </div>

            {/* Address Line 2 */}
            <div className="space-y-2">
              <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
              <Textarea
                id="address_line2"
                placeholder="Landmark, Area"
                rows={2}
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              />
            </div>

            {/* City, State, Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code *</Label>
                <Input
                  id="postal_code"
                  placeholder="PIN Code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
              </div>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>

            {/* Set as Default */}
            <div className="flex items-center gap-2 pt-2">
              <input
                id="is_default"
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="is_default" className="cursor-pointer">
                Set as default address
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAddress}>
              {editingId ? "Update Address" : "Add Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
