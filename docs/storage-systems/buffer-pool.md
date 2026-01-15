---
title: Buffer Pool Management in CitrineDB
description: A comprehensive technical analysis of the buffer pool architecture - the memory management layer that mediates between volatile memory and persistent storage in database systems.
sidebar_label: Buffer Pool
sidebar_position: 3
keywords: [buffer-pool, buffer-management, cache, lru, database-internals]
reading_time: 25
last_update:
  date: 2026-01-15
draft: false
format: md
---

# Buffer Pool Management: Memory-Disk Interface in Database Systems

## Abstract

This document presents a comprehensive technical analysis of the buffer pool management system implemented in CitrineDB. The buffer pool serves as a critical memory management layer that mediates between volatile memory and persistent storage, implementing sophisticated caching strategies to minimize expensive disk I/O operations. We examine the architectural design, frame management, replacement policies, concurrency control mechanisms, and the interactions with the disk manager subsystem.

---

## 1. Introduction

### 1.1 The Database I/O Problem

Database systems face a fundamental performance challenge: **disk I/O operations are orders of magnitude slower than memory access**. Typical latency characteristics:

- RAM access: ~100 nanoseconds
- SSD random read: ~100 microseconds (1000× slower)
- HDD random read: ~10 milliseconds (100,000× slower)

Since databases must persist data on disk for durability guarantees, all data must eventually traverse this performance chasm.

### 1.2 The Buffer Pool Solution

The **buffer pool** (also called **buffer cache** or **buffer manager**) addresses this challenge by maintaining a cache of disk pages in memory. Key responsibilities include:

1. **Demand paging**: Fetch pages from disk only when needed
2. **Caching**: Retain frequently accessed pages in memory
3. **Write buffering**: Defer and batch disk writes
4. **Page replacement**: Evict pages when memory is full
5. **Concurrency control**: Manage simultaneous page access
6. **Crash recovery support**: Track dirty pages and coordinate with WAL

---

## 2. Architectural Overview

### 2.1 System Components

The buffer pool architecture consists of three primary components:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BUFFER POOL ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                       BufferPool Manager                            │   │
│   │  ┌────────────────────────────────────────────────────────────┐    │   │
│   │  │  • Page fetch/eviction logic                              │    │   │
│   │  │  • Pin/unpin operations                                   │    │   │
│   │  │  • Dirty page tracking                                    │    │   │
│   │  │  • Concurrency control (mutex)                            │    │   │
│   │  └────────────────────────────────────────────────────────────┘    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                          ↓                            ↓                     │
│   ┌──────────────────────────────────┐   ┌──────────────────────────────┐   │
│   │       Frame Pool                 │   │      LRU Replacement List    │   │
│   │  ┌────────────────────────────┐  │   │  ┌────────────────────────┐  │   │
│   │  │ Frame 0: [Page|Pin|Dirty] │  │   │  │  head → node → ... → tail│  │   │
│   │  │ Frame 1: [Page|Pin|Dirty] │  │   │  │  (unpinned frames only) │  │   │
│   │  │ Frame 2: [Page|Pin|Dirty] │  │   │  └────────────────────────┘  │   │
│   │  │         ...                │  │   │                              │   │
│   │  │ Frame N: [Page|Pin|Dirty] │  │   │  Eviction: head (oldest)     │   │
│   │  └────────────────────────────┘  │   │  Addition: tail (newest)     │   │
│   └──────────────────────────────────┘   └──────────────────────────────┘   │
│                          ↓                                                  │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Page Table (Hash Map)                            │   │
│   │         PageID → FrameIndex mapping for O(1) lookup                 │   │
│   │     ┌──────────┬──────────┬──────────┬─────────────┐                │   │
│   │     │ PageID 1 │ PageID 5 │ PageID 7 │    ...      │                │   │
│   │     │    ↓     │    ↓     │    ↓     │             │                │   │
│   │     │ Frame 0  │ Frame 2  │ Frame 1  │             │                │   │
│   │     └──────────┴──────────┴──────────┴─────────────┘                │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                          ↓                                                  │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      Disk Manager                                   │   │
│   │               ReadPage() / WritePage()                              │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                          ↓                                                  │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                   Persistent Storage                                │   │
│   │                     (Disk/SSD)                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Core Data Structures

#### Frame Structure

Each frame represents a buffer pool slot capable of holding a single page:

```go
type Frame struct {
    page     *page.Page    // The cached page data
    pageID   page.PageID   // Identifier of the cached page
    pinCount int           // Number of active references
    dirty    bool          // Modification status
    valid    bool          // Frame occupancy status
}
```

**Field Semantics**:

