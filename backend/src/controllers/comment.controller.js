import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asyncHandler.js";

// 1. Get all comments for a video (with Pagination)
const getVideoComments = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Convert the current user ID to a string once to avoid repeated operations in the pipeline
  const currentUserId = req.user?._id ? String(req.user._id) : null;

  const aggregate = Comment.aggregate([
    {
      // Use String() just in case videoId isn't cast correctly from params
      $match: { video: String(videoId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [{ $project: { username: 1, avatar: 1, fullName: 1 } }],
      },
    },
    { $unwind: "$ownerDetails" },
    {
      // Join with likes collection
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment", // Ensure your Like model uses 'comment' field
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        isLiked: {
          $cond: {
            // If currentUserId exists AND is found in the likes array
            if: {
              $and: [
                { $ne: [currentUserId, null] },
                {
                  $in: [
                    currentUserId,
                    {
                      $map: {
                        input: "$likes",
                        as: "l",
                        in: { $toString: "$$l.likedBy" },
                      },
                    },
                  ],
                },
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      // We don't want to send the full 'likes' array to the frontend, just the counts/state
      $project: {
        likes: 0,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const comments = await Comment.aggregatePaginate(aggregate, options);
  console.log("--- COMMENT SYNC CHECK ---");
  if (comments.docs.length > 0) {
    console.log("First Comment ID:", comments.docs[0]._id);
    console.log("isLiked Value:", comments.docs[0].isLiked);
    console.log("Likes Count:", comments.docs[0].likesCount);
  }
  console.log("--------------------------");
  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});
// 3. Update a comment
const updateComment = asynchandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required to update comment");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) throw new ApiError(404, "Comment not found");

  // Security check: Only the owner can update
  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You do not have permission to edit this comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { $set: { content } },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

// 4. Delete a comment
const deleteComment = asynchandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) throw new ApiError(404, "Comment not found");

  // Security check: Only owner can delete
  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      403,
      "You do not have permission to delete this comment"
    );
  }

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});
const addComment = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  // 1. Validation
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content cannot be empty");
  }

  if (!videoId) {
    throw new ApiError(400, "Video ID is required to post a comment");
  }

  // 2. Create the comment
  // We use req.user._id (which we know is a UUID string from your logs)
  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: req.user?._id,
  });

  // 3. Check if creation was successful
  if (!comment) {
    throw new ApiError(500, "Something went wrong while saving the comment");
  }

  // 4. Return response
  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment posted successfully"));
});
export { getVideoComments, addComment, updateComment, deleteComment };
