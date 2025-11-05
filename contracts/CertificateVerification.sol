// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateVerification {
    struct Certificate {
        uint256 id;
        string issuerName;
        string receivingName;
        string issuerOrg;
        string receivingOrg;
        string issueDate;
        string expirationDate;
        string certificateType;
        string description;
        bool isValid;
        address createdBy;
        uint256 createdAt;
    }

    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public userCertificates;
    
    uint256 private nextCertificateId = 1;
    address public owner;

    event CertificateCreated(
        uint256 indexed id,
        address indexed creator,
        string issuerName,
        string receivingName
    );

    event CertificateUpdated(
        uint256 indexed id,
        address indexed updater
    );

    event CertificateDeleted(
        uint256 indexed id,
        address indexed deleter
    );

    event CertificateValidated(
        uint256 indexed id,
        bool isValid
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier certificateExists(uint256 _id) {
        require(certificates[_id].id != 0, "Certificate does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createCertificate(
        string memory _issuerName,
        string memory _receivingName,
        string memory _issuerOrg,
        string memory _receivingOrg,
        string memory _issueDate,
        string memory _expirationDate,
        string memory _certificateType,
        string memory _description
    ) public returns (uint256) {
        uint256 id = nextCertificateId++;
        
        certificates[id] = Certificate({
            id: id,
            issuerName: _issuerName,
            receivingName: _receivingName,
            issuerOrg: _issuerOrg,
            receivingOrg: _receivingOrg,
            issueDate: _issueDate,
            expirationDate: _expirationDate,
            certificateType: _certificateType,
            description: _description,
            isValid: true,
            createdBy: msg.sender,
            createdAt: block.timestamp
        });

        userCertificates[msg.sender].push(id);

        emit CertificateCreated(id, msg.sender, _issuerName, _receivingName);
        
        return id;
    }

    function getCertificate(uint256 _id) 
        public 
        view 
        certificateExists(_id) 
        returns (Certificate memory) 
    {
        return certificates[_id];
    }

    function updateCertificate(
        uint256 _id,
        string memory _issuerName,
        string memory _receivingName,
        string memory _issuerOrg,
        string memory _receivingOrg,
        string memory _issueDate,
        string memory _expirationDate,
        string memory _certificateType,
        string memory _description
    ) public certificateExists(_id) {
        require(
            certificates[_id].createdBy == msg.sender || msg.sender == owner,
            "Not authorized to update this certificate"
        );

        certificates[_id].issuerName = _issuerName;
        certificates[_id].receivingName = _receivingName;
        certificates[_id].issuerOrg = _issuerOrg;
        certificates[_id].receivingOrg = _receivingOrg;
        certificates[_id].issueDate = _issueDate;
        certificates[_id].expirationDate = _expirationDate;
        certificates[_id].certificateType = _certificateType;
        certificates[_id].description = _description;

        emit CertificateUpdated(_id, msg.sender);
    }

    function deleteCertificate(uint256 _id) 
        public 
        certificateExists(_id) 
    {
        require(
            certificates[_id].createdBy == msg.sender || msg.sender == owner,
            "Not authorized to delete this certificate"
        );

        certificates[_id].isValid = false;
        
        emit CertificateDeleted(_id, msg.sender);
    }

    function validateCertificate(uint256 _id) 
        public 
        view 
        certificateExists(_id) 
        returns (bool) 
    {
        return certificates[_id].isValid;
    }

    function getUserCertificates(address _user) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return userCertificates[_user];
    }

    function getAllCertificates() 
        public 
        view 
        returns (uint256[] memory, Certificate[] memory) 
    {
        uint256 count = nextCertificateId - 1;
        uint256[] memory ids = new uint256[](count);
        Certificate[] memory certs = new Certificate[](count);

        for (uint256 i = 1; i < nextCertificateId; i++) {
            if (certificates[i].id != 0) {
                ids[i - 1] = i;
                certs[i - 1] = certificates[i];
            }
        }

        return (ids, certs);
    }

    function getCertificateCount() public view returns (uint256) {
        return nextCertificateId - 1;
    }
}

