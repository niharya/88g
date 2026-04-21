export default function LqipLabLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`html, body { background: #fafafa !important; }`}</style>
      {children}
    </>
  )
}
