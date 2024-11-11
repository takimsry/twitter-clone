export const formatPosts = (posts) => {
  return posts.map(post => {
    const likes = post.LikedPosts.map(like => like.user_id);
    const comments = post.Comments.map(comment => ({
      id: comment.id,
      text: comment.text,
      user: {
        id: comment.User.id,
        username: comment.User.username,
        fullname: comment.User.fullname,
        profileImg: comment.User.profileImg
      }
    }));

    return {
      id: post.id,
      user: {
        id: post.User.id,
        username: post.User.username,
        fullname: post.User.fullname,
        profileImg: post.User.profileImg
      },
      text: post.text,
      img: post.img,
      likes,
      comments,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }
  });
}