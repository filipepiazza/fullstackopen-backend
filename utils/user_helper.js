const User = require('../models/user')

// ...

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

// const nonExistingId = async () => {
//     const user = new Blog({ title: "new blog2",
//       author: "lucy smith",
//       url: "someurl2.com",
//       likes: 0})
//     await blog.save()
//     await blog.deleteOne()
  
//     return blog._id.toString()
//   }

const user_helper_exports = {
    usersInDb
} 

module.exports = user_helper_exports