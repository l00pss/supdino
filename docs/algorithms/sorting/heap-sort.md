---
title: Heap Sort Algorithm
description: Heap Sort is an efficient comparison-based algorithm that guarantees O(n log n) time complexity while sorting in-place using the heap data structure.
sidebar_label: Heap Sort
sidebar_position: 6
keywords: [heap-sort, sorting, algorithms, heap, data-structures]
reading_time: 15
last_update:
  date: 2026-01-02
---

# Heap Sort Algorithm

Heap Sort is an efficient comparison-based sorting algorithm that combines the best features of merge sort and selection sort. It guarantees O(n log n) time complexity in all cases while sorting in-place, making it particularly valuable for systems with memory constraints and real-time requirements.

## Algorithm Overview

Heap Sort utilizes the heap data structure to sort elements. It works by building a max heap from the input array, then repeatedly extracting the maximum element and placing it at the end of the array. This process continues until the heap is empty and the array is fully sorted.

## Heap Data Structure Fundamentals

A heap is a complete binary tree with the heap property:
- **Max Heap**: Parent nodes are greater than or equal to their children
- **Min Heap**: Parent nodes are less than or equal to their children

For an array-based implementation:
- Parent of node at index i: `(i-1)/2`
- Left child of node at index i: `2*i + 1`
- Right child of node at index i: `2*i + 2`

## Algorithmic Process

Heap Sort operates through these systematic phases:

1. **Build Max Heap**: Transform the input array into a max heap
2. **Extract Maximum**: Repeatedly remove the root (maximum) and restore heap property
3. **Place at End**: Put extracted maximum at the end of the array
4. **Reduce Heap Size**: Decrease heap size and repeat until empty

## Step-by-Step Example

Consider sorting the array `[4, 10, 3, 5, 1]` using Heap Sort:

```
Initial array: [4, 10, 3, 5, 1]

Phase 1: Build Max Heap
Step 1: Start from last non-leaf node (index 1, value 10)
        No change needed: [4, 10, 3, 5, 1]

Step 2: Process node at index 0 (value 4)
        Heapify: 4 < 10, swap and check children
        Result: [10, 4, 3, 5, 1]
        
        Continue heapify: 4 < 5, swap
        Final max heap: [10, 5, 3, 4, 1]

Phase 2: Extract elements and sort
Iteration 1: Extract 10, place at end
            [1, 5, 3, 4] | [10]
            Heapify: [5, 4, 3, 1] | [10]

Iteration 2: Extract 5, place at end
            [1, 4, 3] | [5, 10]
            Heapify: [4, 1, 3] | [5, 10]

Iteration 3: Extract 4, place at end
            [3, 1] | [4, 5, 10]
            Heapify: [3, 1] | [4, 5, 10]

Iteration 4: Extract 3, place at end
            [1] | [3, 4, 5, 10]

Final result: [1, 3, 4, 5, 10]
```

## Implementation in Go

```go
package main

import "fmt"

// HeapSort implements the heap sort algorithm
// Time Complexity: O(n log n) for all cases
// Space Complexity: O(1)
func HeapSort(arr []int) {
    n := len(arr)
    
    // Build max heap (rearrange array)
    for i := n/2 - 1; i >= 0; i-- {
        heapify(arr, n, i)
    }
    
    // Extract elements from heap one by one
    for i := n - 1; i > 0; i-- {
        // Move current root to end
        arr[0], arr[i] = arr[i], arr[0]
        
        // Call heapify on the reduced heap
        heapify(arr, i, 0)
    }
}

// heapify maintains the heap property for a subtree rooted at index i
// n is the size of the heap
func heapify(arr []int, n, i int) {
    largest := i       // Initialize largest as root
    left := 2*i + 1    // Left child
    right := 2*i + 2   // Right child
    
    // Check if left child exists and is greater than root
    if left < n && arr[left] > arr[largest] {
        largest = left
    }
    
    // Check if right child exists and is greater than largest so far
    if right < n && arr[right] > arr[largest] {
        largest = right
    }
    
    // If largest is not root, swap and continue heapifying
    if largest != i {
        arr[i], arr[largest] = arr[largest], arr[i]
        
        // Recursively heapify the affected sub-tree
        heapify(arr, n, largest)
    }
}

// Demonstration of the algorithm
func main() {
    testArray := []int{4, 10, 3, 5, 1}
    
    fmt.Println("Original array:", testArray)
    HeapSort(testArray)
    fmt.Println("Sorted array:  ", testArray)
}
```

