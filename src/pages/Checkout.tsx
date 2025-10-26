import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, MapPin, Check } from "lucide-react";
import { toast } from "sonner";
import { getAddresses as apiGetAddresses, createAddress as apiCreateAddress, updateAddress as apiUpdateAddress } from "@/lib/api/addresses";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Checkout = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editAddressId, setEditAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    address_line1: "",
    city: "",
    state: "",
    postal_code: "",
    is_default: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGetAddresses();
        if (res?.success) {
          setAddresses(res.data || []);
          const def = (res.data || []).find((a: any) => a.is_default);
          setSelectedAddressId(def?.id || (res.data?.[0]?.id));
        }
      } catch (e: any) {
        toast.error(e.message || "Failed to load addresses");
      }
    })();
  }, []);

  const handleAddAddress = async () => {
    const phoneOk = /^\+?\d{10,15}$/.test(newAddress.phone);
    const pinOk = /^\d{5,6}$/.test(newAddress.postal_code);
    if (!newAddress.label || !newAddress.full_name || !newAddress.phone || !newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.postal_code) {
      toast.error("Please fill all fields");
      return;
    }
    if (!phoneOk) { toast.error("Enter a valid phone number"); return; }
    if (!pinOk) { toast.error("Enter a valid pincode"); return; }

    try {
      const payload = { ...newAddress, country: 'India' };
      if (editAddressId) {
        const res = await apiUpdateAddress(editAddressId, payload);
        if (res?.success) {
          const updated = res.data;
          setAddresses(prev => prev.map(a => a.id === editAddressId ? updated : a));
          setSelectedAddressId(updated.id);
          setIsDialogOpen(false);
          setEditAddressId(null);
          resetForm();
          toast.success("Address updated successfully");
        }
      } else {
        const res = await apiCreateAddress(payload);
        if (res?.success) {
          const created = res.data;
          setAddresses(prev => [created, ...prev]);
          setSelectedAddressId(created.id);
          resetForm();
          setIsDialogOpen(false);
          toast.success("Address added successfully");
        }
      }
    } catch (e: any) {
      toast.error(e.message || (editAddressId ? "Failed to update address" : "Failed to add address"));
    }
  };

  const resetForm = () => {
    setNewAddress({
      label: "Home",
      full_name: "",
      phone: "",
      address_line1: "",
      city: "",
      state: "",
      postal_code: "",
      is_default: false,
    });
  };

  const openEdit = (address: any) => {
    setEditAddressId(address.id);
    setNewAddress({
      label: address.label || "Home",
      full_name: address.full_name || "",
      phone: address.phone || "",
      address_line1: address.address_line1 || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      is_default: !!address.is_default,
    });
    setIsDialogOpen(true);
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }
    try { sessionStorage.setItem('selected_address_id', selectedAddressId); } catch {}
    navigate("/delivery-options", { state: { addressId: selectedAddressId } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="bg-gradient-hero py-12 mb-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-primary-foreground mb-4">Select Delivery Address</h1>
            <p className="text-lg text-primary-foreground/90">Choose where you want your order delivered</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Saved Addresses</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditAddressId(null); resetForm(); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Address
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editAddressId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="label">Label</Label>
                      <Select value={newAddress.label} onValueChange={(v) => setNewAddress({ ...newAddress, label: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select label" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name"
                        value={newAddress.full_name}
                        onChange={(e) => setNewAddress({...newAddress, full_name: e.target.value})}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea 
                        id="address"
                        value={newAddress.address_line1}
                        onChange={(e) => setNewAddress({...newAddress, address_line1: e.target.value})}
                        placeholder="House No., Building Name, Street Name"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input 
                          id="state"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                          placeholder="State"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input 
                        id="pincode"
                        value={newAddress.postal_code}
                        onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
                        placeholder="123456"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input id="is_default" type="checkbox" checked={newAddress.is_default} onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })} />
                      <Label htmlFor="is_default">Set as default</Label>
                    </div>
                    <Button onClick={handleAddAddress} className="w-full">
                      {editAddressId ? 'Update Address' : 'Save Address'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
              <div className="space-y-4 mb-8">
                {addresses.map((address: any) => (
                  <Card key={address.id} className={`cursor-pointer transition-all ${selectedAddressId === address.id ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-bold">{address.full_name}</span>
                            {address.label && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{address.label}</span>
                            )}
                            {address.is_default && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}</p>
                          <p className="text-sm text-muted-foreground mb-1">
                            {address.city}, {address.state} - {address.postal_code}
                          </p>
                          <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>
                        </div>
                        {selectedAddressId === address.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                        <div className="ml-auto">
                          <Button variant="outline" size="sm" onClick={() => openEdit(address)}>Edit</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>

            <div className="flex justify-between items-center sticky bottom-0 bg-background py-4 border-t">
              <Button variant="outline" onClick={() => navigate("/cart")}>
                Back to Cart
              </Button>
              <Button size="lg" onClick={handleContinue}>
                Continue to Delivery Options
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
