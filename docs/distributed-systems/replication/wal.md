---
title: Write-Ahead Logging (WAL)
description: Write-Ahead Logging (WAL) is a fundamental technique in database systems that ensures data durability and consistency by recording changes to a log before applying them to the actual data store.
sidebar_label: Write-Ahead Log
sidebar_position: 1
keywords: [wal, write-ahead-log, durability, database, distributed-systems]
reading_time: 25
last_update:
  date: 2026-01-10
---

# Write-Ahead Logging (WAL): Ensuring Data Durability and Consistency

## Abstract

Write-Ahead Logging (WAL) is a fundamental technique in database systems and distributed applications that ensures data durability and consistency by recording changes to a log before applying them to the actual data store. This protocol guarantees that in the event of system failure, committed transactions can be recovered and uncommitted transactions can be rolled back. This article explores the theoretical foundations, practical implementations, and real-world applications of WAL, with detailed Go code examples demonstrating core concepts and implementation considerations.

---

## 1. Introduction: The Foundation of Reliable Data Storage

In the world of data management, ensuring that committed data survives system failures is paramount. Consider a banking system where a customer transfers money between accounts—the system must guarantee that either both the debit and credit operations complete successfully, or neither occurs at all. Write-Ahead Logging provides this guarantee by establishing a clear protocol: **changes are first written to a durable log before being applied to the primary data structure**.

The WAL protocol follows a simple but powerful principle: "No data page is written to disk until the corresponding log record has been written to disk." This ensures that the system can always recover to a consistent state, even after catastrophic failures.

![WAL Process Flow](https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Write-ahead_logging.svg/400px-Write-ahead_logging.svg.png)
*Figure 1: Write-Ahead Logging process flow showing log writes preceding data writes*

---

## 2. Problem and Solution

### 2.1 The Core Problem

Traditional data storage systems face several critical challenges:

**Atomicity Violations**: Without proper coordination, partial writes can leave the system in an inconsistent state. If a multi-step operation fails midway, some changes might be persisted while others are lost.

**Durability Concerns**: Data held only in volatile memory is vulnerable to loss during power failures, crashes, or hardware malfunctions.

**Consistency Issues**: Concurrent operations can interfere with each other, leading to race conditions and data corruption.

**Performance vs. Safety Trade-offs**: Synchronous disk writes provide durability but severely impact performance, while asynchronous writes improve performance at the cost of potential data loss.

### 2.2 WAL as the Solution

Write-Ahead Logging addresses these challenges through a structured approach:

1. **Sequential Log Writes**: Changes are recorded sequentially in a log file before being applied to data pages. Sequential writes are significantly faster than random writes.

2. **Recovery Protocols**: The log serves as a complete record of all changes, enabling both redo (reapplying committed changes) and undo (rolling back uncommitted changes) operations.

3. **Atomic Commits**: By controlling when log entries are marked as committed, the system ensures atomicity across complex operations.

4. **Performance Optimization**: Bulk operations can be logged efficiently, and data pages can be written asynchronously without compromising consistency.

---

## 3. Implementation Considerations

### 3.1 Log Entry Structure

A well-designed log entry must contain sufficient information for both forward recovery (redo) and backward recovery (undo). Here's the walrus implementation:

```go
package walrus

import (
	"time"
)

type Entry struct {
	Index         uint64
	Term          uint64
	Data          []byte
	Checksum      uint32
	Timestamp     time.Time
	TransactionID TransactionID
}

type TransactionID string

type TransactionState int

const (
	TransactionPending TransactionState = iota
	TransactionCommitted
	TransactionAborted
)

type Transaction struct {
	ID        TransactionID
	State     TransactionState
	Entries   []Entry
	StartTime time.Time
	Timeout   time.Duration
	Batch     Batch
}

func (t *Transaction) IsExpired() bool {
	if t.Timeout == 0 {
		return false
	}
	return time.Since(t.StartTime) > t.Timeout
}

func (t *Transaction) Reset() {
	t.Entries = t.Entries[:0]
	t.Batch.Reset()
```

