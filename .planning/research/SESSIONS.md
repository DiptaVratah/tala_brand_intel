# Session Management Patterns for Web Applications Without Authentication

**Research Date:** 2026-01-26
**Context:** PulseCraft currently uses client-generated userId stored in localStorage. This document explores robust session management patterns that provide better tracking and user experience without requiring full authentication infrastructure.

---

## Executive Summary

Session management without authentication is a common pattern for applications in early stages, free tools, or privacy-focused products. The goal is to **distinguish unique usage sessions** while respecting user privacy and maintaining a clear path to future authentication.

**Current PulseCraft Implementation:**
```javascript
// Script.js lines 5-12
let userId = localStorage.getItem('pulsecraft_userId');
if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('pulsecraft_userId', userId);
}
```

**Limitations:**
- No distinction between "session" and "user identity"
- Single identifier for both device persistence and session tracking
- No expiry mechanism
- No multi-device coordination
- Simple collision-prone generation method

---

## Session ID Generation

### Best Practices

**Security Requirements for Session IDs:**
1. **Unpredictability:** Must be cryptographically random to prevent session hijacking
2. **Sufficient Entropy:** At least 128 bits (16 bytes) of randomness
3. **No Sequential Patterns:** Avoid timestamps or counters as primary components
4. **Unique Per Session:** Each browser tab or device interaction should have its own session ID

### Recommended Libraries & Methods

#### 1. **UUID v4 (Recommended for Session IDs)**
```javascript
// Using crypto.randomUUID() (modern browsers + Node.js 16+)
const sessionId = crypto.randomUUID();
// Example: "550e8400-e29b-41d4-a716-446655440000"
```

**Pros:**
- Native browser support (no dependencies)
- Cryptographically secure (uses window.crypto)
- 128 bits of entropy
- Universally unique across devices

**Cons:**
- Slightly verbose (36 characters with hyphens)
- Not URL-safe without encoding

**Browser Support:** Chrome 92+, Firefox 95+, Safari 15.4+

#### 2. **Nanoid (Recommended for Compact Session IDs)**
```javascript
// Using nanoid library (4.3 KB)
import { nanoid } from 'nanoid';
const sessionId = nanoid();
// Example: "V1StGXR8_Z5jdHi6B-myT"

// Custom alphabet and length
const sessionId = nanoid(21); // Default: 21 chars, ~126 bits entropy
```

**Pros:**
- 2x faster than UUID
- URL-safe by default (no hyphens)
- Compact (21 characters for same security as UUID)
- Customizable alphabet and length
- Tree-shaking friendly

**Cons:**
- Requires npm package (or CDN)

**Install:** `npm install nanoid`

#### 3. **Web Crypto API (Manual Implementation)**
```javascript
// For maximum control
function generateSecureSessionId() {
    const array = new Uint8Array(16); // 128 bits
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
// Example: "a3d5e7f9b1c3d5e7f9b1c3d5e7f9b1c3"
```

**Pros:**
- No dependencies
- Maximum control over format
- Browser-native cryptographic security

**Cons:**
- Manual implementation required
- Hex output not as compact (32 characters for 128 bits)

#### 4. **Hybrid Approach (Current + Session Layer)**
```javascript
// Persistent User ID (device fingerprint)
const userId = localStorage.getItem('pulsecraft_userId') || generateUserId();

// Ephemeral Session ID (per-session)
const sessionId = sessionStorage.getItem('pulsecraft_sessionId') || generateSessionId();

function generateUserId() {
    const id = 'user_' + crypto.randomUUID();
    localStorage.setItem('pulsecraft_userId', id);
    return id;
}

function generateSessionId() {
    const id = 'sess_' + crypto.randomUUID();
    sessionStorage.setItem('pulsecraft_sessionId', id);
    return id;
}
```

### Collision Risk Analysis

| Method | Bits of Entropy | Collision Probability (1B IDs) |
|--------|-----------------|--------------------------------|
| Date.now() + Math.random() | ~63 bits | 1 in 10,000 |
| UUID v4 | 122 bits | 1 in 5.3 × 10^36 |
| Nanoid (21 chars) | ~126 bits | 1 in 8.5 × 10^37 |
| Web Crypto (16 bytes) | 128 bits | 1 in 3.4 × 10^38 |

**Recommendation:** Use UUID v4 or Nanoid for session IDs. Current implementation has unacceptable collision risk at scale.

