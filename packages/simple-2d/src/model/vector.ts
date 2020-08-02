export interface Vector {
  dx: number;
  dy: number;
}

export function lengthOf(vector: Vector): number {
  return Math.sqrt(Math.pow(vector.dx, 2) + Math.pow(vector.dy, 2));
}

/**
 * @param vector A vector
 * @return A new vector with the same direction as the original one and with a length of 1
 */
export function normalized(vector: Vector): Vector {
  const originalLength = lengthOf(vector);
  return { dx: vector.dx / originalLength, dy: vector.dy / originalLength };
}

/**
 * @return A new vector, where each dimension is the sum of dimensions of the two vectors
 */
export function sumOf(v1: Vector, v2: Vector): Vector {
  return { dx: v1.dx + v2.dx, dy: v1.dy + v2.dy };
}

/**
 * @param vector The vector to multiply
 * @param scalar The scalar (number) to multiply by
 * @return A new vector with the same direction, but length of `original-length` * `scalar`
 */
export function multiplied(vector: Vector, scalar: number): Vector {
  return { dx: vector.dx * scalar, dy: vector.dy * scalar };
}

/**
 * @param vector The vector for which to calculate the direction
 * @return The direction of the vector in Radians, in the range -Pi to Pi
 */
export function directionOf(vector: Vector): number {
  return Math.atan2(vector.dy, vector.dx);
}

/**
 * @param direction The direction of the vector to build
 * @param length The length of the vector to build. Defaults to 1 to create a unit vector.
 * @return A new vector
 */
export function vectorInDirection(direction: number, length: number = 1): Vector {
  return { dx: Math.cos(direction) * length, dy: Math.sin(direction) * length };
}
