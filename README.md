# ZerohedgeQuant Backend API

Secure Node.js backend that connects to Upstox API and serves real market data to your frontend.

## 🚀 Quick Setup

### Local Testing

1. **Install Node.js** (if not installed): Download from [nodejs.org](https://nodejs.org)

2. **Install dependencies**:
```bash
cd backend
npm install
```

3. **Run the server**:
```bash
npm start
```

Server will start at `http://localhost:3000`

Test it: Open browser → `http://localhost:3000` → Should see: `{"status":"ZerohedgeQuant API Server Running"}`

---

## 📡 API Endpoints

Your backend provides these endpoints:

- `GET /` - Health check
- `GET /api/market-data` - Real-time stock prices (10 stocks)
- `GET /api/indices` - Nifty 50, Bank Nifty, Sensex
- `GET /api/screener` - Stock screener data with fundamentals

---

## 🌐 Deploy for FREE (Choose one)

### **Option 1: Render.com** (Recommended - Easiest)

1. Go to [render.com](https://render.com) → Sign up (free)
2. Click **New → Web Service**
3. Connect your GitHub account
4. Push this `backend` folder to a new GitHub repo
5. Select the repo → Render auto-detects Node.js
6. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
7. Click **Create Web Service**
8. Done! You'll get a URL like: `https://zerohedgequant-api.onrender.com`

---

### **Option 2: Railway.app**

1. Go to [railway.app](https://railway.app) → Sign up
2. Click **New Project → Deploy from GitHub**
3. Select your backend repo
4. Railway auto-deploys
5. Get your URL from the dashboard

---

### **Option 3: Vercel (Serverless)**

If you want to use Vercel (where your frontend is):

1. Install Vercel CLI: `npm install -g vercel`
2. In the `backend` folder, run: `vercel`
3. Follow prompts
4. Done! Get your API URL

---

## 🔄 Update Frontend

Once backend is deployed, update your frontend `index.html`:

Change this line (around line 850 in the JavaScript):
```javascript
const API_URL = 'https://YOUR-BACKEND-URL.onrender.com';
```

Replace `YOUR-BACKEND-URL` with your actual backend URL.

---

## 🔐 Security Notes

- ✅ API credentials are stored in backend (not exposed to users)
- ✅ CORS enabled for your Vercel domain
- ✅ Access token has expiry - you'll need to refresh it periodically

**Refreshing Access Token:**
When your token expires (you'll see 401 errors), get a new one from Upstox and update line 19 in `server.js`.

---

## 🧪 Test Your Backend

```bash
# Test health
curl https://your-backend-url.com/

# Test market data
curl https://your-backend-url.com/api/market-data

# Test indices
curl https://your-backend-url.com/api/indices
```

---

## 📝 Notes

- Free tier on Render: Server sleeps after 15 mins of inactivity (first request takes ~30 sec to wake up)
- Upstox API has rate limits - don't refresh data more than once every 5-10 seconds
- Access tokens expire - typically valid for 1 day

---

Need help? Check Render/Railway docs or ask me!


## API response caching

The backend keeps a bounded, per-process response cache for selected public GET endpoints. Successful responses only are cached; provider errors and incomplete market-data responses are not cached.

| Endpoint | Cache lifetime |
| --- | ---: |
| `/api/option-chain/:underlying?expiry=...` | 1.5 seconds |
| `/api/stock/:symbol` | 2 seconds |
| `/api/prices` | 5 seconds–15 minutes, based on interval |
| `/api/search` | 5 minutes |

Existing endpoint-specific caches for indices, screeners, fundamentals, scanner signals, IPO data, terminal quotes and the NSE instrument master remain in place. Identical concurrent requests are coalesced, and responses expose `X-AHQ-Cache` (`HIT` or `MISS`) plus cache age on hits.

**Deployment note:** this cache is in-memory and local to one backend process. It reduces duplicate provider calls within that process, but it is cleared on restart and is not shared across multiple Render instances. Use a shared Redis-compatible store if the service is later scaled horizontally.