---

## Storage Strategies

### Storage Options Comparison

| Storage Type | Persistence | Cross-Tab Sharing | Server Access | Capacity | Security |
|--------------|-------------|-------------------|---------------|----------|----------|
| **localStorage** | Permanent (until cleared) | Yes | No | ~5-10 MB | XSS vulnerable |
| **sessionStorage** | Session lifetime | No | No | ~5-10 MB | XSS vulnerable |
| **Cookies** | Configurable expiry | Yes | Yes (HTTP) | ~4 KB | CSRF risk, HttpOnly option |
| **IndexedDB** | Permanent | Yes | No | ~50+ MB | XSS vulnerable |
| **Memory (JS object)** | Page lifetime | No | No | Unlimited | Lost on refresh |

### Recommended Storage Pattern for PulseCraft

**Multi-Layer Identity System:**

```javascript
// Layer 1: Device Identity (persistent across sessions)
const DEVICE_ID_KEY = 'pulsecraft_deviceId';
const DEVICE_METADATA_KEY = 'pulsecraft_deviceMeta';

function getDeviceId() {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = 'device_' + crypto.randomUUID();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);

        // Store device metadata for analytics
        localStorage.setItem(DEVICE_METADATA_KEY, JSON.stringify({
            createdAt: new Date().toISOString(),
            userAgent: navigator.userAgent,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language
        }));
    }
    return deviceId;
}

// Layer 2: Session Identity (ephemeral, per browser tab)
const SESSION_ID_KEY = 'pulsecraft_sessionId';
const SESSION_START_KEY = 'pulsecraft_sessionStart';

function getSessionId() {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
        sessionId = 'sess_' + crypto.randomUUID();
        sessionStorage.setItem(SESSION_ID_KEY, sessionId);
        sessionStorage.setItem(SESSION_START_KEY, new Date().toISOString());
    }
    return sessionId;
}

// Layer 3: Request Tracking (for rate limiting & analytics)
const REQUEST_COUNT_KEY = 'pulsecraft_requestCount';

function trackRequest() {
    const count = parseInt(sessionStorage.getItem(REQUEST_COUNT_KEY) || '0', 10);
    sessionStorage.setItem(REQUEST_COUNT_KEY, (count + 1).toString());
    return count + 1;
}

// Combined identity payload for API calls
function getIdentityPayload() {
    return {
        deviceId: getDeviceId(),
        sessionId: getSessionId(),
        requestCount: trackRequest(),
        timestamp: Date.now()
    };
}
```

### Why This Approach Works

1. **Device ID (localStorage):** Allows tracking returning users across sessions
2. **Session ID (sessionStorage):** Distinguishes unique browsing sessions (tab/window)
3. **Separation of Concerns:** Clear distinction between "user" and "session"
4. **Privacy-Conscious:** No PII collected, just anonymous identifiers
5. **Analytics-Ready:** Can track session duration, requests per session, return frequency

---

## Session Expiry Patterns

### Strategy 1: Inactivity Timeout (Recommended)

```javascript
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const LAST_ACTIVITY_KEY = 'pulsecraft_lastActivity';

function updateActivity() {
    sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

function checkSessionExpiry() {
    const lastActivity = parseInt(sessionStorage.getItem(LAST_ACTIVITY_KEY) || '0', 10);
    const now = Date.now();

    if (lastActivity && (now - lastActivity) > SESSION_TIMEOUT_MS) {
        // Session expired - regenerate
        sessionStorage.removeItem(SESSION_ID_KEY);
        sessionStorage.removeItem(LAST_ACTIVITY_KEY);
        console.log('Session expired due to inactivity');
        return true;
    }

    updateActivity();
    return false;
}

// Track activity on user interactions
['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
    document.addEventListener(event, updateActivity, { passive: true, once: true });
});

// Check expiry before critical operations
async function mirrorVoiceCore() {
    if (checkSessionExpiry()) {
        showToast("Your session has expired. Starting fresh...", 'info');
    }
    // ... rest of function
}
```

### Strategy 2: Absolute Expiry

