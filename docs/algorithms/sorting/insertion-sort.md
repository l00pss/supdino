---
title: Insertion Sort Algorithm
description: Insertion Sort is an efficient algorithm for small datasets, building the sorted array by inserting elements into their correct position one at a time.
sidebar_label: Insertion Sort
sidebar_position: 3
keywords: [insertion-sort, sorting, algorithms, comparison-sort]
reading_time: 8
last_update:
  date: 2025-12-10
---

# Insertion Sort Algorithm

Insertion Sort is an efficient algorithm for sorting small datasets. It builds the final sorted array one element at a time by repeatedly taking elements from the unsorted portion and inserting them into their correct position within the sorted portion.

## Algorithm Overview

Insertion Sort works similarly to how most people sort playing cards in their hands. The algorithm maintains two regions in the array: elements 0 through i-1 are sorted, and elements i through n-1 are unsorted. It takes each element from the unsorted region and inserts it into the correct position in the sorted region.

## Algorithmic Process

The Insertion Sort algorithm follows these systematic steps:

1. **Start**: Begin with the second element (index 1), as a single element is trivially sorted
2. **Select**: Take the current element from the unsorted portion
3. **Compare**: Compare it with elements in the sorted portion from right to left
4. **Shift**: Shift larger elements one position to the right
5. **Insert**: Place the current element in its correct position
6. **Advance**: Move to the next element in the unsorted portion

## Step-by-Step Example

Consider sorting the array `[12, 11, 13, 5, 6]` using Insertion Sort:

```
Initial array: [12, 11, 13, 5, 6]
Sorted portion: [12], Unsorted: [11, 13, 5, 6]

Pass 1: Insert 11
        Compare 11 with 12: 11 < 12, so shift 12 right
        Insert 11 at position 0: [11, 12, 13, 5, 6]

Pass 2: Insert 13
        Compare 13 with 12: 13 > 12, so 13 stays in position
        Result: [11, 12, 13, 5, 6]

Pass 3: Insert 5
        Compare 5 with 13: 5 < 13, shift 13 right
        Compare 5 with 12: 5 < 12, shift 12 right
        Compare 5 with 11: 5 < 11, shift 11 right
        Insert 5 at position 0: [5, 11, 12, 13, 6]

Pass 4: Insert 6
        Compare 6 with 13: 6 < 13, shift 13 right
        Compare 6 with 12: 6 < 12, shift 12 right
        Compare 6 with 11: 6 < 11, shift 11 right
        Compare 6 with 5: 6 > 5, so insert 6 at position 1
        Result: [5, 6, 11, 12, 13]

Final result: [5, 6, 11, 12, 13]
```

## Implementation in Go

```go
package main

import "fmt"

// InsertionSort implements the insertion sort algorithm
// Time Complexity: O(n²) worst and average case, O(n) best case
// Space Complexity: O(1)
func InsertionSort(arr []int) {
    n := len(arr)
    
    // Start from the second element (index 1)
    for i := 1; i < n; i++ {
        key := arr[i]  // Element to be inserted
        j := i - 1     // Index of the last element in sorted portion
        
        // Move elements greater than key one position ahead
        for j >= 0 && arr[j] > key {
            arr[j+1] = arr[j]
            j--
        }
        
        // Insert the key at its correct position
        arr[j+1] = key
    }
}

// Demonstration of the algorithm
func main() {
    testArray := []int{12, 11, 13, 5, 6}
    
    fmt.Println("Original array:", testArray)
    InsertionSort(testArray)
    fmt.Println("Sorted array:  ", testArray)
}
```

## Enhanced Implementation with Visualization

```go
func InsertionSortWithVisualization(arr []int) {
    n := len(arr)
    fmt.Printf("Starting array: %v\n", arr)
    
    for i := 1; i < n; i++ {
        key := arr[i]
        j := i - 1
        
        fmt.Printf("\nPass %d: Inserting %d\n", i, key)
        fmt.Printf("  Sorted portion: %v\n", arr[:i])
        
        // Move elements greater than key one position ahead
        shifts := 0
        for j >= 0 && arr[j] > key {
            arr[j+1] = arr[j]
            j--
            shifts++
        }
        
        // Insert the key at its correct position
        arr[j+1] = key
        
        fmt.Printf("  Performed %d shifts\n", shifts)
        fmt.Printf("  Array after insertion: %v\n", arr)
    }
}
```

