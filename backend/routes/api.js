const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const ticketCtrl = require('../controllers/ticketController');
const upload = require('../middlewares/upload'); 

// --- AUTH ROUTES ---
router.post('/login', authCtrl.itLogin);         // IT Person Login
router.post('/userlogin', authCtrl.userLogin);   // Non-IT Employee Login

// --- TICKET ROUTES ---
// 1. Get all tickets (IT) or User specific tickets (Employee)
router.get('/tickets', ticketCtrl.getTickets);

// 2. Create a ticket (Employee)
router.post('/tickets', upload.single('image'), ticketCtrl.createTicket);

// 3. Get specific details for one ticket (IT/Employee)
router.get('/tickets/details/:tId', ticketCtrl.getTicketDetails);

// 4. Update ticket status (IT Person)
router.patch('/tickets/status/:tId', ticketCtrl.updateTicketStatus);

router.patch('/tickets/reopen/:tId', ticketCtrl.reopenTicket);
// Ticket Statistics (Dashboard)
router.get('/tickets/stats', ticketCtrl.getTicketStats);

// Submit Feedback (User)
router.post('/tickets/feedback/:tId', ticketCtrl.submitFeedback);

module.exports = router;
