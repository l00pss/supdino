---
title: Gaussian Elimination
description: Detailed study of Gaussian elimination algorithm for solving systems of linear equations with computational implementation.
sidebar_label: Gaussian Elimination
sidebar_position: 3
keywords: [gaussian-elimination, gauss-jordan, row-reduction, linear-algebra, algorithms]
reading_time: 15
last_update:
  date: 2026-02-23
---

# Gaussian Elimination

Gaussian elimination is the fundamental algorithm for solving systems of linear equations. Named after Carl Friedrich Gauss, this method systematically transforms the augmented matrix into row echelon form through elementary row operations, enabling efficient solution computation.

## Algorithm Overview

Gaussian elimination consists of two main phases:

1. **Forward Elimination**: Transform the augmented matrix to upper triangular (row echelon) form
2. **Back Substitution**: Solve for variables starting from the last equation upward

The algorithm uses elementary row operations that preserve the solution set while simplifying the system structure.

## Elementary Row Operations

Three types of operations are permitted, each preserving the solution set:

**Type 1 - Row Swapping**: Exchange two rows
```
Rᵢ ↔ Rⱼ
```

**Type 2 - Row Scaling**: Multiply a row by a non-zero scalar
```
Rᵢ → c·Rᵢ  (where c ≠ 0)
```

**Type 3 - Row Addition**: Add a multiple of one row to another
```
Rᵢ → Rᵢ + c·Rⱼ
```

These operations form the foundation of the elimination process.

## Forward Elimination Process

The forward elimination phase systematically creates zeros below the diagonal:

### Step-by-Step Procedure

For an n×n system with augmented matrix [A|b]:

1. **Select pivot**: Choose the element in position (k,k) for column k
2. **Eliminate below**: For each row i > k, compute multiplier mᵢₖ = aᵢₖ/aₖₖ
3. **Update row**: Perform Rᵢ → Rᵢ - mᵢₖ·Rₖ
4. **Repeat**: Continue for k = 1, 2, ..., n-1


### Detailed Example

Solve the system:
```
x + 2y + z = 9
2x - y + 3z = 8
3x + y - z = 3
```

**Initial augmented matrix**:
```
[1  2  1 |  9]
[2 -1  3 |  8]
[3  1 -1 |  3]
```

**Step 1**: Eliminate first column below pivot (1,1)

For row 2: m₂₁ = 2/1 = 2, so R₂ → R₂ - 2·R₁
```
[1  2  1 |  9]
[0 -5  1 | -10]
[3  1 -1 |  3]
```

For row 3: m₃₁ = 3/1 = 3, so R₃ → R₃ - 3·R₁
```
[1  2  1 |  9]
[0 -5  1 | -10]
[0 -5 -4 | -24]
```

**Step 2**: Eliminate second column below pivot (2,2)

For row 3: m₃₂ = -5/-5 = 1, so R₃ → R₃ - 1·R₂
```
[1  2  1 |  9]
[0 -5  1 | -10]
[0  0 -5 | -14]
```

The matrix is now in upper triangular form (row echelon form).

## Back Substitution

Once in upper triangular form, solve for variables from bottom to top:

From the example above:

**Row 3**: -5z = -14 → z = 14/5 = 2.8

**Row 2**: -5y + z = -10 → -5y + 2.8 = -10 → y = 2.56

**Row 1**: x + 2y + z = 9 → x + 2(2.56) + 2.8 = 9 → x = 0.88

Solution: (x, y, z) = (0.88, 2.56, 2.8)

## Partial Pivoting

Partial pivoting improves numerical stability by selecting the largest available pivot in each column.

### Pivoting Strategy

At step k, before elimination:
1. Find the row i ≥ k with largest |aᵢₖ|
2. Swap row i with row k
3. Proceed with elimination

This reduces rounding errors in floating-point arithmetic.

### Example with Pivoting

Consider:
```
[0.0001  1 | 1]
[1       1 | 2]
```

**Without pivoting**: Multiplier = 1/0.0001 = 10000, leading to large rounding errors

**With pivoting**: Swap rows first
```
[1       1 | 2]
[0.0001  1 | 1]
```
Now multiplier = 0.0001/1 = 0.0001, much more stable


## Gauss-Jordan Elimination

Gauss-Jordan elimination extends the basic algorithm to produce reduced row echelon form (RREF), where solutions can be read directly.

### RREF Properties

A matrix is in reduced row echelon form when:

