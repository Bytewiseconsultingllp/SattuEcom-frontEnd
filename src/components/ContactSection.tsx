import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type ContactSectionProps = {
  id?: string;
};

export const ContactSection = ({ id }: ContactSectionProps) => {
  return (
    <section id={id} className="py-20 bg-muted/30 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
          <p className="text-lg text-muted-foreground">We'd love to hear from you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center hover-scale transition-all animate-fade-in">
            <CardContent className="p-6">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Phone</h3>
              <p className="text-muted-foreground">+91 9876543210</p>
            </CardContent>
          </Card>

          <Card className="text-center hover-scale transition-all animate-fade-in">
            <CardContent className="p-6">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Email</h3>
              <p className="text-muted-foreground">info@sattustore.com</p>
            </CardContent>
          </Card>

          <Card className="text-center hover-scale transition-all animate-fade-in">
            <CardContent className="p-6">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Address</h3>
              <p className="text-muted-foreground">Patna, Bihar, India</p>
            </CardContent>
          </Card>

          <Card className="text-center hover-scale transition-all animate-fade-in">
            <CardContent className="p-6">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Working Hours</h3>
              <p className="text-muted-foreground">Mon-Sat: 9AM-6PM</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link to="/contact">
            <Button size="lg" className="px-8">
              Send Us a Message
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