```javascript
const SESSION_MAX_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_CREATED_KEY = 'pulsecraft_sessionCreated';

function getSessionId() {
    const created = parseInt(sessionStorage.getItem(SESSION_CREATED_KEY) || '0', 10);
    const now = Date.now();

    // Force expiry after 24 hours regardless of activity
    if (created && (now - created) > SESSION_MAX_DURATION_MS) {
        sessionStorage.clear();
    }

    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
        sessionId = 'sess_' + crypto.randomUUID();
        sessionStorage.setItem(SESSION_ID_KEY, sessionId);
        sessionStorage.setItem(SESSION_CREATED_KEY, now.toString());
    }
    return sessionId;
}
```

### Strategy 3: Server-Side Session Validation

```javascript
// Client-side: Send session ID with every request
const payload = {
    sessionId: getSessionId(),
    deviceId: getDeviceId(),
    // ... other data
};

// Server-side: Track active sessions
const activeSessions = new Map(); // or Redis for production

app.post('/api/mirror-voice', async (req, res) => {
    const { sessionId, deviceId } = req.body;

    // Check if session is valid
    const sessionData = activeSessions.get(sessionId);
    if (!sessionData) {
        // New session - register it
        activeSessions.set(sessionId, {
            deviceId,
            createdAt: Date.now(),
            lastActivity: Date.now(),
            requestCount: 1
        });
    } else {
        // Update existing session
        const timeSinceLastActivity = Date.now() - sessionData.lastActivity;
        if (timeSinceLastActivity > SESSION_TIMEOUT_MS) {
            // Session expired
            activeSessions.delete(sessionId);
            return res.status(401).json({
                error: 'Session expired',
                code: 'SESSION_EXPIRED'
            });
        }

        sessionData.lastActivity = Date.now();
        sessionData.requestCount++;
    }

    // ... rest of endpoint logic
});

// Cleanup job: Remove stale sessions
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, data] of activeSessions.entries()) {
        if (now - data.lastActivity > SESSION_TIMEOUT_MS) {
            activeSessions.delete(sessionId);
        }
    }
}, 60 * 1000); // Run every minute
```

---

## Multi-Device Considerations

### Challenge: Same User, Different Devices

**Problem:** A user interacts with PulseCraft on desktop, then switches to mobile. How do we maintain continuity without requiring login?

### Solution 1: Device-Specific Experience (Current State)

**Approach:** Each device has its own isolated identity.

**Implementation:**
```javascript
// No changes needed - current localStorage approach works
const deviceId = localStorage.getItem('pulsecraft_deviceId') || generateDeviceId();
```

**Pros:**
- Simple implementation
- No server coordination needed
- Maximum privacy

**Cons:**
- No cross-device sync
- Voice kits locked to single device
- Poor UX for multi-device users

### Solution 2: Anonymous Sync Codes

**Approach:** Generate a one-time code to transfer identity between devices.

**Implementation:**
```javascript
// Device A: Generate sync code
function generateSyncCode() {
    const deviceId = getDeviceId();
    const syncCode = nanoid(10); // Short, memorable code

    // Store in server with expiry
    fetch('/api/generate-sync-code', {
        method: 'POST',
        body: JSON.stringify({ deviceId, syncCode }),
        headers: { 'Content-Type': 'application/json' }
    });

    return syncCode;
}

// Device B: Claim sync code
function claimSyncCode(syncCode) {
    fetch('/api/claim-sync-code', {
        method: 'POST',
        body: JSON.stringify({ syncCode }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        if (data.deviceId) {
            localStorage.setItem('pulsecraft_deviceId', data.deviceId);
            showToast('Device synced successfully!', 'success');
        }
    });
}
```

**Server-side (Redis-based):**
```javascript
// Generate sync code (expires in 5 minutes)
app.post('/api/generate-sync-code', async (req, res) => {
    const { deviceId, syncCode } = req.body;

    // Store in Redis with expiry
    await redisClient.setex(
        `sync:${syncCode}`,
        300, // 5 minutes
        deviceId
    );

    res.json({ syncCode });
});

// Claim sync code
app.post('/api/claim-sync-code', async (req, res) => {
    const { syncCode } = req.body;

    const deviceId = await redisClient.get(`sync:${syncCode}`);
    if (deviceId) {
        await redisClient.del(`sync:${syncCode}`); // One-time use
        res.json({ deviceId });
    } else {
        res.status(404).json({ error: 'Invalid or expired sync code' });
    }
});
```

**Pros:**
- No authentication required
- User-initiated (privacy-respecting)
- Secure (time-limited, one-time use)

