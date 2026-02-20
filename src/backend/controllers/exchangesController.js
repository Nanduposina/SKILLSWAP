const database = require('../models/Database');
const notificationService = require('../services/NotificationService');

// Create new exchange request (student to teacher)
const createExchange = async (req, res) => {
  try {
    const {
      providerID,
      skillID,
      skill,
      skillLevel,
      description,
      sessionType,
      hourlyRate,
      scheduledDate,
      durationHours,
      isMutualExchange
    } = req.body;

    // Validation
    if (!providerID || !skillID || !skill) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID, skill ID, and skill name are required'
      });
    }

    // Check if provider exists
    const provider = await database.findUserById(providerID);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Check if user is not trying to create exchange with themselves
    if (req.user.userId === providerID) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create exchange with yourself'
      });
    }

    // Calculate total points needed for the exchange
    const totalPoints = (hourlyRate || 0) * (durationHours || 1.0);
    
    // Check if requester has enough points
    const requester = await database.findUserById(req.user.userId);
    if (requester.pointsBalance < totalPoints) {
      return res.status(400).json({
        success: false,
        message: `Insufficient points. You need ${totalPoints} points but only have ${requester.pointsBalance} points.`
      });
    }

    const exchangeData = {
      requesterID: req.user.userId,
      providerID,
      skillID,
      skill,
      skillLevel: skillLevel || 'Beginner',
      description,
      sessionType: sessionType || 'Exchange',
      hourlyRate: hourlyRate || 0,
      scheduledDate,
      durationHours: durationHours || 1.0,
      isMutualExchange: isMutualExchange || false
    };

    const exchange = await database.createExchange(exchangeData);
    
    // Note: Points are not deducted until the exchange is accepted
    // This prevents users from being charged for cancelled exchanges

    // Send notification to provider
    await notificationService.notifyNewExchangeRequest(providerID, {
      exchangeId: exchange.id,
      requesterName: req.user.name || 'Unknown User',
      skill: exchange.skill,
      description: exchange.description
    });

    res.status(201).json({
      success: true,
      message: 'Exchange request created successfully',
      data: exchange
    });

  } catch (error) {
    console.error('Create exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new exchange request (teacher to student)
const createTeacherRequest = async (req, res) => {
  try {
    const {
      studentID,
      skillID,
      skill,
      skillLevel,
      description,
      sessionType,
      hourlyRate,
      scheduledDate,
      durationHours,
      isMutualExchange
    } = req.body;

    // Validation
    if (!studentID || !skillID || !skill) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, skill ID, and skill name are required'
      });
    }

    // Check if student exists
    const student = await database.findUserById(studentID);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if user is not trying to create exchange with themselves
    if (req.user.userId === studentID) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create exchange with yourself'
      });
    }

    // Calculate total points needed for the exchange
    const totalPoints = (hourlyRate || 0) * (durationHours || 1.0);
    
    // Check if teacher has enough points
    const teacher = await database.findUserById(req.user.userId);
    if (teacher.pointsBalance < totalPoints) {
      return res.status(400).json({
        success: false,
        message: `Insufficient points. You need ${totalPoints} points but only have ${teacher.pointsBalance} points.`
      });
    }

    const exchangeData = {
      requesterID: req.user.userId, // Teacher is the requester
      providerID: studentID,        // Student is the provider
      skillID,
      skill,
      skillLevel: skillLevel || 'Beginner',
      description,
      sessionType: sessionType || 'Exchange',
      hourlyRate: hourlyRate || 0,
      scheduledDate,
      durationHours: durationHours || 1.0,
      isMutualExchange: isMutualExchange || false
    };

    const exchange = await database.createExchange(exchangeData);
    
    // Note: Points are not deducted until the exchange is accepted
    // This prevents users from being charged for cancelled exchanges

    // Send notification to student
    await notificationService.notifyNewExchangeRequest(studentID, {
      exchangeId: exchange.id,
      requesterName: req.user.name || 'Unknown User',
      skill: exchange.skill,
      description: exchange.description
    });

    res.status(201).json({
      success: true,
      message: 'Exchange request created successfully',
      data: exchange
    });

  } catch (error) {
    console.error('Create teacher exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all exchanges (for admin or general listing)
const getAllExchanges = async (req, res) => {
  try {
    const exchanges = await database.findExchangesByUserId(req.user.userId);
    res.json({
      success: true,
      data: exchanges
    });
  } catch (error) {
    console.error('Get exchanges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all exchanges for current user
const getMyExchanges = async (req, res) => {
  try {
    const exchanges = await database.findExchangesByUserId(req.user.userId);
    
    res.json({
      success: true,
      data: exchanges
    });

  } catch (error) {
    console.error('Get exchanges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get exchange details with messages
const getExchangeById = async (req, res) => {
  try {
    const { id } = req.params;
    const exchange = await database.findExchangeById(id);
    
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    // Check if user is part of this exchange
    if (exchange.requesterID !== req.user.userId && exchange.providerID !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this exchange'
      });
    }

    // Get messages for this exchange
    const messages = await database.getExchangeMessages(id);
    
    // Get ratings for this exchange
    const ratings = await database.getExchangeRatings(id);

    res.json({
      success: true,
      data: {
        ...exchange,
        messages,
        ratings
      }
    });

  } catch (error) {
    console.error('Get exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Accept exchange request
const acceptExchange = async (req, res) => {
  try {
    const { id } = req.params;
    const exchange = await database.findExchangeById(id);
    
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    // Check if user is part of this exchange (either requester or provider)
    if (exchange.requesterID !== req.user.userId && exchange.providerID !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only participants in this exchange can accept it'
      });
    }

    // Check if exchange is still pending
    if (exchange.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Exchange is no longer pending'
      });
    }

    const updatedExchange = await database.acceptExchange(id);

    // Deduct points from requester when exchange is accepted
    const totalPoints = exchange.hourlyRate * exchange.durationHours;
    await database.deductPoints(
      exchange.requesterID, 
      totalPoints, 
      'Payment', 
      `Payment for accepted exchange: ${exchange.skill}`, 
      id
    );

    // Send notification to requester about points deduction
    await notificationService.notifyPointsDeducted(exchange.requesterID, {
      amount: totalPoints,
      reason: `Payment for accepted exchange: ${exchange.skill}`,
      exchangeId: id
    });

    // Send notification to the other participant
    const otherParticipantId = exchange.requesterID === req.user.userId ? exchange.providerID : exchange.requesterID;
    await notificationService.notifyExchangeAccepted(otherParticipantId, {
      exchangeId: id,
      accepterName: req.user.name || 'Unknown User',
      skill: exchange.skill
    });

    res.json({
      success: true,
      message: 'Exchange accepted successfully',
      data: updatedExchange
    });

  } catch (error) {
    console.error('Accept exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Decline exchange request
const declineExchange = async (req, res) => {
  try {
    const { id } = req.params;
    const exchange = await database.findExchangeById(id);
    
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    // Check if user is part of this exchange (either requester or provider)
    if (exchange.requesterID !== req.user.userId && exchange.providerID !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only participants in this exchange can decline it'
      });
    }

    // Check if exchange is still pending
    if (exchange.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Exchange is no longer pending'
      });
    }

    const updatedExchange = await database.declineExchange(id);

    // Note: No points refund needed since points are only deducted when exchange is accepted
    // If exchange is declined before acceptance, no points were deducted

    // Send notification to requester
    await notificationService.notifyExchangeDeclined(exchange.requesterID, {
      exchangeId: id,
      providerName: req.user.name || 'Unknown User',
      skill: exchange.skill
    });

    res.json({
      success: true,
      message: 'Exchange declined successfully',
      data: updatedExchange
    });

  } catch (error) {
    console.error('Decline exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send message in exchange
const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, messageType } = req.body;
    
    const exchange = await database.findExchangeById(id);
    
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    // Check if user is part of this exchange
    if (exchange.requesterID !== req.user.userId && exchange.providerID !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this exchange'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const message = await database.addMessage({
      exchangeID: id,
      senderID: req.user.userId,
      content,
      messageType: messageType || 'text'
    });

    // Get sender info for real-time broadcast
    const sender = await database.findUserById(req.user.userId);
    const messageWithSender = {
      ...message,
      senderName: sender.name,
      senderPicture: sender.profilePicture
    };

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: messageWithSender
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update exchange status
const updateExchangeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const exchange = await database.findExchangeById(id);
    
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    // Check if user is part of this exchange
    if (exchange.requesterID !== req.user.userId && exchange.providerID !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this exchange'
      });
    }

    const validStatuses = ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updatedExchange = await database.updateExchangeStatus(id, status);

    // If exchange is completed, handle point transfers
    if (status === 'Completed') {
      const totalPoints = exchange.hourlyRate * exchange.durationHours;
      
      // Check if points were already deducted from requester
      const existingPayment = await database.findTransactionByExchangeAndType(id, 'Payment');
      
      // If no payment transaction exists, deduct points from requester
      if (!existingPayment) {
        await database.deductPoints(
          exchange.requesterID, 
          totalPoints, 
          'Payment', 
          `Payment for completed exchange: ${exchange.skill}`, 
          id
        );

        // Send notification to requester about points deduction
        await notificationService.notifyPointsDeducted(exchange.requesterID, {
          amount: totalPoints,
          reason: `Payment for completed exchange: ${exchange.skill}`,
          exchangeId: id
        });
      }

      // Award points to provider
      await database.awardPoints(
        exchange.providerID, 
        totalPoints, 
        'Award', 
        `Completed exchange: ${exchange.skill}`, 
        id
      );

      // Send notification to provider about points earned
      await notificationService.notifyPointsAwarded(exchange.providerID, {
        amount: totalPoints,
        reason: `Completed exchange: ${exchange.skill}`,
        exchangeId: id
      });
    }

    // If exchange is cancelled, refund points to requester
    if (status === 'Cancelled') {
      const totalPoints = exchange.hourlyRate * exchange.durationHours;
      await database.awardPoints(
        exchange.requesterID, 
        totalPoints, 
        'Award', 
        `Refund for cancelled exchange: ${exchange.skill}`, 
        id
      );

      // Send notification to requester about points refund
      await notificationService.notifyPointsAwarded(exchange.requesterID, {
        amount: totalPoints,
        reason: `Refund for cancelled exchange: ${exchange.skill}`,
        exchangeId: id
      });
    }

    // Send notification about status change
    const otherUserId = exchange.requesterID === req.user.userId ? exchange.providerID : exchange.requesterID;
    await notificationService.notifyExchangeStatusChange(otherUserId, {
      exchangeId: id,
      status,
      updatedBy: req.user.name || 'Unknown User'
    });

    res.json({
      success: true,
      message: 'Exchange status updated successfully',
      data: updatedExchange
    });

  } catch (error) {
    console.error('Update exchange status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Rate an exchange
const rateExchange = async (req, res) => {
  try {
    const { id } = req.params;
    const { ratedUserID, score, reviewText } = req.body;
    
    const exchange = await database.findExchangeById(id);
    
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    // Only the requester (student) can rate the provider (teacher)
    if (exchange.requesterID !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the student can rate the teacher'
      });
    }

    // Check if exchange is completed
    if (exchange.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed exchanges'
      });
    }

    // Verify they are rating the provider (teacher), not themselves
    if (ratedUserID !== exchange.providerID) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating target'
      });
    }

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 1 and 5'
      });
    }

    const rating = await database.createRating({
      exchangeID: id,
      raterID: req.user.userId,
      ratedUserID,
      score,
      reviewText
    });
    
    // Recalculate and update average rating for the rated user
    const userRatings = await database.getUserRatings(ratedUserID);
    const avgRating = userRatings.reduce((sum, r) => sum + r.score, 0) / userRatings.length;
    await database.updateUser(ratedUserID, { averageRating: avgRating });

    // Send notification about new rating
    await notificationService.notifyNewRating(ratedUserID, {
      exchangeId: id,
      raterName: req.user.name || 'Unknown User',
      score,
      skill: exchange.skill
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: rating
    });

  } catch (error) {
    console.error('Rate exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Revoke exchange request
const revokeExchange = async (req, res) => {
  try {
    const { id } = req.params;
    const exchange = await database.findExchangeById(id);
    
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    // Check if user is the requester
    if (exchange.requesterID !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can revoke this exchange request'
      });
    }

    // Check if exchange is still pending
    if (exchange.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending exchanges can be revoked'
      });
    }

    // Update exchange status to cancelled
    const updatedExchange = await database.updateExchangeStatus(id, 'Cancelled');

    // Note: No points refund needed since points are only deducted when exchange is accepted
    // If exchange is cancelled before acceptance, no points were deducted

    // Send notification to provider about request revocation
    await notificationService.notifyExchangeDeclined(exchange.providerID, {
      exchangeId: id,
      requesterName: req.user.name || 'Unknown User',
      skill: exchange.skill,
      reason: 'Request was revoked by the requester'
    });

    res.json({
      success: true,
      message: 'Exchange request revoked successfully',
      data: updatedExchange
    });

  } catch (error) {
    console.error('Revoke exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createExchange,
  createTeacherRequest,
  getAllExchanges,
  getMyExchanges,
  getExchangeById,
  acceptExchange,
  declineExchange,
  sendMessage,
  updateExchangeStatus,
  rateExchange,
  revokeExchange
};
