---
title: Byte Ordering and Endianness
description: A comprehensive technical analysis of byte ordering in computer systems - understanding Little-Endian and Big-Endian representations for multi-byte data storage and transmission.
sidebar_label: Byte Ordering
sidebar_position: 3
keywords: [endianness, little-endian, big-endian, byte-order, binary-data]
reading_time: 25
last_update:
  date: 2026-01-14
draft: false
format: md
---

# Byte Ordering and Endianness: A Deep Dive into Binary Data Representation

## Abstract

This document provides a comprehensive technical analysis of byte ordering (endianness) in computer systems. Endianness determines how multi-byte data types are stored in memory and transmitted across networks. We examine the fundamental concepts, historical context, practical implications, and implementation strategies for handling byte order in storage systems and network protocols.

---

## 1. Introduction

### 1.1 The Problem

When storing or transmitting multi-byte values (integers larger than 8 bits, floating-point numbers, etc.), a fundamental question arises: **In what order should the individual bytes be arranged?**

Consider a 16-bit integer value `0x1234`. This value consists of two bytes:
- `0x12` - the most significant byte (MSB)
- `0x34` - the least significant byte (LSB)

When writing these bytes to consecutive memory addresses, which byte should come first?

### 1.2 The Two Schools of Thought

Computer architects have historically disagreed on this question, leading to two dominant conventions:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TWO BYTE ORDERING CONVENTIONS                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Value: 0x1234 (decimal: 4660)                                            │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │   LITTLE-ENDIAN ("Little End First")                               │   │
│   │   ────────────────────────────────────                              │   │
│   │   Memory:  [Address N] [Address N+1]                               │   │
│   │            [  0x34   ] [   0x12    ]                                │   │
│   │               LSB         MSB                                       │   │
│   │                                                                     │   │
│   │   "The little end (least significant) comes first"                 │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │   BIG-ENDIAN ("Big End First")                                     │   │
│   │   ──────────────────────────────                                    │   │
│   │   Memory:  [Address N] [Address N+1]                               │   │
│   │            [  0x12   ] [   0x34    ]                                │   │
│   │               MSB         LSB                                       │   │
│   │                                                                     │   │
│   │   "The big end (most significant) comes first"                     │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Etymology: Gulliver's Travels

The terms "Little-Endian" and "Big-Endian" were coined by Danny Cohen in his 1980 paper "On Holy Wars and a Plea for Peace" (IEN 137). The names reference Jonathan Swift's satirical novel "Gulliver's Travels" (1726), where two factions wage war over which end of a boiled egg should be cracked first—the little end or the big end.

Cohen used this allegory to highlight the arbitrary nature of the byte order debate, noting that neither approach is inherently superior; the choice is largely a matter of convention.

---

## 2. Fundamental Concepts

### 2.1 Bits, Bytes, and Words

Before diving deeper, let's establish terminology:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA SIZE TERMINOLOGY                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Unit          Size        Range (Unsigned)         Example                │
│   ─────────────────────────────────────────────────────────────────────     │
│   Bit           1 bit       0 to 1                   1                      │
│   Nibble        4 bits      0 to 15                  0xF                    │
│   Byte          8 bits      0 to 255                 0xFF                   │
│   Word          16 bits     0 to 65,535              0xFFFF                 │
│   Double Word   32 bits     0 to 4,294,967,295       0xFFFFFFFF             │
│   Quad Word     64 bits     0 to 18.4 × 10^18        0xFFFFFFFFFFFFFFFF     │
│                                                                             │
│   Note: "Word" size is architecture-dependent. The above reflects           │
│   traditional x86 terminology.                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Significance and Position

