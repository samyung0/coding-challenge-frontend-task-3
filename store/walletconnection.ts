import { SiweMessage } from "siwe";
import { create } from "zustand";

type WalletConnectionState = {
  connecting: boolean;
  connected: boolean;
  message: SiweMessage | null;
  signingMessage: boolean;
  signedMessage: boolean
};

type WalletConnectionAction = {
  update: (state: WalletConnectionState) => void;
};

export const initialConnectionState: WalletConnectionState = {
  connecting: false,
  connected: false,
  message: null,
  signingMessage: false,
  signedMessage: false
};

const useWalletConnectionStore = create<WalletConnectionState & WalletConnectionAction>()(
  (set) => ({
    ...initialConnectionState,
    update: (state) => set(state),
  })
);

export default useWalletConnectionStore;
