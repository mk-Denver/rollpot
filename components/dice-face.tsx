"use client";

import { Box, Typography } from "@mui/material";

const pipPositions: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function DiceFace({ label, value }: { label: string; value: number | null }) {
  const pips = value ? pipPositions[value] : [];

  return (
    <Box sx={{ textAlign: "center" }}>
      <Box
        aria-label={`${label} dice`}
        sx={{
          width: 132,
          height: 132,
          mx: "auto",
          borderRadius: 2,
          bgcolor: "#f8f2e8",
          border: "2px solid rgba(255,255,255,0.5)",
          boxShadow: "0 22px 42px rgba(0,0,0,0.28)",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
          p: 2,
          gap: 1,
        }}
      >
        {Array.from({ length: 9 }).map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              placeSelf: "center",
              bgcolor: pips.includes(index) ? "#17251b" : "transparent",
            }}
          />
        ))}
      </Box>
      <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 900 }}>
        {label}
      </Typography>
    </Box>
  );
}
