import { NATIVE_MINT } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { BPS_PER_WHOLE, GameState } from '.'
import { decodeGame } from './decoders'
import { getGameAddress } from './pdas'

export const basisPoints = (percent: number) => {
  return Math.round(percent * BPS_PER_WHOLE)
}

export const isNativeMint = (pubkey: PublicKey) => NATIVE_MINT.equals(pubkey)

export const hmac256 = async (secretKey: string, message: string) => {
  const encoder = new TextEncoder
  const messageUint8Array = encoder.encode(message)
  const keyUint8Array = encoder.encode(secretKey)
  const cryptoKey = await crypto.subtle.importKey('raw', keyUint8Array, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageUint8Array)
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const getGameHash = (rngSeed: string, clientSeed: string, nonce: number) => {
  return hmac256(rngSeed, [clientSeed, nonce].join('-'))
}

export const getResultNumber = async (rngSeed: string, clientSeed: string, nonce: number) => {
  const hash = await getGameHash(rngSeed, clientSeed, nonce)
  return parseInt(hash.substring(0, 5), 16)
}

export type GameResult = ReturnType<typeof parseResult>

export const parseResult = (
  state: GameState,
) => {
  const clientSeed = state.clientSeed
  const bet = state.bet.map((x) => x / BPS_PER_WHOLE)
  const nonce = state.nonce.toNumber() - 1
  const rngSeed = state.rngSeed
  const resultIndex = state.result
  const multiplier = bet[resultIndex]
  const wager = state.wager.toNumber()
  const payout = (wager * multiplier)
  const profit = (payout - wager)

  return {
    creator: state.creator,
    user: state.user,
    rngSeed,
    clientSeed,
    nonce,
    bet,
    resultIndex,
    wager,
    payout,
    profit,
    multiplier,
    token: state.tokenMint,
    bonusUsed: state.bonusUsed.toNumber(),
    jackpotWin: state.jackpotPayout.toNumber(),
  }
}

export async function getNextResult(
  connection: Connection,
  user: PublicKey,
  prevNonce: number,
) {
  return new Promise<GameResult>((resolve, reject) => {
    if (!connection || !connection.onAccountChange) {
      return reject('Connection not available or missing onAccountChange method')
    }

    let listener: number | undefined

    try {
      listener = connection.onAccountChange(
        getGameAddress(user),
        async (account) => {
          const current = decodeGame(account)
          if (!current) {
            if (listener !== undefined && connection?.removeAccountChangeListener) {
              connection.removeAccountChangeListener(listener)
            }
            return reject('Game account was closed')
          }
          if (current.nonce.toNumber() === prevNonce + 1) {
            if (listener !== undefined && connection?.removeAccountChangeListener) {
              connection.removeAccountChangeListener(listener)
            }
            const result = await parseResult(current)
            return resolve(result)
          }
        },
      )
    } catch (error) {
      return reject(`Error setting up account change listener: ${error}`)
    }
  })
} 