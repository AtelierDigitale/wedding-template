export default function RingsFlowerIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Anelli */}
      <circle cx="14" cy="22" r="7" stroke="#C4856A" strokeWidth="2" fill="none" />
      <circle cx="22" cy="22" r="7" stroke="#8B6F47" strokeWidth="2" fill="none" />
      {/* Fiorellini sopra */}
      <circle cx="15" cy="10" r="3" fill="#D4A0A0" />
      <circle cx="15" cy="10" r="1.2" fill="#C4856A" />
      <circle cx="21" cy="8" r="2.5" fill="#E8B4B4" />
      <circle cx="21" cy="8" r="1" fill="#C4856A" />
      {/* Foglioline */}
      <ellipse cx="10" cy="12" rx="2" ry="4" transform="rotate(-20 10 12)" fill="#8B9E7E" />
      <ellipse cx="26" cy="10" rx="2" ry="4" transform="rotate(20 26 10)" fill="#5C6E52" />
    </svg>
  );
}
