import { useState } from "react";
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

const dummyAddresses = [
  {
    id: "1",
    name: "Rahul Kumar",
    phone: "+91 98765 43210",
    address: "123, MG Road, Near City Mall",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
    isDefault: true,
  },
  {
    id: "2",
    name: "Rahul Kumar",
    phone: "+91 98765 43210",
    address: "456, Park Street, Opposite Metro Station",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    isDefault: false,
  },
];

const Checkout = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState(dummyAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState(addresses.find(a => a.isDefault)?.id || addresses[0]?.id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error("Please fill all fields");
      return;
    }

    const address = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, address]);
    setSelectedAddressId(address.id);
    setNewAddress({
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });
    setIsDialogOpen(false);
    toast.success("Address added successfully");
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }
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
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Address
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Address</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
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
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
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
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                        placeholder="123456"
                      />
                    </div>
                    <Button onClick={handleAddAddress} className="w-full">
                      Save Address
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
              <div className="space-y-4 mb-8">
                {addresses.map((address) => (
                  <Card key={address.id} className={`cursor-pointer transition-all ${selectedAddressId === address.id ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-bold">{address.name}</span>
                            {address.isDefault && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{address.address}</p>
                          <p className="text-sm text-muted-foreground mb-1">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>
                        </div>
                        {selectedAddressId === address.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
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
