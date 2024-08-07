"use client";
import { createTheme, ThemeProvider } from "@mui/material";
import { Poppins } from "next/font/google";
import React from "react";

const Poppin = Poppins({
  subsets: ["latin"],
  variable: "--font-poppin",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const muiTheme = createTheme({
    typography: {
      fontFamily: Poppin.style.fontFamily,
    },
    palette: {
      primary: {
        main: "#22c55e",
      },
      secondary: {
        main: "#FF5722",
      },
      warning: {
        main: "#eab308",
      },
    },
    components: {
      MuiModal: {
        defaultProps: {
          classes: {
            root: `${Poppin.variable} ${Poppin.variable}`,
          },
        },
      },
      MuiMenu: {
        defaultProps: {
          classes: {
            root: `${Poppin.variable} ${Poppin.variable}`,
          },
        },
      },
    },
  });

  return (
    <>
      <ThemeProvider theme={muiTheme}>
        <body className={Poppin.className}>{children}</body>
      </ThemeProvider>
    </>
  );
};

export default ClientLayout;
