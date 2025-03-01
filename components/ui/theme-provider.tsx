"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

// NaijaPlay brand colors
export const brandColors = {
  green: "#00A859",
  yellow: "#FFC107",
  orange: "#FF5722",
  white: "#FFFFFF",
  black: "#000000",
}

// Helper function to get color by name
export function getBrandColor(color: keyof typeof brandColors) {
  return brandColors[color]
} 