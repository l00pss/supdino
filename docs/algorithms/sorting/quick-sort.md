---
title: Quick Sort Algorithm
description: Quick Sort is one of the most efficient sorting algorithms using divide-and-conquer strategy to achieve O(n log n) average-case performance.
sidebar_label: Quick Sort
sidebar_position: 5
keywords: [quicksort, sorting, algorithms, divide-and-conquer]
reading_time: 12
last_update:
  date: 2026-01-08
---

# Quick Sort Algorithm

Quick Sort is one of the most efficient and widely used sorting algorithms. It employs a divide-and-conquer strategy to achieve excellent average-case performance of O(n log n), making it the algorithm of choice for many standard library implementations.

## Algorithm Overview

Quick Sort works by selecting a 'pivot' element from the array and partitioning other elements into two subarrays according to whether they are less than or greater than the pivot. The subarrays are then recursively sorted. This process continues until the base case of arrays with zero or one element is reached.

## Algorithmic Process

The Quick Sort algorithm operates through these systematic steps:

1. **Choose Pivot**: Select an element as the pivot (various strategies exist)
2. **Partition**: Rearrange the array so that elements smaller than the pivot come before it, and elements greater come after it
3. **Recursively Sort**: Apply Quick Sort to the sub-arrays on either side of the pivot
4. **Combine**: No explicit combining step needed as sorting is done in-place

## Partitioning Process

The partitioning step is crucial to Quick Sort's efficiency:

```
Before partitioning: [3, 6, 8, 10, 1, 2, 1] (pivot = 6)
After partitioning:  [3, 1, 2, 1] 6 [8, 10]
                     └─ < pivot ─┘   └ > pivot ┘
```

## Step-by-Step Example

Consider sorting the array `[10, 80, 30, 90, 40, 50, 70]` using Quick Sort with the last element as pivot:

```
Initial array: [10, 80, 30, 90, 40, 50, 70] (pivot = 70)

Partition around 70:
[10, 30, 40, 50] 70 [80, 90]

Recursively sort left subarray [10, 30, 40, 50] (pivot = 50):
[10, 30, 40] 50 []

Recursively sort [10, 30, 40] (pivot = 40):
[10, 30] 40 []

Recursively sort [10, 30] (pivot = 30):
[10] 30 []

Recursively sort right subarray [80, 90] (pivot = 90):
[80] 90 []

Final result: [10, 30, 40, 50, 70, 80, 90]
```

## Implementation in Go

```go
package main

import "fmt"

// QuickSort implements the quicksort algorithm
// Time Complexity: O(n log n) average case, O(n²) worst case
// Space Complexity: O(log n) average case due to recursion
func QuickSort(arr []int) {
    quickSortHelper(arr, 0, len(arr)-1)
}

func quickSortHelper(arr []int, low, high int) {
    if low < high {
        // Partition the array and get the pivot index
        pivotIndex := partition(arr, low, high)
        
        // Recursively sort elements before and after partition
        quickSortHelper(arr, low, pivotIndex-1)
        quickSortHelper(arr, pivotIndex+1, high)
    }
}

// partition rearranges the array and returns the pivot index
func partition(arr []int, low, high int) int {
    // Choose the last element as pivot
    pivot := arr[high]
    
    // Index of smaller element (indicates the correct position of pivot)
    i := low - 1
    
    for j := low; j < high; j++ {
        // If current element is smaller than or equal to pivot
        if arr[j] <= pivot {
            i++
            arr[i], arr[j] = arr[j], arr[i]
        }
    }
    
    // Place pivot in its correct position
    arr[i+1], arr[high] = arr[high], arr[i+1]
    
    return i + 1
}

// Demonstration of the algorithm
func main() {
    testArray := []int{10, 80, 30, 90, 40, 50, 70}
    
    fmt.Println("Original array:", testArray)
    QuickSort(testArray)
    fmt.Println("Sorted array:  ", testArray)
}
```

## Enhanced Implementation with Visualization

