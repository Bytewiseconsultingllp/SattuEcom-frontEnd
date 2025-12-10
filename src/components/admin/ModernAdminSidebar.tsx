import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  User,
  MessageSquare,
  Tag,
  Gift,
  DollarSign,
  TrendingUp,
  Grid3x3,
  Image as ImageIcon,
  FileBarChart,
  Receipt,
  FileText,
  ShoppingBag,
  Share2,
  Building2,
  Mail,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Activity,
  Zap,
  Circle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import companyLogo from "@/assets/companyLogo.jpeg";

interface ModernAdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function ModernAdminSidebar({
  activeSection,
  setActiveSection,
}: ModernAdminSidebarProps) {
  const [openSections, setOpenSections] = useState<string[]>(["core", "business", "analytics"]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  // Badge counts for menu items
  const badgeCounts: Record<string, number> = {
    orders: 8,
    customers: 12,
    reviews: 3,
    "custom-gifts": 2,
  };

  const menuStructure = [
    {
      id: "main",
      label: "Overview",
      icon: Sparkles,
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          section: "dashboard",
          description: "Analytics overview",
        },
      ],
    },
    {
      id: "core",
      label: "Store Management",
      icon: Package,
      collapsible: true,
      items: [
        {
          id: "products",
          label: "Products",
          icon: Package,
          section: "products",
          description: "Manage inventory",
        },
        {
          id: "catalogue",
          label: "Catalogue",
          icon: Grid3x3,
          section: "catalogue",
          description: "Product showcase",
        },
        {
          id: "orders",
          label: "Orders",
          icon: ShoppingCart,
          section: "orders",
          description: "Process orders",
        },
        {
          id: "customers",
          label: "Customers",
          icon: Users,
          section: "customers",
          description: "User management",
        },
      ],
    },
    {
      id: "business",
      label: "Finance & Sales",
      icon: DollarSign,
      collapsible: true,
      items: [
        {
          id: "offline-sales",
          label: "Offline Sales",
          icon: ShoppingBag,
          section: "offline-sales",
          description: "POS transactions",
        },
        {
          id: "payments",
          label: "Payments",
          icon: DollarSign,
          section: "payments",
          description: "Payment tracking",
        },
        {
          id: "invoices",
          label: "Invoices",
          icon: FileText,
          section: "invoices",
          description: "Billing system",
        },
        {
          id: "expenses",
          label: "Expenses",
          icon: Receipt,
          section: "expenses",
          description: "Cost management",
        },
      ],
    },
    {
      id: "marketing",
      label: "Marketing",
      icon: Zap,
      collapsible: true,
      items: [
        {
          id: "banners",
          label: "Banners",
          icon: ImageIcon,
          section: "banners",
          description: "Visual promotions",
        },
        {
          id: "coupons",
          label: "Coupons",
          icon: Tag,
          section: "coupons",
          description: "Discount codes",
        },
        {
          id: "reviews",
          label: "Reviews",
          icon: MessageSquare,
          section: "reviews",
          description: "Customer feedback",
        },
        {
          id: "gift-designs",
          label: "Gift Designs",
          icon: Gift,
          section: "gift-designs",
          description: "Custom packages",
        },
        {
          id: "custom-gifts",
          label: "Gift Requests",
          icon: Gift,
          section: "custom-gifts",
          description: "Special orders",
        },
        {
          id: "social-media",
          label: "Social Media",
          icon: Share2,
          section: "social-media",
          description: "Social presence",
        },
      ],
    },
    {
      id: "analytics",
      label: "Insights",
      icon: Activity,
      collapsible: true,
      items: [
        {
          id: "analytics",
          label: "Analytics",
          icon: TrendingUp,
          section: "analytics",
          description: "Performance metrics",
        },
        {
          id: "reports",
          label: "Reports",
          icon: FileBarChart,
          section: "reports",
          description: "Business reports",
        },
      ],
    },
    {
      id: "settings",
      label: "Configuration",
      icon: Building2,
      collapsible: true,
      items: [
        {
          id: "profile",
          label: "My Profile",
          icon: User,
          section: "profile",
          description: "Personal settings",
        },
        {
          id: "settings",
          label: "Company",
          icon: Building2,
          section: "settings",
          description: "Business details",
        },
        {
          id: "contact",
          label: "Contact Queries",
          icon: Mail,
          section: "contact",
          description: "Customer inquiries",
        },
      ],
    },
  ];

  return (
    <Sidebar className="border-r border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <SidebarContent className="p-4">
        {/* Logo Section - Refined & Clean */}
        <div className="mb-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-lg">
            <div className="rounded-xl bg-white dark:bg-slate-900 p-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="h-10 w-10 rounded-lg object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    Grain Fusion
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Admin Panel
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Groups - Clean & Aligned */}
        <nav className="space-y-5">
          {menuStructure.map((group) => (
            <div key={group.id}>
              {group.collapsible ? (
                <Collapsible
                  open={openSections.includes(group.id)}
                  onOpenChange={() => toggleSection(group.id)}
                >
                  <CollapsibleTrigger className="w-full group">
                    <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-2">
                        {group.icon && (
                          <group.icon className="h-4 w-4 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                        )}
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                          {group.label}
                        </span>
                      </div>
                      {openSections.includes(group.id) ? (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-1 space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = activeSection === item.section;
                        const badge = badgeCounts[item.id];
                        
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveSection(item.section)}
                            onMouseEnter={() => setHoveredItem(item.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            className={`
                              w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all duration-200 group/item
                              ${
                                isActive
                                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20 text-white"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }
                            `}
                          >
                            <div className={`
                              h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200
                              ${
                                isActive
                                  ? "bg-white/15"
                                  : "bg-slate-100 dark:bg-slate-800 group-hover/item:bg-indigo-100 dark:group-hover/item:bg-indigo-900/20"
                              }
                            `}>
                              <item.icon className={`h-4 w-4 ${
                                isActive 
                                  ? "text-white" 
                                  : "text-slate-600 dark:text-slate-400 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400"
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className={`text-[13px] font-medium truncate ${
                                isActive ? "text-white font-semibold" : "text-slate-700 dark:text-slate-300"
                              }`}>
                                {item.label}
                              </p>
                              {hoveredItem === item.id && item.description && !isActive && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {badge && (
                              <Badge 
                                className={`h-5 min-w-[18px] px-1.5 text-[10px] font-bold ${
                                  isActive 
                                    ? "bg-white/20 text-white border-0" 
                                    : "bg-indigo-100 text-indigo-700 border-0 dark:bg-indigo-900/30 dark:text-indigo-400"
                                }`}
                              >
                                {badge}
                              </Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <div>
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    {group.icon && (
                      <group.icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    )}
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {group.label}
                    </span>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = activeSection === item.section;
                      const badge = badgeCounts[item.id];
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.section)}
                          onMouseEnter={() => setHoveredItem(item.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={`
                            w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all duration-200 group/item
                            ${
                              isActive
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20 text-white"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }
                          `}
                        >
                          <div className={`
                            h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200
                            ${
                              isActive
                                ? "bg-white/15"
                                : "bg-slate-100 dark:bg-slate-800 group-hover/item:bg-indigo-100 dark:group-hover/item:bg-indigo-900/20"
                            }
                          `}>
                            <item.icon className={`h-4 w-4 ${
                              isActive 
                                ? "text-white" 
                                : "text-slate-600 dark:text-slate-400 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400"
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className={`text-[13px] font-medium truncate ${
                              isActive ? "text-white font-semibold" : "text-slate-700 dark:text-slate-300"
                            }`}>
                              {item.label}
                            </p>
                            {hoveredItem === item.id && item.description && !isActive && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {item.description}
                              </p>
                            )}
                          </div>
                          {badge && (
                            <Badge 
                              className={`h-5 min-w-[18px] px-1.5 text-[10px] font-bold ${
                                isActive 
                                  ? "bg-white/20 text-white border-0" 
                                  : "bg-indigo-100 text-indigo-700 border-0 dark:bg-indigo-900/30 dark:text-indigo-400"
                              }`}
                            >
                              {badge}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer - Clean Stats Card */}
      </SidebarContent>
    </Sidebar>
  );
}
