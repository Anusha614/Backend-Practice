import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
   
    //check if videoID is valid
    //check if video is liked
    // if liked unlike
    //send response 
    //if not liked add a new like 
    //send response 

    //check if videoID is valid
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    //check if videoID is valid
    const existingLike = await Like.findOne(
        {
            video: videoId,
            likedBy: req.user?._id
        }
    )

    // if liked unlike
    if (existingLike) {
        findByIdAndDelete(existingLike._id)
    }

    //send response 
    return res
    .status(200)
    .json(new ApiResponse(200, "Unliked video successfully!"))

     //if not liked add a new like 
     await Like.create({
        video: videoId,
        likedBy: req.user?._id
     })

     //send response 
     return res
     .status(201)
     .json(new ApiResponse(201, "Liked video successfully!"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    
    //check if commentID is valid
    //check if comment is liked
    // if liked unlike
    //send response 
    //if not liked add a new like 
    //send response 

    //check if commentID is valid
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    //check if commentID is valid
    const existingLike = await Like.findOne(
        {
            comment: commentId,
            likedBy: req.user?._id
        }
    )

    // if liked unlike
    if (existingLike) {
        findByIdAndDelete(existingLike._id)
    }

    //send response 
    return res
    .status(200)
    .json(new ApiResponse(200, "Unliked comment successfully!"))

     //if not liked add a new like 
     await Like.create({
        comment: commentId,
        likedBy: req.user?._id
     })

     //send response 
     return res
     .status(201)
     .json(new ApiResponse(201, "Liked comment successfully!"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    
    //check if tweetId is valid
    //check if tweet is liked
    // if liked unlike
    //send response 
    //if not liked add a new like 
    //send response 

    //check if tweetId is valid
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    //check if tweetId is valid
    const existingLike = await Like.findOne(
        {
            tweet: tweetId,
            likedBy: req.user?._id
        }
    )

    // if liked unlike
    if (existingLike) {
        findByIdAndDelete(existingLike._id)
    }

    //send response 
    return res
    .status(200)
    .json(new ApiResponse(200, "Unliked tweet successfully!"))

     //if not liked add a new like 
     await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
     })

     //send response 
     return res
     .status(201)
     .json(new ApiResponse(201, "Liked tweet successfully!"))
    
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
   
    const userId = req.user?._id

    const likedVideos = await Like.aggregate ([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                LocalField: "video",
                ForeignField: "_id",
                as: "likedVideos"
            }
        },
        {
            $unwind: "$likedVideos"
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 0,
                likedVideos: {
                _id: 1,
                title: 1,
                description: 1,
                thumbnail: 1,
                views: 1,
                owner: 1
                }
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully!"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}