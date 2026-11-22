'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Loader2, ShoppingBag } from 'lucide-react'
import {
  formatLength,
  installationReadyGovernorates,
  installerRequiredFor,
  maxQuantityOf,
  validateLength,
  widthOptionsOf,
  withWidth,
  type InstallationConfig,
  type ProductSizeEntry,
  type ProductSizeTexts,
  type StoreProduct,
} from '@zell/core'
import { useCart } from '../../lib/cart'
import { trackPixel } from '../../lib/analytics/pixelBridge'
import { addToCartParams } from '../../lib/analytics/pixelEvents'
import { BUY_NOW_PENDING_TEXT } from '../../lib/buy/buyNow'
import { BuyNowSlowNotice } from './BuyNowSlowNotice'
import { useBuyNow } from './useBuyNow'
import { useRevealOnAdd } from './useRevealOnAdd'
import { buttonClasses, Button } from '../ui/Button'
import { Num } from './Num'
import { GiftNote } from './GiftNote'
import { SizePanel } from './SizePanel'
import { AddonsPicker } from './AddonsPicker'
import { currentInstallModeLine, installChoiceRequired, revealToolsOnChange, showToolSuggestions } from '../../lib/install/installChoice'
import { InstallChoice } from './InstallChoice'
import { buildInspectionMessage, buildWhatsAppUrl } from '../../lib/install/inspection'
import type { SizeDecision } from '../../lib/size/sizeEntry'

