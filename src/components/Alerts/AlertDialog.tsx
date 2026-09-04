import { Box, Dialog, Portal } from "@chakra-ui/react"
import { useLayoutEffect, useState } from "react"
import type { ReactNode, RefObject } from "react"
import { useRsi } from "../../hooks/useRsi"
import { rootId, rsiRootClassName } from "../Providers"

interface Props {
  isOpen: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  footer: ReactNode
  /** Element focused when the dialog opens (the least destructive action, usually "Cancel") */
  leastDestructiveRef: RefObject<HTMLElement | null>
}

/**
 * Centered alert dialog shell shared by the confirm/submit/unmatched-fields alerts.
 *
 * The alert is portalled into the main dialog's content element rather than `document.body`. The main
 * dialog marks everything outside its content `aria-hidden` (deferred to the next animation frame), so a
 * body-level alert could be hidden from assistive tech; nesting inside the content keeps the alert
 * accessible and lets the focus traps nest naturally. Falls back to `document.body` when no main dialog
 * is mounted.
 */
export const AlertDialog = ({ isOpen, onClose, title, children, footer, leastDestructiveRef }: Props) => {
  const { rtl } = useRsi()
  const [container, setContainer] = useState<RefObject<HTMLElement> | undefined>(undefined)

  useLayoutEffect(() => {
    const mainDialogContent = document.getElementById(rootId)
    if (mainDialogContent) setContainer({ current: mainDialogContent })
  }, [])

  return (
    <Dialog.Root
      role="alertdialog"
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose()
      }}
      placement="center"
      initialFocusEl={() => leastDestructiveRef.current}
      lazyMount
      unmountOnExit
    >
      <Portal container={container}>
        <Box className={rsiRootClassName} dir={rtl ? "rtl" : "ltr"}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{title}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>{children}</Dialog.Body>
              <Dialog.Footer>{footer}</Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Box>
      </Portal>
    </Dialog.Root>
  )
}
