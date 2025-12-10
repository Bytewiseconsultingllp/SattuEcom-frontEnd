import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Save,
  Upload,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileSignature,
  Image as ImageIcon,
  Edit,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getCompanySettings, updateCompanySettings } from "@/lib/api/companySettings";
import { uploadCompanyLogo, uploadCompanySignature } from "@/lib/api/upload";
import { Loader2 } from "lucide-react";

export function CompanySettingsPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    gstNumber: "",
    panNumber: "",
    placeOfSupply: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    accountHolderName: "",
    upiId: "",
    logo: "",
    signature: "",
  });
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  // Fetch company settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getCompanySettings();
      if (data) {
        setFormData(data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load company settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.companyName || !formData.email || !formData.phone || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await updateCompanySettings(formData);
      toast.success("Company settings saved successfully");
      setIsEditMode(false);
      fetchSettings();
    } catch (error: any) {
      toast.error(error.message || "Failed to save company settings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    fetchSettings();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const result = await uploadCompanyLogo(file);
      if (result.success && result.data) {
        setFormData({ ...formData, logo: result.data.url });
        toast.success("Logo uploaded successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingSignature(true);
      const result = await uploadCompanySignature(file);
      if (result.success && result.data) {
        setFormData({ ...formData, signature: result.data.url });
        toast.success("Signature uploaded successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload signature");
    } finally {
      setUploadingSignature(false);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Configuration Slate Theme */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl p-6 text-white shadow-lg shadow-slate-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Company Settings</h1>
            <p className="text-slate-100">
              {isEditMode ? "Edit your business information" : "View your business information"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!isEditMode && (
              <Button
                onClick={() => setIsEditMode(true)}
                className="bg-white text-slate-700 hover:bg-slate-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Settings
              </Button>
            )}
            <Building2 className="h-16 w-16 opacity-20" />
          </div>
        </div>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            {isEditMode ? (
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
              />
            ) : (
              <p className="text-lg font-medium py-2">{formData.companyName || "Not set"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            {isEditMode ? (
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            ) : (
              <p className="text-base py-2">{formData.description || "Not set"}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              {isEditMode ? (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 py-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base font-medium">{formData.email || "Not set"}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              {isEditMode ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 py-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base font-medium">{formData.phone || "Not set"}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            {isEditMode ? (
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  rows={2}
                  className="pl-10"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            ) : (
              <div className="flex items-start gap-2 py-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <p className="text-base">{formData.address || "Not set"}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number</Label>
              {isEditMode ? (
                <Input
                  id="gstNumber"
                  placeholder="27AABCU9603R1ZM"
                  value={formData.gstNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, gstNumber: e.target.value })
                  }
                />
              ) : (
                <p className="text-base font-medium py-2">{formData.gstNumber || "Not set"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="panNumber">PAN Number</Label>
              {isEditMode ? (
                <Input
                  id="panNumber"
                  placeholder="AABCU9603R"
                  value={formData.panNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, panNumber: e.target.value })
                  }
                />
              ) : (
                <p className="text-base font-medium py-2">{formData.panNumber || "Not set"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeOfSupply">Place of Supply</Label>
              {isEditMode ? (
                <Input
                  id="placeOfSupply"
                  placeholder="29-KARNATAKA"
                  value={formData.placeOfSupply}
                  onChange={(e) =>
                    setFormData({ ...formData, placeOfSupply: e.target.value })
                  }
                />
              ) : (
                <p className="text-base font-medium py-2">{formData.placeOfSupply || "Not set"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              {isEditMode ? (
                <Input
                  id="website"
                  placeholder="https://yourwebsite.com"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              ) : (
                <p className="text-base font-medium py-2">{formData.website || "Not set"}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            {isEditMode ? (
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) =>
                  setFormData({ ...formData, bankName: e.target.value })
                }
              />
            ) : (
              <p className="text-base font-medium py-2">{formData.bankName || "Not set"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Account Holder Name</Label>
            {isEditMode ? (
              <Input
                id="accountHolderName"
                value={formData.accountHolderName}
                onChange={(e) =>
                  setFormData({ ...formData, accountHolderName: e.target.value })
                }
              />
            ) : (
              <p className="text-base font-medium py-2">{formData.accountHolderName || "Not set"}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              {isEditMode ? (
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                />
              ) : (
                <p className="text-base font-medium py-2">{formData.accountNumber || "Not set"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              {isEditMode ? (
                <Input
                  id="ifscCode"
                  value={formData.ifscCode}
                  onChange={(e) =>
                    setFormData({ ...formData, ifscCode: e.target.value })
                  }
                />
              ) : (
                <p className="text-base font-medium py-2">{formData.ifscCode || "Not set"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name</Label>
              {isEditMode ? (
                <Input
                  id="branchName"
                  value={formData.branchName}
                  onChange={(e) =>
                    setFormData({ ...formData, branchName: e.target.value })
                  }
                />
              ) : (
                <p className="text-base font-medium py-2">{formData.branchName || "Not set"}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID (for QR codes) ⭐</Label>
              {isEditMode ? (
                <Input
                  id="upiId"
                  placeholder="yourstore@upi"
                  value={formData.upiId}
                  onChange={(e) =>
                    setFormData({ ...formData, upiId: e.target.value })
                  }
                />
              ) : (
                <p className="text-base font-medium py-2">{formData.upiId || "Not set"}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Company Logo
            </Label>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted overflow-hidden">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploadingLogo || !isEditMode}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={uploadingLogo || !isEditMode}
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </>
                  )}
                </Button>
                {formData.logo && isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, logo: "" })}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Max 2MB • PNG, JPG, GIF, WEBP • Recommended: 200x200px
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileSignature className="h-4 w-4" />
              Digital Signature
            </Label>
            <div className="flex items-center gap-4">
              <div className="h-24 w-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted overflow-hidden">
                {formData.signature ? (
                  <img src={formData.signature} alt="Signature" className="h-full w-full object-contain" />
                ) : (
                  <FileSignature className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  id="signature-upload"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                  disabled={uploadingSignature || !isEditMode}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('signature-upload')?.click()}
                  disabled={uploadingSignature || !isEditMode}
                >
                  {uploadingSignature ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Signature
                    </>
                  )}
                </Button>
                {formData.signature && isEditMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, signature: "" })}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Max 2MB • PNG, JPG, GIF, WEBP • Recommended: 400x150px with transparent background
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isEditMode && (
        <div className="flex justify-end gap-3">
          <Button onClick={handleCancel} variant="outline" size="lg" disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} size="lg" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
