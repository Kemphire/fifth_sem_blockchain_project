// Example deployment script for Hardhat
// Save this as scripts/deploy.js

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const CertificateVerification = await ethers.getContractFactory("CertificateVerification");
  const certificateVerification = await CertificateVerification.deploy();

  await certificateVerification.waitForDeployment();

  console.log("CertificateVerification deployed to:", await certificateVerification.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

