import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react"
import { forwardRef } from "react"
import type { ReactNode } from "react"
import { useRsiRootClass } from "../hooks/useRsi"

export interface TooltipProps extends ChakraTooltip.RootProps {
  showArrow?: boolean
  content: ReactNode
  contentProps?: ChakraTooltip.ContentProps
  disabled?: boolean
}

/** Thin wrapper over the Chakra v3 compound Tooltip, mirroring the v2 `<Tooltip label>` ergonomics. */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(props, ref) {
  const { showArrow, children, disabled, content, contentProps, ...rest } = props
  const rootClass = useRsiRootClass()

  if (disabled) return <>{children}</>

  return (
    <ChakraTooltip.Root {...rest}>
      <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
      <Portal>
        <ChakraTooltip.Positioner className={rootClass}>
          <ChakraTooltip.Content ref={ref} {...contentProps}>
            {showArrow && (
              <ChakraTooltip.Arrow>
                <ChakraTooltip.ArrowTip />
              </ChakraTooltip.Arrow>
            )}
            {content}
          </ChakraTooltip.Content>
        </ChakraTooltip.Positioner>
      </Portal>
    </ChakraTooltip.Root>
  )
})
