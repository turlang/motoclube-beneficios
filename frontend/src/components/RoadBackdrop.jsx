import { Bike, Gauge, MapPin } from "lucide-react";

export function RoadBackdrop({ compact = false }) {
  return (
    <div className={["road-scene", compact ? "road-scene-compact" : ""].join(" ")} aria-hidden="true">
      <div className="road-glow" />
      <div className="road-horizon" />
      <div className="road-lane road-lane-left" />
      <div className="road-lane road-lane-right" />
      <div className="road-centerline" />
      <div className="road-bike-mark">
        <Bike className="h-9 w-9" strokeWidth={1.5} />
      </div>
      {!compact && (
        <>
          <div className="road-stat road-stat-left"><MapPin className="h-3.5 w-3.5" /> NA RUA</div>
          <div className="road-stat road-stat-right"><Gauge className="h-3.5 w-3.5" /> SEM PARAR</div>
        </>
      )}
    </div>
  );
}
