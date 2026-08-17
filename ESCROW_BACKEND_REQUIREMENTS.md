# Rollpot Escrow Backend Requirements

Rollpot is a two-player dice wager client using the Pontmore standalone escrow HTTP service as its backend. The client relies on the PIP-01 simplified descriptor and the `pontmore_escrow_http_v1` OpenAPI schema.

The game uses `2_of_2` funding: both participants get separate Lightning invoices and must fund before rolling. The winner is determined by higher die roll and receives the total pot via `application_signed_result` release.

## Two-Party Flow

```text
creator create 2_of_2 escrow -> CREATED
counterparty joins via enrollment_token + refund_ln_address -> CREATED (both funder rows seeded)
creator requests funding_instructions -> creator invoice
counterparty requests funding_instructions -> counterparty invoice
both invoices paid -> ACTIVE
application_signed_result release -> RELEASED (winner gets 2 × amount_sats)
```

Funding requires both participants to be registered before either can request an invoice. Each participant receives their own BOLT11 invoice.

## Enrollment and Funding

### Counterparty join

`POST /create` with `enrollment_token` and `refund_ln_address`:

```json
{
  "enrollment_token": "service-issued-token",
  "refund_ln_address": "player2@wallet.com"
}
```

The `refund_ln_address` becomes the counterparty's payout address on release.

### Funding Instructions

Once both participants are registered (creator funder row seeded, counterparty funder row seeded at join), either participant can call `POST /funding_instructions` with `{ "escrow_id": "..." }` authenticated with their Nostr pubkey.

### Fund Status

`POST /fund_status` checks Per-funder invoice status. When `funded_count >= funding_threshold` (2 for 2_of_2), the escrow becomes `active`.

## Release

Roll uses `application_signed_result` release decision. The application signer (Rollpot's ephemeral key) computes two dice rolls, determines the winner, and signs:

```
pontmore-escrow:v1:<escrow_id>:release:<winner>:<sha256(JSON.stringify(result))>:<nonce>:<timestamp>
```

The signature is BIP-340 Schnorr (secp256k1) over `sha256(canonical_message)`.

The escrow service releases the sum of funded contributions (2 × amount_sats for 2_of_2) to the winner's registered payout address. Platform fees are already excluded at invoice time.

## Service Discovery

Rollpot discovers escrow services via the PIP-01 simplified descriptor. Required descriptor fields:
- `version: 1`
- `escrow_type`, `networks`, `reference_format`
- `funding_rules` (with `funding_threshold`, `participant_count`, `required_confirmation`)
- `dispute_rules` (with `policy`)
- `service.schema.url` (standalone service only)

The service endpoint and capabilities are derived from the referenced OpenAPI schema, not from the descriptor itself.