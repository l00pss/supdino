---
title: Gauss-Jordan Elimination
description: Comprehensive study of Gauss-Jordan elimination method for solving linear systems and finding reduced row echelon form.
sidebar_label: Gauss-Jordan Elimination
sidebar_position: 4
keywords: [gauss-jordan, rref, reduced-row-echelon-form, linear-algebra, matrix-methods]
reading_time: 16
last_update:
  date: 2026-02-23
---

# Gauss-Jordan Elimination

Gauss-Jordan elimination is an extension of Gaussian elimination that transforms a matrix into reduced row echelon form (RREF). Unlike standard Gaussian elimination which requires back substitution, Gauss-Jordan produces a form where solutions can be read directly from the augmented matrix.

## Overview and Motivation

While Gaussian elimination produces an upper triangular matrix requiring back substitution, Gauss-Jordan elimination continues the process to create an identity matrix on the left side of the augmented matrix. This makes the solution immediately visible without additional computation.

**Key Advantage**: Solutions appear directly in the augmented matrix without back substitution.

**Trade-off**: Requires approximately 50% more operations than standard Gaussian elimination.

## Reduced Row Echelon Form (RREF)

A matrix is in reduced row echelon form when it satisfies these properties:

1. **All zero rows are at the bottom** of the matrix
2. **Leading entry (pivot) in each non-zero row is 1**
3. **Each pivot is the only non-zero entry in its column**
4. **Pivots move strictly to the right** in successive rows
5. **Each pivot is to the right of pivots in rows above**

### RREF Examples

**Example 1**: Identity matrix (simplest RREF)
```
[1  0  0]
[0  1  0]
[0  0  1]
```

**Example 2**: RREF with solution
```
[1  0  0 | 3]
[0  1  0 | 2]
[0  0  1 | 5]
```
Solution: x = 3, y = 2, z = 5


**Example 3**: RREF with free variable
```
[1  2  0 | 4]
[0  0  1 | 3]
[0  0  0 | 0]
```
Solution: x + 2y = 4, z = 3 (y is free variable)

## Algorithm Steps

The Gauss-Jordan elimination process consists of two main phases:

### Phase 1: Forward Elimination (Same as Gaussian)

Transform the matrix to row echelon form (upper triangular):
1. Select pivot in current column
2. Swap rows if necessary (partial pivoting)
3. Eliminate all entries below the pivot

### Phase 2: Backward Elimination (Unique to Gauss-Jordan)

Continue to reduced row echelon form:
1. Scale each pivot row so pivot = 1
2. Eliminate all entries above each pivot
3. Result: Identity matrix on left side

## Detailed Example with Augmented Matrix

Let's solve the system step by step:
```
2x + y - z = 8
-3x - y + 2z = -11
-2x + y + 2z = -3
```

### Initial Augmented Matrix

```
[  2   1  -1 |   8 ]
[ -3  -1   2 | -11 ]
[ -2   1   2 |  -3 ]
```

### Step 1: Make first pivot = 1

Divide Row 1 by 2:
```
[  1   0.5  -0.5 |   4 ]
[ -3    -1     2 | -11 ]
[ -2     1     2 |  -3 ]
```

### Step 2: Eliminate below first pivot

R₂ → R₂ + 3R₁:
```
[  1   0.5  -0.5 |   4 ]
[  0   0.5   0.5 |   1 ]
[ -2     1     2 |  -3 ]
```

R₃ → R₃ + 2R₁:
```
[  1   0.5  -0.5 |  4 ]
[  0   0.5   0.5 |  1 ]
[  0     2     1 |  5 ]
```

### Step 3: Make second pivot = 1

Divide Row 2 by 0.5:
```
[  1   0.5  -0.5 |  4 ]
[  0     1     1 |  2 ]
[  0     2     1 |  5 ]
```

### Step 4: Eliminate around second pivot

R₁ → R₁ - 0.5R₂:
```
[  1     0    -1 |  3 ]
[  0     1     1 |  2 ]
[  0     2     1 |  5 ]
```

R₃ → R₃ - 2R₂:
```
[  1     0    -1 |  3 ]
[  0     1     1 |  2 ]
[  0     0    -1 |  1 ]
```


### Step 5: Make third pivot = 1

Divide Row 3 by -1:
```
[  1     0    -1 |  3 ]
[  0     1     1 |  2 ]
[  0     0     1 | -1 ]
```

