import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { clampConfig, type FurnitureConfig } from './furniture'

const SEARCH_KEY = 'design'

export function serializeConfig(config: FurnitureConfig): string {
  const packed = compressToEncodedURIComponent(JSON.stringify(clampConfig(config)))
  return `?${SEARCH_KEY}=${packed}`
}

export function deserializeConfig(search: string): FurnitureConfig | null {
  const params = new URLSearchParams(search)
  const packed = params.get(SEARCH_KEY)

  if (!packed) {
    return null
  }

  try {
    const json = decompressFromEncodedURIComponent(packed)
    if (!json) {
      return null
    }

    const parsed = JSON.parse(json) as FurnitureConfig
    return clampConfig(parsed)
  } catch {
    return null
  }
}
