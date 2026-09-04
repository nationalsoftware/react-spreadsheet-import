import { useLayoutEffect, useState } from "react"
import type { ReactNode } from "react"
import ReactDOM from "react-dom"
import { Box } from "@chakra-ui/react"
import { autoUpdate, computePosition, flip, hide, size } from "@floating-ui/dom"
import { rsiRootClassName } from "../Providers"
import { useRsi } from "../../hooks/useRsi"

function createWrapperAndAppendToBody(wrapperId: string) {
  const wrapperElement = document.createElement("div")
  wrapperElement.setAttribute("id", wrapperId)
  document.body.appendChild(wrapperElement)
  return wrapperElement
}

export const SELECT_DROPDOWN_ID = "react-select-dropdown-wrapper"

/** Subset of react-select's MenuPortalProps that this component uses */
interface PortalProps {
  controlElement: HTMLDivElement | null
  children: ReactNode
}

/**
 * Custom react-select menu portal. The menu is rendered into a body-level wrapper (`SELECT_DROPDOWN_ID`),
 * positioned under the select control with floating-ui (fixed strategy, width matched to the control)
 * and hidden when the control scrolls out of view inside the modal body.
 */
const MenuPortal = (props: PortalProps) => {
  const { rtl } = useRsi()
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null)
  const [floatingElement, setFloatingElement] = useState<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    let element = document.getElementById(SELECT_DROPDOWN_ID)
    let systemCreated = false
    if (!element) {
      systemCreated = true
      element = createWrapperAndAppendToBody(SELECT_DROPDOWN_ID)
    }
    setWrapperElement(element)

    return () => {
      if (systemCreated && element?.parentNode) {
        element.parentNode.removeChild(element)
      }
    }
  }, [])

  const reference = props.controlElement

  useLayoutEffect(() => {
    if (!reference || !floatingElement) return

    const update = async () => {
      const { x, y, middlewareData } = await computePosition(reference, floatingElement, {
        strategy: "fixed",
        placement: "bottom-start",
        middleware: [
          size({
            apply({ rects, elements }) {
              elements.floating.style.width = `${rects.reference.width}px`
            },
          }),
          flip(),
          hide(),
        ],
      })
      const referenceHidden = Boolean(middlewareData.hide?.referenceHidden)
      Object.assign(floatingElement.style, {
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
        visibility: referenceHidden ? "hidden" : "visible",
        pointerEvents: referenceHidden ? "none" : "",
      })
    }

    return autoUpdate(reference, floatingElement, () => void update())
  }, [reference, floatingElement])

  // wrapperElement state will be null on very first render.
  if (wrapperElement === null) return null

  return ReactDOM.createPortal(
    // pointerEvents: the modal layer sets pointer-events: none on <body>; the wrapper lives outside Dialog.Content
    <Box
      dir={rtl ? "rtl" : "ltr"}
      ref={setFloatingElement}
      zIndex="tooltip"
      pointerEvents="auto"
      className={rsiRootClassName}
    >
      {props.children}
    </Box>,
    wrapperElement,
  )
}

export const customComponents = {
  MenuPortal,
}
