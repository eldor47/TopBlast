interface Window {
  submitGameScore: (score: number, characterName?: string) => Promise<void>;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  submitScore: (score: number, characterName?: string) => Promise<boolean>;
} 