In positional number systems, each digit has a **weight** based on its position:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      POSITIONAL SIGNIFICANCE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Decimal Example: 1234                                                     │
│   ──────────────────────                                                    │
│                                                                             │
│   Position:    3      2      1      0                                       │
│   Digit:       1      2      3      4                                       │
│   Weight:    10³    10²    10¹    10⁰                                       │
│   Value:    1000    200     30      4                                       │
│                └──────┴──────┴──────┘                                       │
│                    Sum = 1234                                               │
│                                                                             │
│   The leftmost digit (1) is MOST SIGNIFICANT                               │
│   The rightmost digit (4) is LEAST SIGNIFICANT                             │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   Hexadecimal Example: 0x1234 (4660 decimal)                               │
│   ──────────────────────────────────────────                                │
│                                                                             │
│   Position:    3      2      1      0                                       │
│   Digit:       1      2      3      4                                       │
│   Weight:    16³    16²    16¹    16⁰                                       │
│   Value:    4096    512     48      4                                       │
│                └──────┴──────┴──────┘                                       │
│                    Sum = 4660                                               │
│                                                                             │
│   Bytes: [0x12] = MSB (Most Significant Byte)                              │
│          [0x34] = LSB (Least Significant Byte)                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Memory Addressing

Memory is organized as a sequence of bytes, each with a unique address:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MEMORY ORGANIZATION                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Address:   0x1000  0x1001  0x1002  0x1003  0x1004  0x1005  0x1006        │
│              ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐            │
│   Memory:    │      │      │      │      │      │      │      │            │
│              └──────┴──────┴──────┴──────┴──────┴──────┴──────┘            │
│                 ▲                                                           │
│                 │                                                           │
│              Lower                                              Higher      │
│              Address                                            Address     │
│                                                                             │
│   Key principle: Addresses increase from left to right                      │
│   The "base address" of multi-byte data is the LOWEST address              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Little-Endian Byte Order

### 3.1 Definition

In **Little-Endian** byte order, the **least significant byte (LSB)** is stored at the **lowest memory address**. The bytes are arranged from "little end" to "big end" as addresses increase.

### 3.2 Visual Representation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      LITTLE-ENDIAN BYTE ORDER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   16-bit value: 0x1234                                                      │
│   ─────────────────────                                                     │
│                                                                             │
│   Logical view:     [0x12][0x34]                                           │
│                       MSB   LSB                                             │
│                                                                             │
│   Memory layout:                                                            │
│   Address:      0x1000    0x1001                                           │
│                 ┌────────┬────────┐                                         │
│   Content:      │  0x34  │  0x12  │                                         │
│                 └────────┴────────┘                                         │
│                    LSB      MSB                                             │
│                    ▲                                                        │
│                    │                                                        │
│                 Base address points to LSB                                  │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   32-bit value: 0x12345678                                                  │
│   ─────────────────────────                                                 │
│                                                                             │
│   Logical view:     [0x12][0x34][0x56][0x78]                               │
│                       MSB              LSB                                  │
│                                                                             │
│   Memory layout:                                                            │
│   Address:      0x1000    0x1001    0x1002    0x1003                       │
│                 ┌────────┬────────┬────────┬────────┐                       │
│   Content:      │  0x78  │  0x56  │  0x34  │  0x12  │                       │
│                 └────────┴────────┴────────┴────────┘                       │
│                    LSB                        MSB                           │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   64-bit value: 0x0102030405060708                                         │
│   ─────────────────────────────────                                         │
│                                                                             │
│   Memory layout:                                                            │
│   Address:     +0     +1     +2     +3     +4     +5     +6     +7         │
│               ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐    │
│   Content:    │ 0x08 │ 0x07 │ 0x06 │ 0x05 │ 0x04 │ 0x03 │ 0x02 │ 0x01 │    │
│               └──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘    │
│                 LSB                                              MSB       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Decimal Example

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LITTLE-ENDIAN DECIMAL EXAMPLE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Value: 258 (decimal)                                                      │
│                                                                             │
│   Step 1: Convert to hexadecimal                                            │
│   258 = 256 + 2 = 1×256 + 2×1 = 0x0102                                     │
│                                                                             │
│   Step 2: Identify bytes                                                    │
│   0x0102 → [0x01] [0x02]                                                   │
│              MSB    LSB                                                     │
│            (=1)   (=2)                                                      │
│                                                                             │
│   Step 3: Store in Little-Endian order                                      │
│   Address:      0x1000    0x1001                                           │
│                 ┌────────┬────────┐                                         │
│   Content:      │  0x02  │  0x01  │                                         │
│                 └────────┴────────┘                                         │
│                    LSB      MSB                                             │
│                   (=2)     (=1)                                             │
│                                                                             │
│   Verification: Read from memory                                            │
│   value = byte[0] + byte[1] × 256                                          │
│         = 2 + 1 × 256                                                       │
│         = 2 + 256                                                           │
│         = 258 ✓                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Systems Using Little-Endian

