// // ---------------- BACKEND (Node.js + Express) ----------------

// // File: backend/server.js
// import express from 'express';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
// import dotenv from 'dotenv';
// import mongoose from 'mongoose';

// dotenv.config();
// const app = express();

// app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
// app.use(express.json());
// app.use(cookieParser());

// mongoose.connect(process.env.MONGO_URL)
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.log(err));

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
//   role: { type: String, default: 'user' },
// });

// const User = mongoose.model('User', userSchema);

// const generateToken = (user) => jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });

// const verifyToken = (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token) return res.status(401).json({ msg: 'Unauthorized' });
//   try {
//     req.user = jwt.verify(token, process.env.JWT_SECRET);
//     next();
//   } catch {
//     res.status(401).json({ msg: 'Invalid Token' });
//   }
// };

// // Register
// app.post('/api/auth/register', async (req, res) => {
//   const { name, email, password } = req.body;
//   const hashed = await bcrypt.hash(password, 10);
//   const user = await User.create({ name, email, password: hashed });
//   const token = generateToken({ id: user._id, role: user.role });
//   res.cookie('token', token, {
//     httpOnly: true,
//     sameSite: 'Lax',
//     secure: false, // set to true in production
//   });
//   res.json({ msg: 'registered successfully', userID: user._id });
// });

// // Login
// app.post('/api/auth/login', async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return res.status(401).json({ msg: 'Invalid credentials' });
//   }
//   const token = generateToken({ id: user._id, role: user.role });
//   res.cookie('token', token, {
//     httpOnly: true,
//     sameSite: 'Lax',
//     secure: false,
//   });
//   res.json({ msg: 'login successful', userID: user._id });
// });

// // Logout
// app.post('/api/auth/logout', (req, res) => {
//   res.clearCookie('token');
//   res.json({ msg: 'Logged out' });
// });

// // Get Authenticated User
// app.get('/api/auth/user', verifyToken, async (req, res) => {
//   const user = await User.findById(req.user.id).select('-password');
//   res.json({ user });
// });

// app.listen(5000, () => console.log('Server running on port 5000'));


// // ---------------- FRONTEND (React + Vite) ----------------

// // File: frontend/src/api/axios.js
// import axios from 'axios';

// export default axios.create({
//   baseURL: 'http://localhost:5000/api',
//   withCredentials: true,
// });


// // File: frontend/src/context/UserProvider.jsx
// import { createContext, useContext, useEffect, useState } from 'react';
// import axios from '../api/axios';

// const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchUser = async () => {
//     try {
//       const res = await axios.get('/auth/user');
//       setUser(res.data.user);
//     } catch {
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = async () => {
//     await axios.post('/auth/logout');
//     setUser(null);
//   };

//   useEffect(() => {
//     fetchUser();
//   }, []);

//   return (
//     <UserContext.Provider value={{ user, loading, setUser, logout }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => useContext(UserContext);


// // File: frontend/src/components/ProtectedRoute.jsx
// import { Navigate } from 'react-router-dom';
// import { useUser } from '../context/UserProvider';

// const ProtectedRoute = ({ children, adminOnly = false }) => {
//   const { user, loading } = useUser();
//   if (loading) return <div>Loading...</div>;
//   if (!user) return <Navigate to="/login" />;
//   if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
//   return children;
// };

// export default ProtectedRoute;


// // File: frontend/src/App.jsx
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { UserProvider } from './context/UserProvider';
// import ProtectedRoute from './components/ProtectedRoute';

// import Home from './pages/Home';
// import Study from './pages/Study';
// import Admin from './pages/Admin';
// import Login from './pages/Login';

// function App() {
//   return (
//     <UserProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<Login />} />

//           <Route path="/study" element={<ProtectedRoute><Study /></ProtectedRoute>} />
//           <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
//         </Routes>
//       </BrowserRouter>
//     </UserProvider>
//   );
// }

// export default App;


// // Other pages (Login, Home, Study, Admin) can be simple functional components for demo
// // Example: frontend/src/pages/Login.jsx
// import { useState } from 'react';
// import axios from '../api/axios';
// import { useNavigate } from 'react-router-dom';
// import { useUser } from '../context/UserProvider';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();
//   const { setUser } = useUser();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     const res = await axios.post('/auth/login', { email, password });
//     if (res.data) {
//       const userRes = await axios.get('/auth/user');
//       setUser(userRes.data.user);
//       navigate('/');
//     }
//   };

//   return (
//     <form onSubmit={handleLogin}>
//       <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
//       <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
//       <button type="submit">Login</button>
//     </form>
//   );
// };

// export default Login;
