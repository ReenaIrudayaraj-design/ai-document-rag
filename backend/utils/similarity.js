export function cosineSimilarity(a, b) {

  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);

  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  return dot / (magA * magB);

}

// cos(θ) = (A · B) / (|A| × |B|)

// a = [1,2,3]
// b = [4,5,6]

// dot = (1×4) + (2×5) + (3×6)
// dot = 4 + 10 + 18 = 32



// a = [1,2,3]

// |A| = √(1² + 2² + 3²)
// |A| = √(1+4+9)
// |A| = √14

// |B| = √(4² + 5² + 6²)
// |B| = √(16+25+36)
// |B| = √77

// cos(θ) = 32 / (√14 × √77)
