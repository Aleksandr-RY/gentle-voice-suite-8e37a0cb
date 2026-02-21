import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <Hero />
    <AboutSection />
    <ServicesSection />
    <BookingForm />
    <Footer />
  </div>
);

export default Index;