## Enhanced Implementation with Visualization

```go
func HeapSortWithVisualization(arr []int) {
    n := len(arr)
    fmt.Printf("Starting array: %v\n", arr)
    
    // Build max heap
    fmt.Println("\nBuilding max heap:")
    for i := n/2 - 1; i >= 0; i-- {
        fmt.Printf("Heapifying from index %d: ", i)
        heapifyViz(arr, n, i)
        fmt.Printf("Result: %v\n", arr)
    }
    
    fmt.Printf("Max heap built: %v\n", arr)
    
    // Extract elements from heap
    fmt.Println("\nExtracting elements:")
    for i := n - 1; i > 0; i-- {
        fmt.Printf("Extracting max %d: ", arr[0])
        arr[0], arr[i] = arr[i], arr[0]
        fmt.Printf("After swap: %v\n", arr[:i+1])
        
        heapifyViz(arr, i, 0)
        fmt.Printf("After heapify: %v | Sorted: %v\n", arr[:i], arr[i:])
    }
    
    fmt.Printf("Final sorted array: %v\n", arr)
}

func heapifyViz(arr []int, n, i int) {
    for {
        largest := i
        left := 2*i + 1
        right := 2*i + 2
        
        if left < n && arr[left] > arr[largest] {
            largest = left
        }
        
        if right < n && arr[right] > arr[largest] {
            largest = right
        }
        
        if largest == i {
            break
        }
        
        fmt.Printf("  Swapping %d and %d ", arr[i], arr[largest])
        arr[i], arr[largest] = arr[largest], arr[i]
        i = largest
    }
}
```

## Iterative Heapify Implementation

For systems where recursion depth is a concern:

```go
func heapifyIterative(arr []int, n, i int) {
    for {
        largest := i
        left := 2*i + 1
        right := 2*i + 2
        
        // Find largest among root, left child and right child
        if left < n && arr[left] > arr[largest] {
            largest = left
        }
        
        if right < n && arr[right] > arr[largest] {
            largest = right
        }
        
        // If root is largest, heap property is satisfied
        if largest == i {
            break
        }
        
        // Swap and continue with the affected subtree
        arr[i], arr[largest] = arr[largest], arr[i]
        i = largest
    }
}
```

## Min Heap Sort Implementation

For sorting in descending order:

```go
func HeapSortDescending(arr []int) {
    n := len(arr)
    
    // Build min heap
    for i := n/2 - 1; i >= 0; i-- {
        minHeapify(arr, n, i)
    }
    
    // Extract elements from min heap
    for i := n - 1; i > 0; i-- {
        arr[0], arr[i] = arr[i], arr[0]
        minHeapify(arr, i, 0)
    }
}

func minHeapify(arr []int, n, i int) {
    smallest := i
    left := 2*i + 1
    right := 2*i + 2
    
    if left < n && arr[left] < arr[smallest] {
        smallest = left
    }
    
    if right < n && arr[right] < arr[smallest] {
        smallest = right
    }
    
    if smallest != i {
        arr[i], arr[smallest] = arr[smallest], arr[i]
        minHeapify(arr, n, smallest)
    }
}
```

## Heap Operations for Priority Queue

```go
type MaxHeap struct {
    data []int
}

func NewMaxHeap() *MaxHeap {
    return &MaxHeap{data: make([]int, 0)}
}

func (h *MaxHeap) Insert(value int) {
    h.data = append(h.data, value)
    h.heapifyUp(len(h.data) - 1)
}

func (h *MaxHeap) ExtractMax() int {
    if len(h.data) == 0 {
        panic("heap is empty")
    }
    
    max := h.data[0]
    lastIndex := len(h.data) - 1
    h.data[0] = h.data[lastIndex]
    h.data = h.data[:lastIndex]
    
    if len(h.data) > 0 {
        h.heapifyDown(0)
    }
    
    return max
}

func (h *MaxHeap) heapifyUp(i int) {
    for i > 0 {
        parent := (i - 1) / 2
        if h.data[parent] >= h.data[i] {
            break
        }
        h.data[parent], h.data[i] = h.data[i], h.data[parent]
        i = parent
    }
}

func (h *MaxHeap) heapifyDown(i int) {
    n := len(h.data)
    for {
        largest := i
        left := 2*i + 1
        right := 2*i + 2
        
        if left < n && h.data[left] > h.data[largest] {
            largest = left
        }
        
        if right < n && h.data[right] > h.data[largest] {
            largest = right
        }
        
        if largest == i {
            break
        }
        
        h.data[i], h.data[largest] = h.data[largest], h.data[i]
        i = largest
    }
}
```

