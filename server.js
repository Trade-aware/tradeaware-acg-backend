const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ============================================
// ACG AUTHENTICATOR
// ============================================
async function authenticateACG(email, password) {
  try {
    console.log('🔐 Authenticating with ACG...');
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Navigate to ACG login
    await page.goto('https://app.alphacapitalgroup.co.uk', {
      waitUntil: 'networkidle2'
    });
    
    // Check if we're on login page
    const isLoginPage = await page.evaluate(() => {
      return document.body.innerText.includes('Use existing account');
    });
    
    if (!isLoginPage) {
      throw new Error('Login page not found');
    }
    
    // Fill in credentials
    await page.type('input[placeholder="enter login"]', email);
    await page.type('input[placeholder="enter password"]', password);
    
    // Click sign in button
    await page.click('button:has-text("Sign In")');
    
    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {
      // Sometimes navigation doesn't trigger, that's ok
    });
    
    // Get cookies
    const cookies = await page.cookies();
    
    console.log('✅ Authentication successful');
    
    return {
      browser,
      page,
      cookies,
      authenticated: true
    };
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    throw new Error('Failed to authenticate with ACG');
  }
}

// ============================================
// SCAN ACCOUNTS
// ============================================
async function scanAccounts(authSession) {
  try {
    console.log('📋 Scanning accounts...');
    
    const { page } = authSession;
    
    // Navigate to dashboard
    await page.goto('https://app.alphacapitalgroup.co.uk/dashboard', {
      waitUntil: 'networkidle2'
    });
    
    // Extract account data from page
    const accounts = await page.evaluate(() => {
      const accountElements = document.querySelectorAll('[data-account-item], .account-card, .account-row');
      const accounts = [];
      
      accountElements.forEach((el) => {
        const accountNumber = el.textContent.match(/\d{7}/)?.[0];
        const text = el.textContent;
        
        if (accountNumber) {
          accounts.push({
            accountNumber: accountNumber,
            raw: text.substring(0, 200)
          });
        }
      });
      
      return accounts.length
cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
