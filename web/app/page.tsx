import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Impact } from "./components/Impact";
import { SocialProof } from "./components/SocialProof";
import { FinalCta } from "./components/FinalCta";
import { Footer } from "./components/Footer";
import { ScrollProgress } from "./components/ScrollProgress";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="relative">
        <Hero />
        <Impact />
        <SocialProof />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
