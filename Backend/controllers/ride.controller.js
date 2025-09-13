const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const { sendMessageToSocketId } = require('../socket');
const rideModel = require('../models/ride.model');


module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, pickup, destination, vehicleType } = req.body;

    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const ride = await rideService.createRide({ user: req.user._id, pickup, destination, vehicleType });

        // Validate pickup coordinates
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        if (
            !pickupCoordinates ||
            typeof pickupCoordinates.ltd !== 'number' ||
            typeof pickupCoordinates.lng !== 'number' ||
            isNaN(pickupCoordinates.ltd) ||
            isNaN(pickupCoordinates.lng)
        ) {
            return res.status(400).json({ message: 'Invalid pickup coordinates' });
        }

        const captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.ltd, pickupCoordinates.lng, 2);

        ride.otp = "";

        const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');

        captainsInRadius.map(captain => {
            sendMessageToSocketId(captain.socketId, {
                event: 'new-ride',
                data: rideWithUser
            });
        });

        // Only send response once, after all logic
        return res.status(201).json(ride);
    } catch (err) {
        console.log(err);
        if (!res.headersSent) {
            return res.status(500).json({ message: err.message });
        }
    }

};

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;
    const mongoose = require('mongoose');
    if (!rideId || !mongoose.Types.ObjectId.isValid(rideId)) {
        return res.status(400).json({ errors: [{ type: 'field', msg: 'Invalid ride id', path: 'rideId', location: 'body' }] });
    }

    try {
        const ride = await rideService.confirmRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        });

        return res.status(200).json(ride);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;
    const mongoose = require('mongoose');
    if (!rideId || !mongoose.Types.ObjectId.isValid(rideId)) {
        return res.status(400).json({ errors: [{ type: 'field', msg: 'Invalid ride id', path: 'rideId', location: 'query' }] });
    }

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        console.log(ride);

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        });

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;
    const mongoose = require('mongoose');
    if (!rideId || !mongoose.Types.ObjectId.isValid(rideId)) {
        return res.status(400).json({ errors: [{ type: 'field', msg: 'Invalid ride id', path: 'rideId', location: 'body' }] });
    }

    try {
        const ride = await rideService.endRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        });

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}