- **page**: Pointer to the in-memory page data structure
- **pageID**: Unique identifier for the page currently resident in this frame
- **pinCount**: Reference counter preventing premature eviction; pinCount > 0 means page is actively used
- **dirty**: True if page has been modified but not yet written to disk
- **valid**: True if frame contains a valid page; false if frame is empty

#### Buffer Pool State

```go
type BufferPool struct {
    mu          sync.Mutex              // Protects concurrent access
    diskManager *file.DiskManager       // I/O subsystem interface
    poolSize    int                     // Total number of frames
    frames      []*Frame                // Array of buffer frames
    pageTable   map[page.PageID]int     // Page-to-frame mapping
    freeList    []int                   // Available frame indices
    lruList     *lruList                // Replacement policy data structure
}
```

**Invariants**:

1. **Disjoint sets**: Every frame index belongs to exactly one of {`pageTable`, `freeList`, `lruList`}
2. **Page table consistency**: If `pageTable[pid] = idx`, then `frames[idx].pageID == pid` and `frames[idx].valid == true`
3. **LRU membership**: Frame index in `lruList` iff `frames[idx].valid == true` and `frames[idx].pinCount == 0`
4. **Free list membership**: Frame index in `freeList` iff `frames[idx].valid == false`

---

## 3. Core Operations

### 3.1 Page Fetch Protocol

The `FetchPage` operation retrieves a page, either from the buffer pool cache or from disk if not resident:

```
Algorithm: FetchPage(pageID)
──────────────────────────────────────────────────────────────────────
Input: pageID - identifier of the requested page
Output: pointer to page in buffer pool, or error

1. Acquire buffer pool lock
2. Check page table for existing mapping:
   
   IF pageID ∈ pageTable:
      frameIdx ← pageTable[pageID]
      frame ← frames[frameIdx]
      frame.pinCount++                    // Prevent eviction
      lruList.remove(frameIdx)            // Remove from LRU (now pinned)
      Release lock
      RETURN frame.page
   
3. Page not in buffer; acquire a frame:
   
   frameIdx ← getFrame()                  // May evict unpinned page
   IF frameIdx == ERROR:
      Release lock
      RETURN ErrBufferPoolFull
   
4. Read page from disk:
   
   page ← diskManager.ReadPage(pageID)
   IF page == ERROR:
      freeList.append(frameIdx)           // Return frame to free list
      Release lock
      RETURN ERROR
   
5. Install page in frame:
   
   frame ← frames[frameIdx]
   frame.page ← page
   frame.pageID ← pageID
   frame.pinCount ← 1                     // Initially pinned
   frame.dirty ← false                    // Clean (just read from disk)
   frame.valid ← true
   
   pageTable[pageID] ← frameIdx           // Register mapping
   
6. Release lock
7. RETURN page
```

**Critical properties**:

- **Atomicity**: Page table and frame state are updated within the same critical section
- **Pinning**: Fetched page is returned with `pinCount = 1`, preventing immediate eviction
- **Error recovery**: Frame is returned to free list if disk read fails

### 3.2 New Page Allocation

Creating a new page combines disk allocation with buffer pool management:

```
Algorithm: NewPage(pageType)
──────────────────────────────────────────────────────────────────────
Input: pageType - type of page to create (data, index, etc.)
Output: pointer to newly created page, or error

1. Acquire buffer pool lock
2. Allocate page identifier from disk manager:
   
   pageID ← diskManager.AllocatePage()
   IF pageID == ERROR:
      Release lock
      RETURN ERROR
   
3. Acquire buffer frame:
   
   frameIdx ← getFrame()
   IF frameIdx == ERROR:
      Release lock
      RETURN ErrBufferPoolFull
   
4. Create page in memory:
   
   page ← page.NewPage(pageID, pageType)
   
5. Install in frame:
   
   frame ← frames[frameIdx]
   frame.page ← page
   frame.pageID ← pageID
   frame.pinCount ← 1                     // Initially pinned
   frame.dirty ← true                     // Must be written to disk
   frame.valid ← true
   
   pageTable[pageID] ← frameIdx
   
6. Release lock
7. RETURN page
```

**Key distinction from FetchPage**: New pages are marked dirty immediately since they exist only in memory and must be flushed to ensure durability.

### 3.3 Unpin Protocol

When a transaction finishes using a page, it must release its pin:

