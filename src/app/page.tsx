import HeroReel from "@/components/HeroReel";
import WorkRow from "@/components/WorkRow";
import LabGrid from "@/components/LabGrid";
import Parcours from "@/components/Parcours";
import Archives from "@/components/Archives";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <HeroReel />
      <WorkRow />
      <LabGrid />
      <Parcours />
      <Archives />
      <Contact />
    </>
  );
}
