import { Intro } from "@/components/Intro";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Contact } from "@/components/Contact";

export default function Home() {
  return (
    <main className="p-4 flex flex-col text-primary bg-secondary bg-noise font-sans">
      <Intro />
      <About />
      <Experience />
      <Contact />
    </main>
  );
}
