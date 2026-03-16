export default function CamperIcon({ className = "w-28 h-20" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tetto pop-up Westfalia */}
      <path d="M20 22 L20 14 Q20 10 24 10 L72 10 Q76 10 76 14 L76 22" fill="#FEFEFE" stroke="#e8ddd0" strokeWidth="1.5" />
      {/* Linea tetto */}
      <line x1="22" y1="16" x2="74" y2="16" stroke="#e8ddd0" strokeWidth="0.8" />

      {/* Corpo principale VW - due toni classici */}
      <rect x="8" y="22" width="90" height="32" rx="5" fill="#FEFEFE" stroke="#e8ddd0" strokeWidth="1.5" />
      {/* Fascia inferiore colorata */}
      <path d="M8 38 L98 38 L98 49 Q98 54 93 54 L13 54 Q8 54 8 49 Z" fill="#8B9E7E" />
      {/* Linea divisoria */}
      <line x1="8" y1="38" x2="98" y2="38" stroke="#7a8e6e" strokeWidth="1" />

      {/* Logo VW frontale */}
      <circle cx="92" cy="34" r="4" fill="none" stroke="#e8ddd0" strokeWidth="1.2" />
      <path d="M89.5 32 L92 37 L94.5 32" stroke="#e8ddd0" strokeWidth="0.8" fill="none" />
      <path d="M89.5 36 L92 31 L94.5 36" stroke="#e8ddd0" strokeWidth="0.8" fill="none" />

      {/* Parabrezza grande diviso */}
      <rect x="78" y="25" width="16" height="11" rx="2.5" fill="#d4e4ef" stroke="#b8ccd9" strokeWidth="1" />
      <line x1="86" y1="25" x2="86" y2="36" stroke="#b8ccd9" strokeWidth="0.8" />

      {/* Finestrino laterale grande */}
      <rect x="48" y="25" width="22" height="11" rx="2.5" fill="#d4e4ef" stroke="#b8ccd9" strokeWidth="1" />

      {/* Finestrino laterale piccolo con tenda */}
      <rect x="22" y="25" width="18" height="11" rx="2.5" fill="#d4e4ef" stroke="#b8ccd9" strokeWidth="1" />
      {/* Tendina */}
      <path d="M23.5 26.5 L31 33 L23.5 33 Z" fill="#F5F0E8" opacity="0.6" />
      <path d="M38.5 26.5 L31 33 L38.5 33 Z" fill="#F5F0E8" opacity="0.6" />

      {/* Porta scorrevole */}
      <rect x="48" y="38" width="14" height="16" rx="1.5" fill="#7a8e6e" stroke="#6a7e5e" strokeWidth="0.8" />
      <circle cx="60" cy="46" r="1" fill="#FEFEFE" opacity="0.6" />
      {/* Guida porta */}
      <line x1="48" y1="40" x2="62" y2="40" stroke="#6a7e5e" strokeWidth="0.5" />

      {/* Faro anteriore */}
      <circle cx="96" cy="44" r="3" fill="#FAF6F0" stroke="#e8ddd0" strokeWidth="1" />
      <circle cx="96" cy="44" r="1.5" fill="#f0e68c" opacity="0.7" />

      {/* Faro posteriore */}
      <rect x="8" y="42" width="3" height="5" rx="1" fill="#D4A0A0" stroke="#c08080" strokeWidth="0.5" />

      {/* Paraurti */}
      <rect x="6" y="54" width="92" height="3" rx="1.5" fill="#e8ddd0" />
      {/* Paraurti anteriore cromato */}
      <rect x="94" y="52" width="8" height="5" rx="2" fill="#e8ddd0" />

      {/* Ruote */}
      <circle cx="28" cy="57" r="7" fill="#4a4a4a" />
      <circle cx="28" cy="57" r="5" fill="#666" />
      <circle cx="28" cy="57" r="2.5" fill="#e8ddd0" />
      <circle cx="28" cy="57" r="1" fill="#999" />

      <circle cx="82" cy="57" r="7" fill="#4a4a4a" />
      <circle cx="82" cy="57" r="5" fill="#666" />
      <circle cx="82" cy="57" r="2.5" fill="#e8ddd0" />
      <circle cx="82" cy="57" r="1" fill="#999" />

      {/* Ghirlanda di fiori sul tetto */}
      <path d="M24 10 Q36 6 48 10 Q60 6 72 10" stroke="#e8ddd0" strokeWidth="0.6" fill="none" />
      <circle cx="28" cy="8" r="2.2" fill="#FEFEFE" opacity="0.9" />
      <circle cx="28" cy="8" r="1" fill="#F5F0E8" />
      <circle cx="38" cy="6.5" r="2.5" fill="#FEFEFE" opacity="0.9" />
      <circle cx="38" cy="6.5" r="1.2" fill="#F5F0E8" />
      <ellipse cx="33" cy="7.5" rx="2" ry="1.2" fill="#8B9E7E" opacity="0.7" transform="rotate(-15 33 7.5)" />
      <circle cx="48" cy="8" r="2.2" fill="#FEFEFE" opacity="0.9" />
      <circle cx="48" cy="8" r="1" fill="#F5F0E8" />
      <ellipse cx="43" cy="7" rx="2" ry="1.2" fill="#8B9E7E" opacity="0.7" transform="rotate(10 43 7)" />
      <circle cx="58" cy="6.5" r="2.5" fill="#FEFEFE" opacity="0.9" />
      <circle cx="58" cy="6.5" r="1.2" fill="#F5F0E8" />
      <ellipse cx="53" cy="7.5" rx="2" ry="1.2" fill="#8B9E7E" opacity="0.7" transform="rotate(-10 53 7.5)" />
      <circle cx="68" cy="8" r="2.2" fill="#FEFEFE" opacity="0.9" />
      <circle cx="68" cy="8" r="1" fill="#F5F0E8" />
      <ellipse cx="63" cy="7" rx="2" ry="1.2" fill="#8B9E7E" opacity="0.7" transform="rotate(15 63 7)" />

      {/* Bandierine */}
      <path d="M24 10 Q36 7 48 10 Q60 7 72 10" stroke="#FEFEFE" strokeWidth="0.4" fill="none" opacity="0.5" />
      <polygon points="30,10 33,10 31.5,7.5" fill="#FEFEFE" opacity="0.5" />
      <polygon points="40,9 43,9 41.5,6.5" fill="#8B9E7E" opacity="0.5" />
      <polygon points="50,10 53,10 51.5,7.5" fill="#FEFEFE" opacity="0.5" />
      <polygon points="60,9 63,9 61.5,6.5" fill="#8B9E7E" opacity="0.5" />
    </svg>
  );
}
