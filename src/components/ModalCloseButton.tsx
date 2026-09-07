import { IconButton } from "@chakra-ui/react"
import { CgClose } from "react-icons/cg"
import { ConfirmCloseAlert } from "./Alerts/ConfirmCloseAlert"
import { useState } from "react"
import { useModalStyles } from "../hooks/useRsiStyles"

type ModalCloseButtonProps = {
  onClose: () => void
}

export const ModalCloseButton = ({ onClose }: ModalCloseButtonProps) => {
  const [showModal, setShowModal] = useState(false)
  const styles = useModalStyles()
  return (
    <>
      <ConfirmCloseAlert
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          setShowModal(false)
          onClose()
        }}
      />
      <IconButton
        unstyled
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        fontSize="md"
        right="14px"
        top="20px"
        css={styles.closeModalButton}
        aria-label="Close modal"
        color="white"
        position="fixed"
        // the modal layer sets pointer-events: none on <body>; this button lives outside Dialog.Content
        pointerEvents="auto"
        transform="translate(50%, -50%)"
        onClick={() => setShowModal(true)}
        zIndex="toast"
        dir="ltr"
      >
        <CgClose />
      </IconButton>
    </>
  )
}
