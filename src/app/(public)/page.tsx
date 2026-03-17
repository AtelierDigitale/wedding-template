import HeroSection from "@/components/home/HeroSection";
import TimelineSection from "@/components/home/TimelineSection";
import DressCodeSection from "@/components/home/DressCodeSection";
import LocationSection from "@/components/home/LocationSection";
import GiftSection from "@/components/home/GiftSection";
import GalleryLinkSection from "@/components/home/GalleryLinkSection";
import LeafDivider from "@/components/LeafDivider";

export default function HomePage() {
  return (
    <div className="pb-16">
      <HeroSection />
      <LeafDivider />
      <TimelineSection />

      <div className="mx-auto mt-10 flex flex-col items-center text-center">
        <p className="font-heading text-2xl text-marrone">Ascolta il programma della giornata</p>
        <audio controls className="mt-3" preload="none">
          <source src="/angie.mp3" type="audio/mpeg" />
        </audio>
      </div>

      <LeafDivider />
      <DressCodeSection />
      <LeafDivider />
      <LocationSection />
      <LeafDivider />
      <GiftSection />
      <LeafDivider />
      <GalleryLinkSection />
    </div>
  );
}
