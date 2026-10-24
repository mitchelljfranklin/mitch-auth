import fs from 'node:fs'
import path from 'node:path'

export const BRANDING_DIR = path.join('./config/branding')

export const BACKGROUND_FILENAMES = ['background.png', 'background.jpg', 'background.jpeg'] as const

export function findBrandingBackground(): string | null {
  try {
    const files = fs.readdirSync(BRANDING_DIR)
    return BACKGROUND_FILENAMES.find(name => files.includes(name)) ?? null
  } catch {
    return null
  }
}