### 3.2 WAL Manager Implementation

The WAL manager coordinates all logging operations and ensures proper sequencing:

```go
package walrus

import (
	"crypto/rand"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/l00pss/helpme/result"
	"github.com/l00pss/littlecache"
)

type WAL struct {
	config            Config
	mu                sync.RWMutex
	encoder           Encoder
	state             State
	status            Status
	cusror            Cursor
	dir               string
	tailSFH           os.File
	segments          []*Segment
	currentSegment    *Segment
	cache             *littlecache.LittleCache
	batch             Batch
	transactions      map[TransactionID]*Transaction
	transactionsMu    sync.RWMutex
}

func NewWAL(dir string, config Config) result.Result[*WAL] {
	configResult := config.Validate()
	if configResult.IsErr() {
		return result.Err[*WAL](configResult.UnwrapErr())
	}

	dir, err := filepath.Abs(dir)
	if err != nil {
		return result.Err[*WAL](err)
	}

	cacheConfig := littlecache.DefaultConfig()
	cache, err := littlecache.NewLittleCache(cacheConfig)

	if err != nil {
		return result.Err[*WAL](err)
	}
	cache.Resize(config.cachedSegments * 1024)
	MkDirIfNotExist(dir)

	var encoder Encoder
	switch config.format {
	case BINARY:
		encoder = BinaryEncoder{}
	case JSON:
		encoder = JSONEncoder{}
	}

	w := &WAL{
		mu:                sync.RWMutex{},
		encoder:           encoder,
		state:             Initializing,
		status:            OK,
		cusror:            StartCursor(),
		dir:               dir,
		config:            configResult.Unwrap(),
		cache:             &cache,
		transactions:      make(map[TransactionID]*Transaction),
		transactionsMu:    sync.RWMutex{},
	}

	return result.Ok(w)
}
func (w *WAL) Append(entry Entry) result.Result[uint64] {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.state == Closed {
		return result.Err[uint64](ErrWALClosed)
	}

	if w.currentSegment == nil {
		if err := w.ensureSegment(); err != nil {
			return result.Err[uint64](err)
		}
	}

	entry.Index = w.cusror.LastIndex + 1
	seralizedEntryResult := w.encoder.Encode(entry)
	if seralizedEntryResult.IsErr() {
		return result.Err[uint64](seralizedEntryResult.UnwrapErr())
	}
	data := seralizedEntryResult.Unwrap()

	currentSize, _ := w.currentSegment.Size()
	_, err := w.currentSegment.Write(data)
	if err != nil {
		return result.Err[uint64](err)
	}

	w.currentSegment.TrackEntry(entry.Index, currentSize)
	return result.Ok(entry.Index)
}

func (w *WAL) Close() error {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.state == Closed {
		return nil
	}

	w.rollbackAllPendingTransactions()

	for _, seg := range w.segments {
		seg.Sync()
		seg.Close()
	}

	w.segments = nil
	w.currentSegment = nil
	w.state = Closed
	return nil
}
```

### 3.3 Transaction Management with WAL

Transactions coordinate multiple operations while maintaining ACID properties:

