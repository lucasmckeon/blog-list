import { Blog } from '../models/blog.js';

const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0,
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0,
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0,
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0,
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0,
  },
];

async function getBlogsInDB() {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
}

function getInitialAmountOfBlogs() {
  return initialBlogs.length;
}

async function populateDB() {
  await Promise.all(
    initialBlogs.map((initialBlog) => {
      const blog = new Blog(initialBlog);
      return blog.save();
    })
  );
}

async function clearDB() {
  await Blog.deleteMany({});
  return;
}

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => {
    return total + blog.likes;
  }, 0);
};

const favoriteBlog = (blogs) => {
  let mostLikes = -1,
    favorite = {};
  blogs.forEach((blog, index) => {
    if (blog.likes > mostLikes) {
      mostLikes = blog.likes;
      favorite = blogs[index];
    }
  });
  return favorite;
};

//TODO: Finish if have more time
const mostBlogs = (blogs) => {
  let author = '',
    authorToBlogsCountMap = new Map();
  blogs.forEach((blog, index) => {
    const blogAuthor = blog.author;
  });
};

export {
  totalLikes,
  favoriteBlog,
  getBlogsInDB,
  clearDB,
  populateDB,
  getInitialAmountOfBlogs,
};
