import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AISwarmSection from "@/components/AISwarmSection";
import InfrastructureSection from "@/components/InfrastructureSection";
import AchievementsSection from "@/components/AchievementsSection";
import ServicesSection from "@/components/ServicesSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <HeroSection />
      <AISwarmSection />
      <InfrastructureSection />
      <AchievementsSection />
      <ServicesSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
