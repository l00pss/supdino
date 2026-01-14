---
sidebar_label: Slotted Page
sidebar_position: 2
draft: false
format: md
---

# Slotted Page Architecture: A Deep Dive into Database Page Internals

## Abstract

This document provides a comprehensive technical analysis of the slotted page architecture implemented in CitrineDB. The slotted page format is a fundamental data structure used in modern database systems to efficiently store variable-length records within fixed-size pages. We examine the page layout, header structure, slot directory mechanism, and the algorithms that govern record insertion, deletion, and compaction.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Page Overview](#2-page-overview)
3. [Page Header Structure](#3-page-header-structure)
4. [Slot Directory](#4-slot-directory)
5. [Record Storage](#5-record-storage)
6. [Space Management](#6-space-management)
7. [Core Algorithms](#7-core-algorithms)
8. [Indirection and Record Identification](#8-indirection-and-record-identification)
9. [Fragmentation and Compaction](#9-fragmentation-and-compaction)
10. [Implementation Details](#10-implementation-details)
11. [Conclusion](#11-conclusion)

---

## 1. Introduction

### 1.1 The Problem

Database systems face a fundamental challenge: **variable-length records must be stored in fixed-size pages**. Records in a database table can vary significantly in size due to:

- Variable-length string fields (VARCHAR, TEXT)
- Nullable columns
- Different data types with varying storage requirements

However, disk I/O operates most efficiently with fixed-size blocks (typically 4KB or 8KB), aligned with the operating system's virtual memory page size.

### 1.2 The Solution: Slotted Pages

The **slotted page** format (also known as **slot directory** or **variable-length record page**) elegantly solves this problem by introducing an indirection layer between record identifiers and physical record locations.

Key properties:
- Fixed page size (4096 bytes in CitrineDB)
- Variable-length records within the page
- Stable record identifiers (RID) that survive record movement
- Efficient space reclamation through compaction

---

## 2. Page Overview

### 2.1 High-Level Structure

A slotted page consists of three distinct regions that grow toward each other:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PAGE LAYOUT (4096 bytes)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │  ┌──────────┬────────────────┬─────────────────┬────────────────┐  │   │
│   │  │  HEADER  │ SLOT DIRECTORY │   FREE SPACE    │  RECORD DATA   │  │   │
│   │  │  (32B)   │  (grows →)     │                 │    (← grows)   │  │   │
│   │  └──────────┴────────────────┴─────────────────┴────────────────┘  │   │
│   │                                                                     │   │
│   │  Byte 0     Byte 32          Variable          Variable    Byte 4096│   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Direction of growth:                                                       │
│   • Slot directory: grows from left to right (low → high addresses)        │
│   • Record data: grows from right to left (high → low addresses)           │
│   • Free space: shrinks from both ends                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Design Rationale

The opposing growth directions serve a critical purpose:

1. **Slot directory** starts immediately after the header and grows toward higher addresses as new records are added
2. **Record data** starts at the end of the page and grows toward lower addresses
3. **Free space** exists between them and shrinks as content is added

This design allows:
- Maximum flexibility in record sizes
- No pre-allocation of slot or record regions
- Natural boundary detection (collision = page full)

---

## 3. Page Header Structure

### 3.1 Header Layout

The page header occupies the first 32 bytes and contains metadata essential for page management:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PAGE HEADER (32 bytes)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Offset   Size    Field           Description                               │
│  ─────────────────────────────────────────────────────────────────────────  │
│    0       4      PageID          Unique page identifier (uint32)           │
│    4       1      PageType        Page type enumeration (uint8)             │
│    5       1      Flags           Reserved for future use (uint8)           │
│    6       2      SlotCount       Number of slots in directory (uint16)     │
│    8       2      FreeSpacePtr    Offset where free space ends (uint16)     │
│   10       2      FreeSpace       Available free space in bytes (uint16)    │
│   12       8      LSN             Log Sequence Number for WAL (uint64)      │
│   20       4      Checksum        Data integrity checksum (uint32)          │
│   24       4      NextPageID      Next page in chain (uint32)               │
│   28       4      PrevPageID      Previous page in chain (uint32)           │
│  ─────────────────────────────────────────────────────────────────────────  │
│   Total: 32 bytes                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Binary Layout Visualization

```
Byte:   0   1   2   3   4   5   6   7   8   9  10  11  12  ...  20  ...  24  ...  28  ... 32
        ├───────────┼───┼───┼───────┼───────┼───────┼───────────┼───────┼───────┼───────┤
        │  PageID   │ T │ F │SlotCnt│FreePtr│FreeSpc│    LSN    │Chksum │NextPg │PrevPg │
        │  (4B)     │(1)│(1)│ (2B)  │ (2B)  │ (2B)  │   (8B)    │ (4B)  │ (4B)  │ (4B)  │
        └───────────┴───┴───┴───────┴───────┴───────┴───────────┴───────┴───────┴───────┘
                      │   │
                      │   └── Flags (reserved)
                      └────── PageType (Data=1, Index=2, Overflow=3, Free=4, Meta=5)
```

### 3.3 Key Header Fields Explained

#### SlotCount
The total number of slots in the slot directory, including deleted (tombstone) slots. This value only increases during normal operation; it decreases only during page reorganization.

#### FreeSpacePtr
Points to the end of free space (equivalently, the beginning of record data). New records are inserted immediately before this pointer.

```
FreeSpacePtr = PageSize - Σ(RecordLength_i)
```

#### FreeSpace
The total available space for new records and slots:

```
FreeSpace = FreeSpacePtr - HeaderSize - (SlotCount × SlotSize)
```

---

## 4. Slot Directory

### 4.1 Slot Entry Structure

Each slot entry is exactly 4 bytes and contains:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SLOT ENTRY (4 bytes)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌────────────────────────────┬────────────────────────────┐               │
│   │        Offset              │         Length             │               │
│   │       (2 bytes)            │        (2 bytes)           │               │
│   │     uint16 LE              │       uint16 LE            │               │
│   └────────────────────────────┴────────────────────────────┘               │
│                                                                             │
│   Offset: Byte position of record within the page                           │
│   Length: Size of the record in bytes                                       │
│                                                                             │
│   Special case - Tombstone (deleted record):                                │
│   Offset = 0 AND Length = 0                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Slot Directory Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SLOT DIRECTORY IN PAGE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Byte:    32        36        40        44        48                       │
│            │         │         │         │         │                        │
│            ▼         ▼         ▼         ▼         ▼                        │
│            ┌─────────┬─────────┬─────────┬─────────┬─────────               │
│            │  Slot0  │  Slot1  │  Slot2  │  Slot3  │   ...                  │
│            │ off|len │ off|len │ off|len │ off|len │                        │
│            └─────────┴─────────┴─────────┴─────────┴─────────               │
│               │  │                                                          │
│               │  └── Length (2 bytes)                                       │
│               └───── Offset (2 bytes)                                       │
│                                                                             │
│   SlotID Calculation:                                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  slotOffset = HeaderSize + (SlotID × SlotSize)                      │   │
│   │             = 32 + (SlotID × 4)                                     │   │
│   │                                                                     │   │
│   │  SlotID = (slotOffset - HeaderSize) / SlotSize                      │   │
│   │         = (slotOffset - 32) / 4                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Note: SlotID is NOT stored explicitly - it is the array index!           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 SlotID: Implicit Identification

A crucial design decision: **SlotID is never stored**. It is derived from the slot's position in the directory:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      IMPLICIT SLOTID DERIVATION                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Memory Layout:                                                            │
│                                                                             │
│   p.data[32:36]  →  SlotID = 0   (32 - 32) / 4 = 0                         │
│   p.data[36:40]  →  SlotID = 1   (36 - 32) / 4 = 1                         │
│   p.data[40:44]  →  SlotID = 2   (40 - 32) / 4 = 2                         │
│   p.data[44:48]  →  SlotID = 3   (44 - 32) / 4 = 3                         │
│                                                                             │
│   This is analogous to array indexing:                                      │
│   arr[0], arr[1], arr[2]... the index is not stored in the element!        │
│                                                                             │
│   Benefits:                                                                  │
│   • Zero storage overhead for SlotID                                        │
│   • O(1) slot lookup                                                        │
│   • Stable identifiers (position never changes)                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Record Storage

### 5.1 Record Placement

Records are stored at the end of the page, growing toward lower addresses:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RECORD STORAGE LAYOUT                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Page (4096 bytes):                                                        │
│                                                                             │
│   Byte: 0      32                           4060    4080       4096         │
│         │      │                            │       │          │            │
│         ▼      ▼                            ▼       ▼          ▼            │
│         ┌──────┬──────────┬─────────────────┬───────┬──────────┐           │
│         │HEADER│  SLOTS   │   FREE SPACE    │Record1│ Record0  │           │
│         │ 32B  │ S0 S1 S2 │                 │ 20B   │   16B    │           │
│         └──────┴──────────┴─────────────────┴───────┴──────────┘           │
│                                              │       │          │           │
│                                              │       │          │           │
│                                        FreeSpacePtr  │      PageEnd         │
│                                           (4060)     │                      │
│                                                      │                      │
│   Record insertion order:                            │                      │
│   1. Record0 inserted at offset 4080 (4096-16)       │                      │
│   2. Record1 inserted at offset 4060 (4080-20)  ◄────┘                      │
│   3. Next record will start at 4060 - recordLen                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Slot-to-Record Mapping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SLOT TO RECORD MAPPING                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Slot Directory              Record Data Area                              │
│   ─────────────              ─────────────────                              │
│                                                                             │
│   Slot0 [4080|16] ─────────────────────────────────────────────────┐        │
│   Slot1 [4060|20] ─────────────────────────────────────┐           │        │
│   Slot2 [0|0]     (tombstone - deleted)                │           │        │
│   Slot3 [4040|12] ─────────────────────────┐           │           │        │
│                                            │           │           │        │
│                                            ▼           ▼           ▼        │
│   ┌──────┬────────┬────────────────┬───────┬───────────┬───────────┐       │
│   │HEADER│ SLOTS  │   FREE SPACE   │Rec 3  │  Rec 1    │  Rec 0    │       │
│   │      │        │                │ 12B   │   20B     │   16B     │       │
│   └──────┴────────┴────────────────┴───────┴───────────┴───────────┘       │
│                                     4040    4060        4080       4096     │
│                                                                             │
│   Note: Record physical order ≠ SlotID order                                │
│   Records are placed in insertion order (newest at lower offset)            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Space Management

### 6.1 Free Space Calculation

The available free space is tracked in real-time:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FREE SPACE CALCULATION                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │  FreeSpace = FreeSpacePtr - (HeaderSize + SlotCount × SlotSize)    │   │
│   │                                                                     │   │
│   │  Example:                                                           │   │
│   │  • FreeSpacePtr = 4040                                             │   │
│   │  • HeaderSize = 32                                                  │   │
│   │  • SlotCount = 4                                                    │   │
│   │  • SlotSize = 4                                                     │   │
│   │                                                                     │   │
│   │  FreeSpace = 4040 - (32 + 4×4)                                     │   │
│   │            = 4040 - 48                                              │   │
│   │            = 3992 bytes                                             │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Visual:                                                                   │
│                                                                             │
│   0          32    48                       4040                    4096    │
│   │          │     │                        │                       │       │
│   ▼          ▼     ▼                        ▼                       ▼       │
│   ┌──────────┬─────┬────────────────────────┬───────────────────────┐      │
│   │  HEADER  │SLOTS│      FREE SPACE        │      RECORDS          │      │
│   │   32B    │ 16B │       3992B            │        56B            │      │
│   └──────────┴─────┴────────────────────────┴───────────────────────┘      │
│                    │◄────────────────────────│                              │
│                          FreeSpace                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Page Full Detection

A page is considered full when:

```
RequiredSpace > FreeSpace
```

Where:

```
RequiredSpace = RecordLength + SlotSize
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PAGE FULL CONDITION                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Attempting to insert a 100-byte record:                                   │
│                                                                             │
│   RequiredSpace = 100 (record) + 4 (new slot) = 104 bytes                   │
│                                                                             │
│   Case 1: FreeSpace = 200 bytes                                             │
│           104 ≤ 200  ✓  Insert succeeds                                     │
│                                                                             │
│   Case 2: FreeSpace = 50 bytes                                              │
│           104 > 50   ✗  ErrPageFull returned                                │
│                                                                             │
│   Critical insight: We need space for BOTH the record AND its slot!        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Core Algorithms

### 7.1 Record Insertion

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INSERT ALGORITHM                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Input: record []byte                                                       │
│   Output: SlotID, error                                                      │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  1. Calculate required space                                        │   │
│   │     requiredSpace = len(record) + SlotSize                          │   │
│   │                                                                     │   │
│   │  2. Check available space                                           │   │
│   │     if requiredSpace > FreeSpace:                                   │   │
│   │         return error "page full"                                    │   │
│   │                                                                     │   │
│   │  3. Calculate new record position                                   │   │
│   │     newOffset = FreeSpacePtr - len(record)                          │   │
│   │                                                                     │   │
│   │  4. Copy record data to page                                        │   │
│   │     copy(page.data[newOffset:], record)                             │   │
│   │                                                                     │   │
│   │  5. Create new slot entry                                           │   │
│   │     newSlotID = SlotCount                                           │   │
│   │     setSlot(newSlotID, newOffset, len(record))                      │   │
│   │                                                                     │   │
│   │  6. Update header                                                   │   │
│   │     SlotCount++                                                     │   │
│   │     FreeSpacePtr = newOffset                                        │   │
│   │     FreeSpace -= requiredSpace                                      │   │
│   │                                                                     │   │
│   │  7. Mark page dirty                                                 │   │
│   │     dirty = true                                                    │   │
│   │                                                                     │   │
│   │  8. Return newSlotID                                                │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Visual Example:**

```
BEFORE Insert("Hello World" - 11 bytes):

   0      32   36                        4070         4096
   │      │    │                         │            │
   ▼      ▼    ▼                         ▼            ▼
   ┌──────┬────┬─────────────────────────┬────────────┐
   │HEADER│ S0 │       FREE SPACE        │  Record0   │
   │      │    │       (4034 bytes)      │   (26B)    │
   └──────┴────┴─────────────────────────┴────────────┘
                                         ▲
                                    FreeSpacePtr


AFTER Insert("Hello World"):

   0      32   36   40                   4059  4070   4096
   │      │    │    │                    │     │      │
   ▼      ▼    ▼    ▼                    ▼     ▼      ▼
   ┌──────┬────┬────┬────────────────────┬─────┬──────┐
   │HEADER│ S0 │ S1 │    FREE SPACE      │ R1  │  R0  │
   │      │    │    │    (4019 bytes)    │ 11B │ 26B  │
   └──────┴────┴────┴────────────────────┴─────┴──────┘
                                         ▲
                                    FreeSpacePtr
   
   Changes:
   • S1 created: [offset=4059, length=11]
   • FreeSpacePtr: 4070 → 4059
   • FreeSpace: 4034 → 4019 (reduced by 11+4=15)
   • SlotCount: 1 → 2
```

### 7.2 Record Retrieval

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GET ALGORITHM                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Input: slotID                                                              │
│   Output: record []byte, error                                               │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  1. Validate slotID                                                 │   │
│   │     if slotID >= SlotCount:                                         │   │
│   │         return error "invalid slot"                                 │   │
│   │                                                                     │   │
│   │  2. Read slot entry                                                 │   │
│   │     slotOffset = HeaderSize + slotID × SlotSize                     │   │
│   │     offset = readUint16(page.data[slotOffset:])                     │   │
│   │     length = readUint16(page.data[slotOffset+2:])                   │   │
│   │                                                                     │   │
│   │  3. Check for tombstone                                             │   │
│   │     if offset == 0 AND length == 0:                                 │   │
│   │         return error "slot deleted"                                 │   │
│   │                                                                     │   │
│   │  4. Extract and return record                                       │   │
│   │     record = copy(page.data[offset : offset+length])                │   │
│   │     return record                                                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Time Complexity: O(1)                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Record Deletion

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DELETE ALGORITHM                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Input: slotID                                                              │
│   Output: error                                                              │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  1. Validate and get slot                                           │   │
│   │     offset, length, err = getSlot(slotID)                           │   │
│   │     if err: return err                                              │   │
│   │                                                                     │   │
│   │  2. Mark slot as tombstone                                          │   │
│   │     setSlot(slotID, 0, 0)                                           │   │
│   │                                                                     │   │
│   │  3. Update free space counter                                       │   │
│   │     FreeSpace += length                                             │   │
│   │     (Note: This counts logical free space, not contiguous)          │   │
│   │                                                                     │   │
│   │  4. Mark page dirty                                                 │   │
│   │     dirty = true                                                    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   IMPORTANT: The record data is NOT erased!                                  │
│   • Only the slot is marked as deleted (tombstone)                          │
│   • Record bytes remain until compaction                                    │
│   • This is a logical delete, not physical                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Visual Example:**

```
BEFORE Delete(SlotID=1):

   Slot0 [4080|16] → Record0
   Slot1 [4060|20] → Record1
   Slot2 [4040|12] → Record2


AFTER Delete(SlotID=1):

   Slot0 [4080|16] → Record0
   Slot1 [0|0]     → TOMBSTONE (deleted)
   Slot2 [4040|12] → Record2

   Page data:
   ┌──────┬─────────────┬─────┬─────┬─────┬─────┐
   │HEADER│    SLOTS    │FREE │ R2  │ R1  │ R0  │
   │      │ S0  S1  S2  │     │     │DEAD │     │
   └──────┴─────────────┴─────┴─────┴─────┴─────┘
                                    ▲
                              Still exists but
                              inaccessible (orphaned)
```

---

## 8. Indirection and Record Identification

### 8.1 Record ID (RID)

Every record in the database is identified by a **Record ID (RID)**:

```
RID = (PageID, SlotID)
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RECORD ID (RID)                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   RID Structure:                                                            │
│   ┌────────────────────┬────────────────────┐                               │
│   │      PageID        │       SlotID       │                               │
│   │     (4 bytes)      │      (2 bytes)     │                               │
│   └────────────────────┴────────────────────┘                               │
│                                                                             │
│   Example: RID(5, 3)                                                        │
│   • PageID = 5  → Go to page 5                                              │
│   • SlotID = 3  → Read slot 3 to get offset/length                          │
│   • Fetch record from offset                                                │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │   RID(5, 3)                                                         │   │
│   │      │                                                              │   │
│   │      ▼                                                              │   │
│   │   Page 5                                                            │   │
│   │   ┌──────┬─────────────────────┬───────────────────────────────┐   │   │
│   │   │HEADER│ S0  S1  S2  S3  ... │  ...  R3  R2  R1  R0          │   │   │
│   │   └──────┴──────────│──────────┴───────│───────────────────────┘   │   │
│   │                     │                  │                            │   │
│   │                     └───offset/length──┘                            │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Why Indirection Matters

The slot acts as an **indirection layer**, providing stability:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     INDIRECTION BENEFITS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Without Indirection (Direct Addressing):                                  │
│   ──────────────────────────────────────                                    │
│   RID = (PageID, ByteOffset)                                                │
│                                                                             │
│   Problem: If record moves (update/compaction), RID becomes invalid!        │
│   • All indexes pointing to this record break                               │
│   • All foreign keys become dangling pointers                               │
│                                                                             │
│                                                                             │
│   With Indirection (Slot-based):                                            │
│   ─────────────────────────────                                             │
│   RID = (PageID, SlotID)                                                    │
│                                                                             │
│   Solution: Record can move freely within the page                          │
│   • SlotID never changes                                                    │
│   • Only slot's offset field is updated                                     │
│   • All external references remain valid                                    │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │   Index Entry: "John" → RID(5, 3)                                   │   │
│   │                              │                                      │   │
│   │                              │ (never changes)                      │   │
│   │                              ▼                                      │   │
│   │   Page 5, Slot 3: [offset=4020, length=50]                          │   │
│   │                        │                                            │   │
│   │                        │ (can change during compaction)             │   │
│   │                        ▼                                            │   │
│   │   Record data at offset 4020                                        │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Fragmentation and Compaction

### 9.1 How Fragmentation Occurs

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FRAGMENTATION EXAMPLE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Initial state (3 records):                                                │
│   ┌──────┬─────────────┬────────────┬─────┬─────┬─────┐                    │
│   │HEADER│ S0  S1  S2  │    FREE    │ R2  │ R1  │ R0  │                    │
│   │      │             │   3950B    │ 30B │ 40B │ 20B │                    │
│   └──────┴─────────────┴────────────┴─────┴─────┴─────┘                    │
│                                                                             │
│   After Delete(SlotID=1):                                                   │
│   ┌──────┬─────────────┬────────────┬─────┬─────┬─────┐                    │
│   │HEADER│ S0  S1  S2  │    FREE    │ R2  │(R1) │ R0  │                    │
│   │      │    [0|0]    │   3990B*   │ 30B │ 40B │ 20B │                    │
│   └──────┴─────────────┴────────────┴─────┴──│──┴─────┘                    │
│                                              │                              │
│                                         ORPHANED                            │
│                                         (40B wasted)                        │
│                                                                             │
│   * FreeSpace increased by 40B, but it's not contiguous!                    │
│                                                                             │
│   Problem: Trying to insert a 60-byte record                                │
│   • Logical FreeSpace = 3990B (enough!)                                     │
│   • Contiguous free = 3950B (not enough if we need 64B including slot)     │
│   • The 40B hole cannot be used                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Compaction Algorithm

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMPACTION ALGORITHM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  1. Collect all valid records                                       │   │
│   │     validRecords = []                                               │   │
│   │     for slotID = 0 to SlotCount-1:                                  │   │
│   │         if slot is not tombstone:                                   │   │
│   │             validRecords.append(\{slotID, recordData\})               │   │
│   │                                                                     │   │
│   │  2. Reset write pointer                                             │   │
│   │     FreeSpacePtr = PageSize (4096)                                  │   │
│   │                                                                     │   │
│   │  3. Rewrite records contiguously                                    │   │
│   │     for each record in validRecords:                                │   │
│   │         FreeSpacePtr -= len(record.data)                            │   │
│   │         copy(page.data[FreeSpacePtr:], record.data)                 │   │
│   │         setSlot(record.slotID, FreeSpacePtr, len(record.data))      │   │
│   │         // Note: slotID unchanged, only offset updated!             │   │
│   │                                                                     │   │
│   │  4. Recalculate free space                                          │   │
│   │     slotArrayEnd = HeaderSize + SlotCount × SlotSize                │   │
│   │     FreeSpace = FreeSpacePtr - slotArrayEnd                         │   │
│   │                                                                     │   │
│   │  5. Mark page dirty                                                 │   │
│   │     dirty = true                                                    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Visual Example:**

```
BEFORE Compaction:
                                              orphaned
   ┌──────┬─────────────┬────────────┬─────┬────│────┬─────┐
   │HEADER│ S0  S1  S2  │    FREE    │ R2  │ (R1)   │ R0  │
   │      │    [0|0]    │            │ 30B │  40B   │ 20B │
   └──────┴─────────────┴────────────┴─────┴────────┴─────┘
   
   Slot1 = [0|0] (tombstone)
   Contiguous free is smaller than logical free


AFTER Compaction:
   
   ┌──────┬─────────────┬────────────────────────┬─────┬─────┐
   │HEADER│ S0  S1  S2  │      FREE SPACE        │ R2  │ R0  │
   │      │    [0|0]    │      (3990 bytes)      │ 30B │ 20B │
   └──────┴─────────────┴────────────────────────┴─────┴─────┘
   
   Slot1 still [0|0] (tombstone preserved)
   Slot0 offset: updated to new position
   Slot2 offset: updated to new position
   
   All free space is now contiguous!
   RIDs unchanged - indexes still valid!
```

---

## 10. Implementation Details

### 10.1 Byte Order (Endianness)

CitrineDB uses **Little-Endian** byte order for all multi-byte integers:

```go
// Writing a uint16 value
binary.LittleEndian.PutUint16(p.data[offset:], value)

// Reading a uint16 value
value := binary.LittleEndian.Uint16(p.data[offset:])
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LITTLE-ENDIAN ENCODING                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Value: 0x1234 (4660 decimal)                                              │
│                                                                             │
│   Little-Endian:  [0x34] [0x12]   ← Low byte first                         │
│                    byte0  byte1                                             │
│                                                                             │
│   Big-Endian:     [0x12] [0x34]   ← High byte first                        │
│                    byte0  byte1                                             │
│                                                                             │
│   Why Little-Endian?                                                        │
│   • x86/x64 processors are Little-Endian                                    │
│   • Direct memory mapping possible                                          │
│   • Most databases (SQLite, PostgreSQL) use Little-Endian                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Thread Safety

The Page implementation uses `sync.RWMutex` for concurrent access:

```go
type Page struct {
    mu       sync.RWMutex  // Protects all fields
    id       PageID
    pageType PageType
    data     []byte
    dirty    bool
    pinCount int
}

// Read operations use RLock (multiple readers allowed)
func (p *Page) Get(slotID SlotID) ([]byte, error) {
    p.mu.RLock()
    defer p.mu.RUnlock()
    // ...
}

// Write operations use Lock (exclusive access)
func (p *Page) Insert(record []byte) (SlotID, error) {
    p.mu.Lock()
    defer p.mu.Unlock()
    // ...
}
```

### 10.3 Constants and Limits

```go
const (
    DefaultPageSize = 4096                              // 4KB
    HeaderSize      = 32                                // bytes
    SlotSize        = 4                                 // bytes
    MaxRecordSize   = DefaultPageSize - HeaderSize - SlotSize  // 4060 bytes
)
```

**Maximum Capacity Analysis:**

```
Max Records = (PageSize - HeaderSize) / (MinRecordSize + SlotSize)
```

For minimum record size of 1 byte:

```
Max Records = (4096 - 32) / (1 + 4) = 4064 / 5 = 812 records
```

---

## 11. Conclusion

### 11.1 Summary

The slotted page architecture provides an elegant solution to the variable-length record storage problem:

| Feature | Benefit |
|---------|---------|
| Fixed page size | Efficient disk I/O |
| Variable records | Flexible data storage |
| Slot indirection | Stable record identifiers |
| Tombstone deletion | O(1) delete, no data movement |
| Compaction | Space reclamation without RID changes |

### 11.2 Trade-offs

| Advantage | Disadvantage |
|-----------|--------------|
| O(1) record access | 4-byte overhead per record (slot) |
| Stable RIDs | Fragmentation accumulates |
| Simple implementation | Compaction requires page lock |
| In-page record movement | Max record size limited to page size |

### 11.3 References

1. Ramakrishnan, R., & Gehrke, J. (2003). *Database Management Systems* (3rd ed.). McGraw-Hill.
2. Graefe, G. (2011). Modern B-Tree Techniques. *Foundations and Trends in Databases*, 3(4), 203-402.
3. SQLite File Format Documentation. https://www.sqlite.org/fileformat.html

---

*Document Version: 1.0*  
*Last Updated: January 2026*  
*CitrineDB Storage Engine Documentation*
