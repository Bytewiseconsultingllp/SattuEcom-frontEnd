import { Target, Users, Sprout, Award, Leaf, ShieldCheck } from "lucide-react";

interface AboutSectionProps {
  id?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ id }) => {
  return (
    <section id={id} className="relative py-20 bg-gradient-to-br from-emerald-50 via-lime-50/30 to-emerald-50 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-lime-200/30 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16" data-animate="true">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 mb-6">
            <Leaf className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold uppercase tracking-wider text-emerald-700">About Grain Fusion</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-6 leading-tight">
            Who We Are
          </h2>
          <p className="text-lg md:text-xl text-emerald-800/90 leading-relaxed">
            We are <span className="font-semibold text-emerald-900">Swatishree's Innovation Pvt. Ltd.</span>, a family-owned business from Bihar, 
            dedicated to bringing the traditional goodness of sattu and millets to modern households. With over 
            <span className="font-semibold text-emerald-900"> 20 years of experience</span> in processing and packaging 
            authentic products, we maintain the highest quality standards while preserving age-old recipes and methods.
          </p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" data-gsap-stagger data-stagger="center">
          {/* Mission Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-lime-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-emerald-200 p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-emerald-900">Our Mission</h3>
              <p className="text-emerald-700/80 text-sm leading-relaxed">
                To make traditional sattu and millets accessible to everyone while maintaining authenticity and quality.
              </p>
            </div>
          </div>

          {/* Sustainable Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-400/20 to-emerald-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-emerald-200 p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="h-16 w-16 bg-gradient-to-br from-lime-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Sprout className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-emerald-900">Sustainable</h3>
              <p className="text-emerald-700/80 text-sm leading-relaxed">
                We source locally and support 2,000+ farmers directly, ensuring fair prices and sustainable practices.
              </p>
            </div>
          </div>

          {/* Customers Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-emerald-200 p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="h-16 w-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-emerald-900">50K+ Customers</h3>
              <p className="text-emerald-700/80 text-sm leading-relaxed">
                Trusted by thousands across India for our quality, authentic taste, and nutrition.
              </p>
            </div>
          </div>

          {/* Quality Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-400/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-emerald-200 p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="h-16 w-16 bg-gradient-to-br from-lime-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-emerald-900">Quality Certified</h3>
              <p className="text-emerald-700/80 text-sm leading-relaxed">
                FSSAI certified with rigorous quality checks at every step of production.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Banner */}
        <div className="max-w-5xl mx-auto" data-animate="true" data-animate-strong>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500 p-8 md:p-12 shadow-2xl">
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30">
                  <ShieldCheck className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="flex-1 text-white text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Made in India with Pride</h3>
                <p className="text-lg text-white/90 leading-relaxed">
                  Every Grain Fusion product is crafted in Bihar, India, using traditional methods combined with 
                  modern food safety standards. We're committed to bringing you 100% natural, gluten-free products 
                  with <span className="font-semibold">50-70% millet content</span> – far exceeding industry standards.
                </p>
              </div>
              <div className="flex-shrink-0 text-center">
                <div className="inline-block rounded-2xl bg-white/20 backdrop-blur-md px-6 py-4 border border-white/30">
                  <div className="text-4xl font-bold text-white">100%</div>
                  <div className="text-sm text-white/90 uppercase tracking-wider">Natural</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