| Architecture/System | Notes |
|---------------------|-------|
| Intel x86/x86-64 | All modern PCs and servers |
| AMD64 | Compatible with Intel |
| ARM (most modes) | Default mode for most ARM chips |
| RISC-V | Officially little-endian |
| VAX | Historical DEC systems |
| Windows | Operating system convention |
| Linux (x86) | Following hardware |

---

## 4. Big-Endian Byte Order

### 4.1 Definition

In **Big-Endian** byte order, the **most significant byte (MSB)** is stored at the **lowest memory address**. The bytes are arranged from "big end" to "little end" as addresses increase.

### 4.2 Visual Representation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BIG-ENDIAN BYTE ORDER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   16-bit value: 0x1234                                                      │
│   ─────────────────────                                                     │
│                                                                             │
│   Logical view:     [0x12][0x34]                                           │
│                       MSB   LSB                                             │
│                                                                             │
│   Memory layout:                                                            │
│   Address:      0x1000    0x1001                                           │
│                 ┌────────┬────────┐                                         │
│   Content:      │  0x12  │  0x34  │                                         │
│                 └────────┴────────┘                                         │
│                    MSB      LSB                                             │
│                    ▲                                                        │
│                    │                                                        │
│                 Base address points to MSB                                  │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   32-bit value: 0x12345678                                                  │
│   ─────────────────────────                                                 │
│                                                                             │
│   Logical view:     [0x12][0x34][0x56][0x78]                               │
│                       MSB              LSB                                  │
│                                                                             │
│   Memory layout:                                                            │
│   Address:      0x1000    0x1001    0x1002    0x1003                       │
│                 ┌────────┬────────┬────────┬────────┐                       │
│   Content:      │  0x12  │  0x34  │  0x56  │  0x78  │                       │
│                 └────────┴────────┴────────┴────────┘                       │
│                    MSB                        LSB                           │
│                                                                             │
│   Note: Memory layout matches logical/written representation!              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Network Byte Order

Big-Endian is also known as **"Network Byte Order"** because it is the standard for network protocols:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NETWORK BYTE ORDER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Why Big-Endian for networks?                                              │
│   ────────────────────────────                                              │
│                                                                             │
│   1. Human readability: Bytes appear in "natural" reading order            │
│   2. Historical: Early network protocols used big-endian systems           │
│   3. Debugging: Packet dumps are easier to interpret                       │
│                                                                             │
│   Example: IP Address 192.168.1.1 as 32-bit integer                        │
│   ─────────────────────────────────────────────────                         │
│                                                                             │
│   Decimal octets: 192 . 168 . 1 . 1                                        │
│   Hex octets:     0xC0  0xA8  0x01  0x01                                   │
│   32-bit value:   0xC0A80101                                               │
│                                                                             │
│   Network transmission (Big-Endian):                                        │
│   Byte 0    Byte 1    Byte 2    Byte 3                                     │
│   ┌────────┬────────┬────────┬────────┐                                    │
│   │  0xC0  │  0xA8  │  0x01  │  0x01  │   → Transmitted first to last     │
│   └────────┴────────┴────────┴────────┘                                    │
│     (192)    (168)     (1)      (1)                                        │
│                                                                             │
│   Matches how we write and read IP addresses!                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Systems Using Big-Endian

| Architecture/System | Notes |
|---------------------|-------|
| Network protocols | TCP/IP, UDP, HTTP headers |
| Motorola 68000 | Classic Macintosh |
| IBM z/Architecture | Mainframes |
| SPARC (older) | Sun Microsystems |
| PowerPC (older) | Classic Mac, some game consoles |
| Java Virtual Machine | Platform-independent choice |
| JPEG, PNG, GIF | Image format headers |

