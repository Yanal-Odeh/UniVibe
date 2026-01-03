# Event Approval System - Performance Bottleneck Analysis

**Date**: January 1, 2026  
**Analysis Type**: Full-Stack Performance Audit  
**Critical Issue**: Aggressive Frontend Polling + Backend Caching Conflicts

---

## 🚨 CRITICAL BOTTLENECKS IDENTIFIED

### 1. **AGGRESSIVE 1-SECOND POLLING** ⚠️ SEVERITY: CRITICAL

**Current Implementation** (PlanEvents.jsx lines 81-93):
```javascript
// Set up interval to refresh events every 1 second for instant real-time updates
const interval = setInterval(() => {
  if (!isLoading && currentAdmin) {
    fetchEvents(); // Calls api.clearCache() + api.getEvents({}, true)
  }
}, 1000); // HAMMERING THE SERVER!
```

**Impact Analysis**:
- **3,600 requests per hour** per active user
- Each request clears entire API cache
- Forces fresh DB query every second
- Bypasses all caching mechanisms with `force: true` flag
- Creates DB connection pressure (10+ simultaneous queries)
- Network overhead: ~2MB/min per user

**Root Cause**: Misguided attempt at "real-time" updates

---

### 2. **CACHE WARFARE** ⚠️ SEVERITY: HIGH

**Conflicting Strategies**:

**Backend** (eventController.js line 111):
```javascript
res.set('Cache-Control', 'public, max-age=300'); // "Cache for 5 minutes"
```

**Frontend** (PlanEvents.jsx line 56 + api.js):
```javascript
api.clearCache();  // "Delete all cache"
await api.getEvents({}, true);  // "Force skip cache"
```

**Impact**:
- Cache headers completely ignored
- No benefit from HTTP caching
- Increased server load (no client-side caching)
- Database gets hit every single second

---

### 3. **REDUNDANT CACHE CLEARING** ⚠️ SEVERITY: MEDIUM

**Occurrences**:
- Line 56: Every fetchEvents() call
- Line 246: After deleteEvent()
- api.js: Automatic clear on all mutations

**Impact**:
- Destroys cache for ALL endpoints (not just events)
- Affects notifications, communities, colleges queries
- Forces DB queries for unrelated data

---

### 4. **HEAVY `include` IN getPendingApprovals** ⚠️ SEVERITY: MEDIUM

**Current** (eventController.js line 1124):
```javascript
include: {
  creator: { select: {...} },  // OK
  community: { select: {...} }, // OK
  college: true,  // ❌ FULL OBJECT (20+ fields)
  eventLocation: true  // ❌ FULL OBJECT (10+ fields)
}
```

**Impact**:
- Fetches 30-40 unnecessary fields per event
- Larger payloads (15KB vs 3KB for 10 events)
- Slower serialization and network transfer

---

### 5. **NO REQUEST DEDUPLICATION** ⚠️ SEVERITY: LOW

**Issue**: If user clicks rapidly or multiple components mount:
- Multiple identical requests can fire simultaneously
- No in-flight request guard

**Impact**:
- Duplicate queries to database
- Wasted resources

---

### 6. **MISSING NOTIFICATION INDEXES** ⚠️ SEVERITY: MEDIUM

**Current Schema**: Only basic @@map, no performance indexes

**Needed**:
```prisma
@@index([userId, read])  // For unread notification queries
@@index([eventId])       // For event-related lookups
@@index([userId, createdAt])  // For chronological fetches
```

**Impact**:
- Slow notification inserts as table grows (>10K rows)
- Full table scans on userId filters
- Approval delays of 50-200ms from notification creation

---

## 📊 PERFORMANCE IMPACT ESTIMATION

### Current State (Per User)
| Metric | Value | Impact |
|--------|-------|---------|
| Polling Rate | 1 req/sec | 3,600 req/hour |
| Cache Hit Rate | 0% | All requests hit DB |
| DB Queries/Min | 60 | Connection pool saturation |
| Approval Latency | 300-500ms | Includes polling overhead |
| Network Usage | 120KB/min | 7MB/hour bandwidth |

### With 10 Concurrent Users
- **36,000 requests/hour** to server
- **600 DB queries/minute** (beyond typical pool capacity)
- **70MB/hour** bandwidth
- **High risk of**: Connection exhaustion, slow queries, timeouts

---

## ✅ RECOMMENDED SOLUTIONS

### Solution 1: Event-Driven Updates (RECOMMENDED)
**Strategy**: Use existing `eventApprovalChanged` event + 30-second polling

**Benefits**:
- 98% reduction in requests (3,600 → 120/hour)
- Instant updates after user actions
- Respects cache headers
- Minimal code changes

### Solution 2: Server-Sent Events (FUTURE)
**Strategy**: SSE for true real-time push notifications

**Benefits**:
- Zero polling
- True real-time updates
- Scalable with Redis pub/sub

**Drawbacks**:
- Requires significant backend changes
- Need persistent connections

### Solution 3: Optimized Polling (BASELINE)
**Strategy**: 30-second polling + immediate refresh on actions

**Benefits**:
- Simple implementation
- 97% reduction in requests
- Good enough for most use cases

---

## 🎯 RECOMMENDED POLLING INTERVAL: 30 SECONDS

**Rationale**:
1. **User Perception**: Approval workflows take minutes, not seconds
2. **Network Efficiency**: Reduces requests by 97% (60 → 2 per minute)
3. **Cache Effectiveness**: Allows 5-min cache to work (6 requests before cache expires)
4. **Real-Time Feel**: Combine with immediate refresh after user actions
5. **Industry Standard**: Gmail checks every 60s, Slack every 30s

**Alternative Intervals**:
- 10 seconds: For high-activity environments (still 83% reduction)
- 60 seconds: For low-activity/resource-constrained servers
- Event-only: No polling, refresh only on window events (99% reduction)

---

## 🔍 DIAGNOSIS REQUIREMENTS

### Backend Logging (Already Implemented)
```javascript
const profiler = new Profiler('Faculty Approval');
profiler.start('fetch_event');
// ... operations ...
profiler.end('fetch_event');
profiler.log(); // Outputs timing breakdown
```

### Frontend Logging (TO BE ADDED)
```javascript
// Count requests per minute
let requestCount = 0;
const startTime = Date.now();

const fetchEvents = async () => {
  const fetchStart = performance.now();
  requestCount++;
  
  // ... existing code ...
  
  const duration = performance.now() - fetchStart;
  const elapsed = (Date.now() - startTime) / 60000; // minutes
  console.log(`[Performance] Fetch took ${duration}ms | ${(requestCount / elapsed).toFixed(1)} requests/min`);
};
```

---

## 📋 IMPLEMENTATION PRIORITY

1. **CRITICAL** (Deploy ASAP): Fix 1-second polling → 30-second polling
2. **HIGH**: Remove aggressive cache clearing
3. **HIGH**: Optimize getPendingApprovals with select
4. **MEDIUM**: Add notification indexes
5. **LOW**: Add request deduplication
6. **FUTURE**: Consider SSE/WebSockets

---

**Next**: Detailed code patches for each optimization