```go
func (w *WAL) BeginTransaction(timeout time.Duration) result.Result[TransactionID] {
	w.transactionsMu.Lock()
	defer w.transactionsMu.Unlock()

	if w.state == Closed {
		return result.Err[TransactionID](ErrWALClosed)
	}

	if timeout == 0 {
		timeout = w.config.DefaultTimeout
	}

	txID := generateTransactionID()
	tx := &Transaction{
		ID:        txID,
		State:     TransactionPending,
		Entries:   make([]Entry, 0),
		StartTime: time.Now(),
		Timeout:   timeout,
		Batch:     Batch{},
	}

	w.transactions[txID] = tx
	return result.Ok(txID)
}

func (w *WAL) AddToTransaction(txID TransactionID, entry Entry) result.Result[struct{}] {
	w.transactionsMu.Lock()
	defer w.transactionsMu.Unlock()

	tx, exists := w.transactions[txID]
	if !exists {
		return result.Err[struct{}](ErrTransactionNotFound)
	}

	if tx.State != TransactionPending {
		return result.Err[struct{}](ErrTransactionNotPending)
	}

	if tx.IsExpired() {
		tx.State = TransactionAborted
		return result.Err[struct{}](ErrTransactionExpired)
	}

	if len(tx.Entries) >= w.config.MaxEntries {
		return result.Err[struct{}](ErrTransactionTooLarge)
	}

	entry.TransactionID = txID
	tx.Entries = append(tx.Entries, entry)
	return result.Ok(struct{}{})
}

func (w *WAL) CommitTransaction(txID TransactionID) result.Result[[]uint64] {
	w.transactionsMu.Lock()
	tx, exists := w.transactions[txID]
	if !exists {
		w.transactionsMu.Unlock()
		return result.Err[[]uint64](ErrTransactionNotFound)
	}

	if tx.State != TransactionPending {
		w.transactionsMu.Unlock()
		return result.Err[[]uint64](ErrTransactionNotPending)
	}

	if tx.IsExpired() {
		tx.State = TransactionAborted
		w.transactionsMu.Unlock()
		return result.Err[[]uint64](ErrTransactionExpired)
	}

	tx.State = TransactionCommitted
	entries := make([]Entry, len(tx.Entries))
	copy(entries, tx.Entries)
	w.transactionsMu.Unlock()

	result := w.WriteBatch(entries)

	w.transactionsMu.Lock()
	delete(w.transactions, txID)
	w.transactionsMu.Unlock()

	return result
}

func (w *WAL) RollbackTransaction(txID TransactionID) result.Result[struct{}] {
	w.transactionsMu.Lock()
	defer w.transactionsMu.Unlock()

	tx, exists := w.transactions[txID]
	if !exists {
		return result.Err[struct{}](ErrTransactionNotFound)
	}

	if tx.State != TransactionPending {
		return result.Err[struct{}](ErrTransactionNotPending)
	}

	tx.State = TransactionAborted
	delete(w.transactions, txID)
	return result.Ok(struct{}{})
}
```

---

## 4. Using WAL in Transactional Storage

### 4.1 Database Integration

WAL integrates seamlessly with database storage engines to provide ACID guarantees:

