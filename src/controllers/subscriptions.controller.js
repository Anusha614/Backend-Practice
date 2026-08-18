import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    //check if channelID is valid
    //check if the user is already subscribed
    //if subscribed, unsubscribe
    //send res
    //if unsubscribed,subscribe
    //send res

    //check if channelID is valid
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel ID is invalid")
    }

    const existingSubscribtion = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user?._id
    })

    if (existingSubscribtion) {
        await Subscription.findOneAndDelete(existingSubscribtion._id)
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200, "Unsubscribed the channel successfully!"))


    const newSubscribtion = await Subscription.create({
        channel: channelId,
        subscriber: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, "subscribed the channel successfully!"))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}