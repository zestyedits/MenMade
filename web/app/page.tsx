import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { TrustBand } from "./components/TrustBand";
import { Impact } from "./components/Impact";
import { ProductTour } from "./components/ProductTour";
import { SocialProof } from "./components/SocialProof";
import { PricingShowcase } from "./components/PricingShowcase";
import { FinalCta } from "./components/FinalCta";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <Hero />
        <TrustBand />
        <Impact />
        <ProductTour />
        <SocialProof />
        <PricingShowcase />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
