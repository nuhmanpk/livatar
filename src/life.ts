// livatar/life: personality, feelings, context, AI assistant, virtual pet, multiplayer.
// Everything works on any AliveHandle (from mount, mountCode, <live-avatar>, React refs…).
export { feel, feeling, type Feeling } from './life/feel'
export { personality, traits, personalityName, PERSONALITIES, type Traits, type Personality, type PersonalityName, type PersonalityInput, type PersonalityOptions } from './life/personality'
export { react, reaction, context, type LifeEvent, type Reaction, type ContextOptions } from './life/react'
export { assistant, type Assistant, type AssistantState, type AssistantOptions } from './life/assistant'
export { pet, type Pet, type PetStats, type PetStore, type PetOptions } from './life/pet'
export { group, type Group, type Member, type GroupOptions } from './life/group'
