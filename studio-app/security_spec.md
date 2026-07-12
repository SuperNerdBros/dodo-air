# Security Specification: Dodo Airlines Trust System

## 1. Data Invariants
- **Profile Ownership**: A user profile is bound by their unique identifier (friendCode). Users cannot modify someone else's rating counts or profiles.
- **Feedback Validity**: Ratings must either be a `Good Apple 🍏` or a `Rotten Turnip 🧅`.
- **Dodo Code Privacy**: Dodo codes are protected and only revealed to boarded passengers.

## 2. The Dirty Dozen Payloads
1. **Identity Spoofing**: Attempt to update someone else's profile `villagerName`.
2. **Self-Appointed Good Apples**: Attempt to increment own `goodApples` field directly.
3. **Double Rating Exploit**: Attempt to send multiple upvotes from the same author to skew a user's trust profile.
4. **Junk Character ID Injection**: Injecting a 2MB binary string as a user profile friendCode path.
5. **Dodo Code Eavesdropping**: Attempting to read a flight's `dodoCode` without being on the boarded passenger list.
6. **Negative Value Rating**: Setting `goodApples` to a negative number.
7. **Bypassing Rating Types**: Submitting feedback with ratingType "amazing" instead of "apple" or "turnip".
8. **Spamming Feedback Reviews**: Flooding reviews collection with large, bloated comments.
9. **Tampering Flight Status**: Attempting to set flight status to "Boarding" when it has already been closed.
10. **Orphaned Reviews**: Creating reviews for a profile that doesn't exist.
11. **Malicious Timestamp Injections**: Spoofing review creation time to be in the future instead of using server-defined timestamps.
12. **Bypassing Active Capacity**: Submitting a passenger boarding action when the flight is already at capacity.

## 3. Recommended Security Safeguards
We configure Firestore Security Rules to prevent all unauthenticated/unvouched operations and strictly partition read/write capabilities based on user status.
