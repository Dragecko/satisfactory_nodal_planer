export * from './types'
export { Miner } from './miner'
export { Smelter } from './smelter'
export { Foundry } from './foundry'
export { Assembler } from './assembler'
export { TrainFreight } from './train_freight'

import { Miner } from './miner'
import { Smelter } from './smelter'
import { Foundry } from './foundry'
import { Assembler } from './assembler'
import { TrainFreight } from './train_freight'

export const ALL_BLOCKS = [
  Miner,
  Smelter,
  Foundry,
  Assembler,
  TrainFreight
]


