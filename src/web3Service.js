import { ethers } from 'ethers';

// Contract ABI - Simplified for demo. In production, compile the contract and use the full ABI
const CONTRACT_ABI = [
  "function createCertificate(string memory _issuerName, string memory _receivingName, string memory _issuerOrg, string memory _receivingOrg, string memory _issueDate, string memory _expirationDate, string memory _certificateType, string memory _description) public returns (uint256)",
  "function getCertificate(uint256 _id) public view returns (tuple(uint256 id, string issuerName, string receivingName, string issuerOrg, string receivingOrg, string issueDate, string expirationDate, string certificateType, string description, bool isValid, address createdBy, uint256 createdAt))",
  "function updateCertificate(uint256 _id, string memory _issuerName, string memory _receivingName, string memory _issuerOrg, string memory _receivingOrg, string memory _issueDate, string memory _expirationDate, string memory _certificateType, string memory _description) public",
  "function deleteCertificate(uint256 _id) public",
  "function validateCertificate(uint256 _id) public view returns (bool)",
  "function getUserCertificates(address _user) public view returns (uint256[])",
  "function getCertificateCount() public view returns (uint256)",
  // "event CertificateCreated(uint256 indexed id, address indexed creator, string issuerName, string receivingName)",
  // "event CertificateUpdated(uint256 indexed id, address indexed updater)",
  // "event CertificateDeleted(uint256 indexed id, address indexed deleter)"
];

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = null;
  }

  async connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        const address = await this.signer.getAddress();
        return { success: true, address };
      } catch (error) {
        return { success: false, error: error.message };
      }
    } else {
      return { success: false, error: 'Please install MetaMask or another Web3 wallet' };
    }
  }

  async connectContract(contractAddress) {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    this.contractAddress = contractAddress;
    this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.signer);
  }

  async createCertificate(certificateData) {
    if (!this.contract) {
      throw new Error('Contract not connected');
    }

    const tx = await this.contract.createCertificate(
      certificateData.issuerName,
      certificateData.receivingName,
      certificateData.issuerOrg || '',
      certificateData.receivingOrg || '',
      certificateData.issueDate,
      certificateData.expirationDate || '',
      certificateData.certificateType || '',
      certificateData.description || ''
    );

    await tx.wait();
    return tx.hash;
  }

  async getCertificate(id) {
    if (!this.contract) {
      throw new Error('Contract not connected');
    }

    const cert = await this.contract.getCertificate(id);
    return {
      id: cert.id.toString(),
      issuerName: cert.issuerName,
      receivingName: cert.receivingName,
      issuerOrg: cert.issuerOrg,
      receivingOrg: cert.receivingOrg,
      issueDate: cert.issueDate,
      expirationDate: cert.expirationDate,
      certificateType: cert.certificateType,
      description: cert.description,
      isValid: cert.isValid,
      createdBy: cert.createdBy,
      createdAt: new Date(Number(cert.createdAt) * 1000).toLocaleString()
    };
  }

  async updateCertificate(id, certificateData) {
    if (!this.contract) {
      throw new Error('Contract not connected');
    }

    const tx = await this.contract.updateCertificate(
      id,
      certificateData.issuerName,
      certificateData.receivingName,
      certificateData.issuerOrg || '',
      certificateData.receivingOrg || '',
      certificateData.issueDate,
      certificateData.expirationDate || '',
      certificateData.certificateType || '',
      certificateData.description || ''
    );

    await tx.wait();
    return tx.hash;
  }

  async deleteCertificate(id) {
    if (!this.contract) {
      throw new Error('Contract not connected');
    }

    const tx = await this.contract.deleteCertificate(id);
    await tx.wait();
    return tx.hash;
  }

  async validateCertificate(id) {
    if (!this.contract) {
      throw new Error('Contract not connected');
    }

    return await this.contract.validateCertificate(id);
  }

  async getUserCertificates(userAddress) {
    if (!this.contract) {
      throw new Error('Contract not connected');
    }

    const ids = await this.contract.getUserCertificates(userAddress);
    return ids.map(id => id.toString());
  }

  async getCertificateCount() {
    if (!this.contract) {
      throw new Error('Contract not connected');
    }

    const count = await this.contract.getCertificateCount();
    return count.toString();
  }

  getCurrentAddress() {
    return this.signer ? this.signer.getAddress() : null;
  }
}

export default Web3Service;

