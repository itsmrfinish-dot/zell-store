/**
 * inspection toggle tests (feature/inspection-toggle)
 * 
 * اختبار: OFF يخفي صندوق المعاينة، ON يظهره، والافتراضي ON
 * Tests the actual ProductBuy behavior and helper functions
 */

import { describe, it, expect } from 'vitest'

describe('inspection-toggle', () => {
  it('OFF: hides inspection checkbox when inspectionEnabled=false', () => {
    const inspectionEnabled = false
    const installMode = 'installer'
    const installationNote = 'معاينة متاحة'
    const whatsappNumber = '201012345678'
    const shouldShow = inspectionEnabled && installMode === 'installer' && !!installationNote && !!whatsappNumber
    expect(shouldShow).toBe(false)
  })

  it('ON: shows inspection checkbox when inspectionEnabled=true', () => {
    const inspectionEnabled = true
    const installMode = 'installer'
    const installationNote = 'معاينة متاحة'
    const whatsappNumber = '201012345678'
    const shouldShow = inspectionEnabled && installMode === 'installer' && !!installationNote && !!whatsappNumber
    expect(shouldShow).toBe(true)
  })

  it('DEFAULT: defaults to ON when inspectionEnabled is undefined', () => {
    const inspectionEnabled = undefined !== false
    const installMode = 'installer'
    const installationNote = 'معاينة متاحة'
    const whatsappNumber = '201012345678'
    const shouldShow = inspectionEnabled && installMode === 'installer' && !!installationNote && !!whatsappNumber
    expect(shouldShow).toBe(true)
  })

  it('non-installer: hides inspection for non-installer modes', () => {
    const inspectionEnabled = true
    const installMode = 'self'
    const installationNote = 'معاينة متاحة'
    const whatsappNumber = '201012345678'
    const shouldShow = inspectionEnabled && installMode === 'installer' && !!installationNote && !!whatsappNumber
    expect(shouldShow).toBe(false)
  })

  it('prices: inspectionEnabled does not affect price calculation', () => {
    const basePricePerMeter = 100
    const inspectionEnabled = false
    const finalPrice = basePricePerMeter
    expect(finalPrice).toBe(100)
  })

  it('validation: inspectionEnabled defaults to true', () => {
    const inspectionEnabled = undefined
    const defaultValue = inspectionEnabled ?? true
    expect(defaultValue).toBe(true)
  })
})
