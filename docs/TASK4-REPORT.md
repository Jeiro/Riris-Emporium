# Task 4 — WhatsApp checkout

Repository: `/mnt/fedora-storage/Riris-Emporium`

Branch: `store-improvements`

Date: 5 November 2026

Baseline: `f8d5be5` — Task 3 checkpoint. Changes remain **uncommitted** for review.

## Scope and preserved work

The latest owner instruction replaces Flutterwave checkout with a manual WhatsApp order workflow. The two latest attached briefs were identical. Git status/diff, the Task 3 report and partial Task 4 work were inspected before changes.

At continuation, the repository was clean at `f8d5be5`. Unfinished backend/Edge Function work existed only under `/home/dragneel/Documents/riris-task4-work`; it remains untouched and was not copied into the repository. The subsequent local Task 4A payment-disable changes were retained and adapted to this business requirement. Its superseded browser scenario was saved outside the repo before replacing it with the WhatsApp suite.

Task 2 features, shared cart calculations, cart/account stores, authentication, Size Guide, Cookie Policy and earlier reports are unchanged. Task 3 browser assertions were updated only where the new checkout deliberately quotes the merchandise subtotal instead of the previous tax/shipping estimate. Existing layout, colors and shipping fields are retained; the order button has a minimum 48px touch height.

No dependencies or lockfile changes, production requests, database writes, real payments, WhatsApp messages, webhook implementation, migrations, push or deployment were performed. Browser cart writes ran against in-memory fixtures only.

## Security findings and disabled behavior

The old Checkout generated payment references in the browser and inserted a `processing` order when a callback reported `successful`. It lacked independent transaction verification, durable attempt tracking and demonstrated database idempotency. A modified client could alter amounts or invoke a forged/repeated callback. The success screen also claimed an email was sent without delivery code.

`paymentService` contained fake initialization/success verification and a refund method that merely changed a database status. `orderService.createOrder` could insert a zero-total order directly from the browser. Those were unsafe substitutes for confirmed payments/orders.

Implemented protections:

- Checkout imports no Flutterwave SDK, creates no payment reference and has no payment callback or order insert. It neither reads nor requires `VITE_FLUTTERWAVE_PUBLIC_KEY`.
- `paymentService.initializePayment`, `verifyPayment` and `refundPayment` reject with `PAYMENTS_UNAVAILABLE`, without API calls or fabricated success.
- The legacy `orderService.createOrder` also rejects; there is no customer path that silently creates a zero-total order.
- Existing order reads, owner checks, history and admin order interfaces remain. No records or payment/fulfillment statuses are changed by WhatsApp handoff.
- The installed SDK dependency and historical payment types remain for compatibility; no active application import invokes the SDK. Removing dependencies was outside scope.

These application changes do not establish or repair live database authorization. A hostile client could still call database APIs directly if existing RLS/grants allow it. Policies remain unknown and were not accessed or modified. These local changes also do not change an already deployed website until a separate approved deployment.

## WhatsApp workflow

The confirmed destination is **+234 807 210 5878**, encoded as `https://wa.me/2348072105878`.

1. Checkout waits for authenticated cart loading. It requires available items and rejects errors, empty carts and insufficient known stock.
2. The existing form collects name, email, phone and delivery information. First name, email, phone, address, city and state are required. Last name and postal code are optional. Inputs are trimmed and checked for format, length and control characters.
3. The message utility uses the actual normalized cart items and Task 3's `calculateCartTotals` utility. Each line includes product name, quantity, current unit price and line total.
4. Only the **merchandise subtotal** is quoted as the estimated total. Delivery, taxes and discounts are explicitly **to be confirmed**. The old 7.5% tax/free-shipping assumptions are not presented as final charges in WhatsApp.
5. The button calls `window.open` with the fixed WhatsApp URL and `encodeURIComponent(message)`, `_blank`, and `noopener,noreferrer`. The customer reviews and sends manually.
6. A fallback link and expandable message preview are always shown. Browsers may return null for a successful `noopener` window, so the UI does not falsely claim that null proves a blocked popup. Thrown popup errors also retain the link.
7. The confirmation text explicitly says **“Nothing has been sent”** and that the cart is unchanged. Form fields and cart contents remain after handoff. Editing the form or changing the cart/account invalidates the old fallback draft.

