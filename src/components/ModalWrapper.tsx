import type React from "react"
import { useRef } from "react"
import { Box, Dialog, Portal } from "@chakra-ui/react"
import { ModalCloseButton } from "./ModalCloseButton"
import { useRsi } from "../hooks/useRsi"
import { useModalStyles } from "../hooks/useRsiStyles"
import { rootId, rsiRootClassName } from "./Providers"

type Props = {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

export const ModalWrapper = ({ children, isOpen, onClose }: Props) => {
  const { rtl } = useRsi()
  const styles = useModalStyles()
  const contentRef = useRef<HTMLDivElement>(null)
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose()
      }}
      ids={{ content: rootId }}
      // focus the dialog itself on open (v2 behaviour, no focus ring on the first button); Tab moves into the content
      initialFocusEl={() => contentRef.current}
      scrollBehavior="inside"
      motionPreset="slide-in-bottom"
      closeOnEscape={false}
      closeOnInteractOutside={false}
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Box className={rsiRootClassName} dir={rtl ? "rtl" : "ltr"}>
          <Dialog.Backdrop />
          <ModalCloseButton onClose={onClose} />
          <Dialog.Positioner>
            <Dialog.Content ref={contentRef} css={styles.dialog}>
              {children}
            </Dialog.Content>
          </Dialog.Positioner>
        </Box>
      </Portal>
    </Dialog.Root>
  )
}
