# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Default-Deny Catch-All**: Any path not explicitly matched is strictly denied (`allow read, write: if false;`).
2. **PII Isolation (Split Collection Strategy)**: User email addresses (`email`) are strictly isolated inside `/users/{userId}/private/{docId}` and may ONLY be read or written by the document owner (`request.auth.uid == userId`) or a verified Admin (`isAdmin()`). Public leaderboard profiles in `/users/{userId}` never expose PII fields.
3. **Trusted RBAC & Anti-Privilege Escalation**:
   - Users creating their own `/users/{userId}` profile MUST set `role == 'user'` (unless `isAdmin()`).
   - Non-admin users updating `/users/{userId}` can ONLY update `['displayName', 'avatar', 'bio', 'totalStudySeconds', 'isOnline', 'updatedAt']` and CANNOT modify `role`, `id`, `ownerId`, or `createdAt`.
   - Admin status (`isAdmin()`) requires `request.auth != null && request.auth.token.email_verified == true` and either the bootstrapped owner email (`trnhng092510@gmail.com`) or existence in `/admins/$(request.auth.uid)`.
4. **Verified Identity Integrity**: Every write operation requires `isSignedIn() && isEmailVerified()` (`request.auth.token.email_verified == true`) and enforces `ownerId == request.auth.uid` (or `authorId == request.auth.uid`) on creation and immutability on update.
5. **Temporal Integrity**: All `createdAt` and `updatedAt` fields must equal `request.time`. `createdAt` is immutable on update (`incoming().createdAt == existing().createdAt`).
6. **Path Variable & Payload Size Hardening**: Every single-document operation (`get`, `create`, `update`, `delete`) validates `isValidId(docId)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars) and enforces explicit `.size()` bounds on every string and `hasAll`/`hasOnly` on keys.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Shadow Field Injection on `/users/{userId}`**:
   - Payload includes `isSuperAdmin: true` alongside valid fields.
   - Rejected by `data.keys().hasOnly(...)`.
2. **Self-Assigned Admin Role on User Creation**:
   - Regular user creates `/users/{userId}` with `role: "admin"`.
   - Rejected by `incoming().role == 'user' || isAdmin()`.
3. **Privilege Escalation via Profile Update**:
   - User updates their own `/users/{userId}` changing `role` from `"user"` to `"admin"`.
   - Rejected by `incoming().diff(existing()).affectedKeys().hasOnly(['displayName', 'avatar', 'bio', 'totalStudySeconds', 'isOnline', 'updatedAt'])` and `incoming().role == existing().role`.
4. **Cross-User PII Read on `/users/{victimId}/private/info`**:
   - Authenticated user `attackerUid` attempts `get` on `/users/victimUid/private/info`.
   - Rejected by `isOwner(userId) || isAdmin()`.
5. **Unverified Admin Email Spoofing**:
   - Attacker with `email: "trnhng092510@gmail.com"` and `email_verified: false` attempts to write to `/app_configs/global`.
   - Rejected by `request.auth.token.email_verified == true`.
6. **Identity Spoofing on `/forum_posts/{postId}` Creation**:
   - User `attackerUid` creates a forum post with `authorId: "victimUid"`.
   - Rejected by `incoming().authorId == request.auth.uid`.
7. **Timestamp Forgery (Backdating `createdAt`)**:
   - Client sends `createdAt: Timestamp.fromMillis(1000000)` instead of `request.time`.
   - Rejected by `incoming().createdAt == request.time`.
8. **Immutable Field Mutation (`createdAt` or `ownerId` tampered on update)**:
   - User updates `/wish_notes/{noteId}` and alters `ownerId` or `createdAt`.
   - Rejected by `incoming().ownerId == existing().ownerId && incoming().createdAt == existing().createdAt`.
9. **Resource Exhaustion / Oversized String Poisoning**:
   - Client sends a 10,000-character `title` on `/forum_posts/{postId}`.
   - Rejected by `data.title.size() <= 300`.
10. **ID Poisoning Attack**:
    - Client targets document ID containing special characters or >128 chars.
    - Rejected by `isValidId(docId)`.
11. **Unauthorized CMS Config Overwrite (`/app_configs/{configId}`)**:
    - Standard signed-in user attempts to update `/app_configs/navbar`.
    - Rejected by `isAdmin()`.
12. **Value Poisoning on Update (`totalStudySeconds` set to negative or string)**:
    - User updates `/users/{userId}` with `totalStudySeconds: -500` or `"999999"`.
    - Rejected by `isValidUserPublicProfile(incoming())` which enforces `data.totalStudySeconds is number && data.totalStudySeconds >= 0`.
