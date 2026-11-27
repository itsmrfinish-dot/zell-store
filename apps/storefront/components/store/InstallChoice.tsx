'use client'

import { useId } from 'react'
import { HardHat, Wrench } from 'lucide-react'
import { formatLength, formatPiastres, installationFeePiastres } from '@zell/core'
import type { ChosenInstallMode, InstallMode } from '../../lib/cart'
import { Num } from './Num'
import { installerOnlyLine } from '../../lib/install/installChoice'

const OPTIONS: Array<{ value: ChosenInstallMode; title: string; hint: string }> = [
  { value: 'self', title: 'ÙØ±ÙÙØ¨Ù Ø¨ÙÙØ³Ù', hint: 'ØªØ®ØªØ§Ø± Ø£Ø¯ÙØ§Øª Ø§ÙØªØ±ÙÙØ¨ Ø§ÙÙÙ ÙØ­ØªØ§Ø¬ÙØ§' },
  { value: 'installer', title: 'ÙØ­ØªØ§Ø¬ ÙÙÙ ØªØ±ÙÙØ¨', hint: 'Ø£Ø¬Ø± Ø¨Ø§ÙÙØªØ± + Ø§ÙØªÙØ§Ù Ø­Ø³Ø¨ ÙÙØ·ÙØªÙ' },
]

/**
 * Â«ÙØªØ±ÙÙØ¨Ù Ø¥Ø²Ø§ÙØÂ» â Ø§Ø®ØªÙØ§Ø± ÙØ§Ø­Ø¯ ÙÙ Ø§ØªÙÙÙ (radio Ø­ÙÙÙÙ) ÙØ£ÙÙØ§Ù Ø§ÙÙÙØ§Ø³Ø ÙÙ ØµÙØ­Ø© Ø§ÙÙÙØªØ¬ ÙØ§ÙØ³ÙØ©.
 *
 * Ø§ÙØ®ÙØ§Ø±Ø§Ù Ø¨ÙÙØ³ Ø§ÙØ§Ø±ØªÙØ§Ø¹ (grid stretch + h-full)Ø ÙØ§ÙØ£ÙÙÙÙØ© ÙØ§ÙØ¹ÙÙØ§Ù Ø¹ÙÙ Ø³Ø·Ø± ÙØ§Ø­Ø¯ ÙØ§ÙÙØµÙ ØªØ­ØªÙÙ.
 * Ø¹ÙÙ Ø§ÙØ´Ø§Ø´Ø§Øª Ø§ÙØ¶ÙÙØ© Ø¬Ø¯ÙØ§ Ø¨ÙØ¨ÙÙØ§ ØµÙÙÙ Ø¨Ø¯Ù ÙØ§ Ø§ÙÙØµ ÙØªØ²ÙÙ.
 *
 * â ï¸ Ø¯Ù ÙÙØ© Ø¨Ø³ Ø¹ÙÙ ÙØ³ØªÙÙ Ø§ÙØ³ÙØ© (cart.installMode). ÙØ´ Ø¨ÙØºÙÙØ± Ø³Ø¹Ø± Ø£Ù ØµÙÙ ÙÙØ§ Ø§ÙØ·ÙØ¨.
 *    Checkout ÙÙ Ø§ÙÙÙ Ø¨ÙÙØ±Ø± Ø§ÙØªÙÙØ± Ø­Ø³Ø¨ Ø§ÙÙØ­Ø§ÙØ¸Ø© ÙØ§ÙÙÙØ·ÙØ©Ø ÙØ§ÙØ¯Ø§ØªØ§Ø¨ÙØ² Ø¨ØªØ­Ø³Ø¨ Ø§ÙÙØ¹ØªÙØ¯.
 *
 * Â«unsetÂ» (ÙØ³Ù ÙØ§ Ø§Ø®ØªØ§Ø±Ø´): ÙÙØ§ radio ÙØªØ­Ø¯Ø¯Ø ÙØ³Ø·Ø± Ø¨ÙØ·ÙØ¨ Ø§ÙØ§Ø®ØªÙØ§Ø± â ÙÙÙØ´ Ø§Ø®ØªÙØ§Ø± Ø§ÙØªØ±Ø§Ø¶Ù.
 */
