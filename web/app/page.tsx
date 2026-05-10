import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { TrustBand } from "./components/TrustBand";
import { Impact } from "./components/Impact";
import { HowItWorks } from "./components/HowItWorks";
import { SocialProof } from "./components/SocialProof";
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
        <HowItWorks />
        <SocialProof />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