```
Algorithm: UnpinPage(pageID, isDirty)
──────────────────────────────────────────────────────────────────────
Input: pageID - identifier of page to unpin
       isDirty - whether page was modified
Output: success or error

1. Acquire buffer pool lock
2. Lookup frame:
   
   IF pageID ∉ pageTable:
      Release lock
      RETURN ErrPageNotFound
   
   frameIdx ← pageTable[pageID]
   frame ← frames[frameIdx]
   
3. Validate pin count:
   
   IF frame.pinCount ≤ 0:
      Release lock
      RETURN success              // Idempotent
   
4. Decrement pin count:
   
   frame.pinCount--
   
5. Update dirty status:
   
   IF isDirty:
      frame.dirty ← true          // Accumulative (once dirty, stays dirty)
   
6. Add to LRU if fully unpinned:
   
   IF frame.pinCount == 0:
      lruList.add(frameIdx)       // Now eligible for eviction
   
7. Release lock
8. RETURN success
```

**Design rationale**:

- **Dirty flag accumulation**: Once a page is marked dirty, it remains dirty until flushed
- **LRU membership**: Only unpinned pages (`pinCount == 0`) participate in replacement
- **Idempotency**: Unpinning with `pinCount == 0` is a no-op, not an error

---

## 4. Frame Acquisition and Eviction

### 4.1 Frame Acquisition Strategy

The `getFrame()` function implements a two-tier acquisition strategy:

```
Algorithm: getFrame()
──────────────────────────────────────────────────────────────────────
Output: frame index, or error if pool is full

1. Priority 1: Try free list
   
   IF freeList is not empty:
      frameIdx ← freeList.pop()
      RETURN frameIdx
   
2. Priority 2: Evict unpinned page
   
   (frameIdx, found) ← lruList.pop()     // Get least recently used
   IF NOT found:
      RETURN ErrBufferPoolFull           // All pages pinned
   
   frame ← frames[frameIdx]
   
3. Flush if dirty:
   
   IF frame.dirty:
      err ← diskManager.WritePage(frame.page)
      IF err != nil:
         lruList.add(frameIdx)           // Restore to LRU
         RETURN ERROR
   
4. Evict current page:
   
   DELETE pageTable[frame.pageID]        // Remove mapping
   
   frame.page ← nil                      // Clear frame
   frame.pageID ← InvalidPageID
   frame.pinCount ← 0
   frame.dirty ← false
   frame.valid ← false
   
5. RETURN frameIdx
```

**Correctness properties**:

1. **Write-before-evict**: Dirty pages are flushed before eviction (Write-Ahead Logging requirement)
2. **Pin protection**: Pinned pages never appear in LRU list, thus cannot be evicted
3. **Atomic eviction**: Page table update and frame clearing occur in same critical section

### 4.2 LRU Replacement Policy

CitrineDB implements the **Least Recently Used (LRU)** replacement algorithm using a doubly-linked list:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LRU LIST STRUCTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Doubly-linked list of unpinned frames:                                    │
│                                                                             │
│   head (oldest)                                                   tail (newest)│
│     │                                                                 │      │
│     ▼                                                                 ▼      │
│   ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌────┐    ┌────┐      ┌────┐   │
│   │ F3 │◄──►│ F7 │◄──►│ F1 │◄──►│ F5 │◄──►│ F2 │◄──►│ F9 │ ... │ F4 │   │
│   └────┘    └────┘    └────┘    └────┘    └────┘    └────┘      └────┘   │
│                                                                             │
│   Operations:                                                               │
│   • add(frameIdx): Append to tail (most recently used)                      │
│   • remove(frameIdx): Remove from arbitrary position                        │
│   • pop(): Remove and return head (least recently used)                     │
│                                                                             │
│   Auxiliary hash map for O(1) access:                                       │
│   idx: frameIdx → *lruNode                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### LRU Operations

```go
type lruNode struct {
    frameIdx int
    prev     *lruNode
    next     *lruNode
}

type lruList struct {
    head *lruNode              // Oldest (eviction candidate)
    tail *lruNode              // Newest (most recently used)
    idx  map[int]*lruNode      // Fast lookup
}
```

**Time complexity**:

- `add(frameIdx)`: O(1) - append to tail
- `remove(frameIdx)`: O(1) - direct lookup via hash map
- `pop()`: O(1) - remove head

**LRU invariant**: Pages toward head are less recently used than pages toward tail.

### 4.3 Eviction Scenarios

The buffer pool encounters several eviction scenarios:

#### Scenario 1: Free frames available

```
State: freeList = [10, 15, 20]
Action: getFrame() → returns 20 (no eviction needed)
```

#### Scenario 2: No free frames, unpinned page exists

```
State: freeList = [], lruList.head = Frame 5 (clean)
Action: getFrame() → evicts Frame 5, returns 5
Flow: pop() → no disk write → clear frame → return
```

#### Scenario 3: No free frames, must flush dirty page

```
State: freeList = [], lruList.head = Frame 3 (dirty)
Action: getFrame() → flushes then evicts Frame 3, returns 3
Flow: pop() → WritePage() → clear frame → return
```

