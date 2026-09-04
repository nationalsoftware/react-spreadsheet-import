import type { Column } from "react-data-grid"
import { Box } from "@chakra-ui/react"
import { CgInfo } from "react-icons/cg"
import { Tooltip } from "../../../components/Tooltip"

export const generateColumns = (): Column<any>[] => [
  {
    key: "label",
    name: "Field Name",
    minWidth: 150,
    renderHeaderCell: (props) => (
      <Box display="flex" gap={1} alignItems="center">
        <Box width="16px" height="16px" />
        <Box overflow="hidden" textOverflow="ellipsis" alignItems="center">
          {props.column.name}
        </Box>
      </Box>
    ),
    renderCell: ({ row }) => (
      <Box display="flex" gap={1} alignItems="center">
        <Box width="16px" height="16px">
          {row.description ? (
            <Tooltip
              positioning={{ placement: "top-end" }}
              showArrow
              content={row.description}
              contentProps={{ whiteSpace: "pre-line" }}
            >
              <Box>
                <CgInfo size="16px" />
              </Box>
            </Tooltip>
          ) : null}
        </Box>
        <Box overflow="hidden" textOverflow="ellipsis" alignItems="center">
          {row.label}
        </Box>
      </Box>
    ),
  },
  {
    key: "value",
    name: "Example Value",
    minWidth: 200,
    renderCell: ({ row }) => (
      <Box minWidth="100%" minHeight="100%" overflow="hidden" textOverflow="ellipsis" alignContent="center">
        {row.value}
      </Box>
    ),
  },
]