```go
func (w *WAL) Append(entry Entry) result.Result[uint64] {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.state == Closed {
		return result.Err[uint64](ErrWALClosed)
	}

	if w.currentSegment == nil {
		if err := w.ensureSegment(); err != nil {
			return result.Err[uint64](err)
		}
	}

	size, err := w.currentSegment.Size()
	if err != nil {
		return result.Err[uint64](err)
	}
	if size >= w.config.segmentSize {
		if err := w.rotateSegment(); err != nil {
			return result.Err[uint64](err)
		}
	}

	entry.Index = w.cusror.LastIndex + 1

	seralizedEntryResult := w.encoder.Encode(entry)
	if seralizedEntryResult.IsErr() {
		return result.Err[uint64](seralizedEntryResult.UnwrapErr())
	}
	data := seralizedEntryResult.Unwrap()

	currentSize, _ := w.currentSegment.Size()
	_, err = w.currentSegment.Write(data)
	if err != nil {
		return result.Err[uint64](err)
	}

	w.currentSegment.TrackEntry(entry.Index, currentSize)

	if w.config.syncAfterWrite {
		if err := w.currentSegment.Sync(); err != nil {
			return result.Err[uint64](err)
		}
	}

	w.cusror.LastIndex = entry.Index
	if w.cusror.FirstIndex == 0 {
		w.cusror.FirstIndex = entry.Index
	}

	return result.Ok(entry.Index)
}

func (w *WAL) WriteBatch(entries []Entry) result.Result[[]uint64] {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.state == Closed {
		return result.Err[[]uint64](ErrWALClosed)
	}

	if len(entries) == 0 {
		return result.Ok([]uint64{})
	}

	if w.currentSegment == nil {
		if err := w.ensureSegment(); err != nil {
			return result.Err[[]uint64](err)
		}
	}

	indices := make([]uint64, len(entries))
	totalSize := 0

	for i := range entries {
		indices[i] = w.cusror.LastIndex + uint64(i) + 1
		entries[i].Index = indices[i]
		if entries[i].Timestamp.IsZero() {
			entries[i].Timestamp = time.Now()
		}

		seralizedEntryResult := w.encoder.Encode(entries[i])
		if seralizedEntryResult.IsErr() {
			return result.Err[[]uint64](seralizedEntryResult.UnwrapErr())
		}
		totalSize += len(seralizedEntryResult.Unwrap())
	}

	startOffset, _ := w.currentSegment.Size()
	for _, entry := range entries {
		seralizedEntryResult := w.encoder.Encode(entry)
		data := seralizedEntryResult.Unwrap()

		currentOffset, _ := w.currentSegment.Size()
		_, err := w.currentSegment.Write(data)
		if err != nil {
			w.currentSegment.file.Truncate(startOffset)
			return result.Err[[]uint64](err)
		}

		w.currentSegment.TrackEntry(entry.Index, currentOffset)
	}

	if w.config.syncAfterWrite {
		if err := w.currentSegment.Sync(); err != nil {
			w.currentSegment.file.Truncate(startOffset)
			return result.Err[[]uint64](err)
		}
	}
	w.cusror.LastIndex = indices[len(indices)-1]
	if w.cusror.FirstIndex == 0 {
		w.cusror.FirstIndex = indices[0]
	}

	return result.Ok(indices)
}
// Example usage demonstrating transactional operations
func ExampleWalrusUsage() error {
	config := Config{
		syncAfterWrite: true,
		segmentSize:    1024 * 1024,
		cachedSegments: 4,
		maxSegments:    10,
		format:         BINARY,
	}

	wal := Open("/tmp/example.wal", config).Unwrap()
	defer wal.Close()

	// Begin a transaction
	txID := wal.BeginTransaction(30 * time.Second).Unwrap()

	// Add entries to the transaction
	entry1 := Entry{
		Data:      []byte("user operation 1"),
		Timestamp: time.Now(),
	}
	entry2 := Entry{
		Data:      []byte("user operation 2"),
		Timestamp: time.Now(),
	}

	wal.AddToTransaction(txID, entry1)
	wal.AddToTransaction(txID, entry2)

	// Commit the transaction atomically
	indices := wal.CommitTransaction(txID).Unwrap()

	// Verify the entries were written
	for _, idx := range indices {
		entry := wal.Get(idx).Unwrap()
		fmt.Printf("Entry %d: %s\n", idx, string(entry.Data))
	}

	return nil
}

func (w *WAL) Get(index uint64) result.Result[Entry] {
	w.mu.RLock()
	defer w.mu.RUnlock()

	if w.state == Closed {
		return result.Err[Entry](ErrWALClosed)
	}

	if index < w.cusror.FirstIndex || index > w.cusror.LastIndex {
		return result.Err[Entry](ErrIndexOutOfRange)
	}

	segment := w.findSegmentByIndex(index)
	if segment == nil {
		return result.Err[Entry](ErrSegmentNotFound)
	}

	data, err := segment.GetEntryByIndex(index)
	if err != nil {
		return result.Err[Entry](err)
	}

	entryResult := w.encoder.Decode(data)
	if entryResult.IsErr() {
		return result.Err[Entry](entryResult.UnwrapErr())
	}

	return result.Ok(entryResult.Unwrap())
}

func (w *WAL) GetRange(start, end uint64) result.Result[[]Entry] {
	w.mu.RLock()
	defer w.mu.RUnlock()

	if w.state == Closed {
		return result.Err[[]Entry](ErrWALClosed)
	}

	if start > end {
		return result.Err[[]Entry](ErrIndexOutOfRange)
	}

	entries := make([]Entry, 0, end-start+1)
	for i := start; i <= end; i++ {
		segment := w.findSegmentByIndex(i)
		if segment == nil {
			continue
		}

		data, err := segment.GetEntryByIndex(i)
		if err != nil {
			return result.Err[[]Entry](err)
		}

		entryResult := w.encoder.Decode(data)
		if entryResult.IsErr() {
			return result.Err[[]Entry](entryResult.UnwrapErr())
		}

		entries = append(entries, entryResult.Unwrap())
	}

	return result.Ok(entries)
}
```