#### Scenario 4: All pages pinned

```
State: freeList = [], lruList is empty (all frames pinned)
Action: getFrame() → ErrBufferPoolFull
Result: Request fails; caller must wait or abort
```

---

## 5. Write Management

### 5.1 Dirty Page Tracking

A page becomes dirty when modified in memory but not yet synchronized to disk. The buffer pool tracks this through the `dirty` flag:

```
Modified ──┐
           │
Page ──────┼──► dirty = true ──► [Uncommitted changes in memory]
           │                     
           └──► WritePage() ───► dirty = false ──► [Persisted to disk]
```

**Important properties**:

1. **Monotonic until flush**: Once `dirty = true`, remains true until explicit write
2. **Set on modify**: Any modification operation must mark page dirty
3. **Conservative**: Over-marking as dirty is safe; under-marking risks data loss

### 5.2 Flush Operations

#### Single Page Flush

```
Algorithm: FlushPage(pageID)
──────────────────────────────────────────────────────────────────────
Input: pageID - identifier of page to flush
Output: success or error

1. Acquire buffer pool lock
2. Lookup frame:
   
   IF pageID ∉ pageTable:
      Release lock
      RETURN ErrPageNotFound
   
   frameIdx ← pageTable[pageID]
   frame ← frames[frameIdx]
   
3. Write if dirty:
   
   IF frame.dirty:
      err ← diskManager.WritePage(frame.page)
      IF err != nil:
         Release lock
         RETURN err
      frame.dirty ← false            // Clean after successful write
   
4. Release lock
5. RETURN success
```

#### Batch Flush (FlushAll)

```
Algorithm: FlushAll()
──────────────────────────────────────────────────────────────────────
Output: success or error

1. Acquire buffer pool lock
2. Iterate all frames:
   
   FOR each frame IN frames:
      IF frame.valid AND frame.dirty:
         err ← diskManager.WritePage(frame.page)
         IF err != nil:
            Release lock
            RETURN err              // Abort on first error
         frame.dirty ← false
   
3. Release lock
4. RETURN success
```

**Use cases**:

- **FlushPage**: Transaction commit, checkpoint specific page
- **FlushAll**: Database shutdown, global checkpoint, recovery preparation

---

## 6. Concurrency Control

### 6.1 Locking Strategy

The buffer pool employs a **single global mutex** to protect all shared state:

```go
type BufferPool struct {
    mu sync.Mutex    // Protects: frames, pageTable, freeList, lruList
    ...
}
```

**Protected regions**:

- Frame state (page, pageID, pinCount, dirty, valid)
- Page table mappings
- Free list
- LRU list structure

**Critical section duration**:

- All operations hold lock for their entire duration
- Disk I/O (ReadPage/WritePage) performed while holding lock

### 6.2 Pin-Based Concurrency

Beyond the global mutex, the buffer pool implements **logical locking** through pin counts:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PIN-BASED LOGICAL LOCKING                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Thread 1: FetchPage(5) ──► pinCount++ ──► Work on Page ──► UnpinPage(5)  │
│                                   │                               │          │
│                                   └───── Eviction blocked ────────┘          │
│                                                                             │
│   Thread 2: getFrame() ──► LRU eviction ──X─ Skip pinned pages             │
│                                                                             │
│   Guarantee: Pinned pages remain valid for the entire duration of the pin   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Pin contract**:

1. **FetchPage**: Returns page with `pinCount ≥ 1`
2. **User responsibility**: Caller must eventually call UnpinPage
3. **Eviction protection**: Frame cannot be reused while `pinCount > 0`
4. **No page-level locking**: Caller must implement higher-level concurrency control (latches, locks)

### 6.3 Design Tradeoffs

The single global mutex approach presents notable tradeoffs:

**Advantages**:
- Simple reasoning about correctness
- No deadlock possibility
- Predictable performance characteristics

**Disadvantages**:
- Contention bottleneck under high concurrency
- Disk I/O extends critical section duration
- No parallelism for independent page operations

**Alternative designs** (not implemented):

1. **Fine-grained locking**: Per-frame mutexes + page table latch
2. **Lock-free structures**: Atomic operations for page table and LRU
3. **Partitioned pools**: Multiple independent buffer pools

---

## 7. Design Patterns and Best Practices

This section analyzes the software engineering patterns employed in the buffer pool implementation and compares them against industry best practices from production database systems.

### 7.1 Applied Design Patterns

#### 7.1.1 Object Pool Pattern

