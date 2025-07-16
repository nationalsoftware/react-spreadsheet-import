import type { Column } from "react-data-grid";
import { Box, Tooltip } from "@chakra-ui/react";
import { CgInfo } from "react-icons/cg";

export const generateColumns = (): Column<any>[] => [
  {
    key: "label",
    name: "Field Name",
    minWidth: 150,
    headerRenderer: (props) => (
      <Box display="flex" gap={1} alignItems="center">
        <Box flex="0 0 auto" width="16px" height="16px" display="flex" alignItems="center" justifyContent="center" />
        <Box flex={1} overflow="hidden" textOverflow="ellipsis">
          {props.column.name}
        </Box>
      </Box>
    ),
    formatter: ({ row }) => (
      <Box display="flex" gap={1} alignItems="center">
        <Box flex="0 0 auto" width="16px" height="16px" display="flex" alignItems="center" justifyContent="center">
          {row.description ? (
            <Tooltip placement="top-end" hasArrow label={row.description}>
              <Box>
                <CgInfo size="16px" />
              </Box>
            </Tooltip>
          ) : null}
        </Box>
        <Box flex={1} overflow="hidden" textOverflow="ellipsis">
          {row.label}
        </Box>
      </Box>
    ),
  },
  {
    key: "value",
    name: "Example Value",
    minWidth: 200,
    formatter: ({ row }) => (
      <Box minWidth="100%" minHeight="100%" overflow="hidden" textOverflow="ellipsis">
        {row.value}
      </Box>
    ),
  },
];
