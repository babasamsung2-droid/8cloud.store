# 8cloud configuration and administrator setup

Selected project: `gen-lang-client-0316422252`. Selected admin: `babasamsung2@gmail.com`. Hosting: Cloud Run; gateway: Razorpay. The named Firestore database from the storefront is retained. These files prepare configuration; they do not prove cloud deployment or billing setup.

## 1. Deploy the API in test mode

Open Google Cloud Shell under the selected project. Clone this repository (or pull its latest changes) and run from its root:

```sh
bash deploy/setup-cloud-run.sh
```

The script creates a dedicated bucket, runtime service account and scoped roles, enables required APIs, asks for test secrets without echoing them, then builds/deploys `server/`. It reuses named resources on reruns. Billing must already be enabled. It never enables payments. Its default region is Mumbai (`asia-south1`); change `STORE_REGION` before running if your database or residency needs require another region. Set `STOREFRONT_ORIGIN` to your actual canonical site origin if you use the apex domain instead of www. The browser must use that exact origin.

Secret prompts: Razorpay test Key ID, test Key Secret, and a separate strong webhook secret chosen by you. The webhook secret must match the Razorpay dashboard setting later. Do not paste values into chat or source files. Existing Secret Manager versions are reused; rotation is a separate operation. The example YAML contains no keys. The runtime fails closed if any storage or payment-mode check fails.

Cloud Run's unauthenticated ingress allows the public catalog and signed Razorpay webhooks. Customer and admin routes still require verified Firebase tokens. The script grants the runtime Firestore data access on this project; use a dedicated commerce project/database and stricter IAM conditions if other sensitive applications share it. The runtime can read Firebase users, but cannot grant admin claims. Bucket access does not include deletion. Detached uploads or cancelled drafts retain uploaded files; review unused objects manually, preserving all sold generations.

## 2. Give the store owner admin access

First sign in to the storefront with `babasamsung2@gmail.com`. Then, in Cloud Shell using your trusted operator account:

```sh
gcloud auth application-default login
cd server
npm ci
export FIREBASE_PROJECT_ID=gen-lang-client-0316422252
node set-admin.mjs babasamsung2@gmail.com grant
```

Sign out and sign back into the storefront. Open `/admin` or `?admin=true`. The UI only opens for the existing owner email; every admin API request additionally requires the server-issued `storeAdmin=true` claim. Revocation: run the same command with `revoke`; it removes the claim and revokes refresh tokens. Do not grant the Cloud Run runtime permissions to administer these claims.

## 3. Connect the frontend before enabling checkout

Set your frontend hosting build environment, using the actual URL printed by deployment:

```env
VITE_CHECKOUT_API_URL=https://YOUR_ACTUAL_CLOUD_RUN_URL
VITE_STORE_MODE=demo
VITE_ENABLE_CHECKOUT=false
```

Rebuild/redeploy the frontend. The admin API works with checkout disabled, so you can prepare your catalog safely. The public storefront still displays demo products until checkout mode is enabled. Add your production domain to Firebase Authentication's authorized domains. The Cloud Run API uses the existing named database, not `(default)`.

Publish the composite `commerceOrders` index from `firestore.indexes.json` to that database (UID ascending, createdAt descending). In Google Cloud Shell:

```sh
gcloud firestore indexes composite create --project=gen-lang-client-0316422252 --database=ai-studio-8cloudstore-08124990-41ca-49e5-9848-d9faf4b2bc64 --collection-group=commerceOrders --query-scope=COLLECTION --field-config=field-path=uid,order=ascending --field-config=field-path=createdAt,order=descending
```

If it already exists, inspect its state rather than recreating it. Wait until ready. Existing default-deny Firestore rules must remain in place for `commerceProducts`, `commerceOrders`, `commerceAudit`, `gatewayOrders`, `apiLimits` and `downloadLimits`. These are server-only collections.

## 4. Prepare products

Admin → Products → New product. Set title, INR price, description, license and format. Save drafts without files if needed. Upload clean PDF/EPUB/ZIP originals up to 25 MB each, maximum 10 files per product. Uploads check basic file signatures, but do not perform antivirus scanning or validate a full EPUB/PDF structure. Scan files yourself before uploading. Uploads are private and immutable; save the product to attach them. Removing an attachment does not delete the stored original. Uncheck Publish and save to stop new sales. Existing buyers keep their order's original file snapshots.

Changes are validated by the server, recorded in `commerceAudit` and protected against concurrent edits using revisions. The panel displays the first 201 products and warns beyond its 200-product supported catalog size; it is intended for a small catalog. Orders show the latest 100 records, not lifetime revenue. Refunds are performed through Razorpay, not a browser-only status toggle.

## 5. Enable and test sandbox payments

Razorpay test webhook URL: `YOUR_API_URL/webhooks/razorpay`. Subscribe to `payment.captured`, `order.paid`, `payment.refunded`, `refund.processed`, using the stored webhook secret. Enable automatic capture appropriately.

```sh
gcloud run services update eightcloud-commerce --project=gen-lang-client-0316422252 --region=asia-south1 --update-env-vars=COMMERCE_ENABLED=true
```

Set frontend `VITE_STORE_MODE=test` and `VITE_ENABLE_CHECKOUT=true`, rebuild, then test purchase, private download, cross-account denial, expired links, cancellation, duplicated webhook, reconciliation and refund. Also verify that a customer cannot call any `/admin/*` endpoint. Do not switch to live keys until these checks pass. Test purchases and live purchases currently share collections; use a separate test environment or archive test data before launch.

## References

- [Firebase custom claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Cloud Run source deployment](https://docs.cloud.google.com/run/docs/deploying-source-code)
- [Cloud Run secrets](https://docs.cloud.google.com/run/docs/configuring/services/secrets)
- [Cloud Storage IAM permissions](https://docs.cloud.google.com/storage/docs/access-control/iam-permissions)