The buffer pool fundamentally implements the **Object Pool** creational pattern (Gamma et al., 1994). Rather than allocating and deallocating page buffers on demand, a fixed set of frames is pre-allocated and reused:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OBJECT POOL PATTERN                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Client Request ──► Pool Manager ──► Acquire Frame ──► Use ──► Release    │
│                            │                                      │         │
│                            │         ┌──────────────────┐         │         │
│                            └────────►│   Frame Pool     │◄────────┘         │
│                                      │  [Reusable Objects]                  │
│                                      └──────────────────┘                   │
│                                                                             │
│   Benefits:                                                                 │
│   • Amortized allocation cost                                               │
│   • Bounded memory usage                                                    │
│   • Predictable resource availability                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Implementation evidence**:
```go
frames := make([]*Frame, config.PoolSize)  // Pre-allocated pool
freeList := make([]int, config.PoolSize)   // Available object tracking
```

#### 7.1.2 Proxy Pattern (Virtual Proxy)

The buffer pool acts as a **Virtual Proxy** for disk pages, providing a surrogate that controls access to the expensive disk resource:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          VIRTUAL PROXY PATTERN                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Upper Layers                                                              │
│        │                                                                    │
│        ▼                                                                    │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐                │
│   │   Client    │─────►│ Buffer Pool │─────►│ Disk Manager│                │
│   │             │      │   (Proxy)   │      │ (Real Subj) │                │
│   └─────────────┘      └─────────────┘      └─────────────┘                │
│                              │                                              │
│                              ▼                                              │
│                        Lazy Loading                                         │
│                        Access Control                                       │
│                        Caching                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Proxy responsibilities**:
- **Lazy loading**: Pages fetched from disk only when accessed
- **Access control**: Pin mechanism prevents premature eviction
- **Caching**: Recently used pages kept in memory

#### 7.1.3 Strategy Pattern (Replacement Policy)

The LRU replacement policy is encapsulated as a separate component, exemplifying the **Strategy** behavioral pattern:

```go
type lruList struct {           // Concrete Strategy
    head *lruNode
    tail *lruNode
    idx  map[int]*lruNode
}

type BufferPool struct {
    lruList *lruList            // Strategy reference (composition)
    ...
}
```

This design enables potential future extension to alternative policies (Clock, LRU-K, 2Q, ARC) without modifying core buffer pool logic.

#### 7.1.4 Monitor Pattern

The combination of mutex and condition-based state management implements the **Monitor** synchronization pattern (Hoare, 1974):

```go
func (bp *BufferPool) FetchPage(pageID page.PageID) (*page.Page, error) {
    bp.mu.Lock()              // Enter monitor
    defer bp.mu.Unlock()      // Exit monitor (guaranteed)
    
    // Protected operations on shared state
    ...
}
```

**Monitor guarantees**:
- Mutual exclusion for all critical sections
- Automatic lock release via `defer`

### 7.2 Industry Best Practices Analysis

#### 7.2.1 STEAL/NO-FORCE Policy

The CitrineDB buffer pool implements a **STEAL/NO-FORCE** buffer management policy, which is the standard approach in modern DBMS (ARIES, 1992):

| Policy | Description | CitrineDB |
|--------|-------------|-----------|
| **STEAL** | Uncommitted pages can be written to disk | ✓ Dirty pages flushed on eviction |
| **NO-FORCE** | Committed pages need not be immediately written | ✓ Lazy write via `FlushPage` |

**Implications**:
- Requires **Write-Ahead Logging (WAL)** for crash recovery
- Enables better I/O performance through batching
- Reduces commit latency

#### 7.2.2 Reference Counting (Pin/Unpin)

The pin count mechanism follows the industry-standard **reference counting** idiom used in:
- PostgreSQL (`buffer refcount`)
- MySQL/InnoDB (`buf_block_t::lock`)
- SQLite (`pager refcount`)

**Best practice compliance**:
```go
frame.pinCount++           // Acquire reference
// ... use page ...
frame.pinCount--           // Release reference
if frame.pinCount == 0 {
    bp.lruList.add(frameIdx)  // Return to eviction pool
}
```

#### 7.2.3 Separation of Concerns

The architecture properly separates responsibilities:

| Component | Responsibility | Single Responsibility ✓ |
|-----------|----------------|-------------------------|
| `BufferPool` | Memory management, caching policy | ✓ |
| `DiskManager` | Physical I/O operations | ✓ |
| `lruList` | Replacement ordering | ✓ |
| `Frame` | Per-page metadata | ✓ |

### 7.3 Comparison with Production Systems

#### 7.3.1 PostgreSQL Buffer Manager

| Feature | PostgreSQL | CitrineDB |
|---------|------------|-----------|
| Replacement Policy | Clock sweep | LRU |
| Locking | Per-buffer spinlocks + LWLocks | Global mutex |
| Hash Table | Partitioned | Single map |
| Background Writer | Yes (bgwriter) | No |
| Ring Buffers | Yes (for large scans) | No |

