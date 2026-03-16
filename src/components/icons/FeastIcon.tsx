export default function FeastIcon({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Griglia BBQ */}
      <rect x="6" y="14" width="24" height="4" rx="1" fill="#8B6F47" />
      <line x1="10" y1="14" x2="10" y2="18" stroke="#C4856A" strokeWidth="1.5" />
      <line x1="14" y1="14" x2="14" y2="18" stroke="#C4856A" strokeWidth="1.5" />
      <line x1="18" y1="14" x2="18" y2="18" stroke="#C4856A" strokeWidth="1.5" />
      <line x1="22" y1="14" x2="22" y2="18" stroke="#C4856A" strokeWidth="1.5" />
      <line x1="26" y1="14" x2="26" y2="18" stroke="#C4856A" strokeWidth="1.5" />
      {/* Gambe */}
      <line x1="10" y1="18" x2="8" y2="30" stroke="#8B6F47" strokeWidth="2" />
      <line x1="26" y1="18" x2="28" y2="30" stroke="#8B6F47" strokeWidth="2" />
      {/* Fumo */}
      <path d="M13 12 Q14 8 13 5" stroke="#D4A0A0" strokeWidth="1" opacity="0.5" fill="none" />
      <path d="M18 11 Q19 7 18 3" stroke="#D4A0A0" strokeWidth="1" opacity="0.4" fill="none" />
      <path d="M23 12 Q24 8 23 5" stroke="#D4A0A0" strokeWidth="1" opacity="0.5" fill="none" />
      {/* Foglie decorative */}
      <ellipse cx="4" cy="22" rx="2" ry="5" transform="rotate(-15 4 22)" fill="#8B9E7E" />
      <ellipse cx="32" cy="22" rx="2" ry="5" transform="rotate(15 32 22)" fill="#5C6E52" />
    </svg>
  );
}
