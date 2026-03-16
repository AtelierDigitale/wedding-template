export default function LeafDivider() {
  return (
    <div className="my-12 flex items-center justify-center gap-4 opacity-50">
      <div className="h-px w-20 bg-verde" />
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse
          cx="12"
          cy="12"
          rx="5"
          ry="10"
          transform="rotate(-30 12 12)"
          fill="#8B9E7E"
        />
        <path
          d="M12 2 C12 2 12 22 12 22"
          stroke="#5C6E52"
          strokeWidth="1"
          opacity="0.6"
        />
      </svg>
      <div className="h-px w-20 bg-verde" />
    </div>
  );
}