```go
func QuickSortWithVisualization(arr []int, depth int) {
    quickSortHelperViz(arr, 0, len(arr)-1, depth)
}

func quickSortHelperViz(arr []int, low, high, depth int) {
    indent := ""
    for i := 0; i < depth; i++ {
        indent += "  "
    }
    
    if low < high {
        fmt.Printf("%sSorting subarray: %v (indices %d-%d)\n", 
                  indent, arr[low:high+1], low, high)
        
        pivotIndex := partitionViz(arr, low, high, depth)
        
        fmt.Printf("%sPivot %d placed at index %d: %v\n", 
                  indent, arr[pivotIndex], pivotIndex, arr)
        
        quickSortHelperViz(arr, low, pivotIndex-1, depth+1)
        quickSortHelperViz(arr, pivotIndex+1, high, depth+1)
    }
}

func partitionViz(arr []int, low, high, depth int) int {
    indent := ""
    for i := 0; i <= depth; i++ {
        indent += "  "
    }
    
    pivot := arr[high]
    fmt.Printf("%sPartitioning around pivot %d\n", indent, pivot)
    
    i := low - 1
    
    for j := low; j < high; j++ {
        if arr[j] <= pivot {
            i++
            if i != j {
                fmt.Printf("%s  Swapping %d and %d\n", indent, arr[i], arr[j])
                arr[i], arr[j] = arr[j], arr[i]
            }
        }
    }
    
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1
}
```

## Pivot Selection Strategies

### 1. Last Element as Pivot (Simple)
```go
func partitionLast(arr []int, low, high int) int {
    pivot := arr[high]
    // ... rest of implementation
}
```

### 2. First Element as Pivot
```go
func partitionFirst(arr []int, low, high int) int {
    // Swap first with last
    arr[low], arr[high] = arr[high], arr[low]
    return partition(arr, low, high)
}
```

### 3. Random Pivot
```go
import "math/rand"

func partitionRandom(arr []int, low, high int) int {
    // Choose random pivot and swap with last
    randomIndex := low + rand.Intn(high-low+1)
    arr[randomIndex], arr[high] = arr[high], arr[randomIndex]
    return partition(arr, low, high)
}
```

### 4. Median-of-Three Pivot
```go
func partitionMedianOfThree(arr []int, low, high int) int {
    mid := low + (high-low)/2
    
    // Sort the three elements
    if arr[low] > arr[mid] {
        arr[low], arr[mid] = arr[mid], arr[low]
    }
    if arr[mid] > arr[high] {
        arr[mid], arr[high] = arr[high], arr[mid]
    }
    if arr[low] > arr[mid] {
        arr[low], arr[mid] = arr[mid], arr[low]
    }
    
    // Place median at the end
    arr[mid], arr[high] = arr[high], arr[mid]
    return partition(arr, low, high)
}
```

## Three-Way Quick Sort (Dutch National Flag)

For arrays with many duplicate elements:

```go
func QuickSort3Way(arr []int) {
    quickSort3WayHelper(arr, 0, len(arr)-1)
}

func quickSort3WayHelper(arr []int, low, high int) {
    if low < high {
        lt, gt := partition3Way(arr, low, high)
        quickSort3WayHelper(arr, low, lt-1)
        quickSort3WayHelper(arr, gt+1, high)
    }
}

func partition3Way(arr []int, low, high int) (int, int) {
    pivot := arr[low]
    i := low
    lt := low      // arr[low..lt-1] < pivot
    gt := high + 1 // arr[gt..high] > pivot
    
    for i < gt {
        if arr[i] < pivot {
            arr[lt], arr[i] = arr[i], arr[lt]
            lt++
            i++
        } else if arr[i] > pivot {
            gt--
            arr[i], arr[gt] = arr[gt], arr[i]
        } else {
            i++
        }
    }
    
    return lt, gt
}
```

## Iterative Implementation

To avoid recursion stack overflow for large arrays:

```go
func QuickSortIterative(arr []int) {
    if len(arr) <= 1 {
        return
    }
    
    stack := make([]int, 0, 2*len(arr))
    stack = append(stack, 0, len(arr)-1)
    
    for len(stack) > 0 {
        // Pop high and low
        high := stack[len(stack)-1]
        low := stack[len(stack)-2]
        stack = stack[:len(stack)-2]
        
        // Partition and get pivot
        pivotIndex := partition(arr, low, high)
        
        // Push left subarray to stack
        if pivotIndex-1 > low {
            stack = append(stack, low, pivotIndex-1)
        }
        
        // Push right subarray to stack
        if pivotIndex+1 < high {
            stack = append(stack, pivotIndex+1, high)
        }
    }
}
```

