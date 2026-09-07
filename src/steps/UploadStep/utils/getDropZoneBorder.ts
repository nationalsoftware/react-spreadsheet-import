import type { SystemStyleObject } from "@chakra-ui/react"

/** Converts a Chakra color token path (e.g. "rsi.500") into a token reference; raw CSS colors pass through. */
const toColorValue = (color: string) => (/^[a-zA-Z][\w-]*(\.[\w-]+)+$/.test(color) ? `{colors.${color}}` : color)

export const getDropZoneBorder = (color: string): SystemStyleObject => {
  const c = toColorValue(color)
  const stripes = (deg: number) =>
    `repeating-linear-gradient(${deg}deg, ${c}, ${c} 10px, transparent 10px, transparent 20px, ${c} 20px)`
  return {
    backgroundImage: [stripes(0), stripes(90), stripes(180), stripes(270)].join(", "),
    backgroundSize: "2px 100%, 100% 2px, 2px 100% , 100% 2px",
    backgroundPosition: "0 0, 0 0, 100% 0, 0 100%",
    backgroundRepeat: "no-repeat",
    borderRadius: "4px",
  }
}
