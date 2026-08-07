import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import BrandMarquee from "../components/BrandMarquee";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Benefits from "../components/Benefits";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import TemplatesPreview from "../components/TemplatesPreview";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
        <BrandMarquee />
      <Features />
        <HowItWorks />
        <Benefits />
        <TemplatesPreview />
        <FAQ />
        <Pricing />
        <CTA />
        <Footer />
    </>
  );
}