const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ACG Backend Service is running' });
});

// Scan accounts endpoint
app.post('/api/acg/scan-accounts', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }
    
    res.json({
      success: true,
      accounts: [{
        accountNumber: '2710804',
        group: 'ACGd\\demo Stage-2',
        leverage: 100,
        startingBalance: 50000,
        status: 'active'
      }]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get account details endpoint
app.post('/api/acg/account-details', async (req, res) => {
  try {
    const { email, password, accountNumber } = req.body;
    
    if (!email || !password || !accountNumber) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and accountNumber required'
      });
    }
    
    res.json({
      success: true,
      account: {
        accountNumber: accountNumber,
        balance: 49998.44,
        equity: 50018.98,
        profitLoss: 0,
        drawdown: 0,
        leverage: 100,
        phase: 'Challenge Phase 2'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ACG Backend Service running on port ${PORT}`);
});
