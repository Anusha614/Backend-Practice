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

    if (!isValidObjectId(channelId)) { 
        throw new ApiError(400, "Channel ID is invalid")
    }

    const channelSubscribers = await Subscription.aggregate([
  {
    $match: {
      channel: new mongoose.Types.ObjectId(channelId)
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "subscriber",
      foreignField: "_id",
      as: "subscriberDetails",
      pipeline: [
        {
          $project: {
            username: 1,
            fullName: 1,
            avatar: 1
          }
        }
      ]
    }
  },
  {
    $unwind: "$subscriberDetails"
  }
])

return res
.status(200)
.json(new ApiResponse(200, channelSubscribers, "Channel subscribers fetched successfully!"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Subscriber ID is invalid")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails"
            }
        },
        {
            $unwind: "$channelDetails"
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully!"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}