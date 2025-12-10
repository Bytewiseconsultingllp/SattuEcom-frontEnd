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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-lime-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-700 py-8 mb-6">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
          <div className="absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-700/30 blur-3xl" />
          <div className="absolute -right-24 top-1/3 h-48 w-48 rounded-full bg-lime-400/20 blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-6 w-6 text-lime-300" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">Delivery Address</h1>
            </div>
            <p className="text-sm md:text-base text-emerald-100">Choose where you want your order delivered</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-4 p-4 bg-white/80 backdrop-blur rounded-xl border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-emerald-700" />
                </div>
                <h2 className="text-lg font-bold text-emerald-900">Saved Addresses</h2>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditAddressId(null); resetForm(); }} className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
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
              <div className="space-y-3 mb-6">
                {addresses.map((address: any) => (
                  <Card key={address.id} className={`cursor-pointer transition-all border hover:shadow-md bg-white/80 backdrop-blur ${
                    selectedAddressId === address.id 
                      ? 'ring-1 ring-emerald-600 border-emerald-600 shadow-sm' 
                      : 'border-emerald-100 hover:border-emerald-300'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={address.id} id={address.id} className="mt-0.5 border-emerald-600" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <MapPin className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                            <span className="font-bold text-sm text-emerald-900">{address.full_name}</span>
                            {address.label && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">{address.label}</span>
                            )}
                            {address.is_default && (
                              <span className="text-xs bg-lime-100 text-lime-700 px-1.5 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-emerald-700 mb-0.5">{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}</p>
                          <p className="text-xs text-emerald-700 mb-0.5">
                            {address.city}, {address.state} - {address.postal_code}
                          </p>
                          <p className="text-xs text-emerald-600">Phone: {address.phone}</p>
                        </div>
                        {selectedAddressId === address.id && (
                          <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-emerald-700" />
                          </div>
                        )}
                        <Button variant="outline" size="sm" onClick={() => openEdit(address)} className="border-emerald-600 text-emerald-700 hover:bg-emerald-700 text-xs h-7 px-2">
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>

            <div className="flex justify-between items-center sticky bottom-0 bg-white/90 backdrop-blur py-3 border-t border-emerald-100 rounded-t-xl shadow-md gap-3">
              <Button variant="outline" onClick={() => navigate("/cart")} className="border border-emerald-600 text-emerald-700 hover:bg-emerald-700">
                Back to Cart
              </Button>
              <Button onClick={handleContinue} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
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
