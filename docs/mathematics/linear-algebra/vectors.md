# Vectors

Vectors are fundamental objects in linear algebra and have widespread applications in computer science, physics, engineering, and data science. Understanding vectors is crucial for topics like machine learning, computer graphics, and scientific computing.

## What is a Vector?

A vector is a mathematical object that has both **magnitude** (length) and **direction**. Vectors can be thought of in several ways:

- **Geometric**: An arrow in space pointing from one point to another
- **Algebraic**: An ordered list of numbers (components)
- **Abstract**: An element of a vector space

## Vector Notation

Vectors are typically written in several ways:

- **Bold lowercase letters**: **v**, **u**, **a**
- **Arrows**: v⃗, u⃗, a⃗
- **Component form**: ⟨a₁, a₂, a₃⟩ or column vectors

## Types of Vectors

### By Dimension

- **2D vectors**: v⃗ = ⟨x, y⟩ - points in a plane
- **3D vectors**: v⃗ = ⟨x, y, z⟩ - points in space  
- **n-dimensional vectors**: v⃗ = ⟨v₁, v₂, ..., vₙ⟩ - abstract mathematical objects

### Special Vectors

- **Zero vector**: 0⃗ = ⟨0, 0, ..., 0⟩
- **Unit vector**: Any vector with magnitude 1
- **Standard basis vectors**: 
  - 2D: î = ⟨1, 0⟩, ĵ = ⟨0, 1⟩
  - 3D: î = ⟨1, 0, 0⟩, ĵ = ⟨0, 1, 0⟩, k̂ = ⟨0, 0, 1⟩

## Vector Operations

### Addition and Subtraction

Vector addition is performed component-wise:

**u⃗ + v⃗ = ⟨u₁ + v₁, u₂ + v₂, u₃ + v₃⟩**

**Properties:**
- Commutative: u⃗ + v⃗ = v⃗ + u⃗
- Associative: (u⃗ + v⃗) + w⃗ = u⃗ + (v⃗ + w⃗)
- Identity: v⃗ + 0⃗ = v⃗

### Scalar Multiplication

Multiplying a vector by a scalar scales its magnitude:

**cv⃗ = ⟨cv₁, cv₂, cv₃⟩**

**Effects:**
- If c > 1: vector becomes longer
- If 0 < c < 1: vector becomes shorter
- If c < 0: vector reverses direction
- If c = 0: results in zero vector

### Magnitude (Length)

The magnitude of a vector is calculated using the Euclidean norm:

**|v⃗| = √(v₁² + v₂² + v₃²)**

### Unit Vector

To find the unit vector in the direction of v⃗:

**v̂ = v⃗/|v⃗|**

### Dot Product

The dot product of two vectors is a scalar:

**u⃗ · v⃗ = u₁v₁ + u₂v₂ + u₃v₃ = |u⃗||v⃗|cos θ**

Where θ is the angle between the vectors.

**Applications:**
- Finding angles between vectors
- Determining orthogonality (if dot product = 0)
- Projection calculations

### Cross Product (3D only)

The cross product produces a vector perpendicular to both input vectors:

**u⃗ × v⃗ = ⟨u₂v₃ - u₃v₂, u₃v₁ - u₁v₃, u₁v₂ - u₂v₁⟩**

## Go Implementation