#### 7.3.2 MySQL/InnoDB Buffer Pool

| Feature | InnoDB | CitrineDB |
|---------|--------|-----------|
| Replacement Policy | LRU with young/old sublists | Simple LRU |
| Locking | Fine-grained mutexes | Global mutex |
| Multiple Instances | Configurable | Single pool |
| Adaptive Hash Index | Yes | No |
| Change Buffer | Yes | No |

### 7.4 Identified Improvement Opportunities

Based on best practices analysis, potential enhancements include:

1. **Clock Replacement Algorithm**: O(1) amortized with better scan resistance than pure LRU
2. **Read-Write Lock Separation**: Allow concurrent readers for improved throughput
3. **Background Page Writer**: Asynchronous dirty page flushing to reduce eviction latency
4. **Buffer Pool Partitioning**: Reduce lock contention via hash-based partitioning
5. **Prefetch Support**: Sequential scan detection for proactive page loading

---

## 8. Page Lifecycle Management

### 8.1 Page States

A page transitions through several states during its lifecycle:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PAGE STATE DIAGRAM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                                                                             │
│                            [Not in Buffer]                                  │
│                               │         │                                   │
│                   FetchPage() │         │ NewPage()                         │
│                               ▼         ▼                                   │
│            ┌───────────────────┐       ┌───────────────────┐                │
│            │  Pinned & Clean   │       │  Pinned & Dirty   │                │
│            │  pinCount > 0     │       │  pinCount > 0     │                │
│            │  dirty = false    │       │  dirty = true     │                │
│            └───────────────────┘       └───────────────────┘                │
│                │           │                     │                          │
│      modify    │           │ UnpinPage           │ UnpinPage                │
│                ▼           │ (dirty=false)       │ (dirty=true)             │
│      ┌───────────────────┐ │                     │                          │
│      │  Pinned & Dirty   │ │                     │                          │
│      │  pinCount > 0     │ │                     │                          │
│      │  dirty = true     │ │                     │                          │
│      └───────────────────┘ │                     │                          │
│                │           │                     │                          │
│  UnpinPage     │           ▼                     │                          │
│  (dirty=true)  │   ┌───────────────────┐         │                          │
│                │   │ Unpinned & Clean  │         │                          │
│                │   │ pinCount = 0      │         │                          │
│                │   │ dirty = false     │         │                          │
│                │   │ [In LRU]          │         │                          │
│                │   └───────────────────┘         │                          │
│                │           │                     │                          │
│                │           │ FetchPage()         │                          │
│                ▼           │                     ▼                          │
│      ┌───────────────────┐ │           ┌───────────────────┐                │
│      │ Unpinned & Dirty  │◄┼───────────│ Unpinned & Dirty  │                │
│      │ pinCount = 0      │ │           │ pinCount = 0      │                │
│      │ dirty = true      │ │           │ dirty = true      │                │
│      │ [In LRU]          │ │           │ [In LRU]          │                │
│      └───────────────────┘ │           └───────────────────┘                │
│                │           │                                                │
│                │ FlushPage() / Eviction                                     │
│                ▼                                                            │
│      ┌───────────────────┐                                                  │
│      │ Unpinned & Clean  │◄─────────────────────────────────────────────────│
│      │ (ready to evict)  │                                                  │
│      └───────────────────┘                                                  │
│                │                                                            │
│                │ Eviction                                                   │
│                ▼                                                            │
│          [Not in Buffer]                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Note**: `FetchPage()` loads pages from disk (clean), while `NewPage()` creates pages in memory only (dirty). This distinction is critical for understanding durability guarantees.

### 8.2 Page Deletion

The `DeletePage` operation removes a page from the buffer pool only. Note that this operation does **not** deallocate the page from persistent storage; disk-level deallocation requires a separate call to `diskManager.DeallocatePage()`.

```
Algorithm: DeletePage(pageID)
──────────────────────────────────────────────────────────────────────
Input: pageID - identifier of page to delete
Output: success or error

1. Acquire buffer pool lock
2. Check if page is in buffer:
   
   IF pageID ∉ pageTable:
      Release lock
      RETURN success              // Already not in buffer (idempotent)
   
   frameIdx ← pageTable[pageID]
   frame ← frames[frameIdx]
   
3. Validate not pinned:
   
   IF frame.pinCount > 0:
      Release lock
      RETURN ERROR                // Cannot delete active page
   
4. Remove from LRU:
   
   lruList.remove(frameIdx)
   
5. Clear frame:
   
   frame.page ← nil
   frame.pageID ← InvalidPageID
   frame.pinCount ← 0
   frame.dirty ← false
   frame.valid ← false
   
6. Update metadata:
   
   DELETE pageTable[pageID]
   freeList.append(frameIdx)
   
7. Release lock
8. RETURN success
```