1. All zero rows are at the bottom
2. The first non-zero entry in each row (pivot) is 1
3. Each pivot is the only non-zero entry in its column
4. Pivots move strictly to the right in successive rows

### Algorithm Modification

After forward elimination:
1. Scale each pivot row so pivot = 1
2. Eliminate entries above each pivot (not just below)
3. Result: Identity matrix on left side, solution on right

### Example

Starting from upper triangular form:
```
[1  2  1 |  9]
[0 -5  1 | -10]
[0  0 -5 | -14]
```

**Step 1**: Scale rows to make pivots = 1
```
[1  2    1   |  9]
[0  1  -0.2  |  2]
[0  0    1   | 2.8]
```

**Step 2**: Eliminate above pivot in column 3
```
[1  2  0 | 6.2]
[0  1  0 | 2.56]
[0  0  1 | 2.8]
```

**Step 3**: Eliminate above pivot in column 2
```
[1  0  0 | 0.88]
[0  1  0 | 2.56]
[0  0  1 | 2.8]
```

Solution can be read directly: x = 0.88, y = 2.56, z = 2.8

## Computational Implementation in Go

```go
package main

import (
    "fmt"
    "math"
)

// Matrix represents a 2D matrix with floating-point entries
type Matrix struct {
    Rows, Cols int
    Data       [][]float64
}

// NewMatrix creates a new matrix with specified dimensions
func NewMatrix(rows, cols int) *Matrix {
    data := make([][]float64, rows)
    for i := range data {
        data[i] = make([]float64, cols)
    }
    return &Matrix{Rows: rows, Cols: cols, Data: data}
}

// SwapRows exchanges two rows in the matrix
func (m *Matrix) SwapRows(i, j int) {
    m.Data[i], m.Data[j] = m.Data[j], m.Data[i]
}


// ScaleRow multiplies a row by a scalar
func (m *Matrix) ScaleRow(row int, scalar float64) {
    for j := 0; j < m.Cols; j++ {
        m.Data[row][j] *= scalar
    }
}

// AddScaledRow adds a multiple of one row to another
func (m *Matrix) AddScaledRow(targetRow, sourceRow int, scalar float64) {
    for j := 0; j < m.Cols; j++ {
        m.Data[targetRow][j] += scalar * m.Data[sourceRow][j]
    }
}

// GaussianElimination solves Ax = b using Gaussian elimination with partial pivoting
func GaussianElimination(A *Matrix, b []float64) ([]float64, error) {
    n := A.Rows
    if A.Cols != n || len(b) != n {
        return nil, fmt.Errorf("invalid dimensions: A must be square and b must match")
    }
    
    // Create augmented matrix [A|b]
    aug := NewMatrix(n, n+1)
    for i := 0; i < n; i++ {
        copy(aug.Data[i][:n], A.Data[i])
        aug.Data[i][n] = b[i]
    }
    
    // Forward elimination with partial pivoting
    for k := 0; k < n; k++ {
        // Find pivot (largest absolute value in column k)
        maxRow := k
        for i := k + 1; i < n; i++ {
            if math.Abs(aug.Data[i][k]) > math.Abs(aug.Data[maxRow][k]) {
                maxRow = i
            }
        }
        
        // Check for singular matrix
        if math.Abs(aug.Data[maxRow][k]) < 1e-10 {
            return nil, fmt.Errorf("matrix is singular or nearly singular")
        }
        
        // Swap rows if necessary
        if maxRow != k {
            aug.SwapRows(k, maxRow)
        }
        
        // Eliminate column entries below pivot
        for i := k + 1; i < n; i++ {
            factor := aug.Data[i][k] / aug.Data[k][k]
            aug.AddScaledRow(i, k, -factor)
        }
    }
    
    // Back substitution
    x := make([]float64, n)
    for i := n - 1; i >= 0; i-- {
        sum := aug.Data[i][n]
        for j := i + 1; j < n; j++ {
            sum -= aug.Data[i][j] * x[j]
        }
        x[i] = sum / aug.Data[i][i]
    }
    
    return x, nil
}


// GaussJordan performs Gauss-Jordan elimination to find RREF
func GaussJordan(A *Matrix, b []float64) ([]float64, error) {
    n := A.Rows
    if A.Cols != n || len(b) != n {
        return nil, fmt.Errorf("invalid dimensions")
    }
    
    aug := NewMatrix(n, n+1)
    for i := 0; i < n; i++ {
        copy(aug.Data[i][:n], A.Data[i])
        aug.Data[i][n] = b[i]
    }
    
    // Forward elimination with partial pivoting
    for k := 0; k < n; k++ {
        // Find pivot
        maxRow := k
        for i := k + 1; i < n; i++ {
            if math.Abs(aug.Data[i][k]) > math.Abs(aug.Data[maxRow][k]) {
                maxRow = i
            }
        }
        
        if math.Abs(aug.Data[maxRow][k]) < 1e-10 {
            return nil, fmt.Errorf("matrix is singular")
        }
        
        if maxRow != k {
            aug.SwapRows(k, maxRow)
        }
        
        // Scale pivot row to make pivot = 1
        aug.ScaleRow(k, 1.0/aug.Data[k][k])
        
        // Eliminate all other entries in column k (both above and below)
        for i := 0; i < n; i++ {
            if i != k {
                factor := aug.Data[i][k]
                aug.AddScaledRow(i, k, -factor)
            }
        }
    }
    
    // Extract solution from last column
    x := make([]float64, n)
    for i := 0; i < n; i++ {
        x[i] = aug.Data[i][n]
    }
    
    return x, nil
}

// PrintMatrix displays a matrix in readable format
func PrintMatrix(m *Matrix) {
    for i := 0; i < m.Rows; i++ {
        fmt.Print("[")
        for j := 0; j < m.Cols; j++ {
            fmt.Printf("%8.3f", m.Data[i][j])
        }
        fmt.Println(" ]")
    }
}

func main() {
    // Example 1: 3×3 system
    fmt.Println("Example 1: Solving 3×3 system")
    fmt.Println("x + 2y + z = 9")
    fmt.Println("2x - y + 3z = 8")
    fmt.Println("3x + y - z = 3")
    fmt.Println()
    
    A1 := NewMatrix(3, 3)
    A1.Data[0] = []float64{1, 2, 1}
    A1.Data[1] = []float64{2, -1, 3}
    A1.Data[2] = []float64{3, 1, -1}
    b1 := []float64{9, 8, 3}
    
    solution1, err := GaussianElimination(A1, b1)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
    } else {
        fmt.Printf("Solution using Gaussian Elimination:\n")
        fmt.Printf("x = %.4f, y = %.4f, z = %.4f\n\n", 
                   solution1[0], solution1[1], solution1[2])
    }

    
    // Example 2: 2×2 system using Gauss-Jordan
    fmt.Println("Example 2: Solving 2×2 system")
    fmt.Println("2x + 3y = 8")
    fmt.Println("x - y = 1")
    fmt.Println()
    
    A2 := NewMatrix(2, 2)
    A2.Data[0] = []float64{2, 3}
    A2.Data[1] = []float64{1, -1}
    b2 := []float64{8, 1}
    
    solution2, err := GaussJordan(A2, b2)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
    } else {
        fmt.Printf("Solution using Gauss-Jordan:\n")
        fmt.Printf("x = %.4f, y = %.4f\n\n", solution2[0], solution2[1])
    }
    
    // Example 3: Larger system (4×4)
    fmt.Println("Example 3: Solving 4×4 system")
    A3 := NewMatrix(4, 4)
    A3.Data[0] = []float64{2, 1, -1, 1}
    A3.Data[1] = []float64{1, 3, 2, -1}
    A3.Data[2] = []float64{-1, 2, 1, 2}
    A3.Data[3] = []float64{1, -1, 2, 1}
    b3 := []float64{8, 13, 5, 6}
    
    fmt.Println("Coefficient matrix A:")
    PrintMatrix(A3)
    fmt.Printf("\nConstant vector b: %v\n\n", b3)
    
    solution3, err := GaussianElimination(A3, b3)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
    } else {
        fmt.Printf("Solution:\n")
        for i, val := range solution3 {
            fmt.Printf("x%d = %.4f\n", i+1, val)
        }
    }
}
```

