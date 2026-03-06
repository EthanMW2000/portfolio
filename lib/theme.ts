"use client";

import { createTheme, type PaletteMode } from "@mui/material/styles";

export function getTheme(mode: PaletteMode) {
  const isDark = mode === "dark";

  const border = isDark
    ? "1px solid rgba(255,255,255,0.08)"
    : "1px solid rgba(0,0,0,0.08)";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#c8cdd8" : "#1b2541",
      },
      secondary: {
        main: isDark ? "#05a3b0" : "#048a95",
      },
      background: {
        default: isDark ? "#0f1117" : "#fafafa",
        paper: isDark ? "#14161e" : "#ffffff",
      },
      text: {
        primary: isDark ? "#e8e8ed" : "#1b2541",
        secondary: isDark ? "#9ca3af" : "#4a5568",
      },
      divider: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    },
    typography: {
      fontFamily: "inherit",
      h1: {
        fontSize: "3.5rem",
        fontWeight: 700,
        lineHeight: 1.1,
      },
      h2: {
        fontSize: "2.5rem",
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: "1.25rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: "1.1rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.7,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.6,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: isDark ? "#14161e" : "#ffffff",
            border,
            boxShadow: "none",
            transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            "&:hover": {
              borderColor: isDark
                ? "rgba(255,255,255,0.14)"
                : "rgba(0,0,0,0.14)",
            },
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
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor: isDark ? "#14161e" : "#ffffff",
            border,
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            backgroundColor: "transparent",
            border,
            borderRadius: 12,
          },
        },
      },
      MuiChip: {
        defaultProps: {
          variant: "outlined",
        },
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 8,
          },
          outlined: {
            borderColor: isDark ? "#05a3b0" : "#048a95",
            color: isDark ? "#05a3b0" : "#048a95",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark
              ? "rgba(15, 17, 23, 0.8)"
              : "rgba(250, 250, 250, 0.8)",
            backdropFilter: "blur(12px)",
            color: isDark ? "#e8e8ed" : "#1b2541",
            boxShadow: "none",
            borderBottom: isDark
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid rgba(0,0,0,0.06)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 10,
          },
          containedSecondary: {
            backgroundColor: isDark ? "#05a3b0" : "#048a95",
            "&:hover": {
              backgroundColor: isDark ? "#048a95" : "#037580",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: "color 0.2s ease-in-out",
          },
        },
      },
    },
  });
}