---

## 5. Side-by-Side Comparison

### 5.1 Memory Layout Comparison

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ENDIANNESS COMPARISON                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Value: 0x12345678 (305,419,896 decimal)                                  │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │   LITTLE-ENDIAN (x86, ARM)                                         │   │
│   │   ─────────────────────────                                         │   │
│   │   Address:    +0       +1       +2       +3                        │   │
│   │              ┌────────┬────────┬────────┬────────┐                 │   │
│   │   Memory:    │  0x78  │  0x56  │  0x34  │  0x12  │                 │   │
│   │              └────────┴────────┴────────┴────────┘                 │   │
│   │                 LSB                        MSB                      │   │
│   │                                                                     │   │
│   │   Reading: Start at +0, value grows as address increases           │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │   BIG-ENDIAN (Network, Java)                                       │   │
│   │   ──────────────────────────                                        │   │
│   │   Address:    +0       +1       +2       +3                        │   │
│   │              ┌────────┬────────┬────────┬────────┐                 │   │
│   │   Memory:    │  0x12  │  0x34  │  0x56  │  0x78  │                 │   │
│   │              └────────┴────────┴────────┴────────┘                 │   │
│   │                 MSB                        LSB                      │   │
│   │                                                                     │   │
│   │   Reading: Bytes appear in "natural" written order                 │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Key Difference:                                                           │
│   • Little-Endian: [78][56][34][12]  (reversed)                           │
│   • Big-Endian:    [12][34][56][78]  (as written)                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Hexdump Comparison

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      HEXDUMP VISUALIZATION                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Writing uint32 value 0x01020304 to address 0x00:                         │
│                                                                             │
│   Little-Endian hexdump:                                                    │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Offset   00 01 02 03 04 05 06 07   ASCII                           │   │
│   │ 0x0000   04 03 02 01 .. .. .. ..   ....                            │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Big-Endian hexdump:                                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Offset   00 01 02 03 04 05 06 07   ASCII                           │   │
│   │ 0x0000   01 02 03 04 .. .. .. ..   ....                            │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Observation: Big-Endian hexdump matches human intuition                   │
│   (01 02 03 04 reads like "one two three four")                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Practical Implications

### 6.1 Data Exchange Problems

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DATA EXCHANGE PROBLEM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Scenario: Transferring integer 258 between systems                        │
│                                                                             │
│   System A (Little-Endian) writes to file:                                  │
│   ┌────────┬────────┐                                                       │
│   │  0x02  │  0x01  │                                                       │
│   └────────┴────────┘                                                       │
│   Intended value: 258                                                       │
│                                                                             │
│   System B (Big-Endian) reads same bytes:                                   │
│   ┌────────┬────────┐                                                       │
│   │  0x02  │  0x01  │   → Interprets as: 0x0201 = 513                      │
│   └────────┴────────┘                                                       │
│   Read value: 513  ← WRONG!                                                 │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   The Corruption:                                                           │
│                                                                             │
│   Original: 258 = 0x0102                                                    │
│   Received: 513 = 0x0201                                                    │
│                                                                             │
│   The bytes were swapped in interpretation!                                 │
│   258 ≠ 513 — Data corruption without explicit conversion                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Network Communication

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   NETWORK BYTE ORDER CONVERSION                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Little-Endian Host                    Big-Endian Network                  │
│   ────────────────────                  ──────────────────                  │
│                                                                             │
│   Application: value = 0x1234                                               │
│                                                                             │
│   Memory:     [0x34][0x12]                                                  │
│                  │                                                          │
│                  │ htons() / htonl()                                       │
│                  │ "host to network short/long"                            │
│                  ▼                                                          │
│   Send buffer: [0x12][0x34]  ─────────────────────────→ Network            │
│                                                              │              │
│                                                              │              │
│                                        ntohs() / ntohl()     │              │
│                                        "network to host"     │              │
│                                                              ▼              │
│   Receive buffer on Little-Endian host:                                    │
│   [0x12][0x34] → Converted back to [0x34][0x12] in memory                 │
│   value = 0x1234 ✓                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 File Format Considerations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   FILE FORMAT ENDIANNESS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Format              Endianness       Notes                                │
│   ─────────────────────────────────────────────────────────────────────     │
│   BMP                 Little           Windows-native                       │
│   JPEG                Big              Network byte order                   │
│   PNG                 Big              Network byte order                   │
│   GIF                 Little           Intel heritage                       │
│   TIFF                Both             Specified in header                  │
│   PDF                 Big              Specification requirement            │
│   ELF                 Both             Specified in header                  │
│   SQLite              Native           Platform-dependent (usually LE)      │
│   Protocol Buffers    Little           Google's choice                      │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   Best Practice: File formats should either:                                │
│   1. Specify a fixed endianness, OR                                         │
│   2. Include an endianness indicator in the header                          │
│                                                                             │
│   Example: TIFF header                                                      │
│   ┌─────────┬──────────────────────────────────────────────────────────┐   │
│   │ "II"    │ → Intel byte order (Little-Endian)                       │   │
│   │ "MM"    │ → Motorola byte order (Big-Endian)                       │   │
│   └─────────┴──────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Implementation in Go

