const mongoose = require('mongoose');
const EmployeeModel = require('../models/user.model')
const UserModel= require('../models/userlogin.model')
const TicketModel= require('../models/tickets.model')
const messageSchema = require('../models/message.model');
require('dotenv').config();

const baseURI = process.env.MONGODB_URI;

const employeeDb = mongoose.createConnection(`${baseURI}/employee`);
const userDb = mongoose.createConnection(`${baseURI}/user`);
const ticketDb = mongoose.createConnection(`${baseURI}/user`);
const chatDb = mongoose.createConnection(`${baseURI}/helpdesk_chat`);

const Employee = employeeDb.model('Employee', EmployeeModel.schema);
const User = userDb.model('User', UserModel.schema);
const Ticket = ticketDb.model('Ticket', TicketModel.schema);
const MessageModel = chatDb.model('Message', messageSchema, 'chat_messages');

module.exports = {Employee,User,Ticket,MessageModel};