### Step 6: Eliminate above third pivot

R₁ → R₁ + R₃:
```
[  1     0     0 |  2 ]
[  0     1     1 |  2 ]
[  0     0     1 | -1 ]
```

R₂ → R₂ - R₃:
```
[  1     0     0 |  2 ]
[  0     1     0 |  3 ]
[  0     0     1 | -1 ]
```

### Final RREF - Solution

```
[  1     0     0 |  2 ]
[  0     1     0 |  3 ]
[  0     0     1 | -1 ]
```

**Solution**: x = 2, y = 3, z = -1

The identity matrix on the left confirms we have RREF, and the solution is directly visible on the right.

## Another Example: 2×2 System

Solve:
```
2x + 3y = 8
x - y = 1
```

### Initial Augmented Matrix

```
[ 2   3 | 8 ]
[ 1  -1 | 1 ]
```

### Step 1: Swap rows (for simpler pivot)

```
[ 1  -1 | 1 ]
[ 2   3 | 8 ]
```

### Step 2: Eliminate below first pivot

R₂ → R₂ - 2R₁:
```
[ 1  -1 | 1 ]
[ 0   5 | 6 ]
```

### Step 3: Make second pivot = 1

R₂ → R₂/5:
```
[ 1  -1 |   1 ]
[ 0   1 | 1.2 ]
```

### Step 4: Eliminate above second pivot

R₁ → R₁ + R₂:
```
[ 1   0 | 2.2 ]
[ 0   1 | 1.2 ]
```

### Final RREF - Solution

```
[ 1   0 | 2.2 ]
[ 0   1 | 1.2 ]
```

**Solution**: x = 2.2, y = 1.2


## Example with Infinitely Many Solutions

Consider the system:
```
x + 2y + z = 3
2x + 4y + 2z = 6
x + 2y - z = 1
```

### Initial Augmented Matrix

```
[ 1   2   1 | 3 ]
[ 2   4   2 | 6 ]
[ 1   2  -1 | 1 ]
```

### Step 1: Eliminate below first pivot

R₂ → R₂ - 2R₁:
```
[ 1   2   1 | 3 ]
[ 0   0   0 | 0 ]
[ 1   2  -1 | 1 ]
```

R₃ → R₃ - R₁:
```
[ 1   2   1 | 3 ]
[ 0   0   0 | 0 ]
[ 0   0  -2 |-2 ]
```

### Step 2: Swap rows to move zero row down

```
[ 1   2   1 | 3 ]
[ 0   0  -2 |-2 ]
[ 0   0   0 | 0 ]
```

### Step 3: Make second pivot = 1

R₂ → R₂/(-2):
```
[ 1   2   1 | 3 ]
[ 0   0   1 | 1 ]
[ 0   0   0 | 0 ]
```

### Step 4: Eliminate above second pivot

R₁ → R₁ - R₂:
```
[ 1   2   0 | 2 ]
[ 0   0   1 | 1 ]
[ 0   0   0 | 0 ]
```

### Final RREF - Infinitely Many Solutions

```
[ 1   2   0 | 2 ]
[ 0   0   1 | 1 ]
[ 0   0   0 | 0 ]
```

**Interpretation**:
- x + 2y = 2  →  x = 2 - 2y
- z = 1
- y is a free variable (can be any value)

**Solution set**: (x, y, z) = (2 - 2t, t, 1) where t ∈ ℝ

## Example with No Solution (Inconsistent System)

Consider:
```
x + y = 2
2x + 2y = 5
```

### Initial Augmented Matrix

```
[ 1   1 | 2 ]
[ 2   2 | 5 ]
```

### Step 1: Eliminate below first pivot

R₂ → R₂ - 2R₁:
```
[ 1   1 | 2 ]
[ 0   0 | 1 ]
```

### Final Form - No Solution

```
[ 1   1 | 2 ]
[ 0   0 | 1 ]
```

**Interpretation**: The second row represents 0 = 1, which is impossible.

**Conclusion**: The system is inconsistent and has no solution.


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

// PrintMatrix displays a matrix in readable format
func (m *Matrix) PrintMatrix() {
    for i := 0; i < m.Rows; i++ {
        fmt.Print("[ ")
        for j := 0; j < m.Cols; j++ {
            fmt.Printf("%7.3f ", m.Data[i][j])
        }
        fmt.Println("]")
    }
    fmt.Println()
}