### 7.1 The encoding/binary Package

Go provides the `encoding/binary` package for explicit byte order handling:

```go
package main

import (
    "encoding/binary"
    "fmt"
)

func main() {
    // Original value
    value := uint32(0x12345678)
    
    // Create buffers
    littleEndian := make([]byte, 4)
    bigEndian := make([]byte, 4)
    
    // Write with explicit byte order
    binary.LittleEndian.PutUint32(littleEndian, value)
    binary.BigEndian.PutUint32(bigEndian, value)
    
    fmt.Printf("Value: 0x%08X\n", value)
    fmt.Printf("Little-Endian: % X\n", littleEndian)
    fmt.Printf("Big-Endian:    % X\n", bigEndian)
    
    // Read back
    readLE := binary.LittleEndian.Uint32(littleEndian)
    readBE := binary.BigEndian.Uint32(bigEndian)
    
    fmt.Printf("Read LE: 0x%08X\n", readLE)
    fmt.Printf("Read BE: 0x%08X\n", readBE)
}

// Output:
// Value: 0x12345678
// Little-Endian: 78 56 34 12
// Big-Endian:    12 34 56 78
// Read LE: 0x12345678
// Read BE: 0x12345678
```

### 7.2 Available Functions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 GO BINARY PACKAGE FUNCTIONS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Reading Functions (decode bytes → integer):                               │
│   ─────────────────────────────────────────────                             │
│   binary.LittleEndian.Uint16(b []byte) uint16                              │
│   binary.LittleEndian.Uint32(b []byte) uint32                              │
│   binary.LittleEndian.Uint64(b []byte) uint64                              │
│                                                                             │
│   binary.BigEndian.Uint16(b []byte) uint16                                 │
│   binary.BigEndian.Uint32(b []byte) uint32                                 │
│   binary.BigEndian.Uint64(b []byte) uint64                                 │
│                                                                             │
│   Writing Functions (encode integer → bytes):                               │
│   ──────────────────────────────────────────────                            │
│   binary.LittleEndian.PutUint16(b []byte, v uint16)                        │
│   binary.LittleEndian.PutUint32(b []byte, v uint32)                        │
│   binary.LittleEndian.PutUint64(b []byte, v uint64)                        │
│                                                                             │
│   binary.BigEndian.PutUint16(b []byte, v uint16)                           │
│   binary.BigEndian.PutUint32(b []byte, v uint32)                           │
│   binary.BigEndian.PutUint64(b []byte, v uint64)                           │
│                                                                             │
│   Note: Slice must have sufficient capacity, no bounds checking!           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Practical Example: Page Header