### 4.2 Recovery Mechanisms

WAL enables sophisticated recovery procedures after system failures:

```go
func (w *WAL) recover() error {
	segments, err := loadSegments(w.dir)
	if err != nil {
		return err
	}

	if len(segments) == 0 {
		return nil
	}

	w.segments = segments
	w.currentSegment = segments[len(segments)-1]

	for _, seg := range segments {
		if err := w.recoverSegment(seg); err != nil {
			w.status = Corrupted
			return err
		}
	}

	return nil
}

func (w *WAL) recoverSegment(seg *Segment) error {
	var offset int64 = 0

	for {
		data, nextOffset, err := seg.ReadAt(offset)
		if err == io.EOF {
			break
		}
		if err != nil {
			return w.handleCorruptedEntry(seg, offset)
		}

		entryResult := w.encoder.Decode(data)
		if entryResult.IsErr() {
			return w.handleCorruptedEntry(seg, offset)
		}

		entry := entryResult.Unwrap()
		seg.TrackEntry(entry.Index, offset)

		if w.cusror.FirstIndex == 0 {
			w.cusror.FirstIndex = entry.Index
		}
		w.cusror.LastIndex = entry.Index

		offset = nextOffset
	}

	return nil
}

func (w *WAL) handleCorruptedEntry(seg *Segment, offset int64) error {
	if err := seg.file.Truncate(offset); err != nil {
		return err
	}
	return nil
}

func (w *WAL) cleanupUncommittedTransactions() {
	w.transactionsMu.Lock()
	defer w.transactionsMu.Unlock()

	for txID := range w.transactions {
		delete(w.transactions, txID)
	}
}

func (w *WAL) CleanupExpiredTransactions() int {
	w.transactionsMu.Lock()
	defer w.transactionsMu.Unlock()

	cleaned := 0
	for txID, tx := range w.transactions {
		if tx.IsExpired() && tx.State == TransactionPending {
			tx.State = TransactionAborted
			delete(w.transactions, txID)
			cleaned++
		}
	}
	return cleaned
}
```

---

## 5. WAL Compared to Event Sourcing

### 5.1 Conceptual Differences

While both Write-Ahead Logging and Event Sourcing involve recording changes before applying them, they serve different purposes and operate at different levels of abstraction:

**Write-Ahead Logging**:
- **Purpose**: Ensures durability and enables crash recovery
- **Scope**: Database/storage layer implementation detail
- **Granularity**: Low-level operations (insert, update, delete)
- **Retention**: Logs can be truncated after checkpoints
- **Primary Goal**: Data safety and consistency

**Event Sourcing**:
- **Purpose**: Captures business logic and provides complete audit trail
- **Scope**: Application architecture pattern
- **Granularity**: Business events and domain operations
- **Retention**: Events are typically kept permanently
- **Primary Goal**: Business insight and temporal queries

### 5.2 Implementation Comparison

Here's how the same business operation might be handled differently:

