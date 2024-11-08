import { assetConstants, type ChainflipAsset } from '@chainflip/utils/chainflip';
import { priceX128ToPrice } from '@chainflip/utils/tickMath';

export const getPriceFromPriceX128 = (
  priceX128: bigint | string,
  srcAsset: ChainflipAsset,
  destAsset: ChainflipAsset,
) =>
  priceX128ToPrice(priceX128.toString())
    .shiftedBy(assetConstants[srcAsset].decimals - assetConstants[destAsset].decimals)
    .toFixed(assetConstants[destAsset].decimals);
