import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Heart, Leaf, Users, Target, Sprout, ShieldCheck, TrendingUp } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 via-white to-lime-50/30">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 py-20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-lime-400/20 blur-3xl" />
            <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
          </div>
          
          <div className="relative container mx-auto px-4 text-center" data-animate="true">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 mb-6 border border-white/20">
              <Leaf className="h-4 w-4 text-lime-300" />
              <span className="text-sm font-semibold uppercase tracking-wider text-lime-100">Our Story</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              About <span className="text-lime-300">Grain Fusion</span>
            </h1>
            <p className="text-xl text-emerald-100/90 max-w-3xl mx-auto leading-relaxed">
              Bringing Bihar's traditional superfood and ancient grains to health-conscious India
            </p>
          </div>
        </section>

        {/* Story Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border-2 border-emerald-100" data-animate="true">
              <h2 className="text-4xl font-bold text-emerald-900 mb-6">Our Story</h2>
              <div className="space-y-6 text-lg text-emerald-700 leading-relaxed">
                <p>
                  <span className="font-bold text-emerald-900">Grain Fusion</span> by Swatishree's Innovation Pvt. Ltd. was born from a simple mission: 
                  to share Bihar's ancient superfood with the world. For generations, sattu has been the cornerstone of nutrition 
                  in rural Bihar, providing farmers and laborers with sustained energy throughout their day.
                </p>
                <p>
                  We partner directly with <span className="font-semibold text-emerald-900">2,000+ local farmers</span>, 
                  ensuring they receive fair prices while we maintain the highest quality standards. Every grain of sattu 
                  is roasted to perfection using traditional methods, preserving its nutritional value and authentic taste.
                </p>
                <p>
                  Today, we blend traditional wisdom with modern innovation, creating products with <span className="font-semibold text-emerald-900">50-70% millet content</span> – 
                  far exceeding industry standards. Our commitment to 100% natural ingredients, with no artificial preservatives, 
                  colors, or flavors, ensures you receive the purest nutrition possible.
                </p>
              </div>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-gsap-stagger data-stagger="center">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-lime-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white rounded-3xl p-8 shadow-xl border-2 border-emerald-100 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                    <Leaf className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-900 mb-3">100% Natural</h3>
                  <p className="text-emerald-700 leading-relaxed">
                    No chemicals, no preservatives. Just pure, natural goodness the way nature intended with complete dehydration for quality.
                  </p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-lime-400/20 to-emerald-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white rounded-3xl p-8 shadow-xl border-2 border-emerald-100 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="h-16 w-16 bg-gradient-to-br from-lime-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-900 mb-3">Made with Love</h3>
                  <p className="text-emerald-700 leading-relaxed">
                    Every batch is prepared with care, following recipes passed down through generations with modern food safety.
                  </p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white rounded-3xl p-8 shadow-xl border-2 border-emerald-100 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="h-16 w-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-900 mb-3">Community First</h3>
                  <p className="text-emerald-700 leading-relaxed">
                    We support 2,000+ local farmers with fair-trade partnerships and contribute to rural economic development.
                  </p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-lime-400/20 to-emerald-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white rounded-3xl p-8 shadow-xl border-2 border-emerald-100 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="h-16 w-16 bg-gradient-to-br from-lime-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-900 mb-3">Quality Assured</h3>
                  <p className="text-emerald-700 leading-relaxed">
                    FSSAI certified with rigorous quality checks at every step to ensure you receive only the finest products.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500 p-8 md:p-12 shadow-2xl" data-animate="true" data-animate-strong>
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              
              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div className="text-white">
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">Made in India with Pride</h3>
                  <p className="text-xl text-white/90 leading-relaxed">
                    Every Grain Fusion product is crafted in Bihar, India, using traditional methods combined with 
                    modern food safety standards. We're committed to bringing you 100% natural, gluten-free products.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 text-center">
                    <div className="text-4xl font-bold text-white">50-70%</div>
                    <div className="text-sm text-white/90 mt-1">Millet Content</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 text-center">
                    <div className="text-4xl font-bold text-white">100%</div>
                    <div className="text-sm text-white/90 mt-1">Natural</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 text-center">
                    <div className="text-4xl font-bold text-white">2000+</div>
                    <div className="text-sm text-white/90 mt-1">Farmers</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 text-center">
                    <div className="text-4xl font-bold text-white">50K+</div>
                    <div className="text-sm text-white/90 mt-1">Customers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
