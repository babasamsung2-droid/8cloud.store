# Supabase Free deployment

Selected project: `8cloud-store` (`hkwyajwnkgyymzbqgeqk`, Sydney). This setup does not require running the Google Cloud billing/bootstrap script. Keep the Supabase organization on Free and monitor its current storage, database, function and egress limits in the dashboard. Free hosting limits and inactivity pauses make this a starting deployment, not a guaranteed-availability service.

Deployment checkpoint (10 October 2026): schema/private bucket applied and verified; `commerce` function deployed; project ID, storefront origin, test mode and disabled checkout settings saved. Firebase web configuration and owner UID, Razorpay secrets, frontend deployment and service integration tests are still pending. The dashboard's legacy JWT check remains ON pending approval to use the function's custom verification.

## Database and private originals

Apply `migrations/202610100001_commerce.sql` once in a transaction to an empty project. It creates five tables, three transactional RPCs, and the private `paid-originals` bucket. **Already applied to the selected project on 10 October 2026; do not rerun it there.**

All commerce tables have RLS enabled. Anonymous and signed-in Supabase clients have no table or RPC privileges. No client storage policies are added. The API uses the platform-provided service role only on the server; never copy that key into frontend configuration, chat, logs or GitHub.

Products, payment state and download counters are changed by the API. Product revisions prevent stale edits, payment updates lock the order and preserve refunded/revoked status, and download counters check paid status inside a transaction.

Uploads use unique UUID paths with `upsert:false`, a file registry and object ID/last-modified checks. This is not native immutable object versioning: trusted dashboard/service-role operators can still alter files. Retain every sold original and never overwrite its path. Buyers receive short-lived signed URLs after server ownership/payment checks. Links can be shared until expiry, and downloaded ebooks cannot be remotely recalled.

## Deploy the Edge Function

From the repository root:

```sh
npm ci
npm run bundle:supabase
```

Paste the generated `supabase/.generated/commerce.ts` into the Supabase Edge Function editor as `index.ts`, and name the function `commerce`. This bundle includes the shared commerce modules; npm and Node built-ins remain runtime imports. Generated bundles are ignored by Git. Alternatively deploy the source entrypoint with the Supabase CLI from the repository root; the dashboard bundle is the validated packaging path.

Use `supabase/.env.example` for function configuration. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by Supabase. Set `FIREBASE_PROJECT_ID`, `STOREFRONT_ORIGIN`, `PAYMENT_MODE=test`, and `COMMERCE_ENABLED=false` first. Without the Firebase web API key, protected requests fail closed. Without the exact admin UID, nobody receives admin access.

The completed integration uses `verify_jwt=false` in `config.toml` because Supabase's gateway JWT check does not accept Firebase sessions or Razorpay webhooks. The function itself verifies Firebase RS256 signatures, issuer, audience, expiry and current account/revocation state; admin routes also check the exact owner UID and verified `babasamsung2@gmail.com` email. Webhooks require a valid Razorpay HMAC over the raw body. Do not disable gateway verification on any unrelated function.

API base URL:
`https://hkwyajwnkgyymzbqgeqk.supabase.co/functions/v1/commerce`

## Firebase sign-in and admin

Use Firebase project `gen-lang-client-0076023438`. Enable Google sign-in and authorize the actual storefront hostname. Obtain its web app configuration from Project settings → Your apps. Do not reuse the old demo project's settings or mix values between projects.

Set backend `FIREBASE_WEB_API_KEY` to that project's public web API key. Firebase accounts lookup must accept server calls; HTTP-referrer-only restrictions can prevent this verification. Keep API restrictions appropriate for Firebase Authentication. Sign in as the owner once, verify the user in Firebase Authentication, then set `STORE_ADMIN_UID` to that exact user's UID. This is a server allowlist, not a browser-editable role.

Build the frontend with all four `VITE_FIREBASE_*` fields from `.env.example`, plus:

```env
VITE_FIRESTORE_PROFILES_ENABLED=false
VITE_CHECKOUT_API_URL=https://hkwyajwnkgyymzbqgeqk.supabase.co/functions/v1/commerce
VITE_STORE_MODE=demo
VITE_ENABLE_CHECKOUT=false
```

Firestore profile writes are unnecessary in this deployment and are skipped. The original config remains a fallback for existing demos; a new deployment must explicitly supply the selected project's complete settings.

## Payment and delivery acceptance

Add Razorpay test key ID, key secret and webhook secret privately in Edge Function secrets. Never use `VITE_` for secrets. Register `/webhooks/razorpay` on the API base URL for captured/order-paid/refund events. Keep payment collection disabled until real files, pricing and sandbox tests are ready.

Use the admin panel to upload PDF/EPUB/ZIP originals (25 MB/file, 10 files/product), create drafts and then publish. The old Firebase bulk importer does not target Supabase. Basic file signatures are checked; antivirus and watermarking are not included.

Before enabling payments, test a real sandbox purchase, another user's denied access, unsigned file denial, 60-second link expiry, cancellation, duplicate webhook, invalid signature, missing callback recovery, refund and delayed capture replay. Verify both canonical-origin CORS and admin denial for non-owners. Frontend must use `VITE_STORE_MODE=test` and `VITE_ENABLE_CHECKOUT=true` only when backend test payments are enabled.

The health endpoint is process liveness, not proof that authentication, storage or payment delivery is configured. Local automated tests do not replace these service integration checks. Payment live-mode, real products, legal pages, backups and production frontend deployment remain separate launch steps.