/** gift: Â«ÙØµ Ø§ÙØ¹Ø±Ø¶Â» ÙÙ Ø¸Ø§ÙØ± â Ø¨ÙØ¸ÙØ± ÙÙØ¯ÙØ© ÙÙÙ Ø²Ø±Ø§Ø± Ø§ÙØ¥Ø¶Ø§ÙØ©. */
export function ProductBuy({
  product,
  gift = '',
  addons = [],
  addonsTitle = '',
  installation = null,
  whatsappNumber = '',
  sizeEntry = 'cm',
  sizeTexts,
}: {
  product: StoreProduct
  gift?: string
  /** 0016 â ÙÙØªØ¬Ø§Øª ÙØ·Ø¹Ø© Ø¨ØªØªØ¶Ø§Ù ÙØ¹ Ø§ÙÙÙÙÙ (Ø¨Ø¹Ø¯Ø¯ÙØ§). */
  addons?: StoreProduct[]
  addonsTitle?: string
  /** PR4 â Ø¥Ø¹Ø¯Ø§Ø¯ Ø§ÙÙÙÙ (0018). null = ÙÙ ØºÙØ± Â«ÙØªØ±ÙÙØ¨Ù Ø¥Ø²Ø§ÙØÂ». */
  installation?: InstallationConfig | null
  /** LENGTH-INPUT â Ø§ÙØ·Ø±ÙÙØ© Ø§ÙØ£ÙÙÙ ÙØ¥Ø¯Ø®Ø§Ù Ø§ÙÙÙØ§Ø³ ÙÙ Â«Ø§ÙÙØ­ØªÙÙÂ» (Ø§ÙØºØ§ÙØ¨ = Ø³ÙØªÙÙØªØ±). */
  sizeEntry?: ProductSizeEntry
  /** SIZE-TEXTS â ÙØµÙØµ Â«Ø­Ø¯Ø¯ Ø§ÙÙÙØ§Ø³Â» ÙÙ Â«Ø§ÙÙØ­ØªÙÙÂ» (Ø§ÙØºØ§ÙØ¨ = Ø§ÙÙØµÙØµ Ø§ÙØ§ÙØªØ±Ø§Ø¶ÙØ©). */
  sizeTexts?: ProductSizeTexts
  whatsappNumber?: string
}) {
  const cart = useCart()
  // BUY-NOW â Â«Ø§Ø·ÙØ¨ Ø¯ÙÙÙØªÙÂ»: Ø¥Ø¶Ø§ÙØ© ÙØ±Ø© ÙØ§Ø­Ø¯Ø© + Ø¹ÙØ§ÙØ© ØªØ­ÙÙÙ ÙÙØ±ÙØ© + ÙÙØ¹ Ø§ÙØ¶ØºØ· Ø§ÙÙØªÙØ±Ø± (lib/buy/buyNow.ts)
  const buyNow = useBuyNow()
  const busy = buyNow.busy
  // PR4 â Â«ÙØªØ±ÙÙØ¨Ù Ø¥Ø²Ø§ÙØÂ»: Ø§ÙÙÙØ© Ø¹ÙÙ ÙØ³ØªÙÙ Ø§ÙØ³ÙØ© (cart.installMode)Ø ÙCheckout Ø§ÙØ­ÙÙ Ø§ÙÙÙØ§Ø¦Ù
  const installerGovernorates = installation ? installationReadyGovernorates(installation) : []
  const fee = installation?.feePerMeterPiastres ?? null
  const showChoice = installerGovernorates.length > 0 && fee !== null
  // INSTALLER-ONLY â Ø§ÙÙÙØªØ¬ Ø¯Ù Â«ÙÙÙ ÙÙØ·Â» ÙÙ Ø§ÙÙÙØ­Ø©: Ø§ÙÙÙÙ ÙÙØ­Ø¯ÙØ ÙÙÙ ØºÙØ± Â«Ø¨ÙÙØ³ÙÂ» ÙÙØ§ Ø§ÙØªØ±Ø§Ø­Ø§Øª Ø£Ø¯ÙØ§Øª
  const installerOnly = showChoice && installation !== null && installerRequiredFor(installation, product.id)
  const installer = showChoice && cart.installMode === 'installer'
  // ÙØ¨Ù ÙØ±Ø§Ø¡Ø© Ø§ÙØ§Ø®ØªÙØ§Ø± Ø§ÙÙØ­ÙÙØ¸ (cart.ready) ÙØ§ÙØ¹Ø±Ø¶Ø´ Â«Ø¨ÙÙØ³ÙÂ» Ø§ÙØ§ÙØªØ±Ø§Ø¶Ù â ÙØ§Ù Ø¨ÙØ¸ÙØ± Ø§ÙØ£Ø¯ÙØ§Øª ÙØ­Ø¸Ø© ÙÙØ®ÙÙÙØ§
  const choicePending = showChoice && !cart.ready
  // Â«ÙØªØ±ÙÙØ¨Ù Ø¥Ø²Ø§ÙØÂ» ÙØ§Ø²Ù ÙØ¨ÙÙ Ø§Ø®ØªÙØ§Ø± ØµØ±ÙØ­: ÙØ¨Ù ÙØ§ Ø§ÙØ¹ÙÙÙ ÙØ®ØªØ§Ø± (unset) Ø§ÙØ¥Ø¶Ø§ÙØ© ÙØ§ÙØ·ÙØ¨ ÙÙÙÙÙÙÙ
  // ÙØ§ÙØ³Ø¨Ø¨ Ø¸Ø§ÙØ± Ø¬ÙØ¨ Ø§ÙØ£Ø²Ø±Ø§Ø±. ÙÙÙÙ ÙÙ ØºÙØ± Ø§ÙÙØ§Ø±Øª Ø£Ù ÙÙØªØ¬ Ø¨Ø§ÙÙØ·Ø¹Ø© ÙØ§Ø¨ÙØªØ£Ø«Ø±ÙØ´.
  const choiceRequired = installChoiceRequired({ showChoice, ready: cart.ready, mode: cart.installMode, installerOnly })
  const choiceHintId = useId()
  // Ø³Ø·Ø± Ø§ÙØ§Ø®ØªÙØ§Ø± Ø§ÙØ­Ø§ÙÙ (null ÙÙ ÙØ³Ù ÙØ§Ø§Ø®ØªØ§Ø±Ø´)
  const currentLine = installerOnly ? null : currentInstallModeLine(cart.installMode)
  const [revealTools, setRevealTools] = useState(false)
  const toolsRef = useRef<HTMLParagraphElement>(null)
  // Â«ÙØ±ÙÙØ¨Ù Ø¨ÙÙØ³ÙÂ» Ø¨Ø¹Ø¯ Â«ÙÙÙÂ»: Ø§ÙØ£Ø¯ÙØ§Øª Ø¨ØªØ¸ÙØ± ÙØ§ÙØªØ±ÙÙØ² ÙØ±ÙØ­ ÙÙØ§ (Ø³ÙØ³Ø ÙÙÙØ±Ù ÙØ¹ reduced motion).
  // ÙÙÙØ´ Ø£Ø¯ÙØ§Øª = ÙÙÙØ´ Ø¹ÙØµØ± = ÙÙÙØ´ scroll.
  useEffect(() => {
    if (!revealTools) return
    setRevealTools(false)
    const node = toolsRef.current
    if (!node) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    node.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    node.focus({ preventScroll: true })
  }, [revealTools])
  const [lengthCm, setLengthCm] = useState(product.min_length_cm)
  const [justAdded, setJustAdded] = useState(false)
  // ADD-REVEAL: Ø§ÙØµÙØ­Ø© Ø¨ØªÙØ²Ù ÙØ±Ø³Ø§ÙØ© Â«Ø§ØªØ¶Ø§Ù ÙÙØ³ÙØ©Â» Ø¨Ø¹Ø¯ Â«Ø¶ÙÙ ÙÙØ³ÙØ©Â» (useRevealOnAdd)
  const addedBox = useRevealOnAdd<HTMLDivElement>()
  const [blocked, setBlocked] = useState(false)
  // LENGTH-INPUT â ÙØ±Ø§Ø± Ø§ÙØ·ÙØ¨ ÙÙ ÙÙØ·Ø© Ø§ÙÙÙØ§Ø³ Ø§ÙØ­Ø§ÙÙØ© ÙÙØª Ø§ÙØ¶ØºØ· (SizePanel Ø¨ÙØ­Ø¯ÙØ« Ø§ÙØ¯Ø§ÙØ© Ø¨Ø¹Ø¯ ÙÙ commitØ ÙØ¨Ù Ø£Ù Ø¶ØºØ·Ø©):
  // Ø§ÙØ³ÙØªÙÙØªØ± Ø§ÙÙØ§Ø¶Ù Ø£Ù Ø§ÙØºÙØ· Ø£Ù ØªØ­Øª Ø§ÙØ­Ø¯ = Ø¥Ø¸ÙØ§Ø± Ø§ÙØ®Ø·Ø£ ÙÙ ØºÙØ± Ø¥Ø¶Ø§ÙØ© (ÙÙÙ Ø£ÙÙ render)Ø ÙØ§ÙØ·ÙÙ Ø§ÙÙØ¶Ø§Ù ÙÙ ÙÙØ³ Ø§ÙÙÙØ·Ø©.
  const decisionRef = useRef<(() => SizeDecision) | null>(null)
  const [attempt, setAttempt] = useState(0)
  /** Ø¢Ø®Ø± Ø³Ø·Ø± Ø§ØªØ¶Ø§Ù (Ø§ÙØ·ÙÙ ÙØ§ÙØ¹Ø±Ø¶) â Â«Ø§Ø·ÙØ¨ Ø¯ÙÙÙØªÙÂ» ÙØ§ÙØ¶ÙÙÙØ´ ØªØ§ÙÙ ÙÙ ÙÙ ÙÙ. */
  const lastAddedRef = useRef<string | null>(null)
  const [addedLengthCm, setAddedLengthCm] = useState(product.min_length_cm)
  const [addonQty, setAddonQty] = useState<Record<number, number>>({})
  // Ø¹Ø¯Ø¯ Ø§ÙØ£Ø¯ÙØ§Øª Ø§ÙÙÙ Ø§ØªØ¶Ø§ÙØª ÙØ¹ÙÙØ§ ÙÙ Ø¢Ø®Ø± Â«Ø¶ÙÙ ÙÙØ³ÙØ©Â» â ÙÙØ±Ø³Ø§ÙØ© Ø¨Ø³Ø Ø¨ÙØªØ³Ø¬ÙÙ ÙØ­Ø¸Ø© Ø§ÙØ¥Ø¶Ø§ÙØ© (ÙØ¨Ù ÙØ§ addonQty ÙØªØµÙÙØ±)
  const [addedToolsCount, setAddedToolsCount] = useState(0)
  // 0015 â Ø§ÙØ¹Ø±Ø¶ Ø§ÙÙØ®ØªØ§Ø±. Ø§ÙÙÙØªØ¬ Ø¨Ø¹Ø±Ø¶ ÙØ§Ø­Ø¯ = ÙÙÙØ´ Ø§Ø®ØªÙØ§Ø± ÙÙÙÙØ´ ØªØºÙÙØ±.
  const options = widthOptionsOf(product)
  const [widthCm, setWidthCm] = useState(product.width_cm)
  const effective = withWidth(product, widthCm) ?? product
  const chosenWidth = effective.width_cm === product.width_cm ? undefined : effective.width_cm

  // ÙÙÙ Ø§ÙØ²Ø±Ø§Ø± (Ø§ÙÙÙÙ Â· Ø§ÙÙÙØ§Ø³ Ø£ÙØ¨Ø± ÙÙ Ø§ÙÙØªØ§Ø­ Â· Ø·ÙÙ ÙØªØ± ØºÙØ± ØµØ§ÙØ­). Ø§ÙÙØ±Ø§Ø± Ø§ÙØ£Ø®ÙØ± ÙÙØª Ø§ÙØ¶ØºØ· ÙÙ decide() ØªØ­Øª.
  const canAdd = !blocked && !choiceRequired && validateLength(lengthCm, effective).ok

  /** Ø§ÙÙØ±Ø§Ø± ÙÙØª Ø§ÙØ¶ØºØ·: Ø§ÙÙÙÙ Ø§ÙÙØ·ÙÙØ¨ = ÙÙØ§ Ø­Ø§Ø¬Ø©Ø ÙØºÙØ± ÙØ¯Ù ÙÙ ÙÙØ·Ø© Ø§ÙÙÙØ§Ø³ Ø§ÙØ­Ø§ÙÙØ© (sizeDecision). */
  const decide = (): SizeDecision => {
    if (choiceRequired) return { kind: 'disabled' }
    const snapshot = decisionRef.current
    return snapshot === null ? { kind: 'disabled' } : snapshot()
  }
  const lineKey = (length: number) => String(length) + '|' + String(effective.width_cm)

  const handleAdd = () => {
    const decision = decide()
    if (decision.kind === 'reveal') setAttempt((value) => value + 1)
    if (decision.kind !== 'add') return
    cart.add(product.id, decision.lengthCm, chosenWidth)
    trackPixel('AddToCart', addToCartParams(product.id))
    lastAddedRef.current = lineKey(decision.lengthCm)
    setAddedLengthCm(decision.lengthCm)
    setAddedToolsCount(addSelectedAddons())
    setJustAdded(true)
    addedBox.reveal()
  }

  /**
   * Ø§ÙØ¥Ø¶Ø§ÙØ§Øª Ø§ÙÙØ®ØªØ§Ø±Ø© Ø¨ØªØªØ¶Ø§Ù ÙØ³Ø·ÙØ± ÙØ·Ø¹Ø©Ø ÙØ§ÙØ§Ø®ØªÙØ§Ø± Ø¨ÙØªØµÙÙØ± Ø¹Ø´Ø§Ù ÙØ§ØªØªÙØ±Ø±Ø´.
   * Ø¨ØªØ±Ø¬ÙØ¹ Ø¹Ø¯Ø¯ Ø§ÙØ£Ø¯ÙØ§Øª Ø§ÙÙÙ Ø§ØªØ¶Ø§ÙØª ÙØ¹ÙÙØ§ ÙÙ Ø§ÙØ¹ÙÙÙØ© Ø¯Ù (ÙÙØ±Ø³Ø§ÙØ© Ø¨Ø³).
   */
  function addSelectedAddons(): number {
    let added = 0
    for (const addon of addons) {
      const quantity = addonQty[addon.id] ?? 0
      if (quantity > 0) {
        cart.addPiece(addon.id, quantity, maxQuantityOf(addon))
        trackPixel('AddToCart', addToCartParams(addon.id))
        added += 1
      }
    }
    setAddonQty({})
    return added
  }

  // Â«Ø§Ø·ÙØ¨ Ø¯ÙÙÙØªÙÂ»: ÙØ¶ÙÙ ÙÙØ±ÙØ­ ÙÙØ¨ÙØ§ÙØ§Øª Ø¹ÙÙ Ø·ÙÙ. ÙÙ ÙÙØ³ Ø§ÙØ§Ø®ØªÙØ§Ø± Ø§ØªØ¶Ø§Ù ÙØ³Ù (justAdded) ÙØ§Ø¨ÙØ¶ÙÙÙØ´ ØªØ§ÙÙ â ÙØ±ÙØ­ Ø¨Ø³.
  // BUY-NOW: Ø§ÙØ³Ø·Ø± ÙØ±Ø© ÙØ§Ø­Ø¯Ø© Ø¨Ø³ ÙÙÙØ§ Ø§ØªØ¶ØºØ·Ø ÙØ£Ø«ÙØ§Ø¡ Ø§ÙØ§ÙØªØ¸Ø§Ø± ÙÙ Ø§ÙØ§Ø®ØªÙØ§Ø±Ø§Øª ÙÙÙÙÙØ©Ø ÙØ¨Ø¹Ø¯ 15 Ø«Ø§ÙÙØ© ØªÙØ¨ÙÙ ÙØ´ ÙØ´Ù.
  const handleBuyNow = () => {
    const decision = decide()
    if (decision.kind === 'reveal') setAttempt((value) => value + 1)
    if (decision.kind !== 'add') return
    const key = lineKey(decision.lengthCm)
    buyNow.go(
      key,
      justAdded && lastAddedRef.current === key,
      () => {
        cart.add(product.id, decision.lengthCm, chosenWidth)
        trackPixel('AddToCart', addToCartParams(product.id))
        lastAddedRef.current = key
      },
      // Ø§ÙØ¥Ø¶Ø§ÙØ§Øª Ø§ÙÙØ®ØªØ§Ø±Ø© Ø¯ÙÙÙØªÙ Ø¨ØªØªØ¶Ø§Ù Ø¯Ø§ÙÙÙØ§ (Ø¨ØªØªØµÙÙØ± Ø¨Ø¹Ø¯ Ø§ÙØ¥Ø¶Ø§ÙØ©Ø ÙÙØ§Ø¨ØªØªÙØ±Ø±Ø´) â Ø§ÙÙÙ Ø¸Ø§ÙØ± ÙØ®ØªØ§Ø± = Ø§ÙÙÙ Ø¨ÙØªØ¶Ø§Ù
      () => {
        addSelectedAddons()
      },
    )
  }

  return (
    <div className="space-y-4">
      {/* BUY-NOW: ÙÙØª Â«Ø§Ø·ÙØ¨ Ø¯ÙÙÙØªÙÂ» ÙÙ Ø§ÙØ§Ø®ØªÙØ§Ø±Ø§Øª ÙØ§ÙØ£Ø²Ø±Ø§Ø± ÙÙÙÙÙØ© ÙØ­Ø¯ ÙØ§ Ø§ÙØ§ÙØªÙØ§Ù ÙØªØ­Ø³Ù â Ø§ÙÙÙ Ø¸Ø§ÙØ± = Ø§ÙÙÙ Ø§ØªØ¶Ø§Ù */}
      <fieldset disabled={busy} className="min-w-0 space-y-4">
      {/* Ø§ÙØ¹Ø±Ø¶ Ø¬ÙÙ ÙØ§Ø±Øª Ø§ÙÙÙØ§Ø³ ÙÙØ³Ù â ÙØªØºÙÙØ±Ù Ø¨ÙØ¹ÙØ¯ Ø§ÙØ­Ø³Ø§Ø¨ Ø¹ÙÙ ÙÙØ³ ÙÙØ§Ø³ Ø§ÙØ´Ø¨Ø§Ù */}
      <SizePanel
        product={product}
        widthCm={effective.width_cm}
        onWidthChange={(next) => {
          setWidthCm(next)
          setJustAdded(false)
        }}
        lengthCm={lengthCm}
        onLengthChange={(next) => {
          setLengthCm(next)
          setJustAdded(false)
        }}
        onBlockedChange={(next) => {
          setBlocked(next)
          if (next) setJustAdded(false)
        }}
        sizeEntry={sizeEntry}
        sizeTexts={sizeTexts}
        decisionRef={decisionRef}
        attempt={attempt}
      />

      {/* ØµÙØ¯ÙÙ Ø·ÙØ¨ Ø§ÙÙØ¹Ø§ÙÙØ© */}
      {cart.installMode === 'installer' && installation?.inspectionNote && whatsappNumber ? (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="font-semibold">ÙØ­ØªØ§Ø¬ ÙØ¹Ø§ÙÙØ©</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{installation.inspectionNote}</p>
          
          <div className="text-sm space-y-2 mt-4 pt-4 border-t border-border">
            <p className="font-medium">الرسالة اللي هتتبعت:</p>
            <p className="text-muted-foreground whitespace-pre-wrap">{buildInspectionMessage(product.name_ar, (() => { const d = decide(); return d.kind === 'add' ? { length: d.lengthCm, width: chosenWidth } : undefined })(), product.id, installation.whatsappMessage)}</p>
          </div>
          <a
            href={buildWhatsAppUrl(
              whatsappNumber,
              buildInspectionMessage(product.name_ar, (() => { const d = decide(); return d.kind === 'add' ? { length: d.lengthCm, width: chosenWidth } : undefined })(), product.id, installation.whatsappMessage)
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            ð¬ ÙØ§ØªØ³Ø§Ø¨
          </a>
        </div>
      ) : null}

      <GiftNote text={gift} />

      {showChoice && fee !== null && choicePending ? (
        // ÙÙØ§Ù Ø«Ø§Ø¨Øª ÙØ­Ø¯ ÙØ§ Ø§ÙØ§Ø®ØªÙØ§Ø± Ø§ÙÙØ­ÙÙØ¸ ÙØªÙØ±Ù â ÙÙ ØºÙØ± ÙÙÙØ¶ ÙÙØ§ ÙÙØ²Ø© ÙÙ Ø§ÙØµÙØ­Ø©
        <div aria-hidden="true" className="h-36 rounded-lg border border-border bg-card" />
      ) : null}
      {showChoice && fee !== null && !choicePending ? (
        <div className="space-y-2">
          <InstallChoice
            mode={cart.installMode}
            onChange={(next) => {
              // Â«ÙØ±ÙÙØ¨Ù Ø¨ÙÙØ³ÙÂ» Ø¨Ø¹Ø¯ Ø§Ø®ØªÙØ§Ø± ØªØ§ÙÙ + ÙÙÙ Ø£Ø¯ÙØ§Øª = Ø§ÙØ£Ø¯ÙØ§Øª Ø¨ØªØ¸ÙØ± ÙØ§ÙØªØ±ÙÙØ² ÙØ±ÙØ­ ÙÙØ§ (ÙÙØ³ Ø§ÙØ´Ø±Ø· Ø¨Ø§ÙØ­Ø±ÙØ lib/install)
              if (revealToolsOnChange(cart.installMode, next, addons.length)) setRevealTools(true)
              cart.setInstallMode(next)
              // Ø£Ø¯ÙØ§Øª ÙØ®ØªØ§Ø±Ø© ÙÙØ³Ù ÙØ§Ø§ØªØ¶Ø§ÙØªØ´ Ø¨ØªØªØµÙÙØ± â ÙØ§Ø¨ØªØªØ¶Ø§ÙØ´ ÙÙ ØºÙØ± ÙØ§ Ø§ÙØ¹ÙÙÙ ÙØ´ÙÙÙØ§
              if (next === 'installer') setAddonQty({})
            }}
            feePerMeterPiastres={fee}
            lengthCm={lengthCm}
            governorates={installerGovernorates}
            context="product"
            installerOnly={installerOnly}
          />
          {/* Ø§ÙØ§Ø®ØªÙØ§Ø± ÙØ§Ø­Ø¯ ÙÙØ·ÙØ¨ ÙÙÙ (cart.installMode): ÙÙ ÙØªØ­Ø¯Ø¯Ø Ø³Ø·Ø± ÙØ§Ø¶Ø­ Ø¨Ø§ÙÙÙÙØ© Ø§ÙØ­Ø§ÙÙØ© ÙØ¥ÙÙØ§ ÙÙØ·ÙØ¨ ÙÙÙ ÙØ¨ØªØªØºÙÙØ± ÙÙ ÙÙØ§ */}
          {currentLine !== null ? <p className="text-sm text-fg">{currentLine}</p> : null}
        </div>
      ) : null}

      {/* ÙØ¹ Ø§ÙÙÙÙ Ø§ÙØªØ±Ø§Ø­Ø§Øª Ø§ÙØ£Ø¯ÙØ§Øª Ø¨ØªØ®ØªÙÙ â ÙØ´ ÙØ­ØªØ§Ø¬ÙØ§. ÙÙØ¨Ù Ø§ÙØ§Ø®ØªÙØ§Ø± ÙØ§Ø¨ØªØ¸ÙØ±Ø´ Ø¹Ø´Ø§Ù Â«Ø¨ÙÙØ³ÙÂ» ÙØ§ÙØ¨Ø§ÙØ´ Ø§ÙØªØ±Ø§Ø¶Ù */}
      {!showToolSuggestions({ installer: installer || installerOnly, choicePending, choiceRequired, addonCount: addons.length }) ? null : (
        <div className="space-y-2">
          {showChoice ? (
            <p ref={toolsRef} tabIndex={-1} className="scroll-mt-24 text-sm font-semibold text-fg outline-none">
              Ø§Ø®ØªØ§Ø± Ø£Ø¯ÙØ§Øª Ø§ÙØªØ±ÙÙØ¨ Ø§ÙÙÙ ÙØ­ØªØ§Ø¬ÙØ§
            </p>
          ) : null}
          <AddonsPicker
            addons={addons}
            title={addonsTitle}
            quantities={addonQty}
            onChange={setAddonQty}
            defaultOpen={revealTools}
          />
        </div>
      )}

      {/* Â«Ø¶ÙÙ ÙÙØ³ÙØ©Â» Ø§ÙØ£Ø³Ø§Ø³Ù ÙÙÙÙ (Ø§ÙÙØ³Ø§Ø± Ø§ÙØ£ÙØ¶Ø­ ÙØ¹ Ø§ÙØ£Ø¯ÙØ§Øª ÙØ§ÙÙÙÙ)Ø ÙÂ«Ø§Ø·ÙØ¨ Ø¯ÙÙÙØªÙÂ» ØªØ­ØªÙ Ø«Ø§ÙÙÙ â Ø§ÙØ³ÙÙÙ Ø²Ù ÙØ§ ÙÙ */}
      <div className="grid gap-2">
        <Button
          size="lg"
          onClick={handleAdd}
          disabled={!canAdd || busy}
          {...(choiceRequired ? { 'aria-describedby': choiceHintId } : {})}
        >
          <ShoppingBag className="h-5 w-5" />
          Ø¶ÙÙ ÙÙØ³ÙØ©
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={handleBuyNow}
          disabled={!canAdd || busy}
          aria-busy={busy}
          className={busy ? 'disabled:cursor-wait disabled:opacity-100' : undefined}
          {...(choiceRequired ? { 'aria-describedby': choiceHintId } : {})}
        >
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              {BUY_NOW_PENDING_TEXT}
            </>
          ) : (
            <>
              Ø§Ø·ÙØ¨ Ø¯ÙÙÙØªÙ
              <ArrowLeft className="h-5 w-5" />
            </>
          )}
        </Button>
        {choiceRequired ? (
          <p id={choiceHintId} className="text-center text-xs font-semibold text-fg">
            {installerOnly
              ? 'Ø§ÙÙÙØªØ¬ Ø¯Ù Ø¨ÙØªØ±ÙÙØ¨ ÙØ¹ ÙÙÙ â Ø§Ø®ØªØ§Ø± Â«ÙØ­ØªØ§Ø¬ ÙÙÙ ØªØ±ÙÙØ¨Â» ÙÙÙ Ø§ÙØ£ÙÙ Ø¹Ø´Ø§Ù ØªØ¶ÙÙ Ø£Ù ØªØ·ÙØ¨.'
              : 'Ø§Ø®ØªØ§Ø± Â«ÙØªØ±ÙÙØ¨Ù Ø¥Ø²Ø§ÙØÂ» ÙÙÙ Ø§ÙØ£ÙÙ â Ø¨ÙÙØ³Ù ÙÙØ§ ÙØ¹ ÙÙÙ â Ø¹Ø´Ø§Ù ØªØ¶ÙÙ Ø£Ù ØªØ·ÙØ¨.'}
          </p>
        ) : null}
      </div>
      </fieldset>

      {/* BUY-NOW: Ø¨Ø¹Ø¯ 15 Ø«Ø§ÙÙØ© ØªÙØ¨ÙÙ (ÙØ´ ÙØ´Ù) + ØªØ­ÙÙÙ ÙØ§ÙÙ ÙØµÙØ­Ø© Ø§ÙØ¨ÙØ§ÙØ§Øª â Ø¨Ø±ÙÙ Ø§ÙÙ fieldset Ø¹ÙØ´Ø§Ù ÙÙØ¶Ù Ø´ØºÙØ§Ù */}
      <BuyNowSlowNotice phase={buyNow.phase} onRetry={buyNow.retry} />

      {justAdded ? (
        <div ref={addedBox.ref} tabIndex={-1} className="space-y-3 rounded-lg border border-accent/40 bg-card p-4 outline-none">
          <p className="flex items-center gap-2 text-sm font-semibold text-fg">
            <Check className="h-4 w-4 text-accent" />
            Ø§ØªØ¶Ø§Ù ÙÙØ³ÙØ© â <Num>{formatLength(addedLengthCm)}</Num>
            {options.length > 1 ? (
              <>
                {' Â· Ø¹Ø±Ø¶ '}
                <Num>{String(effective.width_cm)}</Num>
                {' Ø³Ù'}
              </>
            ) : null}
          </p>
          {/* ØªØ£ÙÙØ¯ Ø¨Ø³ ÙÙ Ø£Ø¯ÙØ§Øª Ø§ØªØ¶Ø§ÙØª ÙØ¹ÙÙØ§ ÙÙ Ø§ÙØ¶ØºØ·Ø© Ø¯Ù â ÙÙØ¹ Ø§ÙÙÙÙ ÙÙÙØ´ Ø£Ù ÙÙØ§Ù Ø¹Ù Ø§ÙØ£Ø¯ÙØ§Øª */}
          {!installer && addedToolsCount > 0 ? (
            <p className="text-xs font-semibold text-fg">Ø§ØªØ¶Ø§ÙØª Ø£Ø¯ÙØ§Øª Ø§ÙØªØ±ÙÙØ¨ Ø§ÙÙØ®ØªØ§Ø±Ø© ÙØ¹ Ø§ÙÙÙØªØ¬.</p>
          ) : null}
          {/* ÙÙ ØºÙØ± Ø¯Ø¹ÙØ© ØªØ§ÙÙØ© ÙØµÙØ­Ø© Ø§ÙØ£Ø¯ÙØ§Øª: Ø§ÙØ§Ø®ØªÙØ§Ø± Ø§ØªØ¹ÙÙ ÙÙÙØ ÙØ§ÙØ£Ø¯ÙØ§Øª ÙØªØ§Ø­Ø© ÙÙ Ø§ÙØ³ÙØ© */}
          <Link href="/cart" className={buttonClasses('primary', 'md', 'w-full')}>
            Ø±ÙØ­ ÙÙØ³ÙØ©
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/checkout" className={buttonClasses('secondary', 'md', 'w-full')}>
              Ø¥ØªÙØ§Ù Ø§ÙØ·ÙØ¨
            </Link>
            <Link href="/" className={buttonClasses('secondary', 'md', 'w-full')}>
              ÙÙÙÙ ØªØ³ÙÙÙ
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
