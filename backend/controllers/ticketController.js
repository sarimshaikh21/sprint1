const { Ticket } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.getTickets = async (req, res) => {
    try {
        const { userid } = req.query;
        const data = userid 
            ? await Ticket.find({ userId: userid }).sort({ createdAt: -1 }) 
            : await Ticket.find({}).sort({ createdAt: -1 });
        
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createTicket = async (req, res) => {
    try {
        const { userid, description, category, priority } = req.body;
        const cloudImageUrl = req.file ? req.file.path : null;
        const newTicket = new Ticket({
            ticketId: `TKT-${uuidv4().substring(0, 5).toUpperCase()}`,
            userId: userid,
            description,
            category,
            priority: priority || 'Medium',
           imagePath: cloudImageUrl
        });
        await newTicket.save();
        res.status(201).json(newTicket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTicketDetails = async (req, res) => {
    try {
        const { tId } = req.params; 
        const ticketData = await Ticket.aggregate([
            { $match: { ticketId: tId } }, 
            {
                $lookup: {
                    from: 'userlogin',      
                    localField: 'userId', // Changed from empid to userId to match your createTicket logic
                    foreignField: 'empid', // Match with the field in your userlogin collection
                    as: 'userDetails'
                }
            },
            { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } }
        ]);

        if (ticketData.length === 0) return res.status(404).json({ message: "Ticket not found" });
        res.json(ticketData[0]); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// NEW: Update ticket status
exports.updateTicketStatus = async (req, res) => {
    try {
        const { tId } = req.params;
        const { status } = req.body;
        const updatedTicket = await Ticket.findOneAndUpdate(
            { ticketId: tId },
            { $set: { status: status } },
            { new: true }
        );
        if (!updatedTicket) return res.status(404).json({ message: "Ticket not found" });
        res.json(updatedTicket);
    } catch (error) {
        res.status(500).json({ message: "Error updating status" });
    }
};

exports.reopenTicket = async (req, res) => {
    try {
        const { tId } = req.params;
        const ticket = await Ticket.findOne({ ticketId: tId });

        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        // Logic check: Only 'Resolved' tickets can be reopened
        if (ticket.status !== 'Resolved') {
            return res.status(400).json({ 
                message: `Only 'Resolved' tickets can be reopened. Current status: ${ticket.status}` 
            });
        }

        ticket.status = 'Reopened';
        await ticket.save();

        res.json({ message: "Ticket status changed to Reopened", status: ticket.status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Ticket Statistics for Dashboard
exports.getTicketStats = async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: 'Open' });
    const resolved = await Ticket.countDocuments({ status: 'Resolved' });
    const reopened = await Ticket.countDocuments({ status: 'Reopened' });
    const closed = await Ticket.countDocuments({ status: 'Closed' });
    const highPriority = await Ticket.countDocuments({ priority: 'High' });

    res.json({ total, open, resolved, reopened, closed, highPriority });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};

// Submit Feedback and Close Ticket
exports.submitFeedback = async (req, res) => {
  const { tId } = req.params;
  const { rating, comment, status } = req.body;

  try {
    const updatedTicket = await Ticket.findOneAndUpdate(
      { ticketId: tId },
      { 
        $set: { 
          status: status || 'Closed',
          feedback: {
            rating: rating,
            comment: comment,
            submittedAt: new Date()
          }
        } 
      },
      { new: true }
    );
    if (!updatedTicket) return res.status(404).json({ message: "Ticket not found" });
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};
