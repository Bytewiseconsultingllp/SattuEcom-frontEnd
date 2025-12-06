import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { getProfile, updateProfile, changePassword, sendEmailVerification, verifyEmail } from "@/lib/api/user";
import { toast } from "sonner";
import { format } from "date-fns";

export function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // Change Password Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Email Verification State
  const [emailChanged, setEmailChanged] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState("");

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
      setSaving(true);
      const originalEmail = profile?.email;
      const response = await updateProfile(formData);
      
      // Check if email was changed
      if (formData.email !== originalEmail) {
        setEmailChanged(true);
        toast.success("Profile updated! Please verify your new email address.");
      } else {
        toast.success(response.message || "Profile updated successfully");
      }
      
      setProfile(response.data);
      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordModalOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      setSendingVerification(true);
      const response = await sendEmailVerification();
      toast.success(response.message || "Verification email sent successfully");
      setVerificationSent(true);
      setVerifyModalOpen(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setSendingVerification(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationOtp || verificationOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setVerifyingEmail(true);
      const response = await verifyEmail(verificationOtp);
      toast.success(response.message || "Email verified successfully!");
      setVerifyModalOpen(false);
      setVerificationOtp("");
      setEmailChanged(false);
      // Refresh profile to update isVerified status
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to verify email");
    } finally {
      setVerifyingEmail(false);
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
                  <Button onClick={handleCancel} variant="outline" size="sm" disabled={saving}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} size="sm" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
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

      {/* Email Verification Alert */}
      {emailChanged && !profile?.isVerified && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">
                  Email Verification Required
                </h3>
                <p className="text-sm text-orange-800 mb-3">
                  Your email address has been updated to <strong>{profile?.email}</strong>. 
                  Please verify your new email address to ensure account security.
                </p>
                <Button
                  size="sm"
                  onClick={handleSendVerification}
                  disabled={sendingVerification || verificationSent}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {verificationSent ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Verification Email Sent
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      {sendingVerification ? "Sending..." : "Send Verification Email"}
                    </>
                  )}
                </Button>
                {verificationSent && (
                  <p className="text-xs text-orange-700 mt-2">
                    Check your inbox for the 6-digit verification code. Didn't receive it? 
                    <button 
                      onClick={handleSendVerification}
                      className="underline ml-1"
                      disabled={sendingVerification}
                    >
                      Resend
                    </button>
                  </p>
                )}
                {verificationSent && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setVerifyModalOpen(true)}
                    className="mt-2"
                  >
                    Enter Verification Code
                  </Button>
                )}
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPasswordModalOpen(true)}
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new secure password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                  disabled={changingPassword}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={changingPassword}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="Enter new password (min. 6 characters)"
                  disabled={changingPassword}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={changingPassword}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm new password"
                  disabled={changingPassword}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={changingPassword}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-md">
              <p className="font-medium">Password requirements:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Minimum 6 characters</li>
                <li>New password must be different from current</li>
                <li>Passwords must match</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPasswordModalOpen(false);
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
              disabled={changingPassword}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Verification Modal */}
      <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Verify Your Email
            </DialogTitle>
            <DialogDescription>
              We've sent a 6-digit verification code to <strong>{profile?.email}</strong>. 
              Please enter it below to verify your email address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="verificationOtp">Verification Code</Label>
              <Input
                id="verificationOtp"
                type="text"
                maxLength={6}
                value={verificationOtp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setVerificationOtp(value);
                }}
                placeholder="Enter 6-digit code"
                disabled={verifyingEmail}
                className="text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-xs text-muted-foreground">
                The code will expire in 10 minutes
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Haven't received the code?</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Check your spam/junk folder</li>
                    <li>Wait a few minutes for the email to arrive</li>
                    <li>Click "Resend" to get a new code</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setVerifyModalOpen(false);
                setVerificationOtp("");
              }}
              disabled={verifyingEmail}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSendVerification}
                disabled={sendingVerification || verifyingEmail}
              >
                {sendingVerification ? "Resending..." : "Resend Code"}
              </Button>
              <Button
                type="button"
                onClick={handleVerifyEmail}
                disabled={verifyingEmail || verificationOtp.length !== 6}
              >
                {verifyingEmail ? "Verifying..." : "Verify Email"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
