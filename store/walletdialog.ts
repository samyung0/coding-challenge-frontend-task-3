import { create } from "zustand";

type WalletDialogState = {
  open: boolean;
  address?: string;
  cancel?: () => void;
  confirm?: () => void;
};

type WalletDialogAction = {
  update: (state: WalletDialogState) => void;
};

const initialState: WalletDialogState = { open: false };

const useWalletDialogStore = create<WalletDialogState & WalletDialogAction>()((set) => ({
  ...initialState,
  update: (state) => set(state),
}));

export default useWalletDialogStore;
