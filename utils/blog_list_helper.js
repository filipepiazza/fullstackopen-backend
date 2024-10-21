const { Blog } = require("../models/blog");

const blogList = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }
]

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        console.log(sum, item.likes);
        
        return sum + item.likes
      }
    
      return blogs.reduce(reducer, 0)
  }
  
  const favoriteBlog = (blogs) => {
    const reducer = (favorite, item) => {
        console.log(favorite, item.likes);
        if(item.likes > favorite.likes){
            favorite = item
        }
        return favorite
      }
    
      return blogs.reduce(reducer)
  }

  const mostBlogs = (blogs) => {

    // const mostObject = {
    //     author: blogs[0].author,
    //     blogs: 0
    //     }
    // const compareObject = {
    //   author: blogs[1].author,
    //   blogs: 0
    // }

    // const reducer = (mostObject, item) => {
    //     console.log(mostObject, item.author);

    //     if(item.author === mostObject.author){
    //         mostObject.blogs = mostObject.blogs + 1
    //     }
    //     else if(item.author === compareObject.author){

    //     }
    //     return favorite
    //   }
    
    //   return blogs.reduce(reducer, mostObject)


      // If the blogs array is empty, return null
      if (blogs.length === 0) {
        return null;
      }
    
      // Create an object to store the blog count for each author
      const authorBlogCounts = {};
    
      // Count the number of blogs for each author
      blogs.forEach(blog => {
        if (authorBlogCounts[blog.author]) {
          authorBlogCounts[blog.author]++;
        } else {
          authorBlogCounts[blog.author] = 1;
        }
      });
    
      // Find the author with the most blogs
      let maxBlogs = 0;
      let topAuthor = '';
    
      for (const [author, count] of Object.entries(authorBlogCounts)) {
        if (count > maxBlogs) {
          maxBlogs = count;
          topAuthor = author;
        }
      }
    
      // Return the result in the specified format
      return {
        author: topAuthor,
        blogs: maxBlogs
      };
    }

    function mostLikes(blogs) {
      // If the blogs array is empty, return null
      if (blogs.length === 0) {
        return null;
      }
    
      // Create an object to store the total likes for each author
      const authorLikes = {};
    
      // Sum up the likes for each author
      blogs.forEach(blog => {
        if (authorLikes[blog.author]) {
          authorLikes[blog.author] += blog.likes;
        } else {
          authorLikes[blog.author] = blog.likes;
        }
      });
    
      // Find the author with the most likes
      let maxLikes = 0;
      let topAuthor = '';
    
      for (const [author, likes] of Object.entries(authorLikes)) {
        if (likes > maxLikes) {
          maxLikes = likes;
          topAuthor = author;
        }
      }
    
      // Return the result in the specified format
      return {
        author: topAuthor,
        likes: maxLikes
      };
    }

    const blogsInDb = async () => {
      const blogs = await Blog.find({})
      return blogs.map(blog => blog.toJSON())
    }

    const nonExistingId = async () => {
      const blog = new Blog({ title: "new blog2",
        author: "lucy smith",
        url: "someurl2.com",
        likes: 0})
      await blog.save()
      await blog.deleteOne()
    
      return blog._id.toString()
    }
    
    const blog_list_helper_exports = {
      totalLikes,
      favoriteBlog,
      mostBlogs,
      mostLikes,
      blogsInDb,
      nonExistingId,
      blogList
    }

  module.exports = blog_list_helper_exports