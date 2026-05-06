export default function DiaTextReveal({
  text,
  colors = ['#A97CF8', '#F38CB8', '#FDCC92'],
  className = '',
}) {
  const gradient = `linear-gradient(90deg, ${colors.join(', ')})`

  return (
    <span
      className={`inline-block bg-[length:200%_100%] bg-clip-text text-transparent animate-[dia-reveal_4s_ease-in-out_infinite] ${className}`}
      style={{ backgroundImage: gradient }}
    >
      {text}
    </span>
  )
}
