import { useContext } from "react"
import { ToasterContext } from "../components/Providers"

/** Returns the toaster store created by `Providers`. Replaces Chakra v2's `useToast`. */
export const useToaster = () => {
  const toaster = useContext(ToasterContext)
  if (!toaster) {
    throw new Error("useToaster must be used within react-spreadsheet-import Providers")
  }
  return toaster
}
