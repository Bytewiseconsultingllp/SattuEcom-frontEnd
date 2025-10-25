import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

export const SupabaseSetupBanner = () => {
  if (isSupabaseConfigured) return null;

  return (
    <Alert className="mb-6 bg-primary/10 border-primary">
      <Database className="h-4 w-4" />
      <AlertTitle>Backend Not Connected</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          To use authentication, cart, orders, and other features, you need to enable Supabase.
        </p>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => window.open('https://docs.lovable.dev/features/cloud', '_blank')}
          >
            Setup Guide
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.open('/projects/dbac6104-b581-4919-bc39-3dd44b1eb968?settings=supabase', '_blank')}
          >
            Enable Now
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
