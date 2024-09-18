const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => {
    return total + blog.likes;
  }, 0);
};

const favoriteBlog = (blogs) => {
  let mostLikes = -1,
    favorite;
  blogs.forEach((blog, index) => {
    if (blog.likes > mostLikes) {
      mostLikes = blog.likes;
      favorite = blogs[index];
    }
  });
  return favorite;
};

export { dummy, totalLikes, favoriteBlog };
