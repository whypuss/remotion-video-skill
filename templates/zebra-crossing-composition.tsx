import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Easing,
  Sequence,
} from "remotion";

const FPS = 30;
const TOTAL = 180; // 6 seconds

// Road + Zebra Crossing scene
const Road: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
        background: "#2a2a2a",
      }}
    >
      {/* Zebra stripes */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 80,
            left: 80 + i * 100,
            width: 60,
            height: 40,
            background: "#ffffff",
          }}
        />
      ))}
      {/* Road edge lines */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 0,
          right: 0,
          height: 4,
          background: "#ffcc00",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          height: 4,
          background: "#ffcc00",
        }}
      />
    </div>
  );
};

// Person component
const Person: React.FC<{
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  startFrame: number;
  walkDuration: number;
  size?: number;
}> = ({ startX, startY, endX, endY, color, startFrame, walkDuration, size = 40 }) => {
  const frame = useCurrentFrame();

  if (frame < startFrame) return null;

  const progress = Math.min((frame - startFrame) / walkDuration, 1);
  const eased = interpolate(progress, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

  const x = startX + (endX - startX) * eased;
  const y = startY + (endY - startY) * eased;

  // Walking bounce
  const bounce = Math.sin(progress * Math.PI * 6) * 5 * (1 - progress);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + bounce,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
      }}
    />
  );
};

// Car component
const Car: React.FC<{
  startFrame: number;
  fromX: number;
  toX: number;
  fromY: number;
  toY: number;
  color: string;
}> = ({ startFrame, fromX, toX, fromY, toY, color }) => {
  const frame = useCurrentFrame();

  if (frame < startFrame) return null;

  const progress = Math.min((frame - startFrame) / 60, 1);
  const eased = interpolate(progress, [0, 0.7, 1], [0, 1, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  const x = fromX + (toX - fromX) * eased;
  const y = fromY + (toY - fromY) * eased;

  // Car shake on motion
  const shake = progress < 1 ? Math.sin(frame * 0.5) * 2 : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x + shake,
        top: y,
        width: 120,
        height: 60,
        background: color,
        borderRadius: 12,
        boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
      }}
    >
      {/* Windshield */}
      <div
        style={{
          position: "absolute",
          right: 10,
          top: 10,
          width: 35,
          height: 30,
          background: "#87ceeb",
          borderRadius: 6,
          opacity: 0.8,
        }}
      />
      {/* Headlight */}
      <div
        style={{
          position: "absolute",
          right: -5,
          top: 20,
          width: 8,
          height: 15,
          background: "#ffff99",
          borderRadius: 3,
        }}
      />
      {/* Wheels */}
      <div
        style={{
          position: "absolute",
          left: 15,
          bottom: -8,
          width: 20,
          height: 20,
          background: "#111",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 15,
          bottom: -8,
          width: 20,
          height: 20,
          background: "#111",
          borderRadius: "50%",
        }}
      />
    </div>
  );
};

// Title overlay
const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15, 120, 150], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity,
        fontSize: 48,
        fontWeight: 800,
        color: "#ffffff",
        textShadow: "0 4px 20px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9)",
        letterSpacing: 2,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      斑馬線前．停一停
    </div>
  );
};

// Subtitle
const Subtitle: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [20, 40, 130, 155], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 130,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity,
        fontSize: 24,
        fontWeight: 500,
        color: "#ffcc00",
        textShadow: "0 2px 10px rgba(0,0,0,0.9)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      生命無價，讓先係義務
    </div>
  );
};

// Scene: Day sky background
const Sky: React.FC = () => {
  const frame = useCurrentFrame();
  const brightness = interpolate(frame, [0, 60, 120], [1, 1.1, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(180deg, #87ceeb ${brightness * 40}%, #b0e0e6 50%, #98d8c8 100%)`,
      }}
    />
  );
};

// Buildings background
const Buildings: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 200,
        left: 0,
        right: 0,
        height: 300,
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
        padding: "0 20px",
      }}
    >
      {[
        { h: 180, w: 80, c: "#8b7355" },
        { h: 220, w: 100, c: "#a0926c" },
        { h: 150, w: 70, c: "#9a8b7a" },
        { h: 260, w: 120, c: "#b8a88a" },
        { h: 200, w: 90, c: "#8b8570" },
        { h: 170, w: 75, c: "#a09080" },
        { h: 240, w: 110, c: "#9a9080" },
        { h: 190, w: 85, c: "#a8a090" },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            height: b.h,
            width: b.w,
            background: b.c,
            borderRadius: "4px 4px 0 0",
          }}
        />
      ))}
    </div>
  );
};

// Warning text flash
const WarningFlash: React.FC = () => {
  const frame = useCurrentFrame();

  if (frame < 85 || frame > 105) return null;

  const intensity = frame < 92
    ? (frame - 85) / 7
    : frame < 100
    ? 1 - (frame - 92) / 8
    : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `rgba(255, 0, 0, ${intensity * 0.15})`,
        pointerEvents: "none",
      }}
    />
  );
};

export const MyComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#87ceeb" }}>
      {/* Background */}
      <Sky />
      <Buildings />

      {/* Road */}
      <Road />

      {/* People crossing */}
      <Sequence from={30} durationInFrames={90}>
        <Person
          startX={200}
          startY={280}
          endX={900}
          endY={280}
          color="#e74c3c"
          startFrame={0}
          walkDuration={80}
          size={35}
        />
      </Sequence>

      <Sequence from={40} durationInFrames={90}>
        <Person
          startX={180}
          startY={250}
          endX={920}
          endY={250}
          color="#3498db"
          startFrame={0}
          walkDuration={85}
          size={32}
        />
      </Sequence>

      <Sequence from={35} durationInFrames={90}>
        <Person
          startX={220}
          startY={300}
          endX={880}
          endY={300}
          color="#9b59b6"
          startFrame={0}
          walkDuration={78}
          size={30}
        />
      </Sequence>

      {/* Car approaching */}
      <Car
        startFrame={60}
        fromX={-150}
        toX={1400}
        fromY={320}
        toY={320}
        color="#e67e22"
      />

      {/* Warning flash when car passes zebra */}
      <WarningFlash />

      {/* Text overlays */}
      <Title />
      <Subtitle />

      {/* End card */}
      <Sequence from={150} durationInFrames={30}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: "#ffffff",
              textShadow: "0 4px 20px rgba(0,0,0,0.8)",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            減速讓先
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 28,
              color: "#ffcc00",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            行人安全．駕駛責任
          </div>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};