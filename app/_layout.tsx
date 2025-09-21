// app/_layout.tsx
import React from "react"
import "./../global.css"
import { Slot } from "expo-router"
import { AuthProvider } from "../context/AuthContext"
import { LoaderProvider } from "../context/LoaderContext"
import { ThemeProvider } from "../context/ThemeContext"
import ThemeWrapper from "@/components/ThemeWrapper"

const RootLayout = () => {
  return (
    <ThemeProvider>
      <ThemeWrapper>
        <LoaderProvider>
          <AuthProvider>
            <Slot />
          </AuthProvider>
        </LoaderProvider>
      </ThemeWrapper>
    </ThemeProvider>
  )
}

export default RootLayout