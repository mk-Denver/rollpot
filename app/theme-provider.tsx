"use client";

import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#57c26a",
      dark: "#2f9e44",
      light: "#91d99d",
      contrastText: "#061208",
    },
    secondary: {
      main: "#f08c00",
      dark: "#b96b00",
      light: "#ffb24d",
      contrastText: "#1d1408",
    },
    background: {
      default: "#0f1711",
      paper: "#17251b",
    },
    divider: "rgba(145, 217, 157, 0.18)",
    text: {
      primary: "#f8f2e8",
      secondary: "#b8c8ba",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 800,
          letterSpacing: 0,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
