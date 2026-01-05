/**
 * Utility for parsing font names with weights and styles
 */

export interface ParsedFont {
    family: string
    weight: string
    style: string
    originalInput: string
}

// Map common weight names to numeric values
const WEIGHT_MAP: Record<string, string> = {
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
const STYLE_MAP: Record<string, string> = {
    'italic': 'italic',
    'oblique': 'italic',
    'slanted': 'italic'
}

const DEFAULT_STYLE = 'normal'
const DEFAULT_WEIGHT = '400'

/**
 * Parse a font string that may include weight and style
 * Examples:
 * - "Open Sans" -> { family: "Open Sans", weight: "400" }
 * - "Open Sans Bold" -> { family: "Open Sans", weight: "700" }
 * - "Open Sans 300" -> { family: "Open Sans", weight: "300" }
 * - "Roboto Light Italic" -> { family: "Roboto", weight: "300", style: "italic" }
 * - "Poppins Semi Bold" -> { family: "Poppins", weight: "600" }
 */
export function parseFont(input: string): ParsedFont {
        const originalInput = input
        const parts = input.trim().split(/\s+/)
        let style = DEFAULT_STYLE
        let weight = DEFAULT_WEIGHT

        // If no parts are passed, return the default styling
        if (parts.length === 0) {
            return {
                family: '',
                weight,
                style,
                originalInput
            }
        }

        // Create a copy of parts to work with
        const remainingParts = [...parts]


        // Step 1: Extract weight keywords
        // Check for two-word weights first (e.g., "Semi Bold", "Extra Light")
        for (let i = 0; i < remainingParts.length - 1; i++) {
            const twoWordWeight = `${remainingParts[i]} ${remainingParts[i + 1]}`.toLowerCase()
            const hyphenatedWeight = `${remainingParts[i]}-${remainingParts[i + 1]}`.toLowerCase()

            if (WEIGHT_MAP[twoWordWeight]) {
                weight = WEIGHT_MAP[twoWordWeight]
                remainingParts.splice(i, 2)
                break
            } else if (WEIGHT_MAP[hyphenatedWeight]) {
                weight = WEIGHT_MAP[hyphenatedWeight]
                remainingParts.splice(i, 2)
                break
            }
        }

        // Check for single-word weights
        const weightIndex = remainingParts.findIndex(part =>
            WEIGHT_MAP[part.toLowerCase()]
        )
        if (weightIndex !== -1) {
            weight = WEIGHT_MAP[remainingParts[weightIndex].toLowerCase()]
            remainingParts.splice(weightIndex, 1)
        }

        // Step 2: Extract numeric weights (e.g., "300", "700") - highest priority
        const numericWeightIndex = remainingParts.findIndex(part => /^[1-9]00$/.test(part))
        if (numericWeightIndex !== -1) {
            weight = remainingParts[numericWeightIndex]
            remainingParts.splice(numericWeightIndex, 1)
        }

        // Step 3: Extract style keywords
        const styleIndex = remainingParts.findIndex(part =>
            STYLE_MAP[part.toLowerCase()]
        )
        if (styleIndex !== -1) {
            style = STYLE_MAP[remainingParts[styleIndex].toLowerCase()]
            remainingParts.splice(styleIndex, 1)
        }

        // Step 4: Whatever remains is the font family name
        const family = remainingParts.join(' ')

        return {
            family,
            weight,
            style,
            originalInput
        }
    }

/**
 * Generate FontSource CDN URL for downloading font files
 */
export function generateFontSourceUrl(parsed: ParsedFont): string {
        if (!parsed.family) {
            throw new Error('Font family name is required')
        }

        const familySlug = parsed.family.toLowerCase().replace(/\s+/g, '-')

        return `https://cdn.jsdelivr.net/fontsource/fonts/${familySlug}@latest/latin-${parsed.weight}-${parsed.style}.ttf`
    }


/**
 * Get display name for a font with its variations
 */
export function getDisplayName(parsed: ParsedFont): string {
        if (parsed.weight === DEFAULT_WEIGHT && !parsed.style) {
            return parsed.family
        }

        const weightName = Object.keys(WEIGHT_MAP).find(
            key => WEIGHT_MAP[key] === parsed.weight
        ) || parsed.weight

        const parts = [parsed.family]

        if (parsed.weight !== DEFAULT_WEIGHT) {
            parts.push(weightName.charAt(0).toUpperCase() + weightName.slice(1))
        }

        if (parsed.style !== DEFAULT_STYLE) {
            parts.push(parsed.style.charAt(0).toUpperCase() + parsed.style.slice(1))
        }

        return parts.join(' ')
}

/**
 * Validate if a URL has a valid font file extension
 */
export function hasValidFontExtension(url: string): boolean {
    return url.match(/\.(ttf|otf|woff2?|eot)$/i) !== null
}