The displayed explanation is: “Your order will be sent through WhatsApp. Our team will confirm the final amount and provide payment details.” Opening WhatsApp never clears the cart, reports payment success, sends email or creates an order record.

Cart and drawer arithmetic is unchanged; their tax/shipping/discount/total labels now make the estimate status explicit. The Cart page's Flutterwave checkout claim was replaced with manual WhatsApp confirmation copy.

## Changed files

Paths are relative to the repository.

Modified:

- `app/src/pages/Checkout.tsx` — WhatsApp form validation/handoff, fallback and preview, merchandise estimate, removal of SDK/callback/false success UI.
- `app/src/pages/Cart.tsx` — estimate labels and WhatsApp confirmation copy.
- `app/src/components/cart/CartDrawer.tsx` — estimate labels; calculations and controls retained.
- `app/src/services/paymentService.ts` — disable fake initialization, verification and refunds; retain existing history reads.
- `app/src/services/orderService.ts` — disable direct browser order creation; all other methods retained.
- `app/tests/task3.browser.mjs` — preserve regression cases while adapting checkout amount expectations to the new requirement.
- `app/package.json` — add `test:browser:whatsapp`; no dependency changes.
- `app/tests/README.md` — updated test instructions and safety boundaries.

Added:

- `app/src/lib/whatsappCheckout.ts` — fixed destination, input validation, formatted draft, shared subtotal and URL encoding.
- `app/src/lib/paymentAvailability.ts` — common explicit error for disabled payment/order operations.
- `app/tests/whatsappCheckout.test.mjs` — seven focused unit tests.
- `app/tests/whatsappCheckout.browser.mjs` — ten synthetic browser check groups.
- `app/tests/task4a.test.mjs` — two retained regression tests for payment rejection and data preservation.
- `docs/TASK4-REPORT.md` — this report.

No tracked files were deleted. The temporary uncommitted Task 4A browser test was replaced by the WhatsApp test; its earlier version is preserved in the external working directory.

## Example generated message

Generated by the actual utility using synthetic products/customer details; these values are not hardcoded in checkout:

```text
Hello Riris Emporium!

I would like to place an order.

ORDER SUMMARY

1. Fixture Linen Bag
Quantity: 2
Unit Price: ₦2,500.00
Total: ₦5,000.00

2. Fixture Cotton Scarf
Quantity: 1
Unit Price: ₦1,500.00
Total: ₦1,500.00

Subtotal: ₦6,500.00
Delivery: To be confirmed
Taxes and discounts: To be confirmed
Estimated Total (items only): ₦6,500.00

CUSTOMER INFORMATION

Name: Synthetic Customer
Phone: +234 800 000 0000
Email: fixture@example.test
Delivery Address: 1 Synthetic Street
City: Fixture City
State: Fixture State

Please confirm the final total, including any delivery fee, and send your bank account details so I can make payment.

Thank you!
```

## Verification

| Check | Result |
| --- | --- |
| `npm run build` | Passed TypeScript/Vite. Existing stale Browserslist warning remains. |
| `npm test` | **26 passed**: original 17, two payment-disable tests and seven WhatsApp tests. |
| `npm run lint` | **71 errors, 4 warnings**, versus Task 3's 74/4. Comparing by file/rule/severity/message found **zero new findings**. Existing failures remain. |
| `git diff --check` | Passed. New source/test/report whitespace also checked before delivery. |
| WhatsApp browser suite | **10 groups passed**, no runtime exceptions, console errors, provider requests or unexpected mutations. |
| Task 2 browser suite | **19 groups passed**, **27 configured routes**, no runtime exceptions or unexpected mutations. Eleven console errors came from deliberate failure fixtures. |
| Task 3 cart browser suite | **13 groups passed**, including request races, account switches, cart arithmetic, errors/retry and direct checkout. Three expected console errors came from injected failures. |
| Configuration browser suite | **5 checks passed**, including missing/invalid public configuration and the generic production error screen. |

WhatsApp checks include single and multiple products, quantity changes, special characters/Unicode, exact URL decoding, missing/invalid delivery information, popup returns/null/throws, intact cart and form fields, a 390×844 mobile viewport with no horizontal overflow, minimum touch target, account A/B isolation, out-of-stock and empty carts, and direct calls to disabled legacy service methods. The mobile screenshot was visually reviewed. Desktop checks use 1440×1000.