// GaussJordanElimination performs Gauss-Jordan elimination to find RREF
func GaussJordanElimination(A *Matrix, b []float64) ([]float64, error) {
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
    
    fmt.Println("Initial Augmented Matrix:")
    aug.PrintMatrix()
    
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
            fmt.Printf("After swapping rows %d and %d:\n", k+1, maxRow+1)
            aug.PrintMatrix()
        }
        
        // Scale pivot row to make pivot = 1
        pivot := aug.Data[k][k]
        aug.ScaleRow(k, 1.0/pivot)
        fmt.Printf("After scaling row %d by %.3f:\n", k+1, 1.0/pivot)
        aug.PrintMatrix()
        
        // Eliminate all other entries in column k (both above and below)
        for i := 0; i < n; i++ {
            if i != k && math.Abs(aug.Data[i][k]) > 1e-10 {
                factor := aug.Data[i][k]
                aug.AddScaledRow(i, k, -factor)
            }
        }
        fmt.Printf("After eliminating column %d:\n", k+1)
        aug.PrintMatrix()
    }
    
    fmt.Println("Final RREF:")
    aug.PrintMatrix()
    
    // Extract solution from last column
    x := make([]float64, n)
    for i := 0; i < n; i++ {
        x[i] = aug.Data[i][n]
    }
    
    return x, nil
}


func main() {
    // Example 1: 3×3 system with unique solution
    fmt.Println("=== Example 1: 3×3 System ===")
    fmt.Println("2x + y - z = 8")
    fmt.Println("-3x - y + 2z = -11")
    fmt.Println("-2x + y + 2z = -3")
    fmt.Println()
    
    A1 := NewMatrix(3, 3)
    A1.Data[0] = []float64{2, 1, -1}
    A1.Data[1] = []float64{-3, -1, 2}
    A1.Data[2] = []float64{-2, 1, 2}
    b1 := []float64{8, -11, -3}
    
    solution1, err := GaussJordanElimination(A1, b1)
    if err != nil {
        fmt.Printf("Error: %v\n\n", err)
    } else {
        fmt.Println("Solution:")
        fmt.Printf("x = %.4f\n", solution1[0])
        fmt.Printf("y = %.4f\n", solution1[1])
        fmt.Printf("z = %.4f\n\n", solution1[2])
    }
    
    // Example 2: 2×2 system
    fmt.Println("=== Example 2: 2×2 System ===")
    fmt.Println("2x + 3y = 8")
    fmt.Println("x - y = 1")
    fmt.Println()
    
    A2 := NewMatrix(2, 2)
    A2.Data[0] = []float64{2, 3}
    A2.Data[1] = []float64{1, -1}
    b2 := []float64{8, 1}
    
    solution2, err := GaussJordanElimination(A2, b2)
    if err != nil {
        fmt.Printf("Error: %v\n\n", err)
    } else {
        fmt.Println("Solution:")
        fmt.Printf("x = %.4f\n", solution2[0])
        fmt.Printf("y = %.4f\n\n", solution2[1])
    }
    
    // Example 3: 4×4 system
    fmt.Println("=== Example 3: 4×4 System ===")
    A3 := NewMatrix(4, 4)
    A3.Data[0] = []float64{1, 2, 1, 1}
    A3.Data[1] = []float64{2, 1, 3, 2}
    A3.Data[2] = []float64{1, 3, 2, 1}
    A3.Data[3] = []float64{3, 1, 2, 3}
    b3 := []float64{7, 12, 9, 14}
    
    solution3, err := GaussJordanElimination(A3, b3)
    if err != nil {
        fmt.Printf("Error: %v\n\n", err)
    } else {
        fmt.Println("Solution:")
        for i, val := range solution3 {
            fmt.Printf("x%d = %.4f\n", i+1, val)
        }
    }
}
```

## Comparison: Gaussian vs Gauss-Jordan

| Aspect | Gaussian Elimination | Gauss-Jordan Elimination |
|--------|---------------------|-------------------------|
| **Final Form** | Row echelon form (upper triangular) | Reduced row echelon form (identity) |
| **Operations** | Forward elimination only | Forward + backward elimination |
| **Complexity** | ~n³/3 operations | ~n³/2 operations |
| **Solution Method** | Requires back substitution | Direct reading from matrix |
| **Efficiency** | More efficient | ~50% more operations |
| **Use Case** | Single system solution | Matrix inversion, multiple analyses |

## When to Use Gauss-Jordan

Gauss-Jordan elimination is particularly useful when:

1. **Matrix Inversion**: Finding A⁻¹ by applying to [A|I]
2. **Multiple Right-Hand Sides**: Solving Ax = b for many different b vectors
3. **Rank Determination**: RREF clearly shows matrix rank
4. **Free Variables**: Identifying free variables in underdetermined systems
5. **Educational Purposes**: Clearer visualization of solution structure


## Matrix Inversion Using Gauss-Jordan

To find the inverse of matrix A, apply Gauss-Jordan to [A|I]:

### Example: Find A⁻¹ for 2×2 matrix

Given:
```
A = [ 2  1 ]
    [ 5  3 ]
