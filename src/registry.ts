import type { AvatarStyle } from './core'
import { blob } from './styles/blob'
import { buddy } from './styles/buddy'
import { bot } from './styles/bot'
import { pixel } from './styles/pixel'
import { animal } from './styles/animal'
import { monster } from './styles/monster'
import { ghost } from './styles/ghost'
import { emoji } from './styles/emoji'
import { initials } from './styles/initials'
import { food } from './styles/food'
import { plant } from './styles/plant'
import { dino } from './styles/dino'
import { alien } from './styles/alien'
import { planet } from './styles/planet'
import { clay } from './styles/clay'
import { memoji } from './styles/memoji'
import { ui } from './styles/ui'
import { device } from './styles/device'
import { fruit } from './styles/fruit'
import { drink } from './styles/drink'
import { vehicle } from './styles/vehicle'
import { tech } from './styles/tech'
import { money } from './styles/money'
import { home } from './styles/home'
import { office } from './styles/office'
import { dev } from './styles/dev'
import { human } from './styles/human'

/**
 * All built-in styles keyed by name. Importing this pulls every style into
 * your bundle. The key order is part of the livatar code format: append only.
 */
export const styles: Record<string, AvatarStyle<any>> = { blob, buddy, bot, pixel, animal, monster, ghost, emoji, initials, food, plant, dino, alien, planet, clay, memoji, ui, device, fruit, drink, vehicle, tech, money, home, office, dev, human }