```go
// Page header constants
const (
    offsetPageID       = 0   // 4 bytes
    offsetSlotCount    = 6   // 2 bytes
    offsetFreeSpacePtr = 8   // 2 bytes
    offsetFreeSpace    = 10  // 2 bytes
)

// Writing page header fields
func (p *Page) initialize() {
    // Write PageID (uint32) at offset 0
    binary.LittleEndian.PutUint32(p.data[offsetPageID:], uint32(p.id))
    
    // Write SlotCount (uint16) at offset 6
    binary.LittleEndian.PutUint16(p.data[offsetSlotCount:], 0)
    
    // Write FreeSpacePtr (uint16) at offset 8
    binary.LittleEndian.PutUint16(p.data[offsetFreeSpacePtr:], uint16(len(p.data)))
    
    // Write FreeSpace (uint16) at offset 10
    binary.LittleEndian.PutUint16(p.data[offsetFreeSpace:], uint16(len(p.data)-HeaderSize))
}

// Reading page header fields
func (p *Page) SlotCount() uint16 {
    return binary.LittleEndian.Uint16(p.data[offsetSlotCount:])
}

func (p *Page) FreeSpace() uint16 {
    return binary.LittleEndian.Uint16(p.data[offsetFreeSpace:])
}
```

### 7.4 Memory Layout Visualization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              PAGE HEADER IN MEMORY (LITTLE-ENDIAN)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PageID = 258 (0x00000102)                                                 │
│   SlotCount = 3 (0x0003)                                                    │
│   FreeSpacePtr = 4096 (0x1000)                                             │
│   FreeSpace = 4000 (0x0FA0)                                                │
│                                                                             │
│   Byte:  0    1    2    3    4    5    6    7    8    9    10   11         │
│          │    │    │    │    │    │    │    │    │    │    │    │          │
│          ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼          │
│         ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐     │
│ Content │ 02 │ 01 │ 00 │ 00 │ .. │ .. │ 03 │ 00 │ 00 │ 10 │ A0 │ 0F │     │
│         └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘     │
│         │◄──────────────────│         │◄──────│◄──────────│◄──────────│    │
│              PageID                   SlotCnt  FreeSpPtr    FreeSpace      │
│            (0x00000102)               (0x0003) (0x1000)     (0x0FA0)       │
│                                                                             │
│   Note: Each multi-byte field has LSB at lower address                     │
│                                                                             │
│   PageID bytes: [02][01][00][00]                                           │
│                  ▲               ▲                                          │
│                  │               │                                          │
│               LSB=0x02       MSB=0x00                                       │
│                                                                             │
│   Reconstructing: 0x02 + 0x01×256 + 0x00×65536 + 0x00×16777216            │
│                 = 2 + 256 + 0 + 0 = 258 ✓                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Byte Swapping

### 8.1 Manual Byte Swapping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BYTE SWAPPING OPERATIONS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   16-bit swap:                                                              │
│   ────────────                                                              │
│   Original:    [A][B]                                                       │
│   Swapped:     [B][A]                                                       │
│                                                                             │
│   func swap16(x uint16) uint16 {                                           │
│       return (x << 8) | (x >> 8)                                           │
│   }                                                                         │
│                                                                             │
│   Example: 0x1234 → 0x3412                                                 │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   32-bit swap:                                                              │
│   ────────────                                                              │
│   Original:    [A][B][C][D]                                                 │
│   Swapped:     [D][C][B][A]                                                 │
│                                                                             │
│   func swap32(x uint32) uint32 {                                           │
│       return ((x & 0xFF000000) >> 24) |                                    │
│              ((x & 0x00FF0000) >> 8)  |                                    │
│              ((x & 0x0000FF00) << 8)  |                                    │
│              ((x & 0x000000FF) << 24)                                      │
│   }                                                                         │
│                                                                             │
│   Example: 0x12345678 → 0x78563412                                         │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   64-bit swap follows the same pattern with 8 bytes                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Efficient Conversion in Go

