import type { CityData } from "@/data/cities";

interface HouseVisualizationProps {
  city: CityData;
}

/**
 * Renders a stylized SVG house whose visual properties are driven by city data:
 * - House width/size  → avg house price (larger = pricier city)
 * - Number of windows → population (more windows = bigger city)
 * - Roof steepness    → growth rate (steeper = faster-growing city)
 * - Yard width        → area size (wider yard = larger city area)
 */
export default function HouseVisualization({ city }: HouseVisualizationProps) {
  // --- Normalise raw city values into visual parameters ---

  // Price: 40–185 L → house body width 180–420px
  const PRICE_MIN = 40, PRICE_MAX = 185;
  const priceNorm = Math.max(0, Math.min(1, (city.avgHousePrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)));
  const houseWidth = 180 + priceNorm * 240;
  const houseHeight = houseWidth * 0.55;

  // Population: 0.7–32.9 M → 2–8 windows
  const POP_MIN = 0.7, POP_MAX = 32.9;
  const popNorm = Math.max(0, Math.min(1, (city.population - POP_MIN) / (POP_MAX - POP_MIN)));
  const windowCount = Math.round(2 + popNorm * 6);

  // Growth rate: 2.9–9.2 % → roof height 80–180px (steeper = taller)
  const GROWTH_MIN = 2.9, GROWTH_MAX = 9.2;
  const growthNorm = Math.max(0, Math.min(1, (city.growthRate - GROWTH_MIN) / (GROWTH_MAX - GROWTH_MIN)));
  const roofHeight = 80 + growthNorm * 100;

  // Area size: 95–1484 km² → yard extension 30–120px on each side
  const AREA_MIN = 95, AREA_MAX = 1484;
  const areaNorm = Math.max(0, Math.min(1, (city.areaSize - AREA_MIN) / (AREA_MAX - AREA_MIN)));
  const yardExt = 30 + areaNorm * 90;

  // Derived geometry
  const totalWidth = houseWidth + yardExt * 2;
  const svgWidth = totalWidth + 60;
  const svgHeight = houseHeight + roofHeight + 120; // 120 = ground + margin
  const groundY = svgHeight - 60;
  const houseLeft = yardExt + 30;
  const houseRight = houseLeft + houseWidth;
  const ridgeX = houseLeft + houseWidth / 2;
  const ridgeY = groundY - houseHeight - roofHeight;
  const eaveY = groundY - houseHeight;

  // Door
  const doorWidth = Math.max(28, houseWidth * 0.14);
  const doorHeight = houseHeight * 0.48;
  const doorLeft = ridgeX - doorWidth / 2;
  const doorTop = groundY - doorHeight;

  // Windows distributed evenly along facade (exclude door zone)
  const windowSize = Math.max(16, houseWidth * 0.1);
  const windowY = eaveY + (houseHeight - doorHeight) / 2 - windowSize / 2;

  const windowPositions: number[] = [];
  if (windowCount > 0) {
    const spacing = houseWidth / (windowCount + 1);
    for (let i = 0; i < windowCount; i++) {
      const wx = houseLeft + spacing * (i + 1);
      // Skip if overlaps door
      if (wx < doorLeft - windowSize - 4 || wx > doorLeft + doorWidth + 4) {
        windowPositions.push(wx);
      }
    }
  }

  // Chimney
  const chimneyX = ridgeX + houseWidth * 0.2;
  const chimneyWidth = houseWidth * 0.07;
  const chimneyHeight = roofHeight * 0.5;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      width="100%"
      className="max-w-2xl mx-auto"
      style={{ aspectRatio: `${svgWidth} / ${svgHeight}` }}
      aria-label={`House visualization for ${city.name}`}
    >
      {/* Sky background */}
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f0ea" />
          <stop offset="100%" stopColor="#e8ddd0" />
        </linearGradient>
        <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b5545" />
          <stop offset="100%" stopColor="#4a3828" />
        </linearGradient>
        <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86c556" />
          <stop offset="100%" stopColor="#5a9e35" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width={svgWidth} height={groundY} fill="url(#skyGrad)" />

      {/* Sun */}
      <circle cx={svgWidth - 50} cy={50} r={22} fill="#fbbf24" opacity="0.85" />

      {/* Ground / yard */}
      <rect x="0" y={groundY} width={svgWidth} height={60} fill="url(#groundGrad)" />

      {/* Yard path (widened) */}
      <rect
        x={houseLeft - yardExt}
        y={groundY}
        width={houseWidth + yardExt * 2}
        height={10}
        fill="#9dcd64"
        opacity="0.6"
      />

      {/* Chimney (drawn before roof so roof overlaps it) */}
      {growthNorm > 0.3 && (
        <rect
          x={chimneyX - chimneyWidth / 2}
          y={ridgeY - chimneyHeight}
          width={chimneyWidth}
          height={chimneyHeight}
          fill="#7c5c4a"
          stroke="#5a3e2b"
          strokeWidth="1.5"
        />
      )}

      {/* Roof */}
      <polygon
        points={`${houseLeft},${eaveY} ${houseRight},${eaveY} ${ridgeX},${ridgeY}`}
        fill="url(#roofGrad)"
        stroke="#3a2518"
        strokeWidth="2"
      />

      {/* Roof overhang shadow */}
      <polygon
        points={`${houseLeft - 4},${eaveY} ${houseRight + 4},${eaveY} ${houseLeft - 4},${eaveY + 8} ${houseRight + 4},${eaveY + 8}`}
        fill="rgba(0,0,0,0.08)"
      />

      {/* House wall */}
      <rect
        x={houseLeft}
        y={eaveY}
        width={houseWidth}
        height={houseHeight}
        fill="url(#wallGrad)"
        stroke="#c9b8a4"
        strokeWidth="1.5"
      />

      {/* Windows */}
      {windowPositions.map((wx, i) => (
        <g key={i}>
          {/* Window frame */}
          <rect
            x={wx - windowSize / 2}
            y={windowY}
            width={windowSize}
            height={windowSize}
            fill="#bfdbfe"
            stroke="#6b5545"
            strokeWidth="2"
            rx="2"
          />
          {/* Cross pane */}
          <line
            x1={wx}
            y1={windowY}
            x2={wx}
            y2={windowY + windowSize}
            stroke="#6b5545"
            strokeWidth="1.5"
          />
          <line
            x1={wx - windowSize / 2}
            y1={windowY + windowSize / 2}
            x2={wx + windowSize / 2}
            y2={windowY + windowSize / 2}
            stroke="#6b5545"
            strokeWidth="1.5"
          />
          {/* Light reflection */}
          <rect
            x={wx - windowSize / 2 + 3}
            y={windowY + 3}
            width={windowSize * 0.35}
            height={windowSize * 0.35}
            fill="white"
            opacity="0.4"
            rx="1"
          />
        </g>
      ))}

      {/* Door */}
      <rect
        x={doorLeft}
        y={doorTop}
        width={doorWidth}
        height={doorHeight}
        fill="#7c5c4a"
        stroke="#5a3e2b"
        strokeWidth="2"
        rx="2"
      />
      {/* Door arch */}
      <path
        d={`M ${doorLeft} ${doorTop + 2} Q ${doorLeft + doorWidth / 2} ${doorTop - doorWidth * 0.3} ${doorLeft + doorWidth} ${doorTop + 2}`}
        fill="#7c5c4a"
        stroke="#5a3e2b"
        strokeWidth="2"
      />
      {/* Door knob */}
      <circle
        cx={doorLeft + doorWidth * 0.72}
        cy={doorTop + doorHeight * 0.55}
        r={doorWidth * 0.07}
        fill="#f59e0b"
      />

      {/* Pathway */}
      <path
        d={`M ${ridgeX - doorWidth * 0.6} ${groundY} L ${ridgeX - doorWidth * 0.3} ${groundY + 55} L ${ridgeX + doorWidth * 0.3} ${groundY + 55} L ${ridgeX + doorWidth * 0.6} ${groundY}`}
        fill="#d1c4b0"
        stroke="#b5a48a"
        strokeWidth="1"
      />

      {/* Trees / bushes in yard */}
      {yardExt > 50 && (
        <>
          <circle cx={houseLeft - yardExt * 0.5} cy={groundY - 20} r={18} fill="#5aac38" />
          <rect x={houseLeft - yardExt * 0.5 - 4} y={groundY - 2} width={8} height={22} fill="#6b4c2a" />
        </>
      )}
      {yardExt > 80 && (
        <>
          <circle cx={houseRight + yardExt * 0.5} cy={groundY - 20} r={18} fill="#4e9e30" />
          <rect x={houseRight + yardExt * 0.5 - 4} y={groundY - 2} width={8} height={22} fill="#6b4c2a" />
        </>
      )}

      {/* City name label */}
      <text
        x={svgWidth / 2}
        y={svgHeight - 12}
        textAnchor="middle"
        fontSize={14}
        fontWeight="600"
        fill="#6b5545"
        fontFamily="Georgia, serif"
      >
        {city.name}
      </text>
    </svg>
  );
}