**Note**: This only removes from buffer pool; disk deletion requires separate call to `diskManager.DeallocatePage()`.

---

## 9. Monitoring and Observability

### 9.1 Buffer Pool Statistics

The buffer pool provides runtime statistics for monitoring:

```go
type Stats struct {
    PoolSize    int    // Total number of frames
    UsedCount   int    // Frames containing valid pages
    FreeCount   int    // Frames available for allocation
    PinnedCount int    // Frames currently pinned (in use)
    DirtyCount  int    // Frames with uncommitted changes
}
```

**Derived metrics**:

```
Hit Rate = (FetchPage hits) / (Total FetchPage calls)
Eviction Rate = (Evictions) / (Frame acquisitions)
Dirty Ratio = DirtyCount / UsedCount
Pin Ratio = PinnedCount / UsedCount
```

### 9.2 Performance Indicators

#### High Hit Rate (Good)
```
Interpretation: Most page requests served from cache
Action: None; buffer pool sized appropriately
```

#### Low Hit Rate (Bad)
```
Interpretation: Excessive disk I/O; cache thrashing
Action: Increase poolSize or optimize access patterns
```

#### High Pin Ratio (Warning)
```
Interpretation: Many pages held simultaneously
Risk: May lead to ErrBufferPoolFull
Action: Audit page holding duration; consider larger pool
```

#### High Dirty Ratio (Caution)
```
Interpretation: Large volume of uncommitted changes
Risk: Long recovery time after crash
Action: Increase checkpoint frequency
```

---

## 10. Correctness Properties and Invariants

### 10.1 Safety Properties

1. **No data loss**: Dirty pages are flushed before eviction
2. **No premature eviction**: Pinned pages cannot be evicted
3. **Consistency**: Page table reflects actual frame contents
4. **Isolation**: Global mutex prevents race conditions

### 10.2 Liveness Properties

1. **Progress**: As long as any frame is unpinned, new pages can be fetched
2. **Bounded blocking**: Lock acquisition has no priority inversion
3. **No deadlock**: Single lock design eliminates circular waiting

### 10.3 Key Invariants

```
Invariant I1 (Frame Partition):
    ∀ frameIdx ∈ [0, poolSize):
        (frameIdx ∈ freeList ∧ frames[frameIdx].valid = false)  XOR
        (frameIdx ∈ lruList ∧ frames[frameIdx].valid = true ∧ frames[frameIdx].pinCount = 0)  XOR
        (frames[frameIdx].valid = true ∧ frames[frameIdx].pinCount > 0)
    
    Equivalently: Each frame is in exactly one of three disjoint states:
    - Free (in freeList, invalid)
    - Unpinned (in lruList, valid, eligible for eviction)
    - Pinned (valid, in use, protected from eviction)

Invariant I2 (Page Table Consistency):
    ∀ pageID, frameIdx:
        pageTable[pageID] = frameIdx ⟹
            frames[frameIdx].pageID = pageID ∧
            frames[frameIdx].valid = true
    
    Contrapositive: Invalid frames have no page table entry.

Invariant I3 (LRU Membership):
    frameIdx ∈ lruList ⟺
        frames[frameIdx].valid = true ∧
        frames[frameIdx].pinCount = 0
    
    Corollary: Pinned frames (pinCount > 0) are never in LRU list.

Invariant I4 (Free List Membership):
    frameIdx ∈ freeList ⟺
        frames[frameIdx].valid = false

Invariant I5 (Pin Count):
    ∀ frameIdx:
        frames[frameIdx].pinCount ≥ 0
```

---

## 11. Integration with Storage Layers

### 11.1 Disk Manager Interface

The buffer pool depends on the disk manager for persistence:

```go
type DiskManager interface {
    ReadPage(pageID PageID) (*Page, error)
    WritePage(page *Page) error
    AllocatePage() (PageID, error)
    DeallocatePage(pageID PageID) error
}
```

**Contract**:

- `ReadPage`: Returns page contents; idempotent
- `WritePage`: Persists page; must be durable after return
- `AllocatePage`: Returns unique page identifier
- `DeallocatePage`: Marks page as free for reuse

### 11.2 Upper Layer Interface

Higher-level components (heap files, B-trees, indexes) interact with the buffer pool through a simple API:

