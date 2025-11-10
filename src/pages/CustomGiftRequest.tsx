import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Gift, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitCustomGiftRequest } from "@/lib/api/gifts";
import { getUserCookie } from "@/utils/cookie";

const CustomGiftRequest = () => {
  const navigate = useNavigate();
  const user = getUserCookie();

  const [formData, setFormData] = useState({
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const occasions = [
    "birthday",
    "anniversary",
    "wedding",
    "corporate",
    "baby-shower",
    "graduation",
    "thank-you",
    "congratulations",
    "get-well",
    "other",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOccasionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, occasion: value }));
  };

  const addImage = () => {
    if (!imageInput.trim()) {
      toast.error("Please enter an image URL");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      design_images: [...prev.design_images, imageInput.trim()],
    }));
    setImageInput("");
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      design_images: prev.design_images.filter((_, i) => i !== index),
    }));
  };

  const addLink = () => {
    if (!linkInput.trim()) {
      toast.error("Please enter a reference link");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      reference_links: [...prev.reference_links, linkInput.trim()],
    }));
    setLinkInput("");
  };

  const removeLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      reference_links: prev.reference_links.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    // Budget validation
    if (formData.budget_min || formData.budget_max) {
      const min = Number(formData.budget_min) || 0;
      const max = Number(formData.budget_max) || 0;
      if (max > 0 && min > max) {
        toast.error("Minimum budget cannot be greater than maximum budget");
        return;
      }
    }

    if (!user?.id) {
      toast.error("Please log in to submit a custom gift request");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        budget_min: formData.budget_min ? Number(formData.budget_min) : undefined,
        budget_max: formData.budget_max ? Number(formData.budget_max) : undefined,
        recipient_name: formData.recipient_name.trim() || undefined,
        occasion: formData.occasion,
        recipient_preferences: formData.recipient_preferences.trim() || undefined,
        design_images: formData.design_images.length > 0 ? formData.design_images : undefined,
        reference_links: formData.reference_links.length > 0 ? formData.reference_links : undefined,
      };

      const res = await submitCustomGiftRequest(payload as any);

      if (res.success) {
        toast.success("Custom gift request submitted successfully!");
        // Reset form
        setFormData({
          title: "",
          description: "",
          budget_min: "",
          budget_max: "",
          recipient_name: "",
          occasion: "birthday",
          recipient_preferences: "",
          design_images: [],
          reference_links: [],
        });
        // Redirect to user dashboard
        setTimeout(() => {
          navigate("/user/dashboard", { state: { tab: "custom-gifts" } });
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit custom gift request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="bg-gradient-hero py-12 mb-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="h-8 w-8 text-primary-foreground" />
              <h1 className="text-4xl font-bold text-primary-foreground">Custom Gift Request</h1>
            </div>
            <p className="text-lg text-primary-foreground/90">
              Tell us about your dream gift design and we'll create it for you
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Custom Gift Design</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Gift Title *</label>
                    <Input
                      name="title"
                      placeholder="e.g., Personalized Birthday Gift Box"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Description *</label>
                    <Textarea
                      name="description"
                      placeholder="Describe your custom gift idea in detail. Include colors, items, themes, and any special requirements..."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={5}
                      required
                    />
                  </div>

                  {/* Budget Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Budget Min (₹)</label>
                      <Input
                        name="budget_min"
                        type="number"
                        placeholder="e.g., 1000"
                        value={formData.budget_min}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Budget Max (₹)</label>
                      <Input
                        name="budget_max"
                        type="number"
                        placeholder="e.g., 5000"
                        value={formData.budget_max}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Recipient Details */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Recipient Name</label>
                    <Input
                      name="recipient_name"
                      placeholder="e.g., Neha"
                      value={formData.recipient_name}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Occasion */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Occasion</label>
                    <Select value={formData.occasion} onValueChange={handleOccasionChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {occasions.map((occ) => (
                          <SelectItem key={occ} value={occ}>
                            {occ.charAt(0).toUpperCase() + occ.slice(1).replace("-", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recipient Preferences */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Recipient Preferences</label>
                    <Textarea
                      name="recipient_preferences"
                      placeholder="e.g., Likes flowers, prefers dark chocolates, favorite colors are red and gold..."
                      value={formData.recipient_preferences}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  {/* Design Images */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Design Images (URLs)</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Paste image URL (e.g., https://example.com/image.jpg)"
                        value={imageInput}
                        onChange={(e) => setImageInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addImage();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={addImage}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.design_images.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.design_images.map((img, idx) => (
                          <Badge key={idx} variant="secondary" className="px-2 py-1">
                            <span className="truncate max-w-[200px]">{img}</span>
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reference Links */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Reference Links</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Paste reference link (e.g., Pinterest, Instagram, website)"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addLink();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={addLink}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.reference_links.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.reference_links.map((link, idx) => (
                          <Badge key={idx} variant="secondary" className="px-2 py-1">
                            <span className="truncate max-w-[200px]">{link}</span>
                            <button
                              type="button"
                              onClick={() => removeLink(idx)}
                              className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Gift className="mr-2 h-4 w-4" />
                          Submit Custom Gift Request
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Our team will review your request and get back to you within 24-48 hours with an estimated price and timeline.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomGiftRequest;