```go
// WAL approach with walrus - focuses on data persistence
func TransferMoney(wal *WAL, fromAccount, toAccount string, amount float64) error {
	txID := wal.BeginTransaction(30 * time.Second).Unwrap()

	// Log debit operation
	debitEntry := Entry{
		Data:      []byte(fmt.Sprintf("DEBIT:%s:%.2f", fromAccount, amount)),
		Timestamp: time.Now(),
	}
	wal.AddToTransaction(txID, debitEntry)

	// Log credit operation
	creditEntry := Entry{
		Data:      []byte(fmt.Sprintf("CREDIT:%s:%.2f", toAccount, amount)),
		Timestamp: time.Now(),
	}
	wal.AddToTransaction(txID, creditEntry)

	// Commit atomically - WAL ensures durability
	indices := wal.CommitTransaction(txID)
	return indices.Err()
}

// Event Sourcing approach using walrus for storage
type MoneyTransferEvent struct {
	TransferID    string    `json:"transfer_id"`
	FromAccount   string    `json:"from_account"`
	ToAccount     string    `json:"to_account"`
	Amount        float64   `json:"amount"`
	Timestamp     time.Time `json:"timestamp"`
	Description   string    `json:"description"`
}

func StoreTransferEvent(wal *WAL, event MoneyTransferEvent) error {
	eventData, _ := json.Marshal(event)
	entry := Entry{
		Data:      eventData,
		Timestamp: event.Timestamp,
	}
	
	// Store the event using walrus WAL for durability
	result := wal.Append(entry)
	return result.Err()
}
```

### 5.3 When to Use Each Approach

**Use WAL when**:
- Building database systems or storage engines
- Need guaranteed crash recovery
- Working with traditional CRUD operations
- Performance and storage efficiency are critical
- You need to support arbitrary queries and updates

**Use Event Sourcing when**:
- Business logic is complex and evolves frequently
- Audit trails and compliance are requirements
- You need to replay business scenarios
- Temporal queries ("What was the state at time X?") are important
- Building event-driven architectures

**Use Both when**:
Many modern systems combine both approaches—Event Sourcing for business logic with WAL-backed storage for reliability:

```go
// Hybrid approach using walrus
type EventSourcingWithWalrus struct {
	wal         *WAL
	projections map[string]interface{}
	mu          sync.RWMutex
}

func NewEventSourcingWithWalrus(dir string) (*EventSourcingWithWalrus, error) {
	config := Config{
		syncAfterWrite: true,
		segmentSize:    1024 * 1024,
		format:         JSON, // Use JSON for readable events
	}

	wal := Open(dir, config)
	if wal.IsErr() {
		return nil, wal.UnwrapErr()
	}

	return &EventSourcingWithWalrus{
		wal:         wal.Unwrap(),
		projections: make(map[string]interface{}),
	}, nil
}

func (es *EventSourcingWithWalrus) ProcessBusinessEvent(eventType string, eventData interface{}) error {
	// Store business event using walrus for durability
	dataBytes, _ := json.Marshal(eventData)
	entry := Entry{
		Data:      dataBytes,
		Timestamp: time.Now(),
	}

	result := es.wal.Append(entry)
	if result.IsErr() {
		return result.UnwrapErr()
	}

	// Update projections using walrus transaction for consistency
	return es.updateProjections(eventType, eventData)
}

func (es *EventSourcingWithWalrus) updateProjections(eventType string, eventData interface{}) error {
	es.mu.Lock()
	defer es.mu.Unlock()
	
	// Update in-memory projections
	es.projections[eventType] = eventData
	return nil
}
```

---

## 6. Performance Considerations and Optimizations

### 6.1 Batching and Group Commits

WAL performance can be significantly improved through batching strategies:

```go
// Walrus provides built-in batching through WriteBatch
func BatchOperations(wal *WAL, operations []string) error {
	entries := make([]Entry, len(operations))
	for i, op := range operations {
		entries[i] = Entry{
			Data:      []byte(op),
			Timestamp: time.Now(),
		}
	}

	// Single batch write is much faster than individual writes
	result := wal.WriteBatch(entries)
	return result.Err()
}

// Transaction-based group commit
func GroupCommitTransactions(wal *WAL, txOperations [][]Entry) error {
	txIDs := make([]TransactionID, len(txOperations))
	
	// Start all transactions
	for i, ops := range txOperations {
		txID := wal.BeginTransaction(30 * time.Second).Unwrap()
		txIDs[i] = txID
		
		// Add operations to transaction
		for _, entry := range ops {
			wal.AddToTransaction(txID, entry)
		}
	}
	
	// Commit all at once for better throughput
	for _, txID := range txIDs {
		if result := wal.CommitTransaction(txID); result.IsErr() {
			return result.UnwrapErr()
		}
	}
	
	return nil
}

// Cleanup expired transactions for better performance
func (w *WAL) StartTransactionCleanup() {
	go func() {
		ticker := time.NewTicker(w.config.CleanupInterval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				if w.state == Closed {
					return
				}
				w.CleanupExpiredTransactions()
			}
		}
	}()
}
```