Every external browser request was intercepted with synthetic responses. `window.open` was replaced with a recorder; fallback URLs were inspected without opening them. No WhatsApp message or real provider request was sent. Browser coverage demonstrates application behavior, not live database acceptance or WhatsApp delivery.

Evidence directory: `/home/dragneel/Documents/riris-task4a-work/`

- `whatsapp-browser/results.json`, `whatsapp-browser/checkout-mobile.png`
- `task2-regression/results.json`
- `task3-regression/results.json`
- `config-regression/results.json`
- `lint-before.json`, `lint-whatsapp-final.json`
- `example-message.txt`

## Remaining limitations and business confirmation

- **Manual order management:** opening or sending a WhatsApp draft does not add it to website Orders/Admin Orders. Automatic pending-order recording would require a separately reviewed backend workflow, permissions and duplicate prevention. No fake order number is generated.
- **Owner confirmation remains necessary:** final delivery fee, delivery time, tax treatment, discount eligibility, stock availability and bank details must be confirmed in the conversation. No bank details are stored in frontend code. The supplied WhatsApp number is used as instructed; its registration/availability was not independently checked and the owner was not contacted.
- **No reservation or payment settlement:** catalog data may change after the draft is prepared, and the customer can edit the message. The owner must verify the order and received funds manually; a draft is not payment proof or authorization to fulfill.
- **Draft lifetime:** entered shipping information and the prepared link stay in current-page React memory. This task does not add personal-data storage; reloading or leaving checkout can discard the form. Account changes hide the application's prior draft. A draft already opened in another app/tab cannot be recalled by this page.
- **WhatsApp behavior:** installed-app/web handoff, real popup policies, sending and delivery were not exercised. The fallback link remains available. Very large drafts (encoded URL over 12,000 characters or more than 100 lines) fail clearly rather than truncate an order.
- **Existing content outside checkout:** Home and FAQ still contain old Flutterwave/payment marketing statements; Product Detail has a generic secure-payment badge; admin Settings retains its unrelated integration placeholder. These pages were not rewritten. They should be reviewed in a separate copy/settings cleanup before release.
- **Existing infrastructure limits:** live Supabase project ownership, schema, RLS, cart persistence and admin privileges remain unverified. Existing lint failures and the stale Browserslist database remain.
- **Environment:** normal catalog/Auth/cart behavior still needs `VITE_SUPABASE_URL` and a public `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` or `VITE_SUPABASE_ANON_KEY`. WhatsApp checkout needs no payment key, API secret, webhook or new environment variable. Existing environment files were not changed.

## Future database inspection checklist — only if automatic order records are requested

The code currently expects order IDs/owner IDs, item JSON snapshots, totals, fulfillment `status`, shipping/billing JSON, timestamps and optional order number/payment reference/method/tracking fields. Payment history types expect order/user associations, provider references/IDs, amount, currency and status. These are code expectations, not a verified schema. Fulfillment states must not be treated as proof of payment.

Before any new backend workflow:

1. Obtain explicit authorization for a named development project; verify ownership/environment without accessing unrelated projects.
2. Inspect schema metadata only: table/column types, defaults, nullability, foreign keys, unique constraints, indexes, triggers and functions. Do not export customer rows or credentials.
3. Review grants/RLS for cart, orders, order items, payments and profiles. Verify owner isolation and who may create/update totals, payment status and fulfillment status, using synthetic users in development.
4. Confirm currency/minor-unit conventions, product/variant pricing, stock rules, coupon semantics and business-approved delivery/tax policy.
5. Agree on separate manual payment/fulfillment states, who can confirm bank receipt, an audit trail, idempotency and duplicate-order handling.
6. Review any proposed schema/policy changes before executing them. Neither this checklist nor the retained earlier staging work authorizes migrations, production access or deployment.

## Run again

Local development server: **http://127.0.0.1:5181/** while the process remains running.

```bash
cd /mnt/fedora-storage/Riris-Emporium/app
npm run dev -- --host 127.0.0.1 --port 5181 --strictPort
npm run build
npm test
npm run lint
git diff --check
```

Use `app/tests/README.md` for the intercepted browser commands. Normal manual browsing uses the configured Supabase project; do not use real customer data or send a WhatsApp message for testing.