```go
import "math/bits"

// Modern Go provides optimized byte reversal
func convertEndianness32(value uint32) uint32 {
    return bits.ReverseBytes32(value)
}

func convertEndianness64(value uint64) uint64 {
    return bits.ReverseBytes64(value)
}

// Alternative: Read in one order, write in another
func littleToBig32(data []byte) uint32 {
    // Read as little-endian
    le := binary.LittleEndian.Uint32(data)
    // Return as big-endian interpretation
    return bits.ReverseBytes32(le)
}
```

---

## 9. Mixed-Endian and Middle-Endian

### 9.1 PDP-11 Middle-Endian

Some historical systems used unusual byte orders:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MIDDLE-ENDIAN (PDP-11)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Value: 0x01020304                                                         │
│                                                                             │
│   Little-Endian:  [04][03][02][01]                                         │
│   Big-Endian:     [01][02][03][04]                                         │
│   PDP-Endian:     [02][01][04][03]   ← Middle-Endian                       │
│                                                                             │
│   The PDP-11 stored 16-bit words in little-endian order,                   │
│   but the two 16-bit halves of a 32-bit value were stored                  │
│   in big-endian order relative to each other.                              │
│                                                                             │
│   Breakdown:                                                                │
│   32-bit: 0x01020304                                                        │
│   High word: 0x0102                                                         │
│   Low word:  0x0304                                                         │
│                                                                             │
│   Storage: [Low word LE][High word LE]                                     │
│          = [04][03][02][01] ? No!                                          │
│          = [02][01][04][03] ← Words swapped, bytes within words LE         │
│                                                                             │
│   This is mostly historical curiosity today.                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Bi-Endian Architectures

Some modern processors support both byte orders:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BI-ENDIAN ARCHITECTURES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Architecture      Default         Switchable?                             │
│   ─────────────────────────────────────────────────────────────────────     │
│   ARM               Little          Yes, via CPSR.E bit                     │
│   PowerPC           Big             Yes, via MSR.LE bit                     │
│   MIPS              Big             Yes, configurable                       │
│   SPARC v9          Big             Yes, via PSTATE.CLE                     │
│   Itanium           Selectable      Per-process                             │
│   RISC-V            Little          Extensions may vary                     │
│                                                                             │
│   Practical Note:                                                           │
│   While these CPUs support both modes, operating systems typically         │
│   choose one mode and stick with it. Switching mid-execution is rare.     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Best Practices

### 10.1 Design Guidelines

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ENDIANNESS BEST PRACTICES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. ALWAYS USE EXPLICIT BYTE ORDER                                         │
│   ─────────────────────────────────                                         │
│   Never assume the host byte order. Always use explicit conversion          │
│   functions like binary.LittleEndian or binary.BigEndian.                  │
│                                                                             │
│   ✗ Bad:  *(*uint32)(unsafe.Pointer(&data[0]))                             │
│   ✓ Good: binary.LittleEndian.Uint32(data)                                 │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   2. DOCUMENT YOUR CHOICE                                                   │
│   ───────────────────────                                                   │
│   File formats and protocols should clearly document their byte order.     │
│                                                                             │
│   Example header comment:                                                   │
│   // All multi-byte integers are stored in little-endian format            │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   3. PREFER LITTLE-ENDIAN FOR STORAGE                                       │
│   ───────────────────────────────────                                       │
│   Most modern systems are little-endian. Using LE for storage:             │
│   • Avoids conversion overhead on common platforms                         │
│   • Aligns with SQLite, Protocol Buffers, and other modern formats        │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   4. USE NETWORK BYTE ORDER FOR PROTOCOLS                                   │
│   ───────────────────────────────────────                                   │
│   For network communication, use big-endian (network byte order)           │
│   to maintain compatibility with established conventions.                   │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   5. TEST ON BOTH ARCHITECTURES                                             │
│   ─────────────────────────────────                                         │
│   If possible, test your code on both little-endian and big-endian         │
│   systems to catch assumptions about byte order.                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Common Mistakes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       COMMON ENDIANNESS MISTAKES                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Mistake 1: Assuming host byte order                                       │
│   ─────────────────────────────────────                                     │
│   ✗ Writing data directly without conversion                               │
│   ✗ Using unsafe pointer casts for serialization                           │
│                                                                             │
│   Mistake 2: Forgetting to convert network data                            │
│   ─────────────────────────────────────────────                             │
│   ✗ Reading IP addresses or port numbers without ntohl/ntohs               │
│   ✗ Sending local integers directly over the network                       │
│                                                                             │
│   Mistake 3: Mixing byte orders in one format                              │
│   ───────────────────────────────────────────                               │
│   ✗ Using big-endian for some fields and little-endian for others         │
│   ✗ Not documenting which order is used where                              │
│                                                                             │
│   Mistake 4: Byte-swapping single bytes                                    │
│   ─────────────────────────────────────                                     │
│   ✗ Endianness only affects multi-byte values                              │
│   ✗ Individual bytes (uint8, int8) are never swapped                       │
│                                                                             │
│   Mistake 5: Confusing bit order with byte order                           │
│   ───────────────────────────────────────────────                           │
│   ✗ Endianness is about BYTE order, not bit order                          │
│   ✗ Bits within a byte are always MSB-to-LSB (left-to-right)               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Real-World Examples

