import { describe, expect, it } from 'vitest'
import { createDefaultConfig } from './furniture'
import { deserializeConfig, serializeConfig } from './urlState'

describe('url state', () => {
  it('round-trips a config through the share URL', () => {
    const config = createDefaultConfig('shelf')
    expect(deserializeConfig(serializeConfig(config))).toEqual(config)
  })

  it('returns null for invalid search data', () => {
    expect(deserializeConfig('?design=not-real')).toBeNull()
  })
})
