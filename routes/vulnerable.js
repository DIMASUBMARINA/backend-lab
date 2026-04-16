// const express = require('express');
// const router = express.Router();
// const prisma = require('../lib/prisma');

// // VULNERABLE: Raw SQL query (for SQL injection demo)
// router.get('/users/search', async (req, res) => {
//   const { name } = req.query;
//   try {
//     const result = await prisma.$queryRawUnsafe(
//       `SELECT * FROM users WHERE email LIKE '%${name}%'`
//     );
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // VULNERABLE: No input validation (Mass Assignment)
// router.put('/users/:id', async (req, res) => {
//   const id = parseInt(req.params.id);
//   try {
//     const user = await prisma.user.update({
//       where: { id },
//       data: req.body
//     });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // VULNERABLE: No XSS protection
// router.post('/posts', async (req, res) => {
//   const { title, content, authorId } = req.body;
//   try {
//     const post = await prisma.post.create({
//       data: {
//         title,
//         content,
//         slug: title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
//         authorId: parseInt(authorId)
//       }
//     });
//     res.json(post);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // VULNERABLE: No type validation on inputs
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await prisma.user.findFirst({
//       where: { email, passwordHash: password }
//     });
//     if (user) {
//       res.json({ message: 'Logged in', user });
//     } else {
//       res.status(401).json({ error: 'Invalid credentials' });
//     }
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

const express = require('express');
module.exports = express.Router();