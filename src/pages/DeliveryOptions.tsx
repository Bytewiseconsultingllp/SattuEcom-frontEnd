import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Gift, Package, Truck, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getActiveGiftDesigns, type GiftDesign } from "@/lib/api/gifts";

const DeliveryOptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const addressId = location.state?.addressId || (() => {
    try { return sessionStorage.getItem('selected_address_id') || undefined; } catch { return undefined; }
  })();
  
  // Initialize state from sessionStorage or location state
  const savedOptions = (() => {
    try {
      const stored = sessionStorage.getItem('delivery_options');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const [deliverySpeed, setDeliverySpeed] = useState(
    location.state?.deliveryOptions?.deliverySpeed || savedOptions?.deliverySpeed || "standard"
  );
  const [specialInstructions, setSpecialInstructions] = useState(
    location.state?.deliveryOptions?.specialInstructions || savedOptions?.specialInstructions || ""
  );
  
  // Gift state
  const [giftDesigns, setGiftDesigns] = useState<GiftDesign[]>([]);
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(
    location.state?.deliveryOptions?.selectedGiftId || savedOptions?.selectedGiftId || null
  );
  const [selectedGiftPrice, setSelectedGiftPrice] = useState<number>(
    location.state?.deliveryOptions?.giftPrice || savedOptions?.giftPrice || 0
  );
  const [selectedGiftName, setSelectedGiftName] = useState<string>(
    location.state?.deliveryOptions?.giftName || savedOptions?.giftName || ""
  );
  const [giftMessage, setGiftMessage] = useState(
    location.state?.deliveryOptions?.giftMessage || savedOptions?.giftMessage || ""
  );
  const [giftLoading, setGiftLoading] = useState(false);
  
  // Custom gift request modal state
  const [customGiftModalOpen, setCustomGiftModalOpen] = useState(false);
  const [customGiftForm, setCustomGiftForm] = useState({
    title: "",
    description: "",
    budget_min: "",
    budget_max: "",
    recipient_name: "",
    occasion: "birthday",
    recipient_preferences: "",
    design_images: [] as string[],
    reference_links: [] as string[],
  });
  const [imageInput, setImageInput] = useState("");
  const [linkInput, setLinkInput] = useState("");
  
  // Fetch gift designs
  useEffect(() => {
    (async () => {
      try {
        setGiftLoading(true);
        const res = await getActiveGiftDesigns();
        if (res?.success) setGiftDesigns(res.data || []);
      } catch {
        toast.error("Failed to load gift designs");
      } finally {
        setGiftLoading(false);
      }
    })();
  }, []);

  const selectedGift = selectedGiftId ? giftDesigns.find(g => g._id === selectedGiftId) : null;

  const addImageToCustomGift = () => {
    if (!imageInput.trim()) {
      toast.error("Please enter an image URL");
      return;
    }
    setCustomGiftForm(prev => ({
      ...prev,
      design_images: [...prev.design_images, imageInput.trim()],
    }));
    setImageInput("");
  };

  const removeImageFromCustomGift = (index: number) => {
    setCustomGiftForm(prev => ({
      ...prev,
      design_images: prev.design_images.filter((_, i) => i !== index),
    }));
  };

  const addLinkToCustomGift = () => {
    if (!linkInput.trim()) {
      toast.error("Please enter a reference link");
      return;
    }
    setCustomGiftForm(prev => ({
      ...prev,
      reference_links: [...prev.reference_links, linkInput.trim()],
    }));
    setLinkInput("");
  };

  const removeLinkFromCustomGift = (index: number) => {
    setCustomGiftForm(prev => ({
      ...prev,
      reference_links: prev.reference_links.filter((_, i) => i !== index),
    }));
  };

  const handleContinue = () => {
    if (!addressId) {
      toast.error("Address information missing");
      navigate("/checkout");
      return;
    }

    const deliveryOptionsData = {
      selectedGiftId,
      giftPrice: selectedGiftPrice,
      giftName: selectedGiftName,
      giftMessage,
      deliverySpeed,
      specialInstructions,
    };

    console.log('Passing to OrderReview:', deliveryOptionsData);

    try { 
      if (addressId) sessionStorage.setItem('selected_address_id', addressId);
      sessionStorage.setItem('delivery_options', JSON.stringify(deliveryOptionsData));
    } catch {}
    
    navigate("/order-review", { 
      state: { 
        addressId,
        deliveryOptions: deliveryOptionsData,
        customGiftRequest: customGiftForm.title || customGiftForm.description ? customGiftForm : null,
      } 
    });
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
              <Package className="h-6 w-6 text-lime-300" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">Delivery Options</h1>
            </div>
            <p className="text-sm md:text-base text-emerald-100">Customize your delivery preferences</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-8">
          <div className="max-w-3xl mx-auto space-y-4">
            
            {/* Delivery Speed */}
            <Card className="border border-emerald-100 shadow-sm bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-100">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Truck className="h-4 w-4 text-emerald-700" />
                  </div>
                  <h2 className="text-lg font-bold text-emerald-900">Delivery Speed</h2>
                </div>
                
                <RadioGroup value={deliverySpeed} onValueChange={setDeliverySpeed}>
                  <div className="space-y-3">
                    <div className={`flex items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer ${
                      deliverySpeed === 'standard' 
                        ? 'border-emerald-600 bg-emerald-50' 
                        : 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                    }`}>
                      <RadioGroupItem value="standard" id="standard" className="border-emerald-600" />
                      <Label htmlFor="standard" className="flex-1 cursor-pointer">
                        <div className="font-bold text-sm text-emerald-900">Standard Delivery (Free)</div>
                        <div className="text-xs text-emerald-600">5-7 business days</div>
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer ${
                      deliverySpeed === 'express' 
                        ? 'border-emerald-600 bg-emerald-50' 
                        : 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                    }`}>
                      <RadioGroupItem value="express" id="express" className="border-emerald-600" />
                      <Label htmlFor="express" className="flex-1 cursor-pointer">
                        <div className="font-bold text-sm text-emerald-900">Express Delivery (+₹50)</div>
                        <div className="text-xs text-emerald-600">2-3 business days</div>
                      </Label>
                    </div>
                    
                    {/* <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/5 cursor-pointer">
                      <RadioGroupItem value="overnight" id="overnight" />
                      <Label htmlFor="overnight" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Overnight Delivery (+₹150)</div>
                        <div className="text-sm text-muted-foreground">Next business day</div>
                      </Label>
                    </div> */}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Gift Selection */}
            <Card className="border border-emerald-100 shadow-sm bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Gift className="h-4 w-4 text-emerald-700" />
                    </div>
                    <h2 className="text-lg font-bold text-emerald-900">Select a Gift Design</h2>
                  </div>
                  <Dialog open={customGiftModalOpen} onOpenChange={setCustomGiftModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                        <Gift className="h-4 w-4 mr-2" />
                        Custom Gift
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Submit Custom Gift Request</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Gift Title *</Label>
                          <Input
                            placeholder="e.g., Personalized Birthday Gift Box"
                            value={customGiftForm.title}
                            onChange={(e) => setCustomGiftForm(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Description *</Label>
                          <Textarea
                            placeholder="Describe your custom gift idea in detail..."
                            value={customGiftForm.description}
                            onChange={(e) => setCustomGiftForm(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Budget Min (₹)</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 1000"
                              value={customGiftForm.budget_min}
                              onChange={(e) => setCustomGiftForm(prev => ({ ...prev, budget_min: e.target.value }))}
                              min="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Budget Max (₹)</Label>
                            <Input
                              type="number"
                              placeholder="e.g., 5000"
                              value={customGiftForm.budget_max}
                              onChange={(e) => setCustomGiftForm(prev => ({ ...prev, budget_max: e.target.value }))}
                              min="0"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Recipient Name</Label>
                          <Input
                            placeholder="e.g., Neha"
                            value={customGiftForm.recipient_name}
                            onChange={(e) => setCustomGiftForm(prev => ({ ...prev, recipient_name: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Occasion</Label>
                          <Select value={customGiftForm.occasion} onValueChange={(value) => setCustomGiftForm(prev => ({ ...prev, occasion: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="birthday">Birthday</SelectItem>
                              <SelectItem value="anniversary">Anniversary</SelectItem>
                              <SelectItem value="wedding">Wedding</SelectItem>
                              <SelectItem value="corporate">Corporate</SelectItem>
                              <SelectItem value="thank-you">Thank You</SelectItem>
                              <SelectItem value="congratulations">Congratulations</SelectItem>
                              <SelectItem value="get-well">Get Well</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Recipient Preferences</Label>
                          <Textarea
                            placeholder="e.g., Likes flowers, prefers dark chocolates..."
                            value={customGiftForm.recipient_preferences}
                            onChange={(e) => setCustomGiftForm(prev => ({ ...prev, recipient_preferences: e.target.value }))}
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Design Images (URLs)</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Paste image URL"
                              value={imageInput}
                              onChange={(e) => setImageInput(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addImageToCustomGift();
                                }
                              }}
                            />
                            <Button type="button" variant="outline" onClick={addImageToCustomGift}>
                              Add
                            </Button>
                          </div>
                          {customGiftForm.design_images.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                              {customGiftForm.design_images.map((img, idx) => (
                                <Badge key={idx} variant="secondary" className="px-2 py-1">
                                  <span className="truncate max-w-[150px]">{img}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeImageFromCustomGift(idx)}
                                    className="ml-2 text-xs"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Reference Links</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Paste reference link"
                              value={linkInput}
                              onChange={(e) => setLinkInput(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addLinkToCustomGift();
                                }
                              }}
                            />
                            <Button type="button" variant="outline" onClick={addLinkToCustomGift}>
                              Add
                            </Button>
                          </div>
                          {customGiftForm.reference_links.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                              {customGiftForm.reference_links.map((link, idx) => (
                                <Badge key={idx} variant="secondary" className="px-2 py-1">
                                  <span className="truncate max-w-[150px]">{link}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeLinkFromCustomGift(idx)}
                                    className="ml-2 text-xs"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Note: Custom gift requests will be submitted after order placement.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {giftLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </div>
                ) : giftDesigns.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No gift designs available</p>
                ) : (
                  <div className="space-y-3">
                    {giftDesigns.map((gift) => (
                      
                      <div
                        key={gift._id}
                        onClick={() => {
                          console.log(gift)
                          setSelectedGiftId(gift._id);
                          setSelectedGiftPrice(Number(gift.price || 0));
                          setSelectedGiftName(gift.name || "");
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedGiftId === gift._id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {gift.image_url && (
                            <img
                              src={gift.image_url}
                              alt={gift.name}
                              className="h-20 w-20 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{gift.name}</h3>
                              <span className="text-lg font-bold text-primary">₹{gift.price}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{gift.description}</p>
                            {gift.category && (
                              <Badge variant="outline" className="mt-2 text-xs capitalize">
                                {gift.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedGift && (
                  <div className="mt-4 p-4 bg-accent/5 rounded-lg">
                    <p className="text-sm">
                      <span className="font-semibold">Selected:</span> {selectedGift.name} - ₹{selectedGift.price}
                    </p>
                  </div>
                )}

                {selectedGift && (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="gift-msg">Gift Card Message (Optional)</Label>
                    <Textarea
                      id="gift-msg"
                      placeholder="Write a personalized message for the recipient..."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {giftMessage.length}/200 characters
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card className="border border-emerald-100 shadow-sm bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-100">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Package className="h-4 w-4 text-emerald-700" />
                  </div>
                  <h2 className="text-lg font-bold text-emerald-900">Special Instructions</h2>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    placeholder="E.g., Call before delivery, Leave at door, Ring the bell, etc."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    rows={3}
                    maxLength={150}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {specialInstructions.length}/150 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center sticky bottom-0 bg-white/90 backdrop-blur py-3 border-t border-emerald-100 rounded-t-xl shadow-md gap-3">
              <Button variant="outline" onClick={() => navigate("/checkout")} className="border border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                Back to Address
              </Button>
              <Button onClick={handleContinue} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
                Continue to Review Order
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DeliveryOptions;
