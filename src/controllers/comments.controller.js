import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                video: mongoose.Types.objectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }


    ])

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const comments = await Comment.aggregatePaginate(aggregateQuery, options);

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body

    if (!content || content.trim() === "") {
        throw new ApiError(400, "comment content is required")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const comment = await Comment.create({
        content,
        owner: req.user?._id,
        video: videoId
    })

    if (!comment) {
        throw new ApiError(500, "failed to add comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment added successfully!"))
})


const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body

    if (!content || content.trim() === "") {
        throw new ApiError(400, "comment content is required")
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if(comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "you are unauthorized to update this comment")
    }

    const updatedComment = await comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment updated successfully!"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} =req.params

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "comment not found")
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "you are unauthorized to delete this comment")
    }

    await comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(new ApiResponse(200, null, "comment deleted successfully!"))
})


export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }