import "./style.css";
import Web3Service from "./web3Service.js";

const web3Service = new Web3Service();
let currentView = 'home';
let editingCertificateId = null;

document.querySelector("#app").innerHTML = `
  <div class="container">
    <header>
      <h1>🔐 Web3 Certificate Verification System</h1>
      <div class="wallet-info">
        <span id="wallet-status">Not Connected</span>
        <button id="connect-wallet-btn" class="btn btn-primary">Connect Wallet</button>
      </div>
    </header>

    <div class="contract-setup" id="contract-setup">
      <div class="card">
        <h2>Contract Setup</h2>
        <p>Enter your deployed contract address to begin:</p>
        <input type="text" id="contract-address" placeholder="0x..." class="input-field" />
        <button id="connect-contract-btn" class="btn btn-primary">Connect Contract</button>
      </div>
    </div>

    <nav class="nav-tabs" id="nav-tabs" style="display: none;">
      <button class="nav-tab active" data-view="home">Home</button>
      <button class="nav-tab" data-view="create">Create Certificate</button>
      <button class="nav-tab" data-view="view">View Certificates</button>
      <button class="nav-tab" data-view="verify">Verify Certificate</button>
    </nav>

    <main id="main-content" style="display: none;">
      <!-- Home View -->
      <div id="home-view" class="view">
        <div class="card">
          <h2>Welcome to Certificate Verification System</h2>
          <p>Manage and verify certificates on the blockchain</p>
          <div class="stats">
            <div class="stat-card">
              <h3 id="cert-count">-</h3>
              <p>Total Certificates</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Certificate View -->
      <div id="create-view" class="view" style="display: none;">
        <div class="card">
          <h2>${editingCertificateId ? 'Edit' : 'Create'} Certificate</h2>
          <form id="certificate-form">
            <div class="form-group">
              <label for="issuer-name">Issuer Name *</label>
              <input type="text" id="issuer-name" required class="input-field" />
            </div>
            
            <div class="form-group">
              <label for="receiving-name">Receiving Name *</label>
              <input type="text" id="receiving-name" required class="input-field" />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="issuer-org">Issuer Organization</label>
                <input type="text" id="issuer-org" class="input-field" />
              </div>
              
              <div class="form-group">
                <label for="receiving-org">Receiving Organization</label>
                <input type="text" id="receiving-org" class="input-field" />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="issue-date">Issue Date *</label>
                <input type="date" id="issue-date" required class="input-field" />
              </div>
              
              <div class="form-group">
                <label for="expiration-date">Expiration Date</label>
                <input type="date" id="expiration-date" class="input-field" />
              </div>
            </div>
            
            <div class="form-group">
              <label for="certificate-type">Certificate Type</label>
              <input type="text" id="certificate-type" placeholder="e.g., Course Completion, Achievement" class="input-field" />
            </div>
            
            <div class="form-group">
              <label for="description">Description</label>
              <textarea id="description" rows="4" class="input-field" placeholder="Additional details about the certificate"></textarea>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">${editingCertificateId ? 'Update' : 'Create'} Certificate</button>
              ${editingCertificateId ? '<button type="button" id="cancel-edit-btn" class="btn btn-secondary">Cancel</button>' : ''}
            </div>
          </form>
        </div>
      </div>

      <!-- View Certificates View -->
      <div id="view-view" class="view" style="display: none;">
        <div class="card">
          <h2>My Certificates</h2>
          <div id="certificates-list" class="certificates-list">
            <p class="loading">Loading certificates...</p>
          </div>
        </div>
      </div>

      <!-- Verify Certificate View -->
      <div id="verify-view" class="view" style="display: none;">
        <div class="card">
          <h2>Verify Certificate</h2>
          <div class="form-group">
            <label for="verify-cert-id">Certificate ID</label>
            <input type="number" id="verify-cert-id" placeholder="Enter certificate ID" class="input-field" />
            <button id="verify-btn" class="btn btn-primary">Verify</button>
          </div>
          <div id="verification-result" class="verification-result"></div>
        </div>
      </div>
    </main>

    <div id="notification" class="notification"></div>
  </div>
`;

document.getElementById('connect-wallet-btn')?.addEventListener('click', connectWallet);
document.getElementById('connect-contract-btn')?.addEventListener('click', connectContract);
document.getElementById('certificate-form')?.addEventListener('submit', handleCertificateSubmit);
document.getElementById('verify-btn')?.addEventListener('click', verifyCertificate);
document.getElementById('cancel-edit-btn')?.addEventListener('click', cancelEdit);

document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    const view = e.target.dataset.view;
    switchView(view);
  });
});

async function connectWallet() {
  const result = await web3Service.connectWallet();
  if (result.success) {
    showNotification('Wallet connected: ' + result.address.substring(0, 10) + '...', 'success');
    document.getElementById('wallet-status').textContent = `Connected: ${result.address.substring(0, 10)}...`;
    document.getElementById('connect-wallet-btn').textContent = 'Connected';
    document.getElementById('connect-wallet-btn').disabled = true;
  } else {
    showNotification('Error: ' + result.error, 'error');
  }
}

async function connectContract() {
  const address = document.getElementById('contract-address').value.trim();
  if (!address) {
    showNotification('Please enter a contract address', 'error');
    return;
  }

  try {
    await web3Service.connectContract(address);
    showNotification('Contract connected successfully!', 'success');
    document.getElementById('contract-setup').style.display = 'none';
    document.getElementById('nav-tabs').style.display = 'flex';
    document.getElementById('main-content').style.display = 'block';
    loadCertificateCount();
  } catch (error) {
    showNotification('Error connecting contract: ' + error.message, 'error');
  }
}

async function handleCertificateSubmit(e) {
  e.preventDefault();

  const formData = {
    issuerName: document.getElementById('issuer-name').value,
    receivingName: document.getElementById('receiving-name').value,
    issuerOrg: document.getElementById('issuer-org').value,
    receivingOrg: document.getElementById('receiving-org').value,
    issueDate: document.getElementById('issue-date').value,
    expirationDate: document.getElementById('expiration-date').value,
    certificateType: document.getElementById('certificate-type').value,
    description: document.getElementById('description').value
  };

  try {
    showNotification('Transaction pending...', 'info');

    if (editingCertificateId) {
      await web3Service.updateCertificate(editingCertificateId, formData);
      showNotification('Certificate updated successfully!', 'success');
    } else {
      await web3Service.createCertificate(formData);
      showNotification('Certificate created successfully!', 'success');
    }

    document.getElementById('certificate-form').reset();
    editingCertificateId = null;
    switchView('view');
    loadCertificates();
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
}

async function loadCertificates() {
  try {
    const address = await web3Service.getCurrentAddress();
    const certIds = await web3Service.getUserCertificates(address);

    const listContainer = document.getElementById('certificates-list');

    if (certIds.length === 0) {
      listContainer.innerHTML = '<p>No certificates found. Create your first certificate!</p>';
      return;
    }

    listContainer.innerHTML = '<p class="loading">Loading...</p>';

    const certificates = await Promise.all(
      certIds.map(id => web3Service.getCertificate(id))
    );

    listContainer.innerHTML = certificates.map(cert => `
      <div class="certificate-card ${cert.isValid ? '' : 'invalid'}">
        <div class="certificate-header">
          <h3>${cert.certificateType || 'Certificate'} #${cert.id}</h3>
          <div class="certificate-actions">
            <button class="btn btn-small btn-primary" onclick="editCertificate(${cert.id})">Edit</button>
            <button class="btn btn-small btn-danger" onclick="deleteCert(${cert.id})">Delete</button>
          </div>
        </div>
        <div class="certificate-body">
          <p><strong>Issuer:</strong> ${cert.issuerName} ${cert.issuerOrg ? `(${cert.issuerOrg})` : ''}</p>
          <p><strong>Recipient:</strong> ${cert.receivingName} ${cert.receivingOrg ? `(${cert.receivingOrg})` : ''}</p>
          <p><strong>Issue Date:</strong> ${cert.issueDate}</p>
          ${cert.expirationDate ? `<p><strong>Expiration:</strong> ${cert.expirationDate}</p>` : ''}
          ${cert.description ? `<p><strong>Description:</strong> ${cert.description}</p>` : ''}
          <p><strong>Status:</strong> <span class="status-badge ${cert.isValid ? 'valid' : 'invalid'}">${cert.isValid ? 'Valid' : 'Invalid'}</span></p>
          <p><strong>Created:</strong> ${cert.createdAt}</p>
        </div>
      </div>
    `).join('');
  } catch (error) {
    document.getElementById('certificates-list').innerHTML =
      '<p class="error">Error loading certificates: ' + error.message + '</p>';
  }
}

async function verifyCertificate() {
  const certId = document.getElementById('verify-cert-id').value;
  if (!certId) {
    showNotification('Please enter a certificate ID', 'error');
    return;
  }

  try {
    const isValid = await web3Service.validateCertificate(certId);
    const cert = await web3Service.getCertificate(certId);

    const resultDiv = document.getElementById('verification-result');
    resultDiv.innerHTML = `
      <div class="verification-card ${isValid ? 'valid' : 'invalid'}">
        <h3>Verification Result</h3>
        <p class="verification-status">${isValid ? '✓ Valid Certificate' : '✗ Invalid Certificate'}</p>
        <div class="certificate-details">
          <p><strong>Certificate ID:</strong> ${cert.id}</p>
          <p><strong>Issuer:</strong> ${cert.issuerName} ${cert.issuerOrg ? `(${cert.issuerOrg})` : ''}</p>
          <p><strong>Recipient:</strong> ${cert.receivingName} ${cert.receivingOrg ? `(${cert.receivingOrg})` : ''}</p>
          <p><strong>Issue Date:</strong> ${cert.issueDate}</p>
          ${cert.expirationDate ? `<p><strong>Expiration:</strong> ${cert.expirationDate}</p>` : ''}
          <p><strong>Type:</strong> ${cert.certificateType || 'N/A'}</p>
        </div>
      </div>
    `;
  } catch (error) {
    showNotification('Error verifying certificate: ' + error.message, 'error');
  }
}

async function editCertificate(id) {
  try {
    const cert = await web3Service.getCertificate(id);
    editingCertificateId = id;

    document.getElementById('issuer-name').value = cert.issuerName;
    document.getElementById('receiving-name').value = cert.receivingName;
    document.getElementById('issuer-org').value = cert.issuerOrg;
    document.getElementById('receiving-org').value = cert.receivingOrg;
    document.getElementById('issue-date').value = cert.issueDate;
    document.getElementById('expiration-date').value = cert.expirationDate;
    document.getElementById('certificate-type').value = cert.certificateType;
    document.getElementById('description').value = cert.description;

    switchView('create');
  } catch (error) {
    showNotification('Error loading certificate: ' + error.message, 'error');
  }
}

async function deleteCert(id) {
  if (!confirm('Are you sure you want to delete this certificate?')) {
    return;
  }

  try {
    showNotification('Deleting certificate...', 'info');
    await web3Service.deleteCertificate(id);
    showNotification('Certificate deleted successfully!', 'success');
    loadCertificates();
    loadCertificateCount();
  } catch (error) {
    showNotification('Error deleting certificate: ' + error.message, 'error');
  }
}

function cancelEdit() {
  editingCertificateId = null;
  document.getElementById('certificate-form').reset();
  switchView('view');
}

function switchView(view) {
  currentView = view;

  // Update nav tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.view === view) {
      tab.classList.add('active');
    }
  });

  // Update views
  document.querySelectorAll('.view').forEach(v => {
    v.style.display = 'none';
  });

  document.getElementById(`${view}-view`).style.display = 'block';

  // Load data if needed
  if (view === 'view') {
    loadCertificates();
  } else if (view === 'home') {
    loadCertificateCount();
  }
}

async function loadCertificateCount() {
  try {
    const count = await web3Service.getCertificateCount();
    document.getElementById('cert-count').textContent = count;
  } catch (error) {
    document.getElementById('cert-count').textContent = 'Error';
  }
}

function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type} show`;

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Make functions globally available for onclick handlers
window.editCertificate = editCertificate;
window.deleteCert = deleteCert;
