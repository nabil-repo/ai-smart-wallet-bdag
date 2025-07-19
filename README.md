
# DAGSense 🔐🤖

**DAGSense** is an AI-powered smart contract wallet dApp that allows users to manage their crypto assets using natural language (chat or voice). It supports token transfers, balance checks, guardian recovery, and more — all through a sleek interface integrated with RainbowKit, Wagmi, and Ethers.js.

🟢 **Visit Now:** [https://avasense.vercel.app](https://avasense.vercel.app)

## ✨ Features

- ✅ Wallet connection via RainbowKit
- 🌉 Supports Avalanche Fuji Testnet
- 🤖 AI-powered chat interface for wallet actions
- 🔐 Smart wallet with:
  - Token transfer
  - Balance check
  - Guardian-based recovery system
- 🔁 Wallet auto-creation via factory contract
- 🎨 Modern, responsive UI with TailwindCSS


---

## ⚙️ Smart Contract Addresses

| Contract       | Address                                 |
| -------------- | --------------------------------------- |
| Wallet Factory | `0xF030E94be8B2fCDF2317928CACaF8979F3DEc524` |
| Smart Wallet   | Created per user via factory            |

---

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/avasense.git
cd avasense
````

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

> Replace `your_walletconnect_project_id` with the actual project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), TailwindCSS
* **Wallet Connection:** RainbowKit + Wagmi + WalletConnect v2
* **Blockchain SDK:** Ethers.js
* **Chain:** Avalanche Fuji Testnet
* **Smart Contracts:**

  * WalletFactory.sol
  * SmartWallet.sol

---

## 📦 Project Structure

```bash
.
├── components/           # UI components like chat, dashboard, settings
├── lib/
│   ├── wallet.ts         # WalletService class (handles contract interaction)
│   └── constants.ts      # Contract addresses, token list
├── styles/               # TailwindCSS global styles
├── app/
│   ├── layout.tsx        # App wrapper with RainbowKit & WagmiProvider
│   └── page.tsx          # Main app interface with tabs
├── public/               # Static assets
├── contracts/            # (Optional) Solidity contracts (if included)
└── README.md
```



<!-- ## 📸 Screenshots

![Chat UI](./screenshots/chat.png)
![Dashboard](./screenshots/dashboard.png) -->

---

<!-- ## 🧠 AI Integration

Chat and voice commands are parsed to determine intent and mapped to wallet actions. Extendable for:

* Token swap
* Portfolio summary
* Transaction history
* And more...

--- -->

## 📜 License

MIT License © 2025 \[Nabil Ansari]

---

## 🙋‍♂️ Contact

* Email: [nabil.aaaman@gmail.com.com](mailto:nabil.aaaman@gmail.com)

---

> Built for the love of crypto + AI ✨

