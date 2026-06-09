- [x] Update backend password change flow to update the correct user UID derived from DB lookup (not trusting req.body.userId)

- [x] Harden avatar upload endpoint: validate userId exists and return cleaned updated user; delete old avatar file (optional, for correctness)

- [ ] Ensure frontend reloads updated avatar/persisted value after success (Account.jsx already sets account from response)
- [ ] Run backend lint/test (if available) and do a quick local smoke test of avatar + password change