```go
package main

import (
    "fmt"
    "math"
)

// Vector3D represents a 3D vector
type Vector3D struct {
    X, Y, Z float64
}

// Add returns the sum of two vectors
func (v Vector3D) Add(other Vector3D) Vector3D {
    return Vector3D{
        X: v.X + other.X,
        Y: v.Y + other.Y,
        Z: v.Z + other.Z,
    }
}

// Subtract returns the difference of two vectors
func (v Vector3D) Subtract(other Vector3D) Vector3D {
    return Vector3D{
        X: v.X - other.X,
        Y: v.Y - other.Y,
        Z: v.Z - other.Z,
    }
}

// Scale multiplies the vector by a scalar
func (v Vector3D) Scale(scalar float64) Vector3D {
    return Vector3D{
        X: v.X * scalar,
        Y: v.Y * scalar,
        Z: v.Z * scalar,
    }
}

// Magnitude returns the length of the vector
func (v Vector3D) Magnitude() float64 {
    return math.Sqrt(v.X*v.X + v.Y*v.Y + v.Z*v.Z)
}

// Unit returns the unit vector in the same direction
func (v Vector3D) Unit() Vector3D {
    mag := v.Magnitude()
    if mag == 0 {
        return Vector3D{0, 0, 0} // Zero vector
    }
    return v.Scale(1.0 / mag)
}

// Dot returns the dot product with another vector
func (v Vector3D) Dot(other Vector3D) float64 {
    return v.X*other.X + v.Y*other.Y + v.Z*other.Z
}

// Cross returns the cross product with another vector
func (v Vector3D) Cross(other Vector3D) Vector3D {
    return Vector3D{
        X: v.Y*other.Z - v.Z*other.Y,
        Y: v.Z*other.X - v.X*other.Z,
        Z: v.X*other.Y - v.Y*other.X,
    }
}

// Angle returns the angle between two vectors in radians
func (v Vector3D) Angle(other Vector3D) float64 {
    dot := v.Dot(other)
    magnitudes := v.Magnitude() * other.Magnitude()
    if magnitudes == 0 {
        return 0
    }
    return math.Acos(dot / magnitudes)
}

// String provides a nice string representation
func (v Vector3D) String() string {
    return fmt.Sprintf("<%g, %g, %g>", v.X, v.Y, v.Z)
}

func main() {
    // Create some vectors
    v1 := Vector3D{3, 4, 0}
    v2 := Vector3D{1, 2, 2}
    
    fmt.Printf("v1 = %v\n", v1)
    fmt.Printf("v2 = %v\n", v2)
    fmt.Println()
    
    // Vector operations
    fmt.Printf("v1 + v2 = %v\n", v1.Add(v2))
    fmt.Printf("v1 - v2 = %v\n", v1.Subtract(v2))
    fmt.Printf("2 * v1 = %v\n", v1.Scale(2))
    fmt.Println()
    
    // Magnitude and unit vector
    fmt.Printf("|v1| = %g\n", v1.Magnitude())
    fmt.Printf("unit(v1) = %v\n", v1.Unit())
    fmt.Println()
    
    // Dot and cross products
    fmt.Printf("v1 · v2 = %g\n", v1.Dot(v2))
    fmt.Printf("v1 × v2 = %v\n", v1.Cross(v2))
    
    // Angle between vectors
    angle := v1.Angle(v2)
    fmt.Printf("Angle between v1 and v2: %g radians (%.1f degrees)\n", 
               angle, angle*180/math.Pi)
}
```

## Applications

### Computer Graphics
- **Position vectors**: Representing points in 3D space
- **Direction vectors**: Camera orientation, lighting directions
- **Normal vectors**: Surface orientation for lighting calculations

### Physics
- **Displacement**: Change in position
- **Velocity**: Rate of change of position
- **Force**: Cause of acceleration

### Machine Learning
- **Feature vectors**: Representing data points in high-dimensional space
- **Weight vectors**: Model parameters
- **Gradient vectors**: Direction of steepest increase

### Game Development
- **Movement**: Character and object motion
- **Collision detection**: Determining intersections
- **Physics simulation**: Realistic object behavior

## Key Concepts to Remember

1. **Vectors have magnitude and direction**
2. **Vector addition is commutative and associative**
3. **Dot product gives a scalar, cross product gives a vector**
4. **Unit vectors have magnitude 1**
5. **Orthogonal vectors have dot product 0**

## Practice Problems

1. Given vectors u⃗ = ⟨2, -1, 3⟩ and v⃗ = ⟨1, 4, -2⟩:
   - Find u⃗ + v⃗
   - Find |u⃗|
   - Find the unit vector in the direction of v⃗
   - Calculate u⃗ · v⃗

2. **Programming exercise**: Extend the Go implementation to include:
   - Vector projection operations
   - Distance between two points
   - Check if three points are collinear

## Next Topics

- Matrices - Arrays of numbers for linear transformations (coming soon)
- Linear Transformations - Functions between vector spaces (coming soon)
- Eigenvalues and Eigenvectors - Special vectors that maintain direction (coming soon)

Vectors form the foundation of linear algebra - master them and you'll be well-prepared for more advanced topics! 🎯
