import { Button } from "@chakra-ui/react"
import { useRef } from "react"
import { useRsi } from "../../hooks/useRsi"
import { AlertDialog } from "./AlertDialog"

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ConfirmCloseAlert = ({ isOpen, onClose, onConfirm }: Props) => {
  const { translations } = useRsi()
  const cancelRef = useRef<HTMLButtonElement | null>(null)

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      title={translations.alerts.confirmClose.headerTitle}
      footer={
        <>
          <Button ref={cancelRef} onClick={onClose} variant="ghost">
            {translations.alerts.confirmClose.cancelButtonTitle}
          </Button>
          <Button colorPalette="red" onClick={onConfirm} ml={3}>
            {translations.alerts.confirmClose.exitButtonTitle}
          </Button>
        </>
      }
    >
      {translations.alerts.confirmClose.bodyText}
    </AlertDialog>
  )
}
