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
