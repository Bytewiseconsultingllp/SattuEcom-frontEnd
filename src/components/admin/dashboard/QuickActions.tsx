import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-24 flex-col gap-2" asChild>
            <Link to="/admin/products">
              <Package className="h-6 w-6" />
              <span>Add Product</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" asChild>
            <Link to="/admin/orders">
              <ShoppingCart className="h-6 w-6" />
              <span>View Orders</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" asChild>
            <Link to="/admin/customers">
              <Users className="h-6 w-6" />
              <span>Manage Customers</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" asChild>
            <Link to="/admin/reports">
              <TrendingUp className="h-6 w-6" />
              <span>View Reports</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
