import { Alert, Box, Button, Container, Link, Stack, Typography } from "@mui/material";
import { RollPotClient } from "../components/roll-pot-client";
import { DESCRIPTOR_URL, fetchDescriptor } from "../lib/escrow";

export default async function Home() {
  try {
    const descriptor = await fetchDescriptor();

    return <RollPotClient descriptor={descriptor} />;
  } catch (error) {
    return (
      <Box component="main" sx={{ minHeight: "100vh", py: 8 }}>
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Typography component="h1" variant="h3" sx={{ fontWeight: 900 }}>
              Roll Pot
            </Typography>
            <Alert severity="error">
              {error instanceof Error ? error.message : "Unable to load escrow descriptor."}
            </Alert>
            <Button component={Link} href={DESCRIPTOR_URL} variant="outlined">
              Open descriptor
            </Button>
          </Stack>
        </Container>
      </Box>
    );
  }
}
