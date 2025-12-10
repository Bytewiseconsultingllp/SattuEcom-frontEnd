import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Share2,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Plus,
  Edit,
  ExternalLink,
  TrendingUp,
  Users,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface SocialAccount {
  platform: string;
  username: string;
  url: string;
  followers: number;
  isActive: boolean;
  icon: any;
  color: string;
}

export function SocialMediaPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    {
      platform: "Facebook",
      username: "@grainfusion",
      url: "https://facebook.com/grainfusion",
      followers: 5420,
      isActive: true,
      icon: Facebook,
      color: "text-blue-600",
    },
    {
      platform: "Instagram",
      username: "@grainfusion",
      url: "https://instagram.com/grainfusion",
      followers: 8930,
      isActive: true,
      icon: Instagram,
      color: "text-pink-600",
    },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const platforms = [
    { name: "Facebook", icon: Facebook, color: "text-blue-600" },
    { name: "Instagram", icon: Instagram, color: "text-pink-600" },
    { name: "Twitter", icon: Twitter, color: "text-sky-500" },
    { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
    { name: "YouTube", icon: Youtube, color: "text-red-600" },
  ];

  const totalFollowers = accounts.reduce((sum, acc) => sum + acc.followers, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Marketing Orange Theme */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl p-6 text-white shadow-lg shadow-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Social Media Management</h1>
            <p className="text-orange-100">
              Manage all your social media accounts
            </p>
          </div>
          <Share2 className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center flex-shrink-0">
            <Share2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Social Media Presence</h3>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Connect and manage your social media accounts across platforms. Monitor follower growth, engagement rates, and post performance. Keep your social presence active and connected with your audience.
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-orange-900 dark:text-orange-100">{totalFollowers.toLocaleString()}</span>
                <span className="text-orange-600 dark:text-orange-400">Total Followers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-orange-900 dark:text-orange-100">{accounts.filter(a => a.isActive).length}</span>
                <span className="text-orange-600 dark:text-orange-400">Active Accounts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Followers</p>
                <p className="text-2xl font-bold">{totalFollowers.toLocaleString()}</p>
              </div>
              <Users className="h-10 w-10 text-pink-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Accounts</p>
                <p className="text-2xl font-bold">{accounts.filter(a => a.isActive).length}</p>
              </div>
              <Share2 className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold">4.2%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Button onClick={() => setDialogOpen(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account, index) => {
              const Icon = account.icon;
              return (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-full bg-muted flex items-center justify-center`}>
                          <Icon className={`h-6 w-6 ${account.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{account.platform}</h3>
                          <p className="text-sm text-muted-foreground">{account.username}</p>
                        </div>
                      </div>
                      <Badge variant={account.isActive ? "default" : "secondary"}>
                        {account.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Followers</span>
                        <span className="font-semibold">{account.followers.toLocaleString()}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a href={account.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Visit
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Post */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea placeholder="What's on your mind?" rows={4} />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <Button key={platform.name} variant="outline" size="sm">
                      <Icon className={`h-4 w-4 ${platform.color}`} />
                    </Button>
                  );
                })}
              </div>
              <Button>Post to All</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
