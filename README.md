# Rollpot

Standalone Next.js client that validates Pontmore escrow service invocation with a two-player dice wager.

The client reads the descriptor at `https://standalone-escrow.onrender.com/pontmore/v1/descriptor`,
uses the advertised HTTP endpoint and OpenAPI schema, signs NIP-98 HTTP auth events locally, and
submits an `application_signed_result` release decision after a dice roll.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3002`.

## Docker

```bash
docker build -t pontmore/rollpot .
docker run --rm -p 3002:3002 pontmore/rollpot
```

## Flow

1. Fetch the escrow descriptor server-side in `app/page.tsx`.
2. Create a `two_party` escrow through the descriptor service endpoint.
3. Join the counterparty with the service-issued invitation token.
4. Request per-participant Lightning funding instructions.
5. Poll each participant's funding status.
6. Roll dice and request release with a BIP-340 application signature over the canonical release message.
