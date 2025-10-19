import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { SolanaNetwork } from '@/types';

/**
 * Get USDC mint address for the network
 */
function getUSDCMint(network: SolanaNetwork): string {
  return network === 'solana'
    ? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // Mainnet USDC
    : '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'; // Devnet USDC
}

/**
 * Get RPC URL for the network
 */
function getRpcUrl(network: SolanaNetwork): string {
  return network === 'solana'
    ? 'https://api.mainnet-beta.solana.com'
    : 'https://api.devnet.solana.com';
}

/**
 * Fetch USDC balance for a wallet address
 * @param walletAddress - Solana wallet public key as string
 * @param network - Solana network (mainnet or devnet)
 * @param customRpcUrl - Optional custom RPC URL
 * @returns USDC balance as formatted string
 */
export async function fetchUSDCBalance(
  walletAddress: string,
  network: SolanaNetwork,
  customRpcUrl?: string
): Promise<string> {
  try {
    const rpcUrl = customRpcUrl || getRpcUrl(network);
    const connection = new Connection(rpcUrl, 'confirmed');
    const walletPubkey = new PublicKey(walletAddress);
    const usdcMint = new PublicKey(getUSDCMint(network));

    // Get associated token account address
    const tokenAccountAddress = await getAssociatedTokenAddress(
      usdcMint,
      walletPubkey
    );

    // Fetch token account info
    const tokenAccount = await getAccount(connection, tokenAccountAddress);

    // Convert from micro-USDC (6 decimals) to USDC
    const balance = Number(tokenAccount.amount) / 1_000_000;

    return balance.toFixed(2);
  } catch (error) {
    console.error('Error fetching USDC balance:', error);
    return '0.00';
  }
}

/**
 * Convert USD amount to micro-USDC
 */
export function toMicroUSDC(amount: number): bigint {
  return BigInt(Math.floor(amount * 1_000_000));
}

/**
 * Convert micro-USDC to USD amount
 */
export function fromMicroUSDC(microAmount: bigint | number): number {
  return Number(microAmount) / 1_000_000;
}
