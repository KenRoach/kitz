# Happy Path Checklist

Manual walkthrough to verify core flows work end-to-end. Run on staging or prod before Friday traffic.

## RenewFlow (renewflow.io)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open landing page | Page loads, no console errors |
| 2 | Click "Login" / "Get Started" | Redirects to login form |
| 3 | Log in with test account | Dashboard loads with asset list |
| 4 | Navigate to Assets tab | Asset table renders, counts match |
| 5 | Click an asset row | Detail view opens with warranty info |
| 6 | Navigate to Quotes tab | Quote list renders (may be empty) |
| 7 | Try Import flow | Upload step renders, drag-drop zone visible |
| 8 | Check Partner Portal link | `/partner/portal?token=...` loads for a valid partner |

## KitZ Admin (localhost:4000 or deployed URL)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open KitZ dashboard | Login page or dashboard loads |
| 2 | Log in | Workspace/dashboard renders |
| 3 | Navigate to Ventures | Venture list shows KitZ + RenewFlow |
| 4 | Navigate to Agents | Agent list renders for selected venture |
| 5 | Navigate to Contacts | Contact list renders |
| 6 | (Optional) Run `pnpm seed:demo` | Sample data populates ventures, agents, contacts |

## API Smoke (Optional)

Run the automated API smoke test:

```bash
# Requires: GATEWAY_URL, HAPPY_PATH_EMAIL, HAPPY_PATH_PASSWORD
pnpm happy-path
```

See `scripts/happy-path-api.mjs` for details.
