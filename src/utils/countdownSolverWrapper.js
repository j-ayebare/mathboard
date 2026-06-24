// src/utils/countdownSolverWrapper.js
import { solverRun } from './CountdownSolver.js'

export function findSolutions(numbers, target, minNumbers, maxNumbers, maxSolutions = 5) {
  return new Promise((resolve) => {
    const solutions = []
    let count = 0

    const progressCallback = (expr, result, used) => {
      solutions.push({ expr, result, used })
      count++
      if (count >= maxSolutions) {
        resolve(solutions)
        return true
      }
      return false
    }

    const finishedCallback = () => {
      resolve(solutions)
    }

    solverRun(numbers, target, progressCallback, finishedCallback)
  })
}