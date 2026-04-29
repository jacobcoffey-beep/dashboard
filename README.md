# Dashboard Server

Features:
- JWT-based auth (register/login)
- Admin endpoints (list users, set admin, delete)
- Personal bookmarks CRUD
- Friend list (add/remove/get)
- Member search (username/email partial)
- Real-time chat & IM via Socket.IO, persistent messages in MongoDB

Setup:
1. Copy files into project directory.
2. Create .env from .env.example and set MONGO_URI and JWT_SECRET.
3. Install dependencies:
   npm install
4. Run:
   npm run dev   # or npm start

API endpoints:
- POST /api/auth/register { username, email, password }
- POST /api/auth/login { usernameOrEmail, password }
- Admin routes: /api/admin/... (requires auth + isAdmin)
- Bookmarks: /api/bookmarks (auth)
- Friends: /api/friends (auth)
- Messages: /api/messages (auth)
- Search: /api/search/members?q=term (auth)

Socket.IO:
- Connect to socket with auth: io('https://...',{ auth: { token: 'JWT' }})
- Events:
  - joinPrivate { to }
  - privateMessage { to, content }  -> server stores message and emits 'message'
  - typing { to, typing }
  - presence events emitted globally: 'presence' { userId, online }

Security & next steps:
- Add input validation (Joi or express-validator).
- Rate limiting (express-rate-limit).
- Use HTTPS & secure cookies if storing JWT in cookie.
- Add friend requests and acceptance workflow (optional).
- Add pagination on message history and bookmark search.
