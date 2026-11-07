/* ------------------------------------------------------------------ *
 *  Let a form drive an avatar's mood. Uses native constraint validation
 *  (required, type="email", minlength, pattern…), so there is nothing to
 *  configure for most forms.
 * ------------------------------------------------------------------ */
import type { AliveHandle } from './alive'
import type { Mood } from './core'

export interface FormMoods {
  /** Nothing typed yet / field cleared. Default 'neutral'. */
  idle?: Mood
  /** Value present and valid. Default 'happy'. */
  valid?: Mood
  /** Value present but invalid. Default 'confused'. */
  invalid?: Mood
  /** Submitted with errors. Default 'sad' (plus a head shake). */
  rejected?: Mood
  /** Submit accepted, waiting for you to call success()/error(). Default 'surprised'. */
  submitting?: Mood
  /** After success(). Default 'love' (plus a nod). */
  success?: Mood
  /** After error(). Default 'sad' (plus a head shake). */
  error?: Mood
  /** Custom check per field; return true/false, or null to fall back to native validity. */
  validate?: (field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => boolean | null
  /** Call `preventDefault()` on valid submits (for fetch-based forms). Default true. */
  preventSubmit?: boolean
}

export interface FormBinding {
  success(): void
  error(): void
  reset(): void
  destroy(): void
}

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
const isField = (el: EventTarget | null): el is Field =>
  !!el && /^(INPUT|TEXTAREA|SELECT)$/.test((el as Element).tagName ?? '')

/**
 * bindForm(handle, form): typing → valid/invalid moods, submit → rejected or
 * submitting, then call `.success()` or `.error()` when your request finishes.
 */
export function bindForm(handle: AliveHandle, form: HTMLFormElement, moods: FormMoods = {}): FormBinding {
  const m = { idle: 'neutral', valid: 'happy', invalid: 'confused', rejected: 'sad', submitting: 'surprised', success: 'love', error: 'sad', ...moods } as Required<Omit<FormMoods, 'validate' | 'preventSubmit'>>
  const ok = (f: Field) => moods.validate?.(f) ?? f.validity.valid // .validity never fires "invalid" events
  const onInput = (e: Event) => {
    if (!isField(e.target)) return
    const f = e.target
    handle.emote(!f.value ? m.idle : ok(f) ? m.valid : m.invalid)
  }
  // native validation blocks the submit event entirely, so react to `invalid` too
  // one reaction per submit attempt, even though every invalid field fires an event
  let busy = false
  const reject = () => {
    if (busy) return
    busy = true
    setTimeout(() => (busy = false), 300)
    handle.emote(m.rejected)
    handle.shake()
  }
  const onInvalid = () => reject()
  const onSubmit = (e: Event) => {
    const fields = Array.from(form.elements).filter(isField)
    if (!fields.every((f) => ok(f))) {
      e.preventDefault()
      reject()
      return
    }
    if (moods.preventSubmit !== false) e.preventDefault()
    handle.emote(m.submitting)
  }
  form.addEventListener('input', onInput)
  form.addEventListener('submit', onSubmit)
  form.addEventListener('invalid', onInvalid, true)
  return {
    success() {
      handle.emote(m.success)
      handle.nod()
    },
    error() {
      handle.emote(m.error)
      handle.shake()
    },
    reset() {
      handle.emote(m.idle)
    },
    destroy() {
      form.removeEventListener('input', onInput)
      form.removeEventListener('submit', onSubmit)
      form.removeEventListener('invalid', onInvalid, true)
    },
  }
}

/** The smallest binding: map one field's value to a mood on every keystroke. */
export function bindInput(handle: AliveHandle, input: Field, toMood: (value: string, field: Field) => Mood | null | undefined): () => void {
  const on = () => {
    const mood = toMood(input.value, input)
    if (mood) handle.emote(mood)
  }
  input.addEventListener('input', on)
  return () => input.removeEventListener('input', on)
}
