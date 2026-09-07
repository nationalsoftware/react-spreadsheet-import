import { Dialog } from "@chakra-ui/react"
import { forwardRef } from "react"
import { useModalStyles } from "../hooks/useRsiStyles"

/**
 * Dialog header/body/footer pre-styled with the RSI `Modal` theme.
 * These replace Chakra v2's `ModalHeader`, `ModalBody` and `ModalFooter` (which picked the styles up
 * from the `rsi` modal variant automatically).
 */

export const ModalHeader = forwardRef<HTMLDivElement, Dialog.HeaderProps>(function ModalHeader(props, ref) {
  const styles = useModalStyles()
  return <Dialog.Header ref={ref} css={styles.header} {...props} />
})

export const ModalBody = forwardRef<HTMLDivElement, Dialog.BodyProps>(function ModalBody(props, ref) {
  const styles = useModalStyles()
  return <Dialog.Body ref={ref} css={styles.body} {...props} />
})

export const ModalFooter = forwardRef<HTMLDivElement, Dialog.FooterProps>(function ModalFooter(props, ref) {
  const styles = useModalStyles()
  return <Dialog.Footer ref={ref} css={styles.footer} {...props} />
})
