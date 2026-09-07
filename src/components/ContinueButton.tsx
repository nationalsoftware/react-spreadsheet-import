import { Button } from "@chakra-ui/react"
import { ModalFooter } from "./ModalParts"
import { useModalStyles } from "../hooks/useRsiStyles"

type ContinueButtonProps = {
  onContinue: (val: any) => void
  onBack?: () => void
  title: string
  backTitle?: string
  isLoading?: boolean
}

export const ContinueButton = ({ onContinue, onBack, title, backTitle, isLoading }: ContinueButtonProps) => {
  const styles = useModalStyles()
  const nextButtonMobileWidth = onBack ? "8rem" : "100%"
  return (
    <ModalFooter>
      {onBack && (
        <Button size="md" css={styles.backButton} onClick={onBack} loading={isLoading} variant="plain">
          {backTitle}
        </Button>
      )}
      <Button
        size="lg"
        w={{ base: nextButtonMobileWidth, md: "21rem" }}
        css={styles.continueButton}
        onClick={onContinue}
        loading={isLoading}
      >
        {title}
      </Button>
    </ModalFooter>
  )
}