**Cons:**
- Requires server infrastructure (Redis)
- Manual process (not automatic)

### Solution 3: URL-Based Identity Transfer

**Approach:** Encode device ID in shareable URL.

**Implementation:**
```javascript
// Generate shareable link
function generateShareableLink() {
    const deviceId = getDeviceId();
    const encoded = btoa(deviceId); // Base64 encode
    return `${window.location.origin}?restore=${encoded}`;
}

// On page load, check for restore parameter
const urlParams = new URLSearchParams(window.location.search);
const restoreId = urlParams.get('restore');
if (restoreId) {
    try {
        const deviceId = atob(restoreId); // Base64 decode
        localStorage.setItem('pulsecraft_deviceId', deviceId);
        showToast('Device restored from link!', 'success');

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
        console.error('Invalid restore link');
    }
}
```

**Pros:**
- No server coordination needed
- Simple implementation
- Works via QR codes, email, etc.

**Cons:**
- Device ID exposed in URL (security concern)
- Link can be accidentally shared
- No expiry mechanism

---

## Privacy Implications

### GDPR/CCPA Considerations

**Key Question:** Are anonymous session IDs "personal data"?

**Short Answer:** It depends. If session IDs can be linked to an identifiable person (IP address, other identifiers), they may be considered personal data under GDPR.

### Privacy Best Practices

#### 1. **Transparent Data Collection**

Add a privacy notice to the UI:

```javascript
// Show on first visit
function showPrivacyNotice() {
    if (!localStorage.getItem('pulsecraft_privacyAck')) {
        showToast(
            'We use anonymous session IDs to improve your experience. No personal data is collected.',
            'info'
        );
        localStorage.setItem('pulsecraft_privacyAck', 'true');
    }
}
```

#### 2. **Data Minimization**

Only collect what's necessary:

```javascript
// GOOD: Minimal, anonymous
const payload = {
    sessionId: getSessionId(),
    deviceId: getDeviceId()
};

// BAD: Excessive tracking
const payload = {
    sessionId: getSessionId(),
    deviceId: getDeviceId(),
    ipAddress: userIp,           // Not necessary
    geoLocation: userLocation,    // Not necessary
    fingerprintHash: generateFingerprint() // Invasive
};
```

#### 3. **User Control**

Provide a way to reset identity:

```javascript
function resetIdentity() {
    if (confirm('This will clear your device ID and all saved voice kits. Continue?')) {
        localStorage.clear();
        sessionStorage.clear();
        showToast('Identity reset. Starting fresh!', 'success');
        location.reload();
    }
}
```

#### 4. **Server-Side Data Retention**

Add automatic cleanup to server:

```javascript
// Delete telemetry older than 90 days
const RETENTION_DAYS = 90;

async function cleanupOldTelemetry() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    const result = await TelemetryLog.deleteMany({
        timestamp: { $lt: cutoffDate }
    });

    console.log(`Cleaned up ${result.deletedCount} old telemetry records`);
}

// Run daily
setInterval(cleanupOldTelemetry, 24 * 60 * 60 * 1000);
```

### Anonymization Techniques

**Hash Device IDs Before Logging:**

```javascript
const crypto = require('crypto');

function hashDeviceId(deviceId) {
    return crypto.createHash('sha256')
        .update(deviceId + process.env.SALT)
        .digest('hex');
}

// When logging telemetry
new TelemetryLog({
    userId: hashDeviceId(req.body.deviceId), // Store hash, not raw ID
    sessionId: hashDeviceId(req.body.sessionId),
    // ... rest of data
}).save();
```

**Why Hash?**
- Prevents linkage to original device ID
- Still allows deduplication and analysis
- Non-reversible (with proper salt)

---

## Implementation Recommendations for PulseCraft

### Phase 1: Immediate Improvements (No Breaking Changes)

**Goal:** Add session layer without disrupting existing userId system.