## Binary Insertion Sort Optimization

For better performance when dealing with larger sorted portions, we can use binary search to find the insertion position:

```go
// BinaryInsertionSort uses binary search to find insertion position
func BinaryInsertionSort(arr []int) {
    n := len(arr)
    
    for i := 1; i < n; i++ {
        key := arr[i]
        
        // Find insertion position using binary search
        left, right := 0, i
        
        for left < right {
            mid := (left + right) / 2
            if arr[mid] <= key {
                left = mid + 1
            } else {
                right = mid
            }
        }
        
        // Shift elements and insert
        for j := i; j > left; j-- {
            arr[j] = arr[j-1]
        }
        arr[left] = key
    }
}
```

## Complexity Analysis

### Time Complexity
- **Best Case**: O(n) - when the array is already sorted
- **Average Case**: O(n²) - typical performance with randomly ordered data
- **Worst Case**: O(n²) - when the array is sorted in reverse order

### Space Complexity
- **Space Complexity**: O(1) - the algorithm sorts in-place

## Algorithm Characteristics

### Stability
Insertion Sort is **stable**, preserving the relative order of equal elements.

### Adaptivity
The algorithm is **adaptive**, performing significantly better on partially sorted data.

### Online Algorithm
Insertion Sort can sort a list as it receives it, making it an **online algorithm**.

### In-Place Sorting
The algorithm operates **in-place**, requiring only constant additional memory.

## Comparison with Other Sorting Algorithms

| Algorithm | Best Case | Average Case | Worst Case | Stable | Adaptive |
|-----------|-----------|--------------|------------|--------|----------|
| Insertion Sort | O(n) | O(n²) | O(n²) | Yes | Yes |
| Bubble Sort | O(n) | O(n²) | O(n²) | Yes | Yes |
| Selection Sort | O(n²) | O(n²) | O(n²) | No | No |

## Practical Applications

### When to Use Insertion Sort
- **Small datasets**: Excellent performance for arrays with fewer than 50 elements
- **Nearly sorted data**: Takes advantage of existing order
- **Online sorting**: Can sort data as it arrives
- **Hybrid algorithms**: Used as a subroutine in advanced algorithms like Timsort
- **Educational purposes**: Clear demonstration of incremental sorting

### When to Avoid Insertion Sort
- **Large datasets**: Performance degrades significantly
- **Random data**: No advantage over other O(n²) algorithms
- **Memory-constrained recursive calls**: Though this doesn't apply to the iterative version

## Advanced Variations

### Shell Sort
Shell Sort is a generalization of Insertion Sort that allows exchanges of elements that are far apart:

```go
func ShellSort(arr []int) {
    n := len(arr)
    
    // Start with a large gap and reduce it
    for gap := n / 2; gap > 0; gap /= 2 {
        // Perform insertion sort on elements separated by gap
        for i := gap; i < n; i++ {
            key := arr[i]
            j := i
            
            for j >= gap && arr[j-gap] > key {
                arr[j] = arr[j-gap]
                j -= gap
            }
            arr[j] = key
        }
    }
}
```

## Generic Implementation

```go
// InsertionSortGeneric sorts any comparable slice using a comparison function
func InsertionSortGeneric[T any](arr []T, less func(a, b T) bool) {
    n := len(arr)
    
    for i := 1; i < n; i++ {
        key := arr[i]
        j := i - 1
        
        for j >= 0 && !less(arr[j], key) {
            arr[j+1] = arr[j]
            j--
        }
        arr[j+1] = key
    }
}

// Usage example
func ExampleUsage() {
    // Sort integers in ascending order
    numbers := []int{5, 2, 8, 1, 9}
    InsertionSortGeneric(numbers, func(a, b int) bool { return a < b })
    
    // Sort strings by length
    words := []string{"apple", "pie", "banana", "cat"}
    InsertionSortGeneric(words, func(a, b string) bool { return len(a) < len(b) })
}
```

## Conclusion

Insertion Sort is a fundamental sorting algorithm that demonstrates the power of adaptive and stable sorting. Its excellent performance on small and nearly sorted datasets makes it a valuable tool in algorithm design, particularly as a component of hybrid sorting algorithms. Understanding Insertion Sort provides essential insights into incremental algorithm design and serves as a stepping stone to more complex sorting methods.

The algorithm's simplicity, combined with its practical advantages in specific scenarios, ensures its continued relevance in computer science education and real-world applications.
