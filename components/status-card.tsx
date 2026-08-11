"use client";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, Box, Button, Chip, Stack, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
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
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (!instructions?.payment_request) {
      setQrDataUrl("");
      return;
    }

    let cancelled = false;

    QRCode.toDataURL(instructions.payment_request, {
      width: 220,
      margin: 1,
      color: { dark: "#17251b", light: "#f8f2e8" },
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    }).catch(() => {
      // Silently skip QR generation on failure.
    });

    return () => { cancelled = true; };
  }, [instructions?.payment_request]);

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
            <KeyValue label="Invoice" value={instructions.payment_request} copy />
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={() => navigator.clipboard.writeText(instructions.payment_request)}
              sx={{ alignSelf: "flex-start", mt: 0.5 }}
            >
              Copy LN invoice
            </Button>
            {qrDataUrl ? (
              <Box sx={{ textAlign: "center", pt: 0.5 }}>
                <Box
                  component="img"
                  src={qrDataUrl}
                  alt="Lightning invoice QR code"
                  sx={{ width: 200, height: 200, borderRadius: 1 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  Scan with your Lightning wallet
                </Typography>
              </Box>
            ) : null}
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
