import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// GET PLAYLISTS BY USER ID REMAINING
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    
    //check if name is provided
    //check if description is provided
    //create the playlist
    //return response

    //check if name is provided
    if (!name) {
        throw new ApiError(400, "playlist name is required")
    }

    //check if description is provided
    if (!description) {
        throw new ApiError(400, "playlist description is required")
    }

    //create the playlist
    const newPlaylist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(201, newPlaylist, "Playlist created successfully!"))

    
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                LocalField: "video",
                foreignField: "_id",
                as: "videos"
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
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, playlists, "User playlists fetched successfully!"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    //get playlist by ID
    //check if playlist exists
    //check if user authorized
    //check if playlistID is valid
    //check if video Id is valid
    //add video to playlist
    //return res

    //get playlist by ID
    const playlist = await Playlist.findById(playlistId)

    //check if playlist exists
    if (!playlist) {
        throw new ApiError(400, "Playlist not found")
    }

    //check if user authorized
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "User not authorized")
    }

    //check if video Id is valid
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "video ID not valid")
    }

    //check if playlist ID is valid
     if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlist ID not valid")
    }

    //add video to playlist
    const addedVideoToPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                video: videoId
            }
        },
        {new: true}
        
    )

    return res
    .status(200)
    .json(new ApiResponse(200, addedVideoToPlaylist, "Video added to playlist successfully!"))
   

})


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    //get playlist by ID
    //check if playlist exists
    //check if user authorized
    //check if playlistID is valid
    //check if video Id is valid
    //delete video from playlist
    //return res

    //get playlist by ID
    const playlist = await Playlist.findById(playlistId)

    //check if playlist exists
    if (!playlist) {
        throw new ApiError(400, "Playlist not found")
    }

    //check if user authorized
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "User not authorized")
    }

    //check if video Id is valid
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "video ID not valid")
    }

    //check if playlist ID is valid
     if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlist ID not valid")
    }

    //delete video from playlist
    const deleteVideoFromPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                video: videoId
            }
        },
        {new: true}
        
    )

    return res 
    .status(200)
    .json(new ApiResponse(200, deleteVideoFromPlaylist, "Video deleted from playlist successfully!"))
    


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    //look for playlist via ID
    //check if user is auth
    //check if playlist exist
    //check if playlist ID is valid
    //delete playlist
    //return res

    const playlist = await Playlist.findById(playlistId)

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlist ID invalid")
    }

    if (!playlist) {
        throw new ApiError(400, "playlist not found")
    }

    if (playlist.owner.toString() !== req.user?._id) {
        throw new ApiError(400, "User not authorized")
    }


    await Playlist.findByIdAndDelete({
        playlistId
    })

    return res
    .status(200)
    .json(new ApiResponse(200, "Deleted playlist successfully!"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    //look for playlist by ID
    //check if user is auth
    //check if playlist exists
    //update playlist
    //return res
    
    const playlist = await Playlist.findById(playlistId)

    if (playlist.owner.toString() !== req.user?._id) {
        throw new ApiError(400, "User not authorized")
    }

    if (!playlist) {
        throw new ApiError(400, "playlist not found")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlist ID invalid")
    }

    //check if name is provided
    if (!name) {
        throw new ApiError(400, "playlist name is required")
    }

    //check if description is provided
    if (!description) {
        throw new ApiError(400, "playlist description is required")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(

        playlistId,

        {

        $set: {
            description,
            name
        }

    },
        {new:true}
        
    )

    return res
    .status(200)
    .json(new ApiResponse(200, "Deleted playlist successfully!"))
    

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}