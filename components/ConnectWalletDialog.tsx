"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import useWalletDialogStore from "~/store/walletdialog";

const ConnectWalletDialog = () => {
  const store = useWalletDialogStore();
  return (
    <AlertDialog
      open={store.open}
      onOpenChange={() => {
        store.update({ open: false });
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Wallet</AlertDialogTitle>
          <AlertDialogDescription>You are connecting the following address:</AlertDialogDescription>
          <div className="font-semibold text-primary">{store.address}</div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={store.cancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={store.confirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConnectWalletDialog;
