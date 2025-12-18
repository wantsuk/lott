
import { Prize } from '../types';

export const getWeightedRandomPrize = (prizes: Prize[]): Prize => {
  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const prize of prizes) {
    if (random < prize.weight) return prize;
    random -= prize.weight;
  }
  
  return prizes[0];
};