```javascript
// Replace lines 5-12 in Script.js
let deviceId = localStorage.getItem('pulsecraft_deviceId');
if (!deviceId) {
    deviceId = 'device_' + crypto.randomUUID();
    localStorage.setItem('pulsecraft_deviceId', deviceId);
    console.log('🆔 New device registered:', deviceId);
} else {
    console.log('🆔 Returning device:', deviceId);
}

let sessionId = sessionStorage.getItem('pulsecraft_sessionId');
if (!sessionId) {
    sessionId = 'sess_' + crypto.randomUUID();
    sessionStorage.setItem('pulsecraft_sessionId', sessionId);
    console.log('🔐 New session started:', sessionId);
} else {
    console.log('🔐 Continuing session:', sessionId);
}

// Update API calls to include both
async function mirrorVoiceCore() {
    const response = await fetch(`${API_BASE_URL}/api/mirror-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            brandInput: brandInputValue,
            deviceId: deviceId,      // New: persistent ID
            sessionId: sessionId,    // New: session ID
            userId: deviceId         // Backward compatible (alias deviceId)
        }),
    });
    // ... rest of function
}
```

**Server-side updates (server.js):**

```javascript
app.post('/api/mirror-voice', mirrorLimiter, async (req, res) => {
    const { brandInput, deviceId, sessionId, userId } = req.body;

    // Backward compatibility: use deviceId if available, fallback to userId
    const effectiveDeviceId = deviceId || userId;

    // Log with session context
    new TelemetryLog({
        userId: effectiveDeviceId,
        sessionId: sessionId,  // New field
        eventType: 'MIRROR_VOICE',
        // ... rest of data
    }).save();

    // ... rest of endpoint
});
```

**Benefits:**
- Backward compatible (old clients still work)
- New session tracking enabled
- No data migration needed

### Phase 2: Session Expiry & Cleanup

Add inactivity timeout:

```javascript
// In Script.js
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const LAST_ACTIVITY_KEY = 'pulsecraft_lastActivity';

function updateActivity() {
    sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

function checkSessionExpiry() {
    const lastActivity = parseInt(sessionStorage.getItem(LAST_ACTIVITY_KEY) || '0', 10);
    if (lastActivity && (Date.now() - lastActivity) > SESSION_TIMEOUT_MS) {
        sessionStorage.clear(); // Clear session data
        return true;
    }
    updateActivity();
    return false;
}

// Call before critical operations
document.addEventListener('DOMContentLoaded', () => {
    checkSessionExpiry();

    // Update activity on interactions
    ['click', 'keypress', 'scroll'].forEach(event => {
        document.addEventListener(event, updateActivity, { passive: true });
    });
});
```

### Phase 3: Multi-Device Support (Optional)

Implement sync codes for users who want cross-device access:

```javascript
// UI: Add "Sync to Another Device" button
function showSyncModal() {
    const deviceId = getDeviceId();
    const syncCode = generateSyncCode(deviceId);

    alert(`Your sync code: ${syncCode}\nEnter this code on another device to sync your voice kits.\nExpires in 5 minutes.`);
}

function generateSyncCode(deviceId) {
    // Simple implementation: Last 8 chars of device ID
    return deviceId.slice(-8).toUpperCase();

    // Better: Send to server and get time-limited code
    // (requires server-side implementation)
}
```

### Schema Updates for MongoDB

Add session tracking to telemetry:

```javascript
const TelemetrySchema = new mongoose.Schema({
    userId: { type: String, required: false, index: true, default: 'anonymous' },
    sessionId: { type: String, index: true },  // NEW FIELD
    deviceId: { type: String, index: true },   // NEW FIELD (alias for userId)
    timestamp: { type: Date, default: Date.now, index: true },
    sessionStartTime: { type: Date },          // NEW FIELD
    requestCount: { type: Number, default: 1 }, // NEW FIELD
    eventType: String,
    inputContext: String,
    styleUsed: String,
    outputData: Object,
    latentProfile: Object,
    latentMeta: Object,
    meta: Object,
    vectorEmbedding: [Number]
});

// Add compound index for session queries
TelemetrySchema.index({ sessionId: 1, timestamp: -1 });
```

### New Analytics Endpoints

```javascript
// Get session statistics
app.get('/api/session-stats', async (req, res) => {
    const { sessionId } = req.query;

    const sessionLogs = await TelemetryLog.find({ sessionId })
        .sort({ timestamp: 1 });

    if (sessionLogs.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
    }

    const firstLog = sessionLogs[0];
    const lastLog = sessionLogs[sessionLogs.length - 1];
    const durationMs = lastLog.timestamp - firstLog.timestamp;

    res.json({
        sessionId,
        startTime: firstLog.timestamp,
        endTime: lastLog.timestamp,
        duration: durationMs,
        durationFormatted: formatDuration(durationMs),
        requestCount: sessionLogs.length,
        events: {
            mirrors: sessionLogs.filter(l => l.eventType === 'MIRROR_VOICE').length,
            generations: sessionLogs.filter(l => l.eventType === 'GENERATE_CONTENT').length,
            refinements: sessionLogs.filter(l => l.eventType === 'REFINE_ALCHEMY').length
        }
    });
});

function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
}
```

---

## Future Authentication Migration Path

### Guiding Principles

1. **Non-Destructive:** Existing anonymous users should not lose data
2. **Optional:** Keep anonymous mode available
3. **Seamless:** Linking should feel natural, not forced
4. **Privacy-First:** Clear value proposition for creating an account

### Migration Strategy

#### Step 1: Add Optional Email Capture (Soft Opt-In)

```javascript
// After successful voice mirror
function showEmailCapturePrompt() {
    const hasEmail = localStorage.getItem('pulsecraft_email');
    const promptShown = sessionStorage.getItem('emailPromptShown');

    if (!hasEmail && !promptShown) {
        setTimeout(() => {
            const email = prompt(
                'Want to save your voice kits across devices?\n\n' +
                'Enter your email (optional) to enable cloud sync:'
            );

            if (email && isValidEmail(email)) {
                registerEmail(email);
            }

            sessionStorage.setItem('emailPromptShown', 'true');
        }, 2000); // Show after 2 seconds
    }
}

