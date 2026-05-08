export default function Logo({ className = "", size = "md" }) {
  const sizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl md:text-7xl",
    xl: "text-7xl md:text-9xl"
  };

  return (
    <span className={`font-serif font-light tracking-tight ${sizes[size]} ${className}`}>
      H<sup className="text-accent font-normal" style={{ fontSize: '0.55em', verticalAlign: 'super' }}>2</sup>F
    </span>
  );
}
