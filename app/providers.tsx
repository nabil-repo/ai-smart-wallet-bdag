"use client";

import * as React from "react";
import {
    RainbowKitProvider,
    getDefaultWallets,
    connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
    argentWallet,
    trustWallet,
    ledgerWallet,
    walletConnectWallet,
    coreWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { Chain } from "wagmi"

export const blockdagPrimordialTestnet: Chain = {
    id: 1043,
    name: "BlockDAG Primordial Testnet",
    network: "blockdag-testnet",
    nativeCurrency: {
        decimals: 18,
        name: "BlockDAG",
        symbol: "BDAG",
    },
    rpcUrls: {
        default: {
            http: ["https://rpc.primordial.bdagscan.com"],
        },
        public: {
            http: ["https://rpc.primordial.bdagscan.com"],
        },
    },
    blockExplorers: {
        default: { name: "BlockDAG Explorer", url: "https://primordial.bdagscan.com" },
    },
    testnet: true,
}


const { chains, publicClient, webSocketPublicClient } = configureChains(
    [
        blockdagPrimordialTestnet,
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [goerli] : []),
    ],
    [publicProvider()],
);

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const { wallets } = getDefaultWallets({
    appName: "DAGSense",
    projectId,
    chains,
});

const demoAppInfo = {
    appName: "Rainbowkit Demo",
};

const connectors = connectorsForWallets([
    ...wallets,
    {
        groupName: "Other",
        wallets: [
            coreWallet({ projectId, chains }),
            argentWallet({ projectId, chains }),
            trustWallet({ projectId, chains }),
            ledgerWallet({ projectId, chains }),
            walletConnectWallet({ projectId, chains }),

        ],
    },
]);

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
});

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    return (
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains} appInfo={demoAppInfo} locale="en-US">
                {mounted && children}
            </RainbowKitProvider>
        </WagmiConfig>
    );
}