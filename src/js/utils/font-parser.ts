/**
 * Utility for parsing font names with weights and styles
 */

interface ParsedFont {
    family: string
    weight: string
    style: string
    originalInput: string
}

export class FontParser {
    // Map common weight names to numeric values
    private static readonly WEIGHT_MAP: Record<string, string> = {
        'thin': '100',
        'extralight': '200',
        'extra-light': '200',
        'ultralight': '200',
        'ultra-light': '200',
        'light': '300',
        'normal': '400',
        'regular': '400',
        'medium': '500',
        'semibold': '600',
        'semi-bold': '600',
        'demibold': '600',
        'demi-bold': '600',
        'bold': '700',
        'extrabold': '800',
        'extra-bold': '800',
        'ultrabold': '800',
        'ultra-bold': '800',
        'black': '900',
        'heavy': '900'
    }

    // Common style variations
    private static readonly STYLE_MAP: Record<string, string> = {
        'italic': 'italic',
        'oblique': 'italic',
        'slanted': 'italic'
    }

    /**
     * Parse a font string that may include weight and style
     * Examples:
     * - "Open Sans" -> { family: "Open Sans", weight: "400" }
     * - "Open Sans Bold" -> { family: "Open Sans", weight: "700" }
     * - "Open Sans 300" -> { family: "Open Sans", weight: "300" }
     * - "Roboto Light Italic" -> { family: "Roboto", weight: "300", style: "italic" }
     * - "Poppins Semi Bold" -> { family: "Poppins", weight: "600" }
     */
    static parseFont(input: string): ParsedFont {
        const originalInput = input.trim()
        const parts = originalInput.split(/\s+/)
        let family = ''
        let weight = '400'
        let style = 'normal'

        if (parts.length === 0) {
            return {
                family,
                weight,
                style,
                originalInput
            }
        }

        // If only one part, it's just the family name
        if (parts.length === 1) {
            return {
                family: parts[0],
                weight,
                style,
                originalInput
            }
        }

        // Look for numeric weight (e.g., "300", "700")
        const numericWeightIndex = parts.findIndex(part => /^[1-9]00$/.test(part))
        if (numericWeightIndex !== -1) {
            weight = parts[numericWeightIndex]
            parts.splice(numericWeightIndex, 1)
        }

        // Look for style keywords
        const styleIndex = parts.findIndex(part =>
            this.STYLE_MAP[part.toLowerCase()]
        )
        if (styleIndex !== -1) {
            style = this.STYLE_MAP[parts[styleIndex].toLowerCase()]
            parts.splice(styleIndex, 1)
        }

        // Look for weight keywords (check multi-word weights first)
        let weightFound = false

        // Check for two-word weights (e.g., "Semi Bold", "Extra Light")
        for (let i = 0; i < parts.length - 1; i++) {
            const twoWordWeight = `${parts[i]} ${parts[i + 1]}`.toLowerCase()
            const hyphenatedWeight = `${parts[i]}-${parts[i + 1]}`.toLowerCase()

            if (this.WEIGHT_MAP[twoWordWeight]) {
                weight = this.WEIGHT_MAP[twoWordWeight]
                parts.splice(i, 2)
                weightFound = true
                break
            } else if (this.WEIGHT_MAP[hyphenatedWeight]) {
                weight = this.WEIGHT_MAP[hyphenatedWeight]
                parts.splice(i, 2)
                weightFound = true
                break
            }
        }

        // If no two-word weight found, check for single-word weights
        if (!weightFound) {
            const weightIndex = parts.findIndex(part =>
                this.WEIGHT_MAP[part.toLowerCase()]
            )
            if (weightIndex !== -1) {
                weight = this.WEIGHT_MAP[parts[weightIndex].toLowerCase()]
                parts.splice(weightIndex, 1)
            }
        }

        // Remaining parts form the family name
        family = parts.join(' ')

        return {
            family,
            weight,
            style,
            originalInput
        }
    }

    /**
     * Generate Google Fonts URL with parsed font information
     */
    static generateGoogleFontsUrl(parsed: ParsedFont): string {
        if (!parsed.family) {
            throw new Error('Font family name is required')
        }

        const encodedFamily = encodeURIComponent(parsed.family.replace(/\s+/g, '+'))
        let weightString = parsed.weight

        // Add italic if specified
        if (parsed.style === 'italic') {
            weightString += ',400italic'
            if (parsed.weight !== '400') {
                weightString += `,${parsed.weight}italic`
            }
        }

        return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weightString}&display=swap`
    }

    /**
     * Get all available font weights for Google Fonts API call
     * This helps ensure we get both regular and italic versions if needed
     */
    static getWeightVariations(parsed: ParsedFont): string[] {
        const weights = [parsed.weight]

        if (parsed.style === 'italic') {
            weights.push(`${parsed.weight}italic`)
            // Also include regular weight for better compatibility
            if (parsed.weight !== '400') {
                weights.push('400', '400italic')
            }
        }

        return weights
    }

    /**
     * Validate if a weight string is valid
     */
    static isValidWeight(weight: string): boolean {
        return /^[1-9]00$/.test(weight)
    }

    /**
     * Get display name for a font with its variations
     */
    static getDisplayName(parsed: ParsedFont): string {
        if (parsed.weight === '400' && !parsed.style) {
            return parsed.family
        }

        const weightName = Object.keys(this.WEIGHT_MAP).find(
            key => this.WEIGHT_MAP[key] === parsed.weight
        ) || parsed.weight

        const parts = [parsed.family]
        if (parsed.weight !== '400') {
            parts.push(weightName.charAt(0).toUpperCase() + weightName.slice(1))
        }
        if (parsed.style !== 'normal') {
            parts.push(parsed.style.charAt(0).toUpperCase() + parsed.style.slice(1))
        }

        return parts.join(' ')
    }
}

export default FontParser