```go
// Fetch existing page
page, err := bufferPool.FetchPage(pageID)
// ... use page ...
bufferPool.UnpinPage(pageID, isDirty)

// Create new page
page, err := bufferPool.NewPage(pageType)
pageID := page.GetID()
// ... initialize page ...
bufferPool.UnpinPage(pageID, true)
```

**Caller responsibilities**:

1. Always unpin after use
2. Correctly report dirty status
3. Implement higher-level concurrency control (latches)

---

## 12. Performance Characteristics

### 12.1 Time Complexity

| Operation | Best Case | Average Case | Worst Case |
|-----------|-----------|--------------|------------|
| FetchPage (hit) | O(1) | O(1) | O(1) |
| FetchPage (miss, free) | O(disk) | O(disk) | O(disk) |
| FetchPage (miss, evict) | O(disk) | O(disk) | O(disk) + O(flush) |
| NewPage (free) | O(1) | O(1) | O(1) |
| NewPage (evict) | O(1) | O(1) | O(flush) |
| UnpinPage | O(1) | O(1) | O(1) |
| FlushPage | O(1) or O(disk) | O(1) or O(disk) | O(disk) |
| DeletePage | O(1) | O(1) | O(1) |

### 12.2 Space Complexity

```
Total Memory = poolSize × (sizeof(Frame) + PageSize)
             = poolSize × (40 bytes + 4096 bytes)
             ≈ poolSize × 4136 bytes

Additional Overhead:
  - Page table: O(poolSize) hash map entries
  - LRU list: O(unpinned pages) nodes
  - Free list: O(free frames) indices
```

**Example**: With `poolSize = 1024`:
- Total buffer space: ~4 MB
- Metadata overhead: ~100 KB
- Total: ~4.1 MB

---

## 13. Conclusions

The buffer pool is a fundamental component in database system architecture, providing efficient memory management and I/O optimization. The CitrineDB implementation demonstrates several key design principles:

1. **Simplicity through global locking**: Prioritizes correctness and maintainability over maximum concurrency
2. **LRU replacement policy**: Provides good cache hit rates for most workloads
3. **Pin-based protection**: Prevents eviction of active pages without complex page-level locking
4. **Lazy writing**: Defers disk writes until eviction or explicit flush

The design successfully addresses the core challenge of mediating between fast volatile memory and slow persistent storage while maintaining strong consistency guarantees.

### Future Enhancements

Potential improvements for production deployment:

1. **Fine-grained locking**: Reduce contention with per-frame latches
2. **Advanced replacement policies**: Clock, 2Q, or ARC algorithms
3. **Prefetching**: Sequential scan detection and readahead
4. **Background flushing**: Asynchronous dirty page writer threads
5. **Adaptive sizing**: Dynamic pool size adjustment based on workload
6. **NUMA awareness**: Partition pools across NUMA nodes

---

## References

1. Comer, D. (1979). "The Ubiquitous B-Tree". *ACM Computing Surveys*, 11(2), 121-137. https://doi.org/10.1145/356770.356776
2. Ramakrishnan, R., & Gehrke, J. (2003). *Database Management Systems* (3rd ed.). McGraw-Hill.
3. Garcia-Molina, H., Ullman, J. D., & Widom, J. (2008). *Database Systems: The Complete Book* (2nd ed.). Prentice Hall.
4. Graefe, G. (2007). "The Five-Minute Rule Twenty Years Later, and How Flash Memory Changes the Rules". *ACM SIGMOD Record*, 36(4), 28-32. https://doi.org/10.1145/1361348.1361352
5. Effelsberg, W., & Härder, T. (1984). "Principles of Database Buffer Management". *ACM Transactions on Database Systems*, 9(4), 560-595. https://doi.org/10.1145/1994.2022
6. Stonebraker, M. (1981). "Operating System Support for Database Management". *Communications of the ACM*, 24(7), 412-418. https://doi.org/10.1145/358699.358703
7. Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.
8. Hoare, C. A. R. (1974). "Monitors: An Operating System Structuring Concept". *Communications of the ACM*, 17(10), 549-557. https://doi.org/10.1145/355620.361161
9. Mohan, C., Haderle, D., Lindsay, B., Pirahesh, H., & Schwarz, P. (1992). "ARIES: A Transaction Recovery Method Supporting Fine-Granularity Locking and Partial Rollbacks Using Write-Ahead Logging". *ACM Transactions on Database Systems*, 17(1), 94-162. https://doi.org/10.1145/128765.128770
10. O'Neil, E. J., O'Neil, P. E., & Weikum, G. (1993). "The LRU-K Page Replacement Algorithm for Database Disk Buffering". *ACM SIGMOD Record*, 22(2), 297-306. https://doi.org/10.1145/170036.170081

---

*This document reflects the buffer pool implementation in CitrineDB as of January 2026.*
