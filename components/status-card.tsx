"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, Box, Button, Chip, Stack, Tooltip, Typography } from "@mui/material";
import type { FundStatusResponse, FundingInstructionsResponse } from "../lib/escrow";

export function FundingStatusCard({
  title,
  disabled,
  instructions,
  status,
  waitingForPlayers = false,
  onInstructions,
  onStatus,
}: {
  title: string;
  disabled: boolean;
  instructions: FundingInstructionsResponse | null;
  status: FundStatusResponse | null;
  waitingForPlayers?: boolean;
  onInstructions: () => void;
  onStatus: () => void;
}) {
  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
          {title}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button disabled={disabled} onClick={onInstructions} variant="outlined" size="small">
            Payment request
          </Button>
          <Button disabled={disabled} onClick={onStatus} variant="outlined" size="small" startIcon={<RefreshIcon />}>
            Check
          </Button>
        </Stack>
        {instructions ? (
          <Stack spacing={1.2}>
            <KeyValue label="Amount" value={`${instructions.amount_sats} sats`} />
            <KeyValue label="Payment request" value={instructions.payment_request} copy />
          </Stack>
        ) : (
          <Alert severity="info">{waitingForPlayers ? "Invite Player 2 before requesting payment." : "Get your payment request after the game is ready."}</Alert>
        )}
        {status ? (
          <Stack spacing={1.2}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              <Chip label={status.funded || status.my_funded ? "paid" : "waiting for payment"} color={status.funded || status.my_funded ? "success" : "default"} />
              {status.funded_count != null ? (
                <Chip label={`${status.funded_count}/${status.funding_threshold || status.total_funders || "?"} funded`} />
              ) : null}
            </Stack>
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}

export function KeyValue({ label, value, copy = false }: { label: string; value: string; copy?: boolean }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900, textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Typography variant="body2" sx={{ overflowWrap: "anywhere", minWidth: 0 }}>
          {value}
        </Typography>
        {copy ? (
          <Tooltip title="Copy">
            <Button size="small" variant="text" onClick={() => navigator.clipboard.writeText(value)} sx={{ minWidth: 36 }}>
              <ContentCopyIcon fontSize="small" />
            </Button>
          </Tooltip>
        ) : null}
      </Stack>
    </Box>
  );
}
