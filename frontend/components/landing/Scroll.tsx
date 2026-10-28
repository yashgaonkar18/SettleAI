import ScrollVelocity from "@/components/ScrollVelocity";

export default function Scroll() {
    return (
        <ScrollVelocity
  texts={['SettleAI', 'Smart Payments, Simplified']}
  velocity={100}
  skewWithVelocity={0}
  scaleWithVelocity={0}
  draggable
  fontSize={80}
  fontWeight={700}
  className="custom-scroll-text"
  numCopies={6}
  damping={50}
  stiffness={400}
  separator=""
  fadeEdges={false}
  outlineAlternate={false}
  gap={0}
  pauseOnHover={false}
/>
    );
}