export function InstallChoice({
  mode,
  onChange,
  feePerSquareMeterPiastres,
  lengthCm,
  governorates,
  context,
  installerOnly = false,
}: {
  mode: InstallMode
  onChange: (next: ChosenInstallMode) => void
  feePerSquareMeterPiastres: number
  /** Ø·ÙÙ Ø£ÙÙØ§Ù Ø§ÙÙÙØ§Ø³ Ø¨Ø§ÙØ³ÙØªÙÙØªØ± â ÙÙ ØµÙØ­Ø© Ø§ÙÙÙØªØ¬ Ø§ÙØ·ÙÙ Ø§ÙØ­Ø§ÙÙØ ÙÙÙ Ø§ÙØ³ÙØ© ÙØ¬ÙÙØ¹ Ø§ÙØ£ÙÙØ§Ù. */
  lengthCm: number
  /** Ø§ÙÙØ­Ø§ÙØ¸Ø§Øª Ø§ÙÙÙ ÙÙÙØ§ ÙÙØ·ÙØ© ÙØªØ§Ø­Ø© ÙÙÙÙÙ (ÙÙ Ø¥Ø¹Ø¯Ø§Ø¯ Ø§ÙÙÙØ­Ø©). */
  governorates: string[]
  context: 'product' | 'cart'
  /** INSTALLER-ONLY â Â«ÙÙÙ ÙÙØ·Â» ÙÙ Ø§ÙÙÙØ­Ø©: Ø®ÙØ§Ø± Ø§ÙÙÙÙ ÙÙØ­Ø¯Ù ÙØ³Ø·Ø± ØªÙØ¶ÙØ­Ø ÙÙÙ ØºÙØ± Â«Ø¨ÙÙØ³ÙÂ». */
  installerOnly?: boolean
}) {
  const name = useId()
  const hintId = useId()
  const unset = mode === 'unset'
  // INSTALLER-ONLY ÙØ§ÙØ§Ø®ØªÙØ§Ø± Ø§ÙØ­Ø§ÙÙ ÙØ´ ÙÙÙ (ÙØ³ÙØ Ø£Ù Â«Ø¨ÙÙØ³ÙÂ» ÙÙ ÙØ¨Ù) = ÙØ§Ø²Ù ÙØ®ØªØ§Ø± Ø§ÙÙÙÙ ØµØ±Ø§Ø­Ø©
  const needsPick = unset || (installerOnly && mode !== 'installer')
  const estimate = installationFeePiastres(feePerSquareMeterPiastres, lengthCm)

  return (
    <fieldset className="rounded-lg border border-border bg-card p-4" {...(needsPick ? { 'aria-describedby': hintId } : {})}>
      <legend className="px-1 text-sm font-bold text-fg">ÙØªØ±ÙÙØ¨Ù Ø¥Ø²Ø§ÙØ</legend>
      {installerOnly ? <p className="px-1 text-xs font-semibold text-fg">{installerOnlyLine(context)}</p> : null}
      <div className={'mt-1 grid grid-cols-1 gap-2' + (installerOnly ? '' : ' min-[380px]:grid-cols-2')}>
        {(installerOnly ? OPTIONS.filter((option) => option.value === 'installer') : OPTIONS).map((option) => {
          const selected = mode === option.value
          const Icon = option.value === 'installer' ? HardHat : Wrench
          return (
            <label
              key={option.value}
              className={
                'flex h-full cursor-pointer items-start gap-2.5 rounded-lg border-2 p-3 text-sm transition-colors ' +
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40 ' +
                (selected ? 'border-brand bg-brand/5' : 'border-border hover:border-brand/50')
              }
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-center gap-1.5 font-semibold leading-5 text-fg">
                  {/* Ø§ÙØ®ÙØ°Ø© Ø´ÙÙÙØ§ ÙØ§Ø²Ù ÙØªØ­Øª ÙØ£ÙØ±Ø¨ ÙÙØ¹ÙÙØ§Ù ÙÙ Ø§ÙÙÙØªØ§Ø­ â Ø±ÙØ¹Ø© Ù¡px ÙÙØ³Ø§ÙØ© ØµØºÙØ±Ø© Ø¹Ø´Ø§Ù ÙØ¨Ø§ÙÙØ§ Ø²Ù Ø¨Ø¹Ø¶ */}
                  <Icon
                    className={'h-4 w-4 shrink-0 text-brand' + (option.value === 'installer' ? ' -translate-y-px me-0.5' : '')}
                    aria-hidden="true"
                  />
                  <span>{option.title}</span>
                </span>
                <span className="text-xs leading-5 text-muted">{option.hint}</span>
              </span>
            </label>
          )
        })}
      </div>

      {needsPick ? (
        <p id={hintId} className="mt-2 text-xs font-semibold text-fg">
          {installerOnly ? 'Ø§Ø®ØªØ§Ø± Â«ÙØ­ØªØ§Ø¬ ÙÙÙ ØªØ±ÙÙØ¨Â» Ø¹Ø´Ø§Ù ÙÙÙÙ' : 'Ø§Ø®ØªØ§Ø± ÙØªØ±ÙÙØ¨Ù Ø¥Ø²Ø§Ù Ø¹Ø´Ø§Ù ÙÙÙÙ'}
        </p>
      ) : null}

      {mode === 'installer' ? (
        <div className="mt-3 space-y-1 rounded border border-dashed border-border p-3 text-xs text-muted">
          <p className="text-sm font-semibold text-fg">
            <Num>{formatPiastres(feePerSquareMeterPiastres)}</Num> ÙÙÙØªØ± Ø§ÙØ·ÙÙÙ ÙÙ Ø£ÙÙØ§Ù Ø§ÙÙÙØ§Ø³
          </p>
          {estimate > 0 ? (
            <p>
              {context === 'product' ? 'ØªÙØ¯ÙØ± Ø§ÙØªØ±ÙÙØ¨ ÙÙØ·ÙÙ Ø¯Ù: ' : 'ØªÙØ¯ÙØ± Ø§ÙØªØ±ÙÙØ¨ ÙØ£ÙÙØ§Ù Ø§ÙØ³ÙØ©: '}
              <Num>{formatLength(lengthCm)}</Num> = <Num>{formatPiastres(estimate)}</Num>
            </p>
          ) : null}
          <p>
            Ø§ÙØªÙØ§Ù Ø§ÙÙÙÙ Ø¨ÙØªØ­Ø³Ø¨ Ø­Ø³Ø¨ ÙÙØ·ÙØªÙ ÙÙ ØµÙØ­Ø© Ø§ÙØ·ÙØ¨. ÙØªØ§Ø­ Ø­Ø§ÙÙÙØ§ ÙÙ: {governorates.join('Ø ')}.
          </p>
        </div>
      ) : null}
    </fieldset>
  )
}
