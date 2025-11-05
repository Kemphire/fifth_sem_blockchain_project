# Web3 Certificate Verification System

A decentralized certificate verification system built on Ethereum blockchain. This system allows you to create, read, update, and delete certificates with full transparency and immutability.

## Features

- ✅ **Create Certificates**: Issue certificates with detailed information
- ✅ **View Certificates**: Browse all your certificates
- ✅ **Update Certificates**: Modify certificate details (authorized users only)
- ✅ **Delete Certificates**: Mark certificates as invalid
- ✅ **Verify Certificates**: Verify certificate authenticity by ID
- ✅ **Web3 Integration**: Connect with MetaMask or other Web3 wallets

## Certificate Fields

- Issuer Name (required)
- Receiving Name (required)
- Issuer Organization (optional)
- Receiving Organization (optional)
- Issue Date (required)
- Expiration Date (optional)
- Certificate Type (optional)
- Description (optional)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Deploy Smart Contract

You need to deploy the smart contract to a blockchain network (local or testnet).

**Option A: Local Development (Hardhat/Foundry)**

1. Install Hardhat:
```bash
npm install --save-dev hardhat
```

2. Compile and deploy the contract:
```bash
npx hardhat compile
npx hardhat node  # Start local blockchain
npx hardhat run scripts/deploy.js --network localhost
```

3. Copy the deployed contract address

**Option B: Testnet Deployment**

1. Use Remix IDE (https://remix.ethereum.org)
2. Copy the contract from `contracts/CertificateVerification.sol`
3. Compile and deploy to Sepolia, Goerli, or your preferred testnet
4. Copy the deployed contract address

### 3. Run the Application

```bash
npm run dev
# or
bun run dev
```

### 4. Connect to the Application

1. Install MetaMask browser extension
2. Connect your wallet
3. Enter the deployed contract address
4. Start creating and managing certificates!

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve the connection in MetaMask
2. **Connect Contract**: Enter your deployed contract address and click "Connect Contract"
3. **Create Certificate**: Navigate to "Create Certificate" tab and fill in the form
4. **View Certificates**: Go to "View Certificates" to see all your certificates
5. **Verify Certificate**: Use "Verify Certificate" tab to verify any certificate by ID

## Smart Contract Functions

- `createCertificate()`: Create a new certificate
- `getCertificate(uint256)`: Retrieve certificate details
- `updateCertificate(uint256, ...)`: Update certificate information
- `deleteCertificate(uint256)`: Mark certificate as invalid
- `validateCertificate(uint256)`: Check if certificate is valid
- `getUserCertificates(address)`: Get all certificates for a user

## Development

The project uses:
- **Vite**: Build tool and dev server
- **ethers.js**: Web3 library for blockchain interactions
- **Solidity**: Smart contract language

## Security Notes

- Always verify the contract address before connecting
- Never share your private keys
- Test on testnets before deploying to mainnet
- Review smart contract code before deployment

## License

MIT

