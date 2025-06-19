import { Injectable } from '@angular/core'

export interface DeckLimits {
  mainboard: {
    min: number
    max: number
  }
  sideboard: {
    min: number
    max: number
    maxIn?: number // Max cards that can be brought in
    maxOut?: number // Max cards that can be taken out
  }
}

@Injectable({
  providedIn: 'root',
})
export class DeckLimitsService {
  private limits: Record<string, DeckLimits> = {
    standard: {
      mainboard: { min: 60, max: -1 }, // -1 means no max
      sideboard: { min: 0, max: 15, maxIn: 15, maxOut: 15 },
    },
    modern: {
      mainboard: { min: 60, max: -1 },
      sideboard: { min: 0, max: 15, maxIn: 15, maxOut: 15 },
    },
    legacy: {
      mainboard: { min: 60, max: -1 },
      sideboard: { min: 0, max: 15, maxIn: 15, maxOut: 15 },
    },
    vintage: {
      mainboard: { min: 60, max: -1 },
      sideboard: { min: 0, max: 15, maxIn: 15, maxOut: 15 },
    },
    pioneer: {
      mainboard: { min: 60, max: -1 },
      sideboard: { min: 0, max: 15, maxIn: 15, maxOut: 15 },
    },
    commander: {
      mainboard: { min: 100, max: 100 },
      sideboard: { min: 0, max: 0 }, // No sideboard in commander
    },
  }

  getLimits(format: string): DeckLimits {
    return (
      this.limits[format.toLowerCase()] || {
        mainboard: { min: 60, max: -1 },
        sideboard: { min: 0, max: 15, maxIn: 15, maxOut: 15 },
      }
    )
  }

  validateMainboardCount(format: string, count: number): { valid: boolean; message?: string } {
    const limits = this.getLimits(format)
    if (count < limits.mainboard.min) {
      return {
        valid: false,
        message: `Mainboard must have at least ${limits.mainboard.min} cards`,
      }
    }
    if (limits.mainboard.max > 0 && count > limits.mainboard.max) {
      return {
        valid: false,
        message: `Mainboard cannot exceed ${limits.mainboard.max} cards`,
      }
    }
    return { valid: true }
  }

  validateSideboardCount(format: string, count: number): { valid: boolean; message?: string } {
    const limits = this.getLimits(format)
    if (count > limits.sideboard.max) {
      return {
        valid: false,
        message: `Sideboard cannot exceed ${limits.sideboard.max} cards`,
      }
    }
    return { valid: true }
  }

  canAddToMainboard(format: string, currentCount: number, quantity: number = 1): boolean {
    const limits = this.getLimits(format)
    if (limits.mainboard.max <= 0) return true // No max limit
    return currentCount + quantity <= limits.mainboard.max
  }

  canAddToSideboard(format: string, currentCount: number, quantity: number = 1): boolean {
    const limits = this.getLimits(format)
    return currentCount + quantity <= limits.sideboard.max
  }

  canAddToSideboardIn(format: string, currentInCount: number, quantity: number = 1): boolean {
    const limits = this.getLimits(format)
    const maxIn = limits.sideboard.maxIn || limits.sideboard.max
    return currentInCount + quantity <= maxIn
  }

  canAddToSideboardOut(format: string, currentOutCount: number, quantity: number = 1): boolean {
    const limits = this.getLimits(format)
    const maxOut = limits.sideboard.maxOut || limits.sideboard.max
    return currentOutCount + quantity <= maxOut
  }

  validateSideboardInOut(
    format: string,
    inCount: number,
    outCount: number
  ): { valid: boolean; message?: string } {
    const limits = this.getLimits(format)
    const maxIn = limits.sideboard.maxIn || limits.sideboard.max
    const maxOut = limits.sideboard.maxOut || limits.sideboard.max

    if (inCount > maxIn) {
      return {
        valid: false,
        message: `Cannot bring in more than ${maxIn} cards`,
      }
    }

    if (outCount > maxOut) {
      return {
        valid: false,
        message: `Cannot take out more than ${maxOut} cards`,
      }
    }

    return { valid: true }
  }
}
