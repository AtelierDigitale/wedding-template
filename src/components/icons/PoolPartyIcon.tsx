export default function PoolPartyIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Piscina */}
      <ellipse cx="18" cy="26" rx="14" ry="6" fill="#8B9E7E" opacity="0.3" />
      <ellipse cx="18" cy="26" rx="14" ry="6" stroke="#8B9E7E" strokeWidth="1.5" fill="none" />
      {/* Onde */}
      <path d="M8 25 Q11 23 14 25 Q17 27 20 25 Q23 23 26 25" stroke="#8B9E7E" strokeWidth="1" fill="none" opacity="0.6" />
      {/* Fenicottero gonfiabile */}
      <circle cx="22" cy="22" r="3" fill="#D4A0A0" />
      <path d="M22 19 Q24 16 23 14" stroke="#D4A0A0" strokeWidth="1.5" fill="none" />
      <circle cx="23" cy="13.5" r="1.2" fill="#E8B4B4" />
      {/* Palma */}
      <line x1="8" y1="20" x2="8" y2="6" stroke="#8B6F47" strokeWidth="2" />
      <ellipse cx="5" cy="6" rx="4" ry="2" transform="rotate(-20 5 6)" fill="#5C6E52" />
      <ellipse cx="11" cy="5" rx="4" ry="2" transform="rotate(20 11 5)" fill="#8B9E7E" />
      <ellipse cx="8" cy="4" rx="4" ry="1.5" fill="#5C6E52" />
      {/* Sole */}
      <circle cx="30" cy="6" r="3" fill="#C4856A" />
      <line x1="30" y1="1" x2="30" y2="3" stroke="#C4856A" strokeWidth="1" />
      <line x1="35" y1="6" x2="33" y2="6" stroke="#C4856A" strokeWidth="1" />
      <line x1="30" y1="11" x2="30" y2="9" stroke="#C4856A" strokeWidth="1" />
      <line x1="25" y1="6" x2="27" y2="6" stroke="#C4856A" strokeWidth="1" />
    </svg>
  );
}
