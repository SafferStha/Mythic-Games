const express = require('express');
const db = require('../db'); 
const bcrypt = require('bcryptjs');

module.exports = (upload) => {
    const router = express.Router();

    // 1. REGISTRATION (JSON only, no image)
    router.post('/register', async (req, res) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        try {
            // Securely hash the password before saving
            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await db.query(
                'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING uid, username, email',
                [username, email, hashedPassword]
            );
            
            res.status(201).json({ 
                success: true, 
                message: "Registration successful!", 
                data: result.rows[0] 
            });
        } catch (error) {
            console.error('Registration Error:', error);
            // Handle unique constraint violation (Username/Email already taken)
            if (error.code === '23505') {
                return res.status(409).json({ success: false, message: 'Username or email already exists.' });
            }
            res.status(500).json({ success: false, message: 'Database error or user already exists.' });
        }
    });

    // 2. LOGIN
    router.post('/login', async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password required" });
        }

        try {
            const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0];

            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            // Compare the provided password with the hashed password in DB
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            res.status(200).json({ 
                success: true, 
                message: 'Login successful', 
                data: { uid: user.uid, username: user.username, email: user.email } 
            });
        } catch (error) {
            console.error('Login Error:', error);
            res.status(500).json({ success: false, message: 'Internal server error.' });
        }
    });

    // Route to get user details
    router.get('/:uid', async (req, res) => {
        const { uid } = req.params;
        try {
            const result = await db.query(
                'SELECT uid, username, email, status, created_at, profile_image, bio FROM users WHERE uid = $1', // Added bio
                [uid]
            );
            if (result.rows.length > 0) {
                res.status(200).json({ success: true, data: result.rows[0] });
            } else {
                res.status(404).json({ success: false, message: 'User not found' });
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });

    // Route to update user profile image
    router.put('/:uid/avatar', upload.single('profileImage'), async (req, res) => {
        const { uid } = req.params;
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        // The path to the uploaded file relative to the base URL
        const profileImagePath = `/uploads/${req.file.filename}`;

        try {
            const result = await db.query(
                'UPDATE users SET profile_image = $1, updated_at = CURRENT_TIMESTAMP WHERE uid = $2 RETURNING uid, username, email, status, created_at, profile_image, bio',
                [profileImagePath, uid]
            );
            res.status(200).json({ success: true, message: 'Profile image updated successfully.', data: result.rows[0] });
        } catch (error) {
            console.error('Error updating profile image:', error);
            res.status(500).json({ success: false, message: 'Internal server error.' });
        }
    });

    // Route to update user profile details (username, email, bio)
    router.put('/:uid/profile', async (req, res) => {
        const { uid } = req.params;
        const { username, email, bio } = req.body;

        try {
            const result = await db.query(
                'UPDATE users SET username = $1, email = $2, bio = $3, updated_at = CURRENT_TIMESTAMP WHERE uid = $4 RETURNING uid, username, email, status, created_at, profile_image, bio',
                [username, email, bio, uid]
            );
            if (result.rows.length > 0) {
                res.status(200).json({ success: true, message: 'Profile updated successfully.', data: result.rows[0] });
            } else {
                res.status(404).json({ success: false, message: 'User not found' });
            }
        } catch (error) {
            console.error('Error updating user profile:', error);
            res.status(500).json({ success: false, message: 'Internal server error.' });
        }
    });

    // --- Wishlist Routes ---

    // Get user wishlist
    router.get('/:uid/wishlist', async (req, res) => {
        const { uid } = req.params;
        try {
            const result = await db.query(
                'SELECT g.* FROM wishlist w JOIN games g ON w.game_id = g.id WHERE w.user_id = $1',
                [uid]
            );
            res.status(200).json({ success: true, data: result.rows });
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });

    // Add to wishlist
    router.post('/:uid/wishlist', async (req, res) => {
        const { uid } = req.params;
        const { gameId } = req.body;
        try {
            await db.query(
                'INSERT INTO wishlist (user_id, game_id) VALUES ($1, $2) ON CONFLICT (user_id, game_id) DO NOTHING',
                [uid, gameId]
            );
            res.status(201).json({ success: true, message: 'Game added to wishlist' });
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });

    // Remove from wishlist
    router.delete('/:uid/wishlist/:gameId', async (req, res) => {
        const { uid, gameId } = req.params;
        try {
            await db.query(
                'DELETE FROM wishlist WHERE user_id = $1 AND game_id = $2',
                [uid, gameId]
            );
            res.status(200).json({ success: true, message: 'Game removed from wishlist' });
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });

    return router;
};