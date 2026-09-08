import { ChakraProvider, createToaster } from "@chakra-ui/react"
import type { CreateToasterReturn } from "@chakra-ui/react"
import merge from "lodash/merge"
import { createContext, useMemo } from "react"
import type { RsiProps } from "../types"
import { createRsiSystem, themeOverrides } from "../theme"
import type { CustomTheme, RsiTheme } from "../theme"
import { RsiThemeContext } from "../hooks/useRsiStyles"
import { Toaster } from "./Toaster"

export const RsiContext = createContext({} as any)
export const ToasterContext = createContext<CreateToasterReturn | null>(null)

type ProvidersProps<T extends string> = {
  children: React.ReactNode
  theme: CustomTheme
  rsiValues: RsiProps<T>
}

/** id of the main dialog's content element; select menus are portalled into it */
export const rootId = "chakra-modal-rsi"

export const Providers = <T extends string>({ children, theme, rsiValues }: ProvidersProps<T>) => {
  const mergedTheme = useMemo(() => merge({}, themeOverrides, theme) as RsiTheme, [theme])
  const system = useMemo(() => createRsiSystem(mergedTheme), [mergedTheme])
  const toaster = useMemo(() => createToaster({ placement: "bottom-start", pauseOnPageIdle: true }), [])

  if (!rsiValues.fields) {
    throw new Error("Fields must be provided to react-spreadsheet-import")
  }

  return (
    <RsiContext.Provider value={rsiValues}>
      <RsiThemeContext.Provider value={mergedTheme}>
        <ToasterContext.Provider value={toaster}>
          <ChakraProvider value={system}>
            {children}
            <Toaster toaster={toaster} />
          </ChakraProvider>
        </ToasterContext.Provider>
      </RsiThemeContext.Provider>
    </RsiContext.Provider>
  )
}
