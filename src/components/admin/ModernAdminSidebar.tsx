import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
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
} from "lucide-react";
import { useState } from "react";
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
  const [openSections, setOpenSections] = useState<string[]>(["core", "business"]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const menuStructure = [
    {
      id: "main",
      label: "Main",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          section: "dashboard",
        },
      ],
    },
    {
      id: "core",
      label: "Core Management",
      collapsible: true,
      items: [
        {
          id: "products",
          label: "Products",
          icon: Package,
          section: "products",
        },
        {
          id: "catalogue",
          label: "Product Catalogue",
          icon: Grid3x3,
          section: "catalogue",
        },
        {
          id: "orders",
          label: "Orders",
          icon: ShoppingCart,
          section: "orders",
        },
        {
          id: "customers",
          label: "Customers",
          icon: Users,
          section: "customers",
        },
      ],
    },
    {
      id: "business",
      label: "Business Operations",
      collapsible: true,
      items: [
        {
          id: "offline-sales",
          label: "Offline Sales",
          icon: ShoppingBag,
          section: "offline-sales",
        },
        {
          id: "expenses",
          label: "Expenses",
          icon: Receipt,
          section: "expenses",
        },
        {
          id: "payments",
          label: "Payments",
          icon: DollarSign,
          section: "payments",
        },
        {
          id: "invoices",
          label: "Invoices",
          icon: FileText,
          section: "invoices",
        },
      ],
    },
    {
      id: "marketing",
      label: "Marketing & Engagement",
      collapsible: true,
      items: [
        {
          id: "banners",
          label: "Banners",
          icon: ImageIcon,
          section: "banners",
        },
        {
          id: "coupons",
          label: "Coupons",
          icon: Tag,
          section: "coupons",
        },
        {
          id: "gift-designs",
          label: "Gift Designs",
          icon: Gift,
          section: "gift-designs",
        },
        {
          id: "custom-gifts",
          label: "Custom Gift Requests",
          icon: Gift,
          section: "custom-gifts",
        },
        {
          id: "reviews",
          label: "Reviews",
          icon: MessageSquare,
          section: "reviews",
        },
        {
          id: "social-media",
          label: "Social Media",
          icon: Share2,
          section: "social-media",
        },
      ],
    },
    {
      id: "analytics",
      label: "Analytics & Reports",
      collapsible: true,
      items: [
        {
          id: "analytics",
          label: "Analytics",
          icon: TrendingUp,
          section: "analytics",
        },
        {
          id: "reports",
          label: "Reports",
          icon: FileBarChart,
          section: "reports",
        },
      ],
    },
    {
      id: "settings",
      label: "Settings & Support",
      collapsible: true,
      items: [
        {
          id: "settings",
          label: "Company Settings",
          icon: Building2,
          section: "settings",
        },
        {
          id: "contact",
          label: "Contact Management",
          icon: Mail,
          section: "contact",
        },
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex items-center gap-2">
          <img
            src={companyLogo}
            alt="Company Logo"
            className="h-30 w-30 rounded-lg object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>
        {menuStructure.map((group) => (
          <SidebarGroup key={group.id}>
            {group.collapsible ? (
              <Collapsible
                open={openSections.includes(group.id)}
                onOpenChange={() => toggleSection(group.id)}
              >
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="w-full flex items-center justify-between hover:bg-muted/50 rounded-md px-2 py-1">
                    <span>{group.label}</span>
                    {openSections.includes(group.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={() => setActiveSection(item.section)}
                            isActive={activeSection === item.section}
                            tooltip={item.label}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => setActiveSection(item.section)}
                          isActive={activeSection === item.section}
                          tooltip={item.label}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
