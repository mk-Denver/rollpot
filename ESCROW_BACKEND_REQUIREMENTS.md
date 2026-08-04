# Roll Pot Escrow Backend Requirements

Roll Pot is a two-player wager client using the Pontmore standalone escrow HTTP service as its backend. The client relies on the descriptor-advertised `pontmore_escrow_http_v1` service operations.

This note summarizes the backend behavior needed to support the game cleanly, especially for `two_party` funding.

## Expected Two-Party Flow

```text
creator create two_party escrow -> CREATED
counterparty joins via invitation_token -> PENDING_FUNDING
creator requests funding_instructions -> creator invoice
counterparty requests funding_instructions -> counterparty invoice
both invoices paid -> FUNDED
application_signed_result release -> SETTLED
```

For `two_party`, funding should not begin until both participants are registered.

## Required Backend Changes

### 1. Make Counterparty Join Atomic

`POST /create` with an `invitation_token` should be atomic.

Observed behavior from Roll Pot testing:

```text
join create + invitation_token -> 500 internal server error
retry same invite -> 409 not in state CREATED
```

This suggests the backend may mutate escrow state during the first join attempt, then return an error before the client receives the joined escrow.

Required behavior:

- If join succeeds, persist the join and return `200 CreateResponse`.
- If join fails, leave the escrow unchanged and still joinable.
- Do not partially join a participant and return `500`.

### 2. Make Invited Join Idempotent

The OpenAPI schema says `idempotency_key` deduplicates repeated `create` calls. The same behavior should apply to invited joins.

Example join payload:

```json
{
  "amount_sats": 100,
  "description": "Roll Pot wager",
  "refund_ln_address": "player2@wallet.com",
  "invitation_token": "service-issued-token",
  "idempotency_key": "roll-pot-join:<escrow_id>:<counterparty_pubkey>"
}
```

If the same authenticated pubkey retries the same join with the same `idempotency_key`, return the already-joined escrow instead of `409`.

### 3. Return Joined Escrow State

After Player 2 joins a `two_party` escrow, the `CreateResponse` should include the enrolled counterparty.

Expected shape:

```json
{
  "escrow_id": "...",
  "state": "PENDING_FUNDING",
  "creator_pubkey": "...",
  "counterparty_pubkey": "...",
  "amount_sats": 100,
  "funding_model": "two_party",
  "funding_threshold": 2,
  "participant_count": 2,
  "invitation_token": "..."
}
```

The client uses `counterparty_pubkey` to know the second player is enrolled.

### 4. Allow Registered Funders To Request Invoices

Once both `two_party` participants are registered, either participant should be able to call:

```json
{
  "escrow_id": "..."
}
```

on `POST /funding_instructions`, authenticated with their own Nostr pubkey.

Expected behavior:

- Creator receives the creator-side invoice.
- Counterparty receives the counterparty-side invoice.
- Repeated calls return the same invoice for that authenticated funder.

### 5. Keep Pre-Join Funding Errors Explicit

If funding is requested too early, return an actionable error instead of a generic internal error.

Useful error examples:

```json
{ "error": "counterparty_required_before_funding" }
```

```json
{ "error": "authenticated pubkey is not a registered funder for this escrow" }
```

The second error is already being returned in some cases and is useful.

### 6. Avoid Generic 500s For Recoverable Escrow State

Roll Pot can recover from clear client-facing errors, but not from generic:

```json
{ "error": "internal server error" }
```

Prefer specific errors such as:

```json
{ "error": "invite_already_used" }
{ "error": "not_registered_funder" }
{ "error": "counterparty_required_before_funding" }
{ "error": "escrow_not_joinable" }
```

## Observed Test Evidence

During testing through the ngrok-proxied Roll Pot client, the following patterns were observed.

### Partial Join Failure

```text
POST /create with invitation_token -> 500 internal server error
POST /create retry with same invitation_token -> 409 not in state "CREATED"
```

This indicates the first request may have changed escrow state but did not return a successful response.

### Premature Funding Request

```text
POST /create funding_model=two_party -> 200 CREATED
POST /funding_instructions as creator -> 400 authenticated pubkey is not a registered funder for this escrow
```

The client has been updated to avoid requesting funding until the counterparty has joined, but the backend should still return a clear protocol error for early calls.

## Summary

The highest-priority backend fix is making invited counterparty join atomic and idempotent. Without that, Player 2 can be partially enrolled by the backend, receive a `500`, and then be unable to recover because retries return `409`.
