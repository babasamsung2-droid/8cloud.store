# 8cloud.store: secure ebook and digital-product sales

This source adds a Firebase + Razorpay commerce flow to the existing store. It is configured as a demo by default and has not been deployed. Do not switch to live keys until sandbox integration tests pass with your own accounts and files.

## What is implemented

- Customer Google/Firebase sign-in; the API verifies Firebase ID tokens and checks revoked sessions and verified email.
- Private server catalog; prices are stored in INR paise. Browser totals, coupon codes and client payment claims cannot set the amount charged.
- One personal download entitlement per product. The checkout shows the server's final INR price before opening the gateway.
- Server-created Razorpay orders, payment HMAC verification and an API check for captured payment, matching order, amount and currency.
- Signed raw-body Razorpay webhooks. Duplicate capture notifications do not create additional orders or restore refunded/revoked access.
- Persistent purchase history and buyer ownership checks for every file request.
- Recovery through My Purchases → Check payment status, using the provider's order payment records when callbacks/webhooks are missed.
- Private, immutable file generations and 60-second signed download URLs. The file is not bundled with the website or stored under a public download URL.
- New links blocked for refunded/revoked orders. Gateway refund state is checked before every link even when its webhook is delayed. Any partial refund conservatively revokes all downloads for the order; item-level partial refunds are not yet supported.
- Atomic limit of 10 link requests per file/order/hour, plus 30 authenticated API requests per customer/minute.
- Server-side catalog import tool for publishing real ebooks. The old browser-only admin edits are blocked when commerce is enabled.

## How the buyer flow works

1. Buyer signs in and chooses an ebook.
2. Checkout asks the API to confirm availability and create a payment order. The server snapshots the purchased file versions and their prices.
3. Buyer reviews the final INR total and pays in Razorpay's interface.
4. The server verifies the signature and checks captured payment. A signed webhook can perform the same confirmation independently of the browser.
5. My Purchases shows the paid ebook. The buyer requests a download; the API checks identity, ownership, payment/refund state and limits, then signs a short-lived URL.
6. The browser downloads from private storage. A later download requires another authenticated request.

A signed URL is a bearer link: anyone who obtains it can use it until expiry. Expiry prevents new requests after 60 seconds; an already-started download may finish. A refund/revocation cannot invalidate an already-issued link immediately or remove downloaded copies. A malicious buyer can share a downloaded ebook. Personalized PDF watermarking and clearly stated license terms are possible next layers, not features included here.

## Files and commands

Frontend: `src/services/commerce.ts`, `CheckoutModal.tsx`, `SecurePurchasesModal.tsx` and `CommerceHero.tsx`.
Backend: `server/core.mjs`, `adapters.mjs`, `http.mjs`, `index.mjs`.

```sh
# Frontend
npm install
npm run lint
npm test
npm run build

# API (separate deployment)
cd server
npm install
npm test
cp .env.example .env
# Fill environment variables privately, then:
npm start
```

Use Node 22 or newer. Run commands from their indicated directory. Do not upload `.env`, service-account JSON, product originals or private catalog import files to GitHub. Never put payment secrets in a `VITE_` variable.

## Configure private storage first

Prefer a dedicated Google Cloud Storage bucket exclusively for paid originals. Do not change an existing shared bucket's permissions without understanding the other applications using it.

- Enforce Uniform Bucket-Level Access and Public Access Prevention; remove any `allUsers` or `allAuthenticatedUsers` grants.
- Keep objects under `private-products/`. Do not add Firebase permanent download tokens; the API/importer rejects objects with `firebaseStorageDownloadTokens` metadata.
- Use versioned object names (`ebook/v1.pdf`) and record the exact object generation. Keep sold generations available for buyers; do not overwrite or delete them casually.
- Upload PDFs, EPUBs or ZIPs through your own trusted admin process. Scan originals, verify their contents and hashes, and only publish files you have rights to sell.
- `storage.rules` denies all Firebase client reads/writes. For a dedicated Firebase-backed bucket, deploy the rule to the intended bucket. Cloud Storage IAM and public-access controls must also be enforced; Firebase rules alone do not make a GCS bucket private.
- Give the runtime service identity the minimum needed private-object read, bucket metadata read (`storage.buckets.get`) and signing permissions. On Cloud Run use Application Default Credentials and IAM `signBlob` capability (typically Service Account Token Creator on the signing service identity). Do not ship a private key to the frontend.
- Set `PRIVATE_BUCKET_CONFIRMED=true` only after confirming these controls. The API and importer also read bucket metadata and fail closed unless Uniform Bucket-Level Access and bucket-level Public Access Prevention are enforced. During file requests these controls are rechecked at most once per minute. This does not audit all inherited IAM permissions or replace your own IAM review.

## Configure Firebase and durable orders

Use your Firebase project and the correct Firestore database ID in `server/.env`; the existing app uses a named database, so `(default)` may be incorrect for your deployment.

Collections used by the API:

| Collection | Purpose |
| --- | --- |
| commerceProducts | Trusted product prices, display content, private file references |
| commerceOrders | Customer UID, payment state, immutable purchased file snapshots |
| gatewayOrders | Gateway order → internal order mapping |
| apiLimits | Atomic per-customer rate counters |
| downloadLimits | Atomic per-file download grant counters |