async function registerEmail(email) {
    const deviceId = getDeviceId();

    const response = await fetch('/api/register-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, deviceId })
    });

    if (response.ok) {
        localStorage.setItem('pulsecraft_email', email);
        showToast('Email registered! Your data will now sync across devices.', 'success');
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

#### Step 2: Server-Side Email-Device Linking

```javascript
// New schema for user accounts
const UserAccountSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true },
    emailVerified: { type: Boolean, default: false },
    devices: [{
        deviceId: String,
        firstSeen: Date,
        lastSeen: Date,
        userAgent: String
    }],
    createdAt: { type: Date, default: Date.now },
    preferences: {
        emailNotifications: { type: Boolean, default: false },
        dataRetention: { type: String, default: 'standard' } // 'standard' or 'extended'
    }
});

const UserAccount = mongoose.model('UserAccount', UserAccountSchema);

// Register email endpoint
app.post('/api/register-email', async (req, res) => {
    const { email, deviceId } = req.body;

    if (!email || !deviceId) {
        return res.status(400).json({ error: 'Missing email or deviceId' });
    }

    try {
        // Find or create user account
        let user = await UserAccount.findOne({ email });

        if (!user) {
            user = new UserAccount({
                email,
                devices: [{
                    deviceId,
                    firstSeen: new Date(),
                    lastSeen: new Date(),
                    userAgent: req.headers['user-agent']
                }]
            });
            await user.save();
        } else {
            // Add device to existing account
            const deviceExists = user.devices.some(d => d.deviceId === deviceId);
            if (!deviceExists) {
                user.devices.push({
                    deviceId,
                    firstSeen: new Date(),
                    lastSeen: new Date(),
                    userAgent: req.headers['user-agent']
                });
                await user.save();
            }
        }

        res.json({ success: true, deviceCount: user.devices.length });
    } catch (err) {
        console.error('Email registration error:', err);
        res.status(500).json({ error: 'Failed to register email' });
    }
});
```

#### Step 3: Cross-Device Data Sync

```javascript
// Fetch all voice kits for user's linked devices
app.get('/api/sync-voice-kits', async (req, res) => {
    const { email, deviceId } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Missing email' });
    }

    try {
        // Verify device belongs to this email
        const user = await UserAccount.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const deviceIds = user.devices.map(d => d.deviceId);
        if (!deviceIds.includes(deviceId)) {
            return res.status(403).json({ error: 'Device not linked to this account' });
        }

        // Fetch telemetry from all linked devices
        const allLogs = await TelemetryLog.find({
            userId: { $in: deviceIds },
            eventType: { $in: ['MIRROR_VOICE', 'REFINE_ALCHEMY'] }
        }).sort({ timestamp: -1 });

        // Extract unique voice kits
        const voiceKits = allLogs.map(log => ({
            ...log.outputData,
            deviceId: log.userId,
            createdAt: log.timestamp
        }));

        res.json({ voiceKits });
    } catch (err) {
        console.error('Sync error:', err);
        res.status(500).json({ error: 'Failed to sync voice kits' });
    }
});
```

#### Step 4: Password-Based Auth (Full Migration)

Once email capture is established, add password authentication:

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Update schema
const UserAccountSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },  // NEW FIELD
    emailVerified: { type: Boolean, default: false },
    // ... rest of schema
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
    const { email, password, deviceId } = req.body;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create account
    const user = new UserAccount({
        email,
        passwordHash,
        devices: [{ deviceId, firstSeen: new Date() }]
    });
    await user.save();

    // Generate JWT
    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.json({ token, userId: user._id });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await UserAccount.findOne({ email });
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.json({ token, userId: user._id });
});

