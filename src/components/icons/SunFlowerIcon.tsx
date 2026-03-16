export default function SunFlowerIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Petali */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="18"
          cy="18"
          rx="3"
          ry="8"
          transform={`rotate(${angle} 18 18)`}
          fill="#C4856A"
          opacity="0.7"
        />
      ))}
      {/* Centro */}
      <circle cx="18" cy="18" r="5" fill="#8B6F47" />
      <circle cx="18" cy="18" r="3" fill="#C4856A" />
    </svg>
  );
}