## Computational Complexity

### Time Complexity

**Forward Elimination**: 
- For each of n columns: eliminate n-k rows
- Operations: Σ(k=1 to n-1) k(n-k) ≈ n³/3

**Back Substitution**: 
- For each of n variables: compute sum of k terms
- Operations: Σ(k=1 to n) k ≈ n²/2

**Total**: O(n³) for forward elimination dominates

### Space Complexity

- In-place modification: O(1) additional space
- With copying: O(n²) for matrix storage

### Comparison with Other Methods

| Method | Time Complexity | Space | Notes |
|--------|----------------|-------|-------|
| Gaussian Elimination | O(n³) | O(n²) | Most practical |
| Gauss-Jordan | O(n³) | O(n²) | Slightly more operations |
| Matrix Inversion | O(n³) | O(n²) | Less efficient |
| Cramer's Rule | O(n! × n) | O(n²) | Impractical for n > 3 |


## Numerical Stability Considerations

### Sources of Error

**Round-off Error**: Floating-point arithmetic introduces small errors that can accumulate

**Catastrophic Cancellation**: Subtracting nearly equal numbers loses significant digits

**Small Pivots**: Division by very small numbers amplifies errors

### Stability Improvements

**Partial Pivoting**: Select largest available pivot in each column
- Reduces error propagation
- Standard practice in numerical libraries