```

### Initial Augmented Matrix [A|I]

```
[ 2  1 | 1  0 ]
[ 5  3 | 0  1 ]
```

### Step 1: Make first pivot = 1

R₁ → R₁/2:
```
[ 1  0.5 | 0.5  0 ]
[ 5    3 |   0  1 ]
```

### Step 2: Eliminate below first pivot

R₂ → R₂ - 5R₁:
```
[ 1  0.5 | 0.5  0 ]
[ 0  0.5 |-2.5  1 ]
```

### Step 3: Make second pivot = 1

R₂ → R₂/0.5:
```
[ 1  0.5 | 0.5  0 ]
[ 0    1 |  -5  2 ]
```

### Step 4: Eliminate above second pivot

R₁ → R₁ - 0.5R₂:
```
[ 1  0 |  3  -1 ]
[ 0  1 | -5   2 ]
```

### Result: A⁻¹

```
A⁻¹ = [  3  -1 ]
      [ -5   2 ]
```

**Verification**: A × A⁻¹ = I

## Determining System Consistency

RREF reveals system properties immediately:

### Consistent System (Unique Solution)

```
[ 1  0  0 | a ]
[ 0  1  0 | b ]
[ 0  0  1 | c ]
```
Identity matrix on left → unique solution

### Consistent System (Infinite Solutions)

```
[ 1  2  0 | 5 ]
[ 0  0  1 | 3 ]
[ 0  0  0 | 0 ]
```
Zero row with zero on right → infinitely many solutions

### Inconsistent System (No Solution)

```
[ 1  0  2 | 4 ]
[ 0  1  3 | 1 ]
[ 0  0  0 | 5 ]
```
Zero row with non-zero on right → no solution (0 = 5 is impossible)

## Finding Matrix Rank

The rank of a matrix equals the number of non-zero rows in its RREF.

### Example 1: Full Rank

```
RREF = [ 1  0  0 ]
       [ 0  1  0 ]
       [ 0  0  1 ]
```
Rank = 3 (full rank for 3×3 matrix)

### Example 2: Rank Deficient

```
RREF = [ 1  2  0  3 ]
       [ 0  0  1  2 ]
       [ 0  0  0  0 ]
```
Rank = 2 (only 2 non-zero rows)


## Identifying Free Variables

In RREF, columns without pivots correspond to free variables.

### Example: System with Free Variables

```
RREF = [ 1  3  0  2 | 5 ]
       [ 0  0  1  4 | 7 ]
       [ 0  0  0  0 | 0 ]
