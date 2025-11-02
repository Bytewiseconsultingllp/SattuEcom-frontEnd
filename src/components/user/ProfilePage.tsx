import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Edit,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Camera,
} from "lucide-react";
import { getProfile } from "@/lib/api/user";
import { toast } from "sonner";
import { format } from "date-fns";

export function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      const profileData = response?.data || response;
      setProfile(profileData);
      setFormData({
        name: profileData?.name || "",
        phone: profileData?.phone || "",
        email: profileData?.email || "",
      });
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);
      toast.error(error.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Implement updateProfile API
      toast.info("Profile update feature coming soon");
      setEditing(false);
      // fetchProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || "",
      phone: profile?.phone || "",
      email: profile?.email || "",
    });
    setEditing(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  const defaultAddress = profile?.addresses?.find((a: any) => a.is_default);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-blue-100">
              Manage your account information
            </p>
          </div>
          <User className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <button className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Camera className="h-5 w-5" />
                </button>
              </div>

              {/* Name & Email */}
              <h2 className="text-2xl font-bold mb-1">{profile?.name || "User"}</h2>
              <p className="text-sm text-muted-foreground mb-4">{profile?.email}</p>

              {/* Verification Badge */}
              {profile?.isVerified ? (
                <Badge variant="default" className="mb-4">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified Account
                </Badge>
              ) : (
                <Badge variant="outline" className="mb-4">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Unverified
                </Badge>
              )}

              <Separator className="my-4" />

              {/* Stats */}
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm font-medium">
                    {profile?.createdAt ? formatDate(profile.createdAt) : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">User ID</span>
                  <span className="text-xs font-mono">
                    {profile?.id?.slice(0, 8) || "N/A"}...
                  </span>
                </div>
                {profile?.role && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <Badge variant="secondary">{profile.role}</Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              {!editing ? (
                <Button onClick={() => setEditing(true)} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              {editing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-lg font-medium">{profile?.name || "Not provided"}</p>
              )}
            </div>

            <Separator />

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              {editing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              ) : (
                <p className="text-lg font-medium">{profile?.email || "Not provided"}</p>
              )}
            </div>

            <Separator />

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              {editing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-lg font-medium">{profile?.phone || "Not provided"}</p>
              )}
            </div>

            <Separator />

            {/* Account Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Account Created
                </Label>
                <p className="text-lg font-medium">
                  {profile?.createdAt ? formatDate(profile.createdAt) : "N/A"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Account Status
                </Label>
                <div>
                  {profile?.isVerified ? (
                    <Badge variant="default">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Default Address Card */}
      {defaultAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Default Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold">{defaultAddress.full_name}</p>
                    <Badge variant="outline">{defaultAddress.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {defaultAddress.address_line1}
                    {defaultAddress.address_line2 && `, ${defaultAddress.address_line2}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.postal_code}
                  </p>
                  <p className="text-sm text-muted-foreground">{defaultAddress.country || "India"}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                    <Phone className="h-3 w-3" />
                    {defaultAddress.phone}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">••••••••</p>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