## Complexity Analysis

### Time Complexity
- **Building Heap**: O(n) - contrary to intuitive O(n log n)
- **Extracting Elements**: O(n log n) - n extractions, each taking O(log n)
- **Overall**: O(n log n) for all cases (best, average, worst)

### Space Complexity
- **Space Complexity**: O(1) - sorts in-place
- **Recursion Stack**: O(log n) for recursive heapify, O(1) for iterative

## Algorithm Characteristics

### Consistency
Heap Sort provides **guaranteed O(n log n)** performance regardless of input distribution.

### In-Place Sorting
The algorithm operates **in-place**, requiring only constant additional memory.

### Instability
Heap Sort is **not stable** - equal elements may not maintain their relative order.

### Cache Performance
**Poor cache locality** compared to Quick Sort due to non-sequential memory access patterns.

## Comparison with Other O(n log n) Algorithms

| Algorithm | Best Case | Average Case | Worst Case | Space | Stable |
|-----------|-----------|--------------|------------|--------|--------|
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |

## Practical Applications

### When to Use Heap Sort
- **Memory-constrained environments**: O(1) space complexity
- **Real-time systems**: Guaranteed O(n log n) performance
- **Large datasets**: Consistent performance scaling
- **Priority queue implementation**: Natural heap operations
- **Partial sorting**: Can stop early to get k largest/smallest elements

### When to Consider Alternatives
- **Cache-sensitive applications**: Poor cache performance
- **Stable sorting required**: Use Merge Sort
- **Small datasets**: Insertion Sort may be faster
- **Average case optimization**: Quick Sort often faster in practice

## k-Largest Elements using Heap Sort

```go
// FindKLargest returns the k largest elements using heap sort technique
func FindKLargest(arr []int, k int) []int {
    if k >= len(arr) {
        HeapSort(arr)
        return arr
    }
    
    n := len(arr)
    
    // Build max heap
    for i := n/2 - 1; i >= 0; i-- {
        heapify(arr, n, i)
    }
    
    result := make([]int, k)
    
    // Extract k largest elements
    for i := 0; i < k; i++ {
        result[i] = arr[0]
        arr[0], arr[n-1-i] = arr[n-1-i], arr[0]
        heapify(arr, n-1-i, 0)
    }
    
    return result
}
```

## Generic Implementation

```go
// HeapSortGeneric sorts any comparable slice using a comparison function
func HeapSortGeneric[T any](arr []T, less func(a, b T) bool) {
    n := len(arr)
    
    // Build max heap
    for i := n/2 - 1; i >= 0; i-- {
        heapifyGeneric(arr, n, i, less)
    }
    
    // Extract elements from heap
    for i := n - 1; i > 0; i-- {
        arr[0], arr[i] = arr[i], arr[0]
        heapifyGeneric(arr, i, 0, less)
    }
}

func heapifyGeneric[T any](arr []T, n, i int, less func(a, b T) bool) {
    largest := i
    left := 2*i + 1
    right := 2*i + 2
    
    if left < n && less(arr[largest], arr[left]) {
        largest = left
    }
    
    if right < n && less(arr[largest], arr[right]) {
        largest = right
    }
    
    if largest != i {
        arr[i], arr[largest] = arr[largest], arr[i]
        heapifyGeneric(arr, n, largest, less)
    }
}
```

## Conclusion

Heap Sort represents an excellent balance between performance guarantees and memory efficiency. Its guaranteed O(n log n) time complexity and O(1) space complexity make it particularly valuable for system-level applications where consistent performance and minimal memory usage are critical.

While it may not achieve the average-case speed of Quick Sort or the cache efficiency of other algorithms, Heap Sort's reliability and the utility of heap data structures in broader computing contexts ensure its continued importance in computer science and software engineering.

Understanding Heap Sort provides essential insights into heap data structures, priority queues, and the design of algorithms that must meet strict performance guarantees under all conditions.
