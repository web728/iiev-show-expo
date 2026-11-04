# Badge & check-in runbook

## Badge design & security
- QR payload: `IIEV1.<256-bit random token>` — no name, email or ID. Server stores SHA-256(token) for lookup and the token AES-256-GCM-encrypted for re-rendering.
- Reissue rotates the token: the old QR immediately scans as **not recognised**; old email links stop working (version check).
- Cancel/reject sets `badgeRevokedAt`: scans show **REVOKED** (red).
- Badge PDF: A6, official logo, Montserrat, name, company, designation, registration ID, 34 mm QR (readable by phone and handheld scanners). Print test before the show on the actual printers.

## Station setup (per desk)
1. Laptop/tablet/phone with Chrome or Edge (Android Chrome has native QR detection; others use the built-in decoder).
2. Sign in with a **Registration** role account (one account per staff member — never shared). Enable MFA.
3. Open **Admin → Check-in station**, set the station name (e.g. "Gate A-1").
4. Choose input: **Start camera** (allow camera permission) or plug in a USB/Bluetooth handheld scanner in keyboard mode and click the scanner field.
5. Results: **green WELCOME** = admit · **yellow DUPLICATE** = already entered (shows first entry time — re-entry policy decides) · **red** = send to help desk.

## Help desk
- Search by name, company, phone, email or VS- ID → check identity with photo ID → **Check in** (logged as manual with your name).
- Lost badge: open visitor → **Print badge PDF** or **Email badge link**. Suspected sharing: **Reissue** (revokes old QR).
- Wrong name: correct details (auto-reissues badge).
- Walk-ins: **Visitors → Walk-in registration** (approved immediately).

## Offline decision & contingency
Check-in is **online-only** by design (avoids unsynced duplicate entries and storing personal data on devices). Contingency:
1. Each morning, a Registration lead exports **Visitors CSV** (approved) to an encrypted laptop and prints a name-sorted list per gate.
2. Provide a 4G/5G hotspot per gate as backup to venue Wi-Fi.
3. If offline: the station shows "OFFLINE"; staff record ID + time on paper; after recovery, re-scan or manually check in from the list (timestamps then reflect recovery time — note this in the incident log).
4. Destroy printed lists at end of day.

## Peak-day readiness checklist
- [ ] Load test registration and check-in on staging (expected peak concurrency agreed with organiser).
- [ ] MongoDB Atlas tier ≥ M10 for event week; alerts on connections/CPU.
- [ ] Transactional email provider (not Gmail) if volume > Gmail limits.
- [ ] Staff trained on colours, duplicate policy, help-desk flow; scanner accounts created and MFA enabled.
- [ ] QR print readability tested on badge printers and phone screens at low brightness.
- [ ] Escalation contacts (organiser ops lead, developer on call) on every desk.
- [ ] Nightly reconciliation: compare check-in export vs. desk notes; review `failed` jobs in Integrations.
- [ ] Post-event: disable scanner accounts, export final data, expire access, apply retention.
