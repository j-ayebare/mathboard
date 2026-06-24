export const tips = {
  "+": {
    exact: {
      "8,4": "Think: 8 + 2 = 10, then add the remaining 2.",
      "9,7": "Think: 9 + 1 = 10, then add the remaining 6.",
      "8,5": "Think: 8 + 2 = 10, then add the remaining 3.",
      "9,6": "Think: 9 + 1 = 10, then add the remaining 5.",
      "7,6": "Think: 7 + 3 = 10, then add the remaining 3.",
      "8,8": "Double it!",
      "9,9": "Double it!",
      "7,7": "Double it!",
      "6,6": "Double it!",
      "5,5": "Double it!"
    },
    patterns: [
      { condition: "a + b <= 10", tip: "Count on from the bigger number." },
      { condition: "a + b > 10 && a + b <= 20", tip: "Make 10 first, then add the rest." },
      { condition: "a === b", tip: "Double it!" },
      { condition: "Math.min(a, b) <= 3 && a + b > 10", tip: "Add the smaller number to the bigger by counting on." }
    ]
  },
  "-": {
    exact: {
      "17,9": "Think: 9 + ? = 17. Count up from 9 to 17.",
      "15,8": "Think: 8 + ? = 15. Count up from 8 to 15.",
      "13,7": "Think: 7 + ? = 13. Count up from 7 to 13.",
      "14,9": "Think: 9 + ? = 14. Count up from 9 to 14.",
      "12,8": "Think: 8 + ? = 12. Count up from 8 to 12.",
      "16,9": "Think: 9 + ? = 16. Count up from 9 to 16."
    },
    patterns: [
      { condition: "a - b <= 10", tip: "Count up from the smaller number to the bigger." },
      { condition: "a - b > 10 && a - b <= 20", tip: "Think: b + ? = a. Find the missing number." },
      { condition: "a > b && b > 0", tip: "Think of it as addition: b + ? = a" }
    ]
  },
  "×": {
    exact: {
      "3,4": "Think: 3 × 2 = 6, then double again.",
      "3,6": "Think: 6 × 3 is three 6s: 6 + 6 + 6.",
      "4,4": "Square of 4! Think: 4 × 4 = 16.",
      "4,6": "Think: 4 × 3 = 12, then double.",
      "4,8": "Double 4 × 4 = 16, then double again.",
      "5,6": "Think: 5 × 3 = 15, then double.",
      "5,8": "Think: 5 × 4 = 20, then double.",
      "6,6": "Square of 6! Remember 6².",
      "6,7": "Think: 6 × 6 = 36, then add 6.",
      "6,8": "Think: 6 × 4 = 24, then double.",
      "7,7": "Square of 7! Remember 7².",
      "7,8": "Think: 7 × 7 = 49, then add 7.",
      "8,8": "Square of 8! Remember 8².",
      "9,9": "Square of 9! Remember 9².",
      "9,6": "Think: 9 × 3 = 27, then double.",
      "9,7": "Think: 9 × 5 = 45, then add 18.",
      "9,8": "Think: 9 × 4 = 36, then double."
    },
    patterns: [
      { condition: "a === 2 || b === 2", tip: "Multiplying by 2 is just doubling!" },
      { condition: "a === 4 || b === 4", tip: "Multiplying by 4 is doubling twice!" },
      { condition: "a === 5 || b === 5", tip: "Multiplying by 5 is half of multiplying by 10." },
      { condition: "a === 9 || b === 9", tip: "Multiply by 10 and subtract the number." },
      { condition: "a === 10 || b === 10", tip: "Just add a zero!" },
      { condition: "a === 11 || b === 11", tip: "For two-digit numbers, add the digits and put in between." },
      { condition: "a === b", tip: "Square it! Remember: n × n = n²" },
      { condition: "a % 2 === 0 || b % 2 === 0", tip: "Double the half: if one number is even, halve it and double the other." }
    ]
  },
  "÷": {
    exact: {
      "12,3": "Think: 3 × ? = 12. What times 3 gives 12?",
      "20,4": "Think: 4 × ? = 20. What times 4 gives 20?",
      "15,3": "Think: 3 × ? = 15. What times 3 gives 15?",
      "24,4": "Think: 4 × ? = 24. What times 4 gives 24?",
      "30,5": "Think: 5 × ? = 30. What times 5 gives 30?",
      "18,3": "Think: 3 × ? = 18. What times 3 gives 18?",
      "24,6": "Think: 6 × ? = 24. What times 6 gives 24?",
      "36,4": "Think: 4 × ? = 36. What times 4 gives 36?",
      "42,6": "Think: 6 × ? = 42. What times 6 gives 42?",
      "48,6": "Think: 6 × ? = 48. What times 6 gives 48?",
      "54,6": "Think: 6 × ? = 54. What times 6 gives 54?",
      "56,7": "Think: 7 × ? = 56. What times 7 gives 56?",
      "63,7": "Think: 7 × ? = 63. What times 7 gives 63?",
      "64,8": "Think: 8 × ? = 64. What times 8 gives 64?",
      "72,8": "Think: 8 × ? = 72. What times 8 gives 72?",
      "81,9": "Think: 9 × ? = 81. What times 9 gives 81?"
    },
    patterns: [
      { condition: "b === 2", tip: "Dividing by 2 is halving!" },
      { condition: "b === 5", tip: "Dividing by 5 is like finding how many 5s fit." },
      { condition: "b === 10", tip: "Dividing by 10: just move the decimal one place left." },
      { condition: "a === b * b", tip: "It's a perfect square! Remember the square root." }
    ]
  }
}