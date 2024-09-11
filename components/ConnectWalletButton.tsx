"use client";

import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import React, { ReactNode, useEffect, useState } from "react";
import { SiweMessage } from "siwe";
import { useAccountEffect, useDisconnect, useSignMessage } from "wagmi";
import { cn } from "~/lib/utils";
import useWalletDialogStore from "~/store/walletdialog";
import { Button, forwardRef } from "@chakra-ui/react";
import { generateNonce } from "siwe";
import { getSiweMessage } from "~/lib/auth";
import useWalletConnectionStore, { initialConnectionState } from "~/store/walletconnection";
import { toast } from "sonner";

type ConnectWalletButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof ConnectButton.Custom>,
  "children"
> & {
  className?: string;
  disabledClassName?: string;
  children?: ({
    connecting,
    connected,
    message,
    signingMessage,
    preparing,
  }: {
    connecting: boolean;
    connected: boolean;
    message: SiweMessage | null;
    signingMessage: boolean;
    preparing: boolean;
  }) => ReactNode;
  onClick?: () => void;
  onSuccess?: () => void;
  onError?: (errorMessage?: string) => void;
};

const ConnectWalletButton = forwardRef<ConnectWalletButtonProps, "div">(
  ({ className, children, disabledClassName, onClick, onSuccess, onError, ...props }, ref) => {
    const [active, setActive] = useState(false);
    const connectionState = useWalletConnectionStore();
    const { connectModalOpen } = useConnectModal();
    const walletdialog = useWalletDialogStore();
    const { disconnect } = useDisconnect();
    const [nonce, setNonce] = useState(() => generateNonce());

    const reset = React.useCallback(() => {
      setActive(false);
      setNonce(generateNonce());
      walletdialog.update({ open: false });
      connectionState.update(initialConnectionState);
    }, [connectionState, walletdialog]);

    const cancel = React.useCallback(() => {
      reset();
      disconnect();
    }, [disconnect, reset]);

    // useEffect(() => {
    //   cancel();
    // }, []);

    useEffect(() => {
      if (active && !connectModalOpen) {
        cancel();
        onError?.("User Cancelled");
      }
    }, [active, cancel, connectModalOpen, onError]);

    const handleVerifySignature = async (message: SiweMessage, signature: string) => {
      try {
        const res = (await fetch("/api/verifySignature", {
          method: "POST",
          body: JSON.stringify({
            message,
            signature,
            nonce,
          }),
        }).then((res) => res.json())) as { success: boolean; error?: string };
        if (res.success) {
          connectionState.update({
            ...connectionState,
            connected: true,
            signingMessage: false,
            signedMessage: true,
          });
          onSuccess?.();
        } else {
          cancel();
          onError?.(res.error);
        }
      } catch (e) {
        cancel();
        if (e instanceof Error) return onError?.(e.message);
        return onError?.("Unknown error");
      }
    };

    const { signMessage } = useSignMessage({
      mutation: {
        onSuccess: async (data) => {
          if (!connectionState.message) {
            cancel();
            return onError?.("Unexpected error");
          }
          handleVerifySignature(connectionState.message, data);
        },
        onError: (error) => {
          cancel();
          onError?.(error.message);
        },
        onSettled: () => {
          connectionState.update({
            ...connectionState,
            signingMessage: false,
          });
        },
      },
    });

    const handleSignMessage = React.useCallback(
      async (address: string) => {
        const message = getSiweMessage(address, nonce);
        connectionState.update({
          message,
          connected: true,
          connecting: false,
          signingMessage: true,
          signedMessage: false,
        });

        signMessage({ message: message.prepareMessage() });
      },
      [connectionState, nonce, signMessage]
    );

    const handleOpenConnectModal = (connected: boolean, openConnectModal: () => void) => {
      if (connected) {
        disconnect();
        return;
      }

      openConnectModal();
    };

    useAccountEffect({
      onConnect: ({ address }) => {
        connectionState.update({
          ...connectionState,
          message: getSiweMessage(address, nonce),
          connecting: false,
          connected: true,
          signingMessage: active,
          signedMessage: !active
        });
        if (active) {
          setActive(false);
          walletdialog.update({
            open: true,
            address,
            cancel: () => {
              cancel();
              onError?.("User Cancelled");
            },
            confirm: () => {
              handleSignMessage(address);
            },
          });
        }
      },
      onDisconnect: () => {
        reset();
      },
    });

    return (
      <>
        <ConnectButton.Custom {...props}>
          {({ openConnectModal, mounted }) => {
            const ready = mounted;
            const buttonDisabled =
              connectionState.connecting ||
              connectionState.signingMessage ||
              !ready ||
              !openConnectModal;
            return (
              <Button
                as="div"
                className={cn(
                  "min-w-fit",
                  buttonDisabled && "disabled:pointer-events-none disabled:opacity-50",
                  className,
                  buttonDisabled && disabledClassName
                )}
                onClick={() => {
                  handleOpenConnectModal(connectionState.connected, openConnectModal!);
                  onClick?.();
                  if (!connectionState.connected) {
                    connectionState.update({
                      ...connectionState,
                      connecting: true,
                    });
                    setActive(true);
                  }
                }}
                disabled={buttonDisabled}
                ref={ref}
              >
                {children?.({
                  preparing: !ready,
                  connecting: connectionState.connecting,
                  connected: connectionState.connected,
                  message: connectionState.message,
                  signingMessage: connectionState.signingMessage,
                })}
              </Button>
            );
          }}
        </ConnectButton.Custom>
      </>
    );
  }
);

ConnectWalletButton.displayName = ConnectButton.Custom.displayName;

export default ConnectWalletButton;