**Complete Pivoting**: Search entire remaining submatrix for largest element
- Maximum stability but more expensive
- Rarely needed in practice

**Scaled Partial Pivoting**: Consider row scaling when selecting pivot
- Accounts for different equation magnitudes
- More sophisticated than simple partial pivoting

### Condition Number

The condition number κ(A) measures sensitivity to perturbations:

κ(A) = ||A|| × ||A⁻¹||

**Interpretation**:
- κ(A) ≈ 1: Well-conditioned (stable)
- κ(A) >> 1: Ill-conditioned (unstable)
- κ(A) = 10^k: Lose approximately k digits of precision

## Special Cases and Edge Conditions

### Singular Matrices

When det(A) = 0, the system either:
- Has no solution (inconsistent)
- Has infinitely many solutions (underdetermined)

**Detection**: Pivot becomes zero (or very small) during elimination

### Underdetermined Systems

More unknowns than equations (n > m):
- Infinitely many solutions (if consistent)
- Free variables parameterize solution space
- RREF reveals free variables

### Overdetermined Systems

More equations than unknowns (m > n):
- Usually inconsistent (no exact solution)
- Least squares provides best approximate solution
- Gaussian elimination can detect inconsistency

## Practice Problems

1. **Manual Calculation**: Solve using Gaussian elimination with partial pivoting
   ```
   2x + y - z = 8
   -3x - y + 2z = -11
   -2x + y + 2z = -3
   ```

2. **Pivoting Exercise**: Explain why pivoting is necessary for
   ```
   0.0001x + y = 1
   x + y = 2
   ```
   Solve both with and without pivoting (use 4 decimal places).

3. **RREF Practice**: Convert to reduced row echelon form
   ```
   [2  1  3 | 1]
   [4  1  0 | 3]
   [2  2  3 | 0]
   ```

4. **Programming Exercise**: Modify the Go implementation to:
   - Count the number of row operations performed
   - Detect singular matrices and report rank
   - Implement scaled partial pivoting


## Historical Context

Carl Friedrich Gauss (1777-1855) developed this method while working on astronomical calculations. Though the basic technique was known earlier, Gauss systematized it and recognized its computational efficiency.

The method became fundamental to numerical linear algebra and remains the basis for modern computational approaches to solving linear systems.

## Variants and Extensions

### LU Decomposition

Gaussian elimination implicitly computes A = LU factorization:
- L: Lower triangular (multipliers from elimination)
- U: Upper triangular (result of elimination)

**Advantage**: Solve multiple systems Ax = b with different b efficiently

### Cholesky Decomposition

For symmetric positive-definite matrices: A = LL^T
- More efficient than general LU
- Requires only n³/3 operations (half of LU)

### Block Gaussian Elimination

Partition matrix into blocks and eliminate block-wise:
- Exploits matrix structure
- Enables parallel computation
- Useful for very large systems

## Key Concepts Summary

1. **Elementary row operations** preserve solution sets
2. **Forward elimination** creates upper triangular form
3. **Partial pivoting** ensures numerical stability
4. **Back substitution** recovers solution efficiently
5. **Gauss-Jordan** produces RREF for direct solution reading
6. **Complexity** is O(n³), making it practical for moderate-sized systems

## Connections to Other Topics

- **Matrix Decompositions**: LU, Cholesky factorizations
- **Determinants**: Product of pivots equals determinant
- **Matrix Rank**: Number of non-zero rows in REF
- **Vector Spaces**: Row operations preserve row space
- **Numerical Analysis**: Stability, conditioning, error analysis

Gaussian elimination remains the workhorse algorithm for solving linear systems, combining theoretical elegance with computational efficiency. Understanding this method provides essential foundation for numerical linear algebra and scientific computing.
