import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Heart, Leaf, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="bg-gradient-hero py-20">
          <div className="container mx-auto px-4 text-center animate-fade-in">
            <h1 className="text-5xl font-bold text-primary-foreground mb-6">About SattuStore</h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Bringing Bihar's traditional superfood to health-conscious India
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="prose prose-lg mx-auto">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                SattuStore was born from a simple mission: to share Bihar's ancient superfood with the world. 
                For generations, sattu has been the cornerstone of nutrition in rural Bihar, providing farmers 
                and laborers with sustained energy throughout their day.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We partner directly with local farmers, ensuring they receive fair prices while we maintain 
                the highest quality standards. Every grain of sattu is roasted to perfection using traditional 
                methods, preserving its nutritional value and authentic taste.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover-scale transition-all animate-fade-in">
                <CardContent className="p-6">
                  <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Leaf className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">100% Natural</h3>
                  <p className="text-muted-foreground">
                    No chemicals, no preservatives. Just pure, natural goodness the way nature intended.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-scale transition-all animate-fade-in">
                <CardContent className="p-6">
                  <div className="h-14 w-14 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                    <Heart className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Made with Love</h3>
                  <p className="text-muted-foreground">
                    Every batch is prepared with care, following recipes passed down through generations.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-scale transition-all animate-fade-in">
                <CardContent className="p-6">
                  <div className="h-14 w-14 bg-success/10 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-7 w-7 text-success" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Community First</h3>
                  <p className="text-muted-foreground">
                    We support local farmers and contribute to rural economic development.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-scale transition-all animate-fade-in">
                <CardContent className="p-6">
                  <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Award className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Quality Assured</h3>
                  <p className="text-muted-foreground">
                    Rigorous quality checks ensure you receive only the finest products.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
