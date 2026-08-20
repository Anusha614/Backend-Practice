import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


// getUserTweets REMAINING
const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    //get content and tweet ID
    //check if content is provided
    //create tweet
    //return res

    const{content} = req.body

    if(!content) {
        throw new ApiError(400, "tweet cotent os required")
    }

    const newTweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201, "Created tweet successfully!"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    //get tweet ID
    //check if Id is valid
    //get tweet from tweet ID
    //check if tweet exists
    //check if user auth
    //update the tweet
    //return res

    const{tweetId} = req.params
    const{content} = req.body

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "tweet ID invalid")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(400, "tweet not found")
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "user not authorized")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        {new: true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully!"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    //get tweet ID
    //check if Id vald
    //find tweet
    //check if tweet exists
    //check if user authorized
    //delete tweet
    //return res

    const{tweetId} = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "tweet ID invalid")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(400, "tweet not found")
    }

    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "user not authorized")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully!"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}