// Middleware for protected routes
function requireAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
```

### Client-Side Migration Flow

```javascript
// Check for existing token on page load
const authToken = localStorage.getItem('pulsecraft_authToken');

if (authToken) {
    // User is authenticated - use JWT for API calls
    fetch('/api/mirror-voice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ brandInput })
    });
} else {
    // User is anonymous - use device ID
    const deviceId = getDeviceId();
    fetch('/api/mirror-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandInput, deviceId })
    });
}
```

### Migration Checklist

- [ ] **Phase 1:** Add sessionId alongside userId (backward compatible)
- [ ] **Phase 2:** Implement session expiry and cleanup
- [ ] **Phase 3:** Add optional email capture (soft opt-in)
- [ ] **Phase 4:** Implement device linking for multi-device sync
- [ ] **Phase 5:** Add password-based authentication (optional upgrade)
- [ ] **Phase 6:** Migrate existing anonymous data to user accounts (when email provided)

### Data Migration Script

```javascript
// Run once when user creates account
async function migrateAnonymousData(deviceId, newUserId) {
    // Update all telemetry logs to link to new user account
    const result = await TelemetryLog.updateMany(
        { userId: deviceId },
        {
            $set: {
                userId: newUserId,
                migratedFrom: deviceId,
                migratedAt: new Date()
            }
        }
    );

    console.log(`Migrated ${result.modifiedCount} records for user ${newUserId}`);
}
```

---

## Summary & Recommendations

### Immediate Action Items

1. **Replace `Date.now() + Math.random()` with `crypto.randomUUID()`**
   - Security: Eliminates collision risk
   - Compatibility: Native browser support

2. **Add Session Layer (sessionStorage)**
   - Distinction: Separate "device" from "session"
   - Analytics: Track session duration, requests per session

3. **Implement Inactivity Timeout**
   - UX: Clear stale sessions after 30 minutes
   - Performance: Reduce server-side session storage

### Short-Term Enhancements (1-2 weeks)

4. **Update Telemetry Schema**
   - Add `sessionId` and `deviceId` fields
   - Add session start time and request count

5. **Build Session Analytics Dashboard**
   - Show session duration, event counts
   - Visualize session timeline

### Long-Term Migration Path (1-3 months)

6. **Add Optional Email Capture**
   - Soft opt-in after successful voice mirror
   - Clear value proposition (cross-device sync)

7. **Implement Device Linking**
   - Email-based device registration
   - Cross-device data sync

8. **Full Authentication (Optional)**
   - Password-based login
   - JWT tokens
   - Protected API routes

### Key Takeaways

- **Session IDs:** Use `crypto.randomUUID()` or Nanoid for security
- **Storage:** Use sessionStorage for ephemeral session data, localStorage for persistent device ID
- **Expiry:** Implement inactivity timeout (30 minutes recommended)
- **Multi-Device:** Start with device-specific experience, add sync codes later
- **Privacy:** Hash device IDs before logging, implement data retention policies
- **Migration:** Add email capture first, then password auth as optional upgrade

### Testing Checklist

- [ ] Session ID uniqueness (no collisions in 100k generations)
- [ ] Session expiry after 30 minutes of inactivity
- [ ] sessionStorage cleared on tab close
- [ ] localStorage persists across browser restarts
- [ ] API calls include both deviceId and sessionId
- [ ] Server logs session data correctly
- [ ] Privacy notice shown on first visit
- [ ] Reset identity function works correctly

---

**Document Version:** 1.0
**Last Updated:** 2026-01-26
**Next Review:** Before implementing authentication system