```

**Analysis**:
- Column 1 has pivot → x₁ is basic variable
- Column 2 has no pivot → x₂ is free variable
- Column 3 has pivot → x₃ is basic variable
- Column 4 has no pivot → x₄ is free variable

**Solution**:
- x₁ = 5 - 3x₂ - 2x₄
- x₂ = t (free)
- x₃ = 7 - 4x₄
- x₄ = s (free)

**Parametric form**: (5 - 3t - 2s, t, 7 - 4s, s) where t, s ∈ ℝ

## Computational Complexity Analysis

### Operation Count

For an n×n system:

**Forward Elimination**:
- Making pivots = 1: n divisions
- Eliminating below: ~n³/3 operations

**Backward Elimination** (unique to Gauss-Jordan):
- Eliminating above: ~n³/6 operations

**Total**: ~n³/2 operations (compared to ~n³/3 for Gaussian elimination)

### Why the Extra Cost?

Gauss-Jordan eliminates entries above pivots, which Gaussian elimination skips. This adds approximately 50% more operations but eliminates the need for back substitution.

## Numerical Stability

Gauss-Jordan has similar stability considerations to Gaussian elimination:

### Partial Pivoting

Always select the largest available pivot to minimize rounding errors:

```go
// Find pivot
maxRow := k
for i := k + 1; i < n; i++ {
    if math.Abs(aug.Data[i][k]) > math.Abs(aug.Data[maxRow][k]) {
        maxRow = i
    }
}
```

### Scaling Considerations

Normalize rows with very different magnitudes before elimination to improve numerical stability.

### Tolerance for Zero

Use a small tolerance (e.g., 1e-10) instead of exact zero comparison:

```go
if math.Abs(aug.Data[maxRow][k]) < 1e-10 {
    // Treat as zero
}
```

## Practice Problems

1. **Basic RREF**: Convert to reduced row echelon form
   ```
   [ 2  4  6 | 8 ]
   [ 1  3  5 | 7 ]
   [ 3  5  7 | 9 ]
   ```

2. **Matrix Inversion**: Find the inverse using Gauss-Jordan
   ```
   A = [ 1  2  3 ]
       [ 0  1  4 ]
       [ 5  6  0 ]
   ```

3. **Free Variables**: Solve and identify free variables
   ```
   x + 2y + 3z + w = 1
   2x + 4y + 7z + 3w = 3
   3x + 6y + 10z + 4w = 4
   ```

4. **Rank Determination**: Find the rank of
   ```
   [ 1  2  3  4 ]
   [ 2  4  6  8 ]
   [ 1  3  5  7 ]
   [ 3  5  7  9 ]
   ```


5. **Programming Exercise**: Extend the Go implementation to:
   - Detect and report the rank of the coefficient matrix
   - Identify free variables in underdetermined systems
   - Handle matrix inversion [A|I] → [I|A⁻¹]
   - Detect inconsistent systems and report appropriately

## Visual Comparison of Methods

### Gaussian Elimination Result

```
[ 2  1  3 | 7 ]     Forward        [ 2  1  3 | 7 ]
[ 4  3  5 | 9 ]  Elimination  →   [ 0  1 -1 |-5 ]
[ 6  5  1 | 3 ]                    [ 0  0  4 | 8 ]
```
Then back substitution: z = 2, y = -3, x = 5

### Gauss-Jordan Elimination Result

```
[ 2  1  3 | 7 ]     Forward +      [ 1  0  0 | 5 ]
[ 4  3  5 | 9 ]     Backward   →   [ 0  1  0 |-3 ]
[ 6  5  1 | 3 ]     Elimination    [ 0  0  1 | 2 ]
```
Solution directly visible: x = 5, y = -3, z = 2

## Applications

### Computer Graphics

**Transformation Matrices**: Computing inverse transformations requires matrix inversion, efficiently done with Gauss-Jordan.

### Cryptography

**Hill Cipher**: Decryption requires finding the inverse of the key matrix.

### Control Systems

**State-Space Models**: System analysis often requires matrix inversion and rank determination.

### Economics

**Input-Output Analysis**: Leontief models use matrix inversion to compute production requirements.

### Circuit Analysis

**Network Equations**: Solving for multiple circuit configurations with the same topology but different sources.

## Key Concepts Summary

1. **RREF provides direct solutions** without back substitution
2. **Identity matrix on left** indicates unique solution
3. **Free variables** correspond to columns without pivots
4. **Matrix inversion** via [A|I] → [I|A⁻¹]
5. **Rank determination** from number of non-zero rows
6. **Consistency check** via zero rows in RREF
7. **50% more operations** than Gaussian elimination

## Advantages and Disadvantages

### Advantages

- Solutions directly visible in final matrix
- Excellent for matrix inversion
- Clear identification of free variables
- Easy rank determination
- Good for educational purposes

### Disadvantages

- ~50% more operations than Gaussian elimination
- Not significantly more stable
- Overkill for single system solution
- More memory operations (more cache misses)

## Connections to Other Topics

- **Linear Independence**: Pivot columns form basis for column space
- **Null Space**: Free variables parameterize null space
- **Matrix Rank**: Number of pivots equals rank
- **Vector Spaces**: RREF reveals dimension of solution space
- **Linear Transformations**: Inverse matrix represents inverse transformation

Gauss-Jordan elimination extends Gaussian elimination to produce reduced row echelon form, making it invaluable for matrix inversion, rank determination, and understanding solution structure. While computationally more expensive, its clarity and versatility make it essential for many applications in linear algebra.