All these collections remain denied to Firebase client SDKs by the existing default-deny rule. Access is through the authenticated API only; Admin SDK access uses IAM and bypasses client rules. Deploy `firestore.indexes.json` to the same database for purchase-history queries. Customer authentication and server Firebase project IDs must match. Configure both your apex and www domains in Firebase Authentication, and choose one canonical storefront origin.

## Publish your real products

1. Copy `server/products.example.json` to a private working location.
2. Replace the example title, amount (29900 means INR 299), display fields, file path and generation with real values.
3. Keep `active=false` while preparing. Set `active=true` only for files that are ready to sell.
4. Run the importer with trusted operator credentials, from `server/`:

```sh
node --env-file=.env import-products.mjs /private/path/your-products.json
```

The importer validates files and display fields before the batch commit. Existing products omitted from an import remain unchanged; explicitly import a product with `active=false` to stop future sales. Previously paid buyers retain their snapshotted purchase file access unless the order is revoked. The real catalog is returned by `/catalog`; demo products are not automatically published or sold.

The old browser admin screen is a demo editor, not a shared production product manager. This version intentionally uses a trusted import workflow. A file-upload/admin publishing UI is future work.

## Configure payments in test mode

Backend `.env`:

- `PAYMENT_MODE=test`
- Razorpay test key ID and key secret, and a separately configured webhook secret.
- `COMMERCE_ENABLED=true` only after the file setup and catalog are ready.
- Exact HTTPS `STOREFRONT_ORIGIN`, without a trailing slash.

Razorpay dashboard:

- Set appropriate automatic capture behavior. Authorized-only payments do not unlock downloads.
- Register `https://YOUR_API_HOST/webhooks/razorpay`.
- Subscribe to `payment.captured`, `order.paid`, `payment.refunded`, and `refund.processed`.
- Set the same webhook secret on the server. Keep test and live webhook settings/secrets separate.

Frontend hosting/build environment:

```env
VITE_STORE_MODE=test
VITE_ENABLE_CHECKOUT=true
VITE_CHECKOUT_API_URL=https://YOUR_API_HOST
```

The checkout public key comes from the server. Customer payment information is entered in the provider's UI, not in your own card form. The API refuses to start if the key prefix and backend payment mode disagree. For a real launch use matching production mode/live key configuration on both deployments after the tests below pass. Setting only the frontend flags does not enable server payments.

## Deploy and verify

Deploy the frontend build to your frontend host and `server/` as a separate HTTPS Node service. A Dockerfile is supplied for Cloud Run or another container host; no infrastructure has been created by this task.

Use secret management for keys, an attached runtime service identity for Firebase/storage, restricted CORS, and an edge rate limit for unauthenticated catalog/webhook traffic. The included authenticated rate limits do not replace an edge WAF or denial-of-service controls. The webhook endpoint must remain reachable without a customer login.

Required sandbox checks with real configured services:

- A paid ebook appears in the correct customer's purchase list and downloads correctly.
- Another account cannot read the order or request the file.
- Direct unsigned access to the object is denied; no permanent Firebase/public link works.
- An issued link fails for new requests after expiry.
- Failed/cancelled/authorized-only payments do not unlock files.
- Callback lost, webhook recovery, and Check payment status recovery work.
- Duplicate events, wrong signatures, wrong amount and wrong currency cannot grant extra access.
- A refund prevents new links; a delayed capture event cannot restore revoked access.
- Signed URL generation works with the deployed service identity and file generation.
- Cart displayed prices match final server totals and your tax policy.

## Remaining launch work and limits

You still need real originals, actual gateway/account configuration, HTTPS hosting, deployed rules/indexes/IAM, legal business details and published refund/privacy/license pages. Tax determination, automated receipts/email delivery, PDF watermarking, item-level partial refunds, a production admin upload UI, automated reconciliation jobs, observability and backups are not implemented by this change. Refunds are initiated through the provider dashboard; their processing revokes download access here.

The backend totals use the configured product amount as the final charge. There is no tax engine or coupon engine: set prices according to your actual tax obligations and disclose the policy before launch. Non-INR catalog values are approximate display conversions; settlement is INR and the final INR amount is shown before payment.

## Validation completed on 10 October 2026

- TypeScript 7 type check passed.
- Production Vite build passed. The build emits a bundle-size warning (~1 MB JavaScript uncompressed); code splitting is future performance work.
- 6 frontend configuration tests and 24 backend/service/HTTP tests passed (30 total).
- Firebase Admin, Firestore and Storage adapter dependencies import successfully.
- `git diff --check` passed.
- Live Firebase/Razorpay/storage integration has not been exercised: credentials, private bucket and real products are not configured.
- Browser visual verification is pending because the local preview URL timed out in the browser tool. API HTTP tests ran successfully on localhost.
- No repository push, deployment, real payment, cloud permission change or product upload was performed.

## Official references

- Razorpay integration, server orders, signatures and captured payments: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
- Razorpay raw-body webhook verification: https://razorpay.com/docs/webhooks/validate-test/
- Firebase ID token verification: https://firebase.google.com/docs/auth/admin/verify-id-tokens
- Cloud Storage signed URL behavior and limitations: https://cloud.google.com/storage/docs/access-control/signed-urls