## Complexity Analysis

### Time Complexity
- **Best Case**: O(n log n) - when the pivot divides the array into two equal halves
- **Average Case**: O(n log n) - with good pivot selection
- **Worst Case**: O(n²) - when the pivot is always the smallest or largest element

### Space Complexity
- **Best/Average Case**: O(log n) - recursion depth
- **Worst Case**: O(n) - when the recursion depth becomes linear

## Algorithm Characteristics

### In-Place Sorting
Quick Sort operates **in-place**, requiring only a small constant amount of additional storage space.

### Instability
Quick Sort is **not stable** by default, though stable variants exist.

### Cache Efficiency
Excellent **cache performance** due to good locality of reference.

### Practical Performance
Despite O(n²) worst-case, Quick Sort is often faster than other O(n log n) algorithms in practice.

## Optimizations

### Tail Recursion Elimination
```go
func quickSortTailOptimized(arr []int, low, high int) {
    for low < high {
        pivotIndex := partition(arr, low, high)
        
        // Recursively sort the smaller partition first
        if pivotIndex-low < high-pivotIndex {
            quickSortTailOptimized(arr, low, pivotIndex-1)
            low = pivotIndex + 1
        } else {
            quickSortTailOptimized(arr, pivotIndex+1, high)
            high = pivotIndex - 1
        }
    }
}
```

### Hybrid with Insertion Sort
```go
const INSERTION_SORT_THRESHOLD = 10

func quickSortHybrid(arr []int, low, high int) {
    if high-low+1 < INSERTION_SORT_THRESHOLD {
        insertionSort(arr[low:high+1])
        return
    }
    
    if low < high {
        pivotIndex := partition(arr, low, high)
        quickSortHybrid(arr, low, pivotIndex-1)
        quickSortHybrid(arr, pivotIndex+1, high)
    }
}
```

## Generic Implementation

```go
// QuickSortGeneric sorts any comparable slice using a comparison function
func QuickSortGeneric[T any](arr []T, less func(a, b T) bool) {
    quickSortGenericHelper(arr, 0, len(arr)-1, less)
}

func quickSortGenericHelper[T any](arr []T, low, high int, less func(a, b T) bool) {
    if low < high {
        pivotIndex := partitionGeneric(arr, low, high, less)
        quickSortGenericHelper(arr, low, pivotIndex-1, less)
        quickSortGenericHelper(arr, pivotIndex+1, high, less)
    }
}

func partitionGeneric[T any](arr []T, low, high int, less func(a, b T) bool) int {
    pivot := arr[high]
    i := low - 1
    
    for j := low; j < high; j++ {
        if less(arr[j], pivot) || !less(pivot, arr[j]) {
            i++
            arr[i], arr[j] = arr[j], arr[i]
        }
    }
    
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1
}
```

## Practical Applications

### When to Use Quick Sort
- **General-purpose sorting**: Excellent average-case performance
- **Large datasets**: Scales well with good cache performance
- **In-place sorting required**: Minimal memory overhead
- **Standard library implementations**: Often the default choice

### When to Consider Alternatives
- **Worst-case guarantees needed**: Use Heap Sort or Merge Sort
- **Stable sorting required**: Use Merge Sort or Stable Sort
- **Small datasets**: Insertion Sort may be faster
- **Many duplicates**: Three-way Quick Sort or other specialized algorithms

## Conclusion

Quick Sort represents one of the most practical and efficient sorting algorithms available. Its combination of excellent average-case performance, in-place operation, and cache efficiency makes it the algorithm of choice for many real-world applications.

Understanding Quick Sort provides crucial insights into divide-and-conquer algorithm design, pivot selection strategies, and the trade-offs between worst-case guarantees and practical performance. The algorithm's various optimizations and variants demonstrate important principles of algorithm engineering and performance tuning.

Quick Sort's enduring popularity in standard library implementations across programming languages testifies to its practical value and effectiveness in solving the fundamental problem of data ordering.