### 6.2 Segment Management and Storage Optimization

Walrus integrates segment-based storage for optimal performance:

```go
// Walrus segment management for performance
func (w *WAL) rotateSegment() error {
	if w.currentSegment != nil {
		if err := w.currentSegment.Sync(); err != nil {
			return err
		}
	}

	var newIndex uint64 = 1
	if len(w.segments) > 0 {
		newIndex = w.segments[len(w.segments)-1].index + 1
	}

	segment, err := createSegment(w.dir, newIndex)
	if err != nil {
		return err
	}

	w.segments = append(w.segments, segment)
	w.currentSegment = segment

	if len(w.segments) > w.config.maxSegments {
		w.cleanupOldSegments()
	}

	return nil
}

// Truncate for space management
func (w *WAL) Truncate(index uint64) result.Result[struct{}] {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.state == Closed {
		return result.Err[struct{}](ErrWALClosed)
	}

	for i := len(w.segments) - 1; i >= 0; i-- {
		seg := w.segments[i]

		if seg.firstEntry > index {
			seg.Close()
			os.Remove(seg.filePath)
			w.segments = w.segments[:i]
			continue
		}

		if seg.ContainsIndex(index) {
			localIdx := index - seg.firstEntry
			if localIdx < uint64(len(seg.entryOffsets)-1) {
				nextOffset := seg.entryOffsets[localIdx+1]
				seg.file.Truncate(nextOffset)
				seg.lastEntry = index
				seg.entryOffsets = seg.entryOffsets[:localIdx+1]
			}
			break
		}
	}

	w.cusror.LastIndex = index
	return result.Ok(struct{}{})
}

// Batch operations with segment awareness
func OptimizedBatchWrite(wal *WAL, data [][]byte) error {
	entries := make([]Entry, len(data))
	for i, d := range data {
		entries[i] = Entry{
			Data:      d,
			Timestamp: time.Now(),
		}
	}

	// WriteBatch handles segment rotation automatically
	result := wal.WriteBatch(entries)
	return result.Err()
}
```

---

## 7. Conclusion

Write-Ahead Logging represents a fundamental building block in modern data systems, providing the durability and consistency guarantees that applications depend on. Its elegant simplicity—writing changes to a sequential log before applying them—enables robust recovery mechanisms while maintaining excellent performance characteristics.

The key insights about WAL include:

- **Sequential writes are fast**: WAL leverages the performance characteristics of sequential I/O
- **Recovery is systematic**: With proper log structure, systems can recover to any consistent state
- **Transactions become possible**: WAL provides the foundation for ACID transactions
- **Flexibility in application**: From database engines to distributed systems, WAL adapts to various use cases

As we've seen through our Go implementations, WAL can be implemented efficiently while providing strong guarantees. When combined with other techniques like Event Sourcing, it enables sophisticated architectures that serve both operational and analytical needs.

The future of data systems continues to build upon WAL's foundations, with innovations in distributed WAL (like Raft logs), persistent memory optimization, and integration with emerging storage technologies. Understanding WAL deeply provides the knowledge needed to build reliable, performant systems that users can trust with their most critical data.

Whether you're building a database, a distributed system, or any application that requires reliable data persistence, Write-Ahead Logging offers a time-tested, theoretically sound approach to ensuring your data survives and your users maintain confidence in your system's reliability.
