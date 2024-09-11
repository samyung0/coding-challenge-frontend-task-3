"use client";

import { StarIcon } from "@chakra-ui/icons";
import { useCallback, useState } from "react";
import { SiweMessage } from "siwe";
import ConnectWalletButton from "../components/ConnectWalletButton";
import { darkTheme, lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Button } from "~/components/ui/button";
import { useTheme } from "next-themes";
import ConnectWalletDialog from "~/components/ConnectWalletDialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import useWalletConnectionStore from "~/store/walletconnection";

export default function Home() {
  const theme = useTheme();
  const state = useWalletConnectionStore()
  // const [wallet, setWallet] = useState("");
  // const [loading, setLoading] = useState(false);

  const onClick = useCallback(() => {}, []);

  const onSuccess = useCallback(() => {
    toast.success("Connected");
  }, []);

  const onError = useCallback((errorMessage?: string) => {
    if (errorMessage) toast.error(errorMessage);
    // setWallet("");
  }, []);

  return (
    <RainbowKitProvider
      theme={theme.resolvedTheme === "dark" ? darkTheme() : lightTheme()}
      modalSize="compact"
    >
      <div className="container m-auto p-8 flex flex-col gap-8">
        <ThemeToggle />
        <h1>Wallet: {state.signedMessage ? state.message?.address : "Not Connected"}</h1>
        <div className="flex flex-col gap-4  items-start">
          <ConnectWalletButton onClick={onClick} onSuccess={onSuccess} onError={onError}>
            {/* can refactor into its own component and make it cleaner */}
            {({ preparing, connecting, connected, message, signingMessage }) => 
              preparing ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing
                </Button>
              ) : connecting ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting Wallet
                </Button>
              ) : signingMessage ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing Message
                </Button>
              ) : (
                <>
                  {!connected && <Button>Connect Wallet</Button>}
                  {connected && <Button variant="outline">Disconnect Wallet</Button>}
                </>
              )
            }
          </ConnectWalletButton>

          <ConnectWalletButton onClick={onClick} onSuccess={onSuccess} onError={onError}>
            {({ preparing, connecting, connected, message }) =>
              preparing || connecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  {!connected && (
                    <Button variant="outline">
                      Custom Button UI
                    </Button>
                  )}
                  {connected && (
                    <Button variant="outline">
                      Custom Button UI - disconnect
                    </Button>
                  )}
                </>
              )
            }
          </ConnectWalletButton>

          <ConnectWalletButton onClick={onClick} onSuccess={onSuccess} onError={onError}>
            {() => <StarIcon color="green" />}
          </ConnectWalletButton>
        </div>
      </div>
      <ConnectWalletDialog />
    </RainbowKitProvider>
  );
}
