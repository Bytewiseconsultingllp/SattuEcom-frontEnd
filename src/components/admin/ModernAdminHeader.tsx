import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Menu,
  Moon,
  Sun,
  HelpCircle,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { removeUserCookie, getUserCookie } from "@/utils/cookie";

export function ModernAdminHeader() {
  const navigate = useNavigate();
  const [notifications] = useState(3);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const user = getUserCookie();

  const handleLogout = () => {
    removeUserCookie();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    // Add theme toggle logic here
  };

  const getInitials = (name?: string) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 backdrop-blur-xl sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" />

          {/* Logo & Branding */}
          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">GF</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                Grain Fusion
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Center Section - Clean Search */}
        <div className="hidden lg:flex flex-1 max-w-2xl">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <Input
              placeholder="Search anything..."
              className="pl-10 pr-16 h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
            <kbd className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
          </Button>

          {/* Help */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                {notifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                    {notifications}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 shadow-xl border-slate-200 dark:border-slate-800">
              <DropdownMenuLabel className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                Notifications
              </DropdownMenuLabel>
              <div className="max-h-96 overflow-y-auto">
                <div className="p-2 space-y-1">
                  <div className="p-2.5 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">📦</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">New order received</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Order #ORD-001 - ₹1,250</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">2 minutes ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">⚠️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Low stock alert</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Premium Sattu Powder - 5 units left</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5 hover:bg-green-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">👤</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">New customer registered</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">John Doe joined</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button variant="ghost" className="w-full justify-center text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                  View all notifications →
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-slate-200 dark:border-slate-700 mx-1"></div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2.5 px-2.5 py-1.5 h-auto rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Avatar className="h-8 w-8 ring-2 ring-indigo-500 ring-offset-2">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold text-xs">
                    {getInitials(user?.name || user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {user?.role || "Administrator"}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 shadow-xl border-slate-200 dark:border-slate-800">
              <DropdownMenuLabel className="pb-2.5">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-10 w-10 ring-2 ring-indigo-500">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-xs">
                      {getInitials(user?.name || user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email || "admin@grainfusion.com"}
                    </p>
                  </div>
                </div>
                <Badge className="mt-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-semibold border-0">
                  {user?.role || "Administrator"}
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer py-2">
                <User className="h-4 w-4 mr-2.5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm">My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2">
                <Settings className="h-4 w-4 mr-2.5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer py-2 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
              >
                <LogOut className="h-4 w-4 mr-2.5" />
                <span className="text-sm font-medium">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
