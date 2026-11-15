# Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Order Identity & PII Isolation**: An `Order` contains PII (`name`, `contact`, `email`, `details`). Guests may only `create` new orders and may NEVER `get` or `list` any order documents. Signed-in customers may only `get` or `list` orders where `resource.data.customerUid == request.auth.uid && resource.data.customerUid != ''`. Only a verified Admin (`isAdmin()`) may read, list, update, or delete any order.
2. **Initial Order Integrity**: Newly created orders MUST start with `status == 'new'`, `adminNote == ''`, `createdAt == request.time`, and `updatedAt == request.time`. Signed-in users must set `customerUid == request.auth.uid`; unauthenticated visitors must set `customerUid == ''`.
3. **Immutable Order Fields**: `orderCode`, `customerUid`, and `createdAt` are immutable after creation.
4. **Terminal State Locking**: Once an order reaches `completed` or `cancelled`, non-admin users cannot modify it; admins retain override capability to correct mistakes if needed, with `updatedAt == request.time`.
5. **Site Settings Integrity**: Public visitors can `get` `/settings/site` (non-PII configuration), cannot `list` `/settings`, and only verified Admins (`isAdmin()`) may write `/settings/site`.
6. **Admin Privilege Protection**: Client SDKs may never self-assign admin privileges in `/admins/{adminId}`. Admin access requires either an existing `/admins/$(request.auth.uid)` record or verified email `tserennadmidtungalag228@gmail.com` with `request.auth.token.email_verified == true`.

## 2. "Dirty Dozen" Attack Payloads (All Expected: `PERMISSION_DENIED`)
1. **Guest List Scrape**: Unauthenticated `list` on `/orders` to harvest customer contacts/emails.
2. **Non-Owner Signed-In Read**: Signed-in non-admin user attempts `get` on `/orders/{otherOrderId}` where `customerUid != request.auth.uid`.
3. **Non-Owner Signed-In List**: Signed-in non-admin user attempts `list` on `/orders` without `where('customerUid', '==', uid)`.
4. **Status Forgery on Create**: Visitor creates an order with `status: 'completed'` instead of `'new'`.
5. **Ghost Field / Shadow Write**: Visitor creates an order with an extra unallowed key `isPaid: true` or `role: 'admin'`.
6. **Customer UID Spoofing**: Signed-in user creates an order with `customerUid: 'victim-uid-123'`.
7. **Timestamp Forgery**: Visitor creates an order with a backdated `createdAt` instead of `request.time`.
8. **ID Poisoning**: Visitor creates `/orders/` with a 500-character or invalid-symbol document ID (`../admin`).
9. **Oversized Payload (Denial of Wallet)**: Visitor submits `details` of 10,000 characters (`> 1800`).
10. **Unverified Admin Email Spoof**: User with email `tserennadmidtungalag228@gmail.com` and `email_verified: false` tries to list `/orders`.
11. **Self-Assigned Admin**: Non-admin user tries to `create` `/admins/{uid}` with `role: 'admin'`.
12. **Unauthorized Site Settings Hijack**: Non-admin user tries to `update` `/settings/site` to redirect `netlifySubdomain` to a malicious domain.
