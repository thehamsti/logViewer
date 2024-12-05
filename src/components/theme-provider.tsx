import { createContext, useContext, useEffect, useState } from "react"
import { setTheme as setTauriTheme } from "@tauri-apps/api/app"
import { invoke } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"
import { emit } from "@tauri-apps/api/event"

export type Theme = "dark" | "light" | "auto"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "auto",
    setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "auto" as Theme,
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme)

    useEffect(() => {
        const getTheme = async () => {
            const theme = await invoke("plugin:theme|get_theme")
            setTheme(theme as Theme)
        }
        getTheme()

        const unlisten = listen("tauri://theme-changed", (event) => {
            setTheme(event.payload as Theme)
        })

        return () => {
            unlisten.then(fn => fn()) // Cleanup listener
        }
    }, [setTheme])

    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark")

        if (theme === "auto") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.classList.add(systemTheme)
            return
        }

        root.classList.add(theme)
    }, [theme])

    const setThemes = async (themeToSet: Theme) => {
        // Check if the theme is already set
        if (themeToSet === theme) {
            console.log('theme is already set', themeToSet);
            return
        }
        try {
            await invoke("plugin:theme|set_theme", { theme: themeToSet })
            setTheme(themeToSet)
            emit("tauri://theme-changed", themeToSet)
        } catch (err) {
            console.error('Error setting theme:', err);
        }
    }
    const value = {
        theme,
        setTheme: setThemes,
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
