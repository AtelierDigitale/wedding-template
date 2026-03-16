export default function FlowerBouquetIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Steli */}
      <line x1="18" y1="18" x2="15" y2="34" stroke="#8B6F47" strokeWidth="1.5" />
      <line x1="18" y1="18" x2="18" y2="34" stroke="#8B6F47" strokeWidth="1.5" />
      <line x1="18" y1="18" x2="21" y2="34" stroke="#8B6F47" strokeWidth="1.5" />
      {/* Foglie */}
      <ellipse cx="11" cy="20" rx="3" ry="6" transform="rotate(-30 11 20)" fill="#8B9E7E" />
      <ellipse cx="25" cy="20" rx="3" ry="6" transform="rotate(30 25 20)" fill="#5C6E52" />
      {/* Fiore centrale grande */}
      <circle cx="18" cy="10" r="5" fill="#D4A0A0" />
      <circle cx="18" cy="10" r="2.5" fill="#C4856A" />
      {/* Fiori laterali */}
      <circle cx="11" cy="13" r="3.5" fill="#E8B4B4" />
      <circle cx="11" cy="13" r="1.5" fill="#C4856A" />
      <circle cx="25" cy="13" r="3.5" fill="#E8B4B4" />
      <circle cx="25" cy="13" r="1.5" fill="#C4856A" />
    </svg>
  );
}