### 11.1 CitrineDB Page Format

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  CITRINEDB USES LITTLE-ENDIAN                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Rationale:                                                                │
│   • Target platforms are primarily x86-64 (little-endian)                  │
│   • Matches SQLite and most modern embedded databases                       │
│   • No runtime byte-swapping overhead on common hardware                   │
│                                                                             │
│   Page Header Example:                                                      │
│   ─────────────────────                                                     │
│   PageID = 1000 (0x000003E8)                                               │
│                                                                             │
│   Written as: [E8][03][00][00]                                             │
│                LSB        MSB                                               │
│                                                                             │
│   Code:                                                                     │
│   binary.LittleEndian.PutUint32(p.data[0:4], uint32(pageID))               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 11.2 TCP/IP Headers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  TCP/IP USES BIG-ENDIAN                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   IP Header (partial):                                                      │
│   ─────────────────────                                                     │
│                                                                             │
│   Total Length field = 1500 bytes (0x05DC)                                 │
│                                                                             │
│   On the wire: [05][DC]                                                     │
│                 MSB LSB                                                     │
│                                                                             │
│   Go code for reading:                                                      │
│   length := binary.BigEndian.Uint16(packet[2:4])                           │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│   TCP Port Number = 443 (HTTPS) = 0x01BB                                   │
│                                                                             │
│   On the wire: [01][BB]                                                     │
│                                                                             │
│   If you forget to convert on a little-endian host:                        │
│   Wrong interpretation: 0xBB01 = 47873                                     │
│   Correct value: 0x01BB = 443                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. Conclusion

### 12.1 Summary

| Aspect | Little-Endian | Big-Endian |
|--------|---------------|------------|
| Byte order | LSB at lowest address | MSB at lowest address |
| Common systems | x86, ARM, RISC-V | Network, Java, older UNIX |
| Human readability | Reversed from written | Matches written form |
| Pointer casting | Natural for LE systems | Requires conversion |
| Modern preference | Storage, file formats | Network protocols |

### 12.2 Key Takeaways

1. **Endianness matters** when exchanging binary data between systems
2. **Always use explicit conversion** functions; never assume byte order
3. **Little-Endian dominates** modern desktop and server hardware
4. **Big-Endian (Network Order)** is standard for network protocols
5. **Document your choice** in file format specifications
6. **Test thoroughly** if your code might run on different architectures

---

## References

1. Cohen, D. (1981). On Holy Wars and a Plea for Peace. *IEEE Computer*, 14(10), 48-54.
2. Swift, J. (1726). *Gulliver's Travels*. Benjamin Motte.
3. Intel Corporation. (2021). *Intel 64 and IA-32 Architectures Software Developer's Manual*.
4. IETF RFC 1700. (1994). Assigned Numbers. Internet Engineering Task Force.
5. Go Documentation. *encoding/binary package*. https://pkg.go.dev/encoding/binary

---

*Document Version: 1.0*  
*Last Updated: January 2026*  
*CitrineDB Storage Engine Documentation*
