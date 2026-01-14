---
title: Selection Sort Algorithm
description: Selection Sort is a simple comparison-based algorithm that builds the sorted array by repeatedly finding the minimum element from the unsorted portion.
sidebar_label: Selection Sort
sidebar_position: 2
keywords: [selection-sort, sorting, algorithms, comparison-sort]
reading_time: 7
last_update:
  date: 2025-12-05
---

# Selection Sort Algorithm

Selection Sort is a simple comparison-based sorting algorithm that builds the final sorted array one element at a time. It is characterized by its straightforward approach of repeatedly finding the minimum element from the unsorted portion and placing it at the beginning.

## Algorithm Overview

Selection Sort works by dividing the input array into two conceptual regions: a sorted region at the beginning and an unsorted region at the end. The algorithm repeatedly selects the smallest element from the unsorted region and swaps it with the first element of the unsorted region, effectively expanding the sorted region by one element.

## Algorithmic Process

The Selection Sort algorithm follows these systematic steps:

1. **Initialize**: Set the first position as the minimum
2. **Search**: Find the minimum element in the remaining unsorted array
3. **Swap**: Exchange the found minimum element with the first element of unsorted region
4. **Advance**: Move the boundary of sorted and unsorted regions by one position
5. **Repeat**: Continue until the entire array is sorted

## Step-by-Step Example

Consider sorting the array `[64, 25, 12, 22, 11]` using Selection Sort:

```
Initial array: [64, 25, 12, 22, 11]

Pass 1: Find minimum in [64, 25, 12, 22, 11]
        Minimum is 11 at index 4
        Swap with element at index 0: [11, 25, 12, 22, 64]

Pass 2: Find minimum in [25, 12, 22, 64]
        Minimum is 12 at index 2
        Swap with element at index 1: [11, 12, 25, 22, 64]

Pass 3: Find minimum in [25, 22, 64]
        Minimum is 22 at index 3
        Swap with element at index 2: [11, 12, 22, 25, 64]

Pass 4: Find minimum in [25, 64]
        Minimum is 25 at index 3
        No swap needed: [11, 12, 22, 25, 64]

Final result: [11, 12, 22, 25, 64]
```

## Implementation in Go

```go
package main

import "fmt"

// SelectionSort implements the selection sort algorithm
// Time Complexity: O(n²) for all cases
// Space Complexity: O(1)
func SelectionSort(arr []int) {
    n := len(arr)
    
    // Move boundary of unsorted subarray
    for i := 0; i < n-1; i++ {
        // Find the minimum element in remaining unsorted array
        minIndex := i
        
        for j := i + 1; j < n; j++ {
            if arr[j] < arr[minIndex] {
                minIndex = j
            }
        }
        
        // Swap the found minimum element with the first element
        if minIndex != i {
            arr[i], arr[minIndex] = arr[minIndex], arr[i]
        }
    }
}

// Demonstration of the algorithm
func main() {
    testArray := []int{64, 25, 12, 22, 11}
    
    fmt.Println("Original array:", testArray)
    SelectionSort(testArray)
    fmt.Println("Sorted array:  ", testArray)
}
```

## Enhanced Implementation with Visualization

```go
func SelectionSortWithVisualization(arr []int) {
    n := len(arr)
    fmt.Printf("Starting array: %v\n", arr)
    
    for i := 0; i < n-1; i++ {
        fmt.Printf("\nPass %d:\n", i+1)
        minIndex := i
        
        // Find minimum in unsorted portion
        for j := i + 1; j < n; j++ {
            if arr[j] < arr[minIndex] {
                minIndex = j
            }
        }
        
        // Perform swap if necessary
        if minIndex != i {
            fmt.Printf("  Minimum %d found at index %d, swapping with %d at index %d\n", 
                      arr[minIndex], minIndex, arr[i], i)
            arr[i], arr[minIndex] = arr[minIndex], arr[i]
        } else {
            fmt.Printf("  Element %d at index %d is already in correct position\n", 
                      arr[i], i)
        }
        
        fmt.Printf("  Array after pass: %v\n", arr)
    }
}
```

## Complexity Analysis

### Time Complexity
- **Best Case**: O(n²) - even if the array is already sorted, the algorithm still performs all comparisons
- **Average Case**: O(n²) - typical performance with randomly ordered data
- **Worst Case**: O(n²) - occurs when the array is sorted in reverse order

### Space Complexity
- **Space Complexity**: O(1) - the algorithm sorts in-place, requiring only constant additional memory

## Algorithm Characteristics

### Stability
Selection Sort is **not stable** by default, meaning that equal elements may not maintain their relative order. However, it can be made stable with slight modifications.

### In-Place Sorting
Selection Sort operates **in-place**, modifying the original array without requiring additional storage proportional to the input size.

### Number of Swaps
Selection Sort performs at most n-1 swaps, which is optimal among comparison-based sorting algorithms in terms of number of writes.

## Comparison with Bubble Sort

| Aspect | Selection Sort | Bubble Sort |
|--------|----------------|-------------|
| Time Complexity | O(n²) all cases | O(n²) worst/average, O(n) best |
| Number of Swaps | O(n) | O(n²) |
| Stability | No | Yes |
| Adaptivity | No | Yes |

## Practical Applications

### When to Use Selection Sort
- **Memory-constrained environments**: Minimal memory overhead
- **Small datasets**: Acceptable performance for small arrays
- **Minimizing writes**: When the cost of swapping is high
- **Educational purposes**: Clear demonstration of selection-based sorting

### When to Avoid Selection Sort
- **Large datasets**: Poor performance scaling
- **Stability requirements**: Does not preserve relative order of equal elements
- **Performance-critical applications**: Better alternatives available

## Generic Implementation

```go
// SelectionSortGeneric sorts any comparable slice using a comparison function
func SelectionSortGeneric[T any](arr []T, less func(a, b T) bool) {
    n := len(arr)
    
    for i := 0; i < n-1; i++ {
        minIndex := i
        
        for j := i + 1; j < n; j++ {
            if less(arr[j], arr[minIndex]) {
                minIndex = j
            }
        }
        
        if minIndex != i {
            arr[i], arr[minIndex] = arr[minIndex], arr[i]
        }
    }
}

// Usage example
func ExampleUsage() {
    // Sort integers in ascending order
    numbers := []int{5, 2, 8, 1, 9}
    SelectionSortGeneric(numbers, func(a, b int) bool { return a < b })
    
    // Sort strings alphabetically
    words := []string{"banana", "apple", "cherry"}
    SelectionSortGeneric(words, func(a, b string) bool { return a < b })
}
```

## Conclusion

Selection Sort provides a clear example of a selection-based sorting approach. While its O(n²) time complexity limits its use for large datasets, its simplicity and minimal memory requirements make it valuable for educational purposes and specific scenarios where the number of swaps must be minimized.

Understanding Selection Sort provides foundation for more advanced selection-based algorithms and helps in choosing the appropriate sorting method based on specific requirements.
