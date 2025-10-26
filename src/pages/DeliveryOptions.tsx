import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Gift, Package, Truck } from "lucide-react";
import { toast } from "sonner";

const DeliveryOptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const addressId = location.state?.addressId || (() => {
    try { return sessionStorage.getItem('selected_address_id') || undefined; } catch { return undefined; }
  })();
  
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [deliverySpeed, setDeliverySpeed] = useState("standard");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const handleContinue = () => {
    if (!addressId) {
      toast.error("Address information missing");
      navigate("/checkout");
      return;
    }

    try { if (addressId) sessionStorage.setItem('selected_address_id', addressId); } catch {}
    navigate("/order-review", { 
      state: { 
        addressId,
        deliveryOptions: {
          isGift,
          giftMessage,
          deliverySpeed,
          specialInstructions,
        }
      } 
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="bg-gradient-hero py-12 mb-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-primary-foreground mb-4">Delivery Options</h1>
            <p className="text-lg text-primary-foreground/90">Customize your delivery preferences</p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Delivery Speed */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">Delivery Speed</h2>
                </div>
                
                <RadioGroup value={deliverySpeed} onValueChange={setDeliverySpeed}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/5 cursor-pointer">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Standard Delivery (Free)</div>
                        <div className="text-sm text-muted-foreground">5-7 business days</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/5 cursor-pointer">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Express Delivery (+₹50)</div>
                        <div className="text-sm text-muted-foreground">2-3 business days</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/5 cursor-pointer">
                      <RadioGroupItem value="overnight" id="overnight" />
                      <Label htmlFor="overnight" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Overnight Delivery (+₹150)</div>
                        <div className="text-sm text-muted-foreground">Next business day</div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Gift Options */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">Gift Options</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 rounded-lg border">
                    <Checkbox 
                      id="gift" 
                      checked={isGift}
                      onCheckedChange={(checked) => setIsGift(checked as boolean)}
                    />
                    <Label htmlFor="gift" className="flex-1 cursor-pointer">
                      <div className="font-semibold">Send as a gift (+₹30)</div>
                      <div className="text-sm text-muted-foreground">
                        Includes gift wrapping and personalized message card
                      </div>
                    </Label>
                  </div>
                  
                  {isGift && (
                    <div className="ml-12 space-y-2 animate-fade-in">
                      <Label htmlFor="gift-message">Gift Message (Optional)</Label>
                      <Textarea
                        id="gift-message"
                        placeholder="Write a personalized message for the recipient..."
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        rows={4}
                        maxLength={200}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {giftMessage.length}/200 characters
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">Special Instructions</h2>
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

            <div className="flex justify-between items-center sticky bottom-0 bg-background py-4 border-t">
              <Button variant="outline" onClick={() => navigate("/checkout")}>
                Back to Address
              </Button>
              <Button size="lg" onClick={handleContinue}>
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
