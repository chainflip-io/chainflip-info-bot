import { ChainflipAsset } from './graphql/generated/graphql.js';

export const FLIP_DECIMAL_POINTS = 18;

export const assetDecimals: Record<ChainflipAsset, number> = {
  ArbEth: 18,
  ArbUsdc: 6,
  Btc: 8,
  Dot: 10,
  Eth: 18,
  Flip: 18,
  Sol: 9,
  SolUsdc: 6,
  Usdc: 6,
  Usdt: 6,
};

type AccountInfo = Record<string, { name: string; twitter: string | null }>;

export const knownBrokers: AccountInfo = {
  cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7: { name: 'Chainflip', twitter: '@Chainflip' },
  cFN1AfNQBEBCkuNAV37WWw34bCAdiW5e5sHTY4LaaRWiBSh7B: {
    name: 'BlockSwap',
    twitter: '@BlockswapBot',
  },
  cFJZVRaybb2PBwxTiAiRLiQfHY4KPB3RpJK22Q7Fhqk979aCH: { name: 'Swappy', twitter: '@SwappyCrypto' },
  cFLuWQcabsKpegned1ka3Qad6cTATzpgwLYZK8U5spmkG9MEf: {
    name: 'THORWallet',
    twitter: '@THORWalletDEX',
  },
  cFJjZKzA5rUTb9qkZMGfec7piCpiAQKr15B4nALzriMGQL8BE: { name: 'THORSwap', twitter: '@THORSwap' },
  cFLdvBS9Gq9iqB8Zdb5cmnWgmhqvEojQYGMBquDz7xRiSvsJV: { name: 'THORSwap', twitter: '@THORSwap' },
  cFJWWedhJmnsk3P9jEmCfbmgmg62ZpA7LT5WCpwLXEzXuRuc3: {
    name: 'HoudiniSwap',
    twitter: '@HoudiniSwap',
  },
  cFKYhAZR1ycHnXLC1PVttiAMVRK489rKhfRXPA4v9yG4WdzqP: {
    name: 'El Dorado',
    twitter: '@eldorado_market',
  },
  cFN3CjHtr3QdUymjhQPFgHzF3WiNNQy36DJxhLwet269qPWaQ: {
    name: 'SwapBot',
    twitter: '@DragonLabsAsia',
  },
  cFJsX7ECMDciU1Ce6VTmNz5TwgkiTMC3j9XVqmbf3eaxSyjXs: { name: 'BitArch', twitter: '@Bit_Arch' },
  cFNx21kQWmr9wsqq29zWM7RpDBKv4bctudEUE6J22Hd4NUUHR: { name: 'Rango', twitter: '@RangoExchange' },
  cFNdyY1j7jKqgJPLg6UH1aaA4N3s9S52Zyxo8nATYxkovtHUr: { name: 'Babylon', twitter: '@bAPElon' },
  cFNmhAeG1L7f4KrbPvsZyUM8xsNmVbJ51AKv4zgHRaTrF4kBf: {
    name: 'Monkey DEX',
    twitter: '@monkeygodlabs',
  },
  cFLraJ446JFyGxmXhEwbcFQrWoWbGL3n18giQ99ktVFFP2LaJ: {
    name: 'Talisman',
    twitter: '@wearetalisman',
  },
  cFN122fMqitRHRxhVnPHuGeQG1GQ5dQXb25J4FoJmn74x7Mhe: { name: 'OKX Wallet', twitter: '@okxweb3' },
  cFMYQgx3LhxLNDEiFC5nLXp5r1ZUrXocrQDqJB1Z3mqEegT6g: {
    name: 'SubWallet',
    twitter: '@subwalletapp',
  },
};

export const knownLps: AccountInfo = {
  cFLBKavxvThwqLWNr7cTwtqhYD6jDqXM31d6QoTLvuK4X78ve: { name: 'CumpsD', twitter: '@cumpsd' },
  cFKy4xbhLxvAVxYuPEWbbTJTed5WtyqNVikH2fS2WYLNHRrFh: {
    name: 'TreStylez',
    twitter: '@StylezCrypto',
  },
  cFKHPcU7dWqZjQarJerUei1ZJWCSGb2AC4VhW5axwYzTsaYRT: { name: 'Shaun', twitter: '@SavcatEth' },
  cFKbPkHcjWs6oryCc4L8i7hgGgFBgS73V8aRpzvQAXykJRrz1: {
    name: 'ChainflipGod',
    twitter: '@chainflipgod',
  },
  cFHy5rshwuXtRvXyEt9a2eK4mzPbs4WqwGkGPWT9XP7jAc2kB: {
    name: 'ChainflipGod',
    twitter: '@chainflipgod',
  },
  cFMboYsd4HvERKXX11LyvZXuTcQzV7KAe9ipP4La5vUs8fd4e: {
    name: 'ChainflipGod',
    twitter: '@chainflipgod',
  },
  cFMVQrUbuTuXmeRinPQovRkCgoyrrRd3N4Q5ZdHfqv4VJi5Hh: {
    name: 'ChainflipGod',
    twitter: '@chainflipgod',
  },
  cFNzKSS48cZ1xQmdub2ykc2LUc5UZS2YjLaZBUvmxoXHjMMVh: { name: 'JIT Strategies', twitter: null },
  cFK6qCSmgYJACMNVk6JnCb5nkccr7yM6aZiKtXUnFAzsX7hvs: { name: 'Marky', twitter: '@Marky_CF' },
  cFJXT4WEEdfiShje4z9JMwAvMiMTu7nioPgXsE9o1KqdVrzLg: { name: 'Auros', twitter: '@Auros_global' },
  cFLGvPhhrribWCx9id5kLVqwiFK4QiVNjQ6ViyaRFF2Nrgq7j: { name: 'Selini', twitter: '@SeliniCapital' },
  cFKZarxpf9MVwzzmYUtQfV61PRkYgTj9wUgUCeuKpKgMLrTow: { name: 'Selini', twitter: '@SeliniCapital' },
  cFLBRkucKofjzUNnFpSoW8Lv4RK24K5tUPFKAWgdrBci9WPDY: { name: 'Selini', twitter: '@SeliniCapital' },
  cFJsDTPT4Pcwco6raEz5PJC65nrdvhcu3ZoEBhtQxapsWmB8A: { name: 'Tokka Labs', twitter: '@TokkaLabs' },
  cFPJNbXH9KNP1CRejnf19ARopcS8w8c4teTz5GF3G36MZRWJG: { name: 'curiouspleb', twitter: null },
};

export const EXPLORER_URL = 'https://scan.chainflip.io';
