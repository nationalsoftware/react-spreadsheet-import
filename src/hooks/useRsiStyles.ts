import merge from "lodash/merge"
import { createContext, useContext, useMemo } from "react"
import { themeOverrides } from "../theme"
import type { RsiTheme } from "../theme"

type Components = RsiTheme["components"]

/** Theme component keys that carry a `baseStyle` block (everything except `Button`) */
type StyledComponent = {
  [K in keyof Components]: Components[K] extends { baseStyle: unknown } ? K : never
}[keyof Components]

/** The merged RSI theme (defaults + `customTheme`). Replaces Chakra v2's `useStyleConfig`. */
export const RsiThemeContext = createContext<RsiTheme>(themeOverrides)

export const useRsiTheme = () => useContext(RsiThemeContext)

/** Returns the `baseStyle` block of a component from the RSI theme, e.g. `useRsiStyles("UploadStep")`. */
export const useRsiStyles = <K extends StyledComponent>(component: K): Components[K]["baseStyle"] =>
  useRsiTheme().components[component].baseStyle

/** Modal styles: `baseStyle` merged with the `rsi` variant (the only variant RSI renders). */
export const useModalStyles = () => {
  const { baseStyle, variants } = useRsiTheme().components.Modal
  return useMemo(() => merge({}, baseStyle, variants.rsi), [baseStyle, variants])
}
