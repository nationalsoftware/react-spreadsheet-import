import { Button } from "@chakra-ui/react"
import { useRef } from "react"
import { useRsi } from "../../hooks/useRsi"
import { AlertDialog } from "./AlertDialog"

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const SubmitDataAlert = ({ isOpen, onClose, onConfirm }: Props) => {
  const { allowInvalidSubmit, translations } = useRsi()
  const cancelRef = useRef<HTMLButtonElement | null>(null)

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      title={translations.alerts.submitIncomplete.headerTitle}
      footer={
        <>
          <Button ref={cancelRef} onClick={onClose} variant="ghost">
            {translations.alerts.submitIncomplete.cancelButtonTitle}
          </Button>
          {allowInvalidSubmit && (
            <Button onClick={onConfirm} ml={3}>
              {translations.alerts.submitIncomplete.finishButtonTitle}
            </Button>
          )}
        </>
      }
    >
      {allowInvalidSubmit
        ? translations.alerts.submitIncomplete.bodyText
        : translations.alerts.submitIncomplete.bodyTextSubmitForbidden}
    </AlertDialog>
  )
}
