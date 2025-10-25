import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Sprout, Award } from "lucide-react";

export const AboutSection = () => {
  return (
    <section className="py-20 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Who We Are</h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We are a family-owned business from Bihar, dedicated to bringing the traditional goodness 
            of sattu to modern households. With over 20 years of experience in processing and packaging 
            authentic sattu products, we maintain the highest quality standards while preserving 
            age-old recipes and methods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center hover-scale transition-all">
            <CardContent className="p-6">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Our Mission</h3>
              <p className="text-muted-foreground text-sm">
                To make traditional sattu accessible to everyone while maintaining authenticity and quality.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover-scale transition-all">
            <CardContent className="p-6">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Sustainable</h3>
              <p className="text-muted-foreground text-sm">
                We source locally and support farmers directly, ensuring fair prices and sustainable practices.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover-scale transition-all">
            <CardContent className="p-6">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">50K+ Customers</h3>
              <p className="text-muted-foreground text-sm">
                Trusted by thousands across India for our quality and authentic taste.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover-scale transition-all">
            <CardContent className="p-6">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Quality Certified</h3>
              <p className="text-muted-foreground text-sm">
                FSSAI certified with rigorous quality checks at every step of production.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
