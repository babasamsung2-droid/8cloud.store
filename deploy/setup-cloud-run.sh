#!/usr/bin/env bash
# Run in Google Cloud Shell from this repository root. Never enable shell tracing.
set -euo pipefail
PROJECT="gen-lang-client-0316422252"
REGION="${STORE_REGION:-asia-south1}"
BUCKET="${STORE_BUCKET:-${PROJECT}-8cloud-paid-originals}"
ORIGIN="${STOREFRONT_ORIGIN:-https://www.8cloud.store}"
SERVICE="eightcloud-commerce"
ACCOUNT="eightcloud-commerce@${PROJECT}.iam.gserviceaccount.com"
DATABASE="ai-studio-8cloudstore-08124990-41ca-49e5-9848-d9faf4b2bc64"
cd "$(dirname "$0")/.."
command -v gcloud >/dev/null
command -v node >/dev/null
if [[ "$(gcloud billing projects describe "$PROJECT" --format='value(billingEnabled)')" != "True" ]]; then
  echo 'Enable billing on the selected Firebase project, then run again.'; exit 1
fi
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com iamcredentials.googleapis.com firestore.googleapis.com identitytoolkit.googleapis.com storage.googleapis.com --project="$PROJECT"
if ! gcloud iam service-accounts describe "$ACCOUNT" --project="$PROJECT" >/dev/null 2>&1; then
  gcloud iam service-accounts create eightcloud-commerce --display-name='8cloud commerce runtime' --project="$PROJECT"
fi
if gcloud storage buckets describe "gs://$BUCKET" --project="$PROJECT" >/dev/null 2>&1; then
  echo "Using existing dedicated bucket $BUCKET. Its controls will be validated at API startup."
else
  gcloud storage buckets create "gs://$BUCKET" --project="$PROJECT" --location="$REGION" --uniform-bucket-level-access --public-access-prevention
fi
# Custom role can read bucket controls and upload/read immutable files, but cannot delete originals or change public access.
ROLE="eightcloudPrivateFiles"
if ! gcloud iam roles describe "$ROLE" --project="$PROJECT" >/dev/null 2>&1; then
  gcloud iam roles create "$ROLE" --project="$PROJECT" --title='8cloud private file delivery' --stage=GA --permissions=storage.buckets.get,storage.objects.get,storage.objects.create
fi
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" --member="serviceAccount:$ACCOUNT" --role="projects/$PROJECT/roles/$ROLE" --project="$PROJECT" >/dev/null
gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$ACCOUNT" --role=roles/datastore.user --condition=None >/dev/null
if ! gcloud iam roles describe eightcloudAuthReader --project="$PROJECT" >/dev/null 2>&1; then
  gcloud iam roles create eightcloudAuthReader --project="$PROJECT" --title='8cloud verified session reader' --stage=GA --permissions=firebaseauth.users.get
fi
gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$ACCOUNT" --role="projects/$PROJECT/roles/eightcloudAuthReader" --condition=None >/dev/null
if ! gcloud iam roles describe eightcloudFileSigner --project="$PROJECT" >/dev/null 2>&1; then
  gcloud iam roles create eightcloudFileSigner --project="$PROJECT" --title='8cloud download signer' --stage=GA --permissions=iam.serviceAccounts.signBlob
fi
gcloud iam service-accounts add-iam-policy-binding "$ACCOUNT" --member="serviceAccount:$ACCOUNT" --role="projects/$PROJECT/roles/eightcloudFileSigner" --project="$PROJECT" >/dev/null
# These values are entered without echo and piped straight to Secret Manager, never written to this checkout.
for SECRET in eightcloud-razorpay-test-key-id eightcloud-razorpay-test-key-secret eightcloud-razorpay-test-webhook-secret; do
  if ! gcloud secrets describe "$SECRET" --project="$PROJECT" >/dev/null 2>&1; then
    gcloud secrets create "$SECRET" --replication-policy=automatic --project="$PROJECT" >/dev/null
  fi
  if ! gcloud secrets versions describe latest --secret="$SECRET" --project="$PROJECT" >/dev/null 2>&1; then
    read -r -s -p "Enter $SECRET (hidden): " STORE_SECRET_VALUE; echo
    if [[ -z "$STORE_SECRET_VALUE" ]]; then echo 'Secret cannot be empty.'; exit 1; fi
    if [[ "$SECRET" == *key-id && "$STORE_SECRET_VALUE" != rzp_test_* ]]; then echo 'Use a Razorpay test key.'; exit 1; fi
    printf '%s' "$STORE_SECRET_VALUE" | gcloud secrets versions add "$SECRET" --data-file=- --project="$PROJECT" >/dev/null
    unset STORE_SECRET_VALUE
  fi
  gcloud secrets add-iam-policy-binding "$SECRET" --member="serviceAccount:$ACCOUNT" --role=roles/secretmanager.secretAccessor --project="$PROJECT" >/dev/null
done
BUILD_ACCOUNT="$(gcloud builds get-default-service-account --project="$PROJECT")"
BUILD_ACCOUNT="${BUILD_ACCOUNT##*/}"
gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$BUILD_ACCOUNT" --role=roles/run.builder --condition=None >/dev/null
gcloud run deploy "$SERVICE" --project="$PROJECT" --region="$REGION" --source=server --service-account="$ACCOUNT" \
  --allow-unauthenticated --memory=512Mi --cpu=1 --concurrency=4 --min-instances=0 --max-instances=3 --timeout=120 \
  --set-env-vars="FIREBASE_PROJECT_ID=$PROJECT,FIRESTORE_DATABASE_ID=$DATABASE,PRIVATE_STORAGE_BUCKET=$BUCKET,STOREFRONT_ORIGIN=$ORIGIN,PAYMENT_MODE=test,COMMERCE_ENABLED=false,PRIVATE_BUCKET_CONFIRMED=true" \
  --set-secrets='RAZORPAY_KEY_ID=eightcloud-razorpay-test-key-id:latest,RAZORPAY_KEY_SECRET=eightcloud-razorpay-test-key-secret:latest,RAZORPAY_WEBHOOK_SECRET=eightcloud-razorpay-test-webhook-secret:latest'
API_URL="$(gcloud run services describe "$SERVICE" --project="$PROJECT" --region="$REGION" --format='value(status.url)')"
printf '\nAPI deployed with payments disabled: %s\n' "$API_URL"
printf 'Set frontend VITE_CHECKOUT_API_URL=%s and rebuild.\n' "$API_URL"
echo 'Next: grant your admin claim, configure Firestore indexes and Razorpay webhook, then run the sandbox checklist in deploy/README.md.'
