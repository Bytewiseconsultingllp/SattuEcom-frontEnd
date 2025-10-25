import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {

  const faqs = [
    {
      question: "What is Sattu?",
      answer: "Sattu is a traditional flour made from roasted chickpeas (chana) or other grains. It's a popular protein-rich superfood from Bihar and eastern India, known for its high nutritional value and cooling properties."
    },
    {
      question: "How do I consume Sattu?",
      answer: "Sattu can be consumed in many ways: mixed with water, milk, or buttermilk as a refreshing drink; used in parathas; made into ladoos; or added to smoothies. Mix 2-3 tablespoons with your choice of liquid and enjoy!"
    },
    {
      question: "Is Sattu good for weight loss?",
      answer: "Yes! Sattu is low in calories, high in protein and fiber, which helps keep you full longer. Its low glycemic index also helps regulate blood sugar levels, making it ideal for weight management."
    },
    {
      question: "Can diabetics consume Sattu?",
      answer: "Absolutely! Sattu has a low glycemic index and helps regulate blood sugar levels. However, if you're diabetic, please consult your doctor before making any dietary changes."
    },
    {
      question: "How long does Sattu last?",
      answer: "When stored in an airtight container in a cool, dry place, sattu powder can last for 3-6 months. Our products come with best-before dates clearly mentioned on the packaging."
    },
    {
      question: "Do you offer free shipping?",
      answer: "Yes! We offer free shipping on all orders above ₹500. For orders below this amount, a nominal shipping charge of ₹50 applies."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy on all products. If you're not satisfied with your purchase, you can return it within 7 days of delivery for a full refund. The product should be unopened and in its original packaging."
    },
    {
      question: "Are your products organic?",
      answer: "We offer both regular and certified organic sattu products. Products marked as 'Organic' are certified by recognized organic certification bodies and completely pesticide-free."
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="bg-gradient-hero py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-primary-foreground mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-primary-foreground/90">
              Everything you need to know about Sattu
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border rounded-lg px-6 bg-card hover:shadow-md transition-all"
                >
                  <AccordionTrigger className="text-left font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
