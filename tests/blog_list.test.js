const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')

const blog_list_helper_exports = require('../utils/blog_list_helper')
const { totalLikes, favoriteBlog, mostBlogs, mostLikes, blogList } = blog_list_helper_exports

const user_helper_exports = require('../utils/user_helper')
const { usersInDb } = user_helper_exports

const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const modelBlogExports = require('../models/blog')
const { Blog, getPersonsCounts } = modelBlogExports

const loggerExports = require('../utils/logger')
const { info, errorLogger } = loggerExports

const configExports = require('../utils/config')
const { MONGODB_URI, PORT, SECRET } = configExports

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

let token

beforeEach(async () => {
  // await Blog.deleteMany({})

  // //executes promises in paralell and waits for all to finish before moving to tests
  // const blogsObjects = blog_list_helper_exports.blogList.map(blog => new Blog(blog))
  // const promiseArray = blogsObjects.map(blog => blog.save())
  // await Promise.all(promiseArray)

  await User.deleteMany({})

  // Create an admin user and generate a token
  const adminUser = new User({
    username: 'admin',
    passwordHash: await bcrypt.hash('adminpassword', 10),
    role: 'admin' // Assuming you have a role field to distinguish admin users
  })
  await adminUser.save()

  token = jwt.sign(
    { username: adminUser.username, id: adminUser._id }, SECRET,
    { expiresIn: '1h' }
  )

  //if oprations need to be executed in order
  await Blog.deleteMany({})

  for (let blog of blog_list_helper_exports.blogList) {
    let blogObject = new Blog(blog)
    blogObject.user = adminUser.id
    const savedBlog = await blogObject.save()
    adminUser.blogs = adminUser.blogs.concat(savedBlog._id)
    await adminUser.save()

  }

})

describe('blogList can be viewed and formatted accordingly', () => {

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are 6 blogs', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, blog_list_helper_exports.blogList.length)
  })

  test('the id is called "id" and not "_id"', async () => {
    const response = await api.get('/api/blogs')
    const keys = response.body.map(obj => Object.keys(obj))
    let isid = false
    for (let keyList of keys) {
      if (keyList.includes('id') && !keyList.includes('_id')) {
        isid = true
      }
      else {
        isid = false
        break
      }
    }
    assert.strictEqual(isid, true)
  })

  describe('Viewing a specific blog', () => {

    test('Succeeds with a valid id', async () => {
      const blogsAtStart = await blog_list_helper_exports.blogsInDb()

      const blogToView = blogsAtStart[0]

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.deepStrictEqual(resultBlog.body.toString(), blogToView.toString())
    })

    test('fails with statuscode 404 if blog does not exist', async () => {
      const validNonexistingId = await blog_list_helper_exports.nonExistingId()

      await api
        .get(`/api/blogs/${validNonexistingId}`)
        .expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .get(`/api/blogs/${invalidId}`)
        .expect(400)
    })

  })

})

describe('blogList Statistics', () => {

  test('total amount of likes across blogs is 36', () => {
    const result = blog_list_helper_exports.totalLikes(blogList)
    console.log(result);

    assert.strictEqual(result, 36)
  })

  test('favorite blog in the list is', () => {
    const result = blog_list_helper_exports.favoriteBlog(blogList)
    console.log(result);

    assert.deepStrictEqual(result, blogList[2])
  })


  test('author wuth  most blogList in the list is', () => {
    const result = blog_list_helper_exports.mostBlogs(blogList)
    console.log(result);

    const formatBlog = {
      author: blogList[3].author,
      blogs: 3
    }

    assert.deepStrictEqual(result, formatBlog)
  })

  test('author with most likes in the list is', () => {
    const result = blog_list_helper_exports.mostLikes(blogList)
    console.log(result);

    const formatBlog = {
      author: blogList[1].author,
      likes: 17
    }
    assert.deepStrictEqual(result, formatBlog)
  })

})

describe('Addition of blogs', () => {

  test('a valid blog can be added with valid data', async () => {

    const usersAtStart = await usersInDb()
    const blogsAtStart = await blog_list_helper_exports.blogsInDb()

    info("usersatstart: ", usersAtStart)

    const newBlog = {
      title: "new blog2",
      author: "lucy smith",
      url: "someurl2.com",
      likes: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await blog_list_helper_exports.blogsInDb()
    //info(personsAtEnd)
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1)

    const contents = blogsAtEnd.map(n => n.url)

    assert(contents.includes('someurl2.com'))

    const usersAtEnd = await usersInDb()
info("usersatend: ", usersAtEnd)
    const blogHasUser = blogsAtEnd.filter(n => n.user.toString() === usersAtEnd[0].id)
info("bloghasuser: ", blogHasUser)
info(blogHasUser.length, blogsAtEnd.length)
    //all blogs belong to adminuser = post successfujll
    assert.strictEqual(blogHasUser.length, blogsAtEnd.length)
//admin user has one new blog
info(usersAtEnd[0].blogs.length, usersAtStart[0].blogs.length)
    assert.strictEqual(usersAtEnd[0].blogs.length, usersAtStart[0].blogs.length + 1)

  })

  test('fails with status code 400 if no token is provided', async () => {

    const usersAtStart = await usersInDb()
    const blogsAtStart = await blog_list_helper_exports.blogsInDb()

    const newBlog = {
      title: "new blog2",
      author: "lucy smith",
      url: "someurl2.com",
      likes: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    const blogsAtEnd = await blog_list_helper_exports.blogsInDb()
    const usersAtEnd = await usersInDb()

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)

    assert.strictEqual(blogsAtEnd.length, blog_list_helper_exports.blogList.length)

    assert.strictEqual(usersAtEnd[0].blogs.length, usersAtStart[0].blogs.length)
  })

  test('fails with status code 400 if data invalid', async () => {
    const newBlog = {
      important: true
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    const blogsAtEnd = await blog_list_helper_exports.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, blog_list_helper_exports.blogList.length)
  })

  test('blog without likes is not added', async () => {
    const newBlog = {
      title: "new blog2",
      author: "lucy smith",
      url: "someurl2.com"

    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, blog_list_helper_exports.blogList.length)

  })

  test('blog without title is not added', async () => {
    const newBlog = {
      author: "lucy smith",
      url: "someurl2.com",
      likes: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, blog_list_helper_exports.blogList.length)

  })

  test('blog without url is not added', async () => {
    const newBlog = {
      title: "new blog2",
      author: "lucy smith",
      likes: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, blog_list_helper_exports.blogList.length)

  })

})

describe('Update of a blog', () => {
  test('succeeds with status code 200 if body is valid', async () => {
    const blogsAtStart = await blog_list_helper_exports.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    // info("blogtoupdate: ", blogToUpdate)
    const updadedBlog = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 1
    }
    //  info("updatedblog: ", updadedBlog)
    await api.put(`/api/blogs/${blogToUpdate.id}`)
      .send(updadedBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await blog_list_helper_exports.blogsInDb()
    info(blogsAtEnd)
    assert.strictEqual(blogsAtEnd[0].likes, updadedBlog.likes)
    
    assert.strictEqual(blogsAtEnd.length, blog_list_helper_exports.blogList.length)

    const contents = blogsAtEnd.map(r => r.url)
    assert(contents.includes(blogToUpdate.url))
  })

  test('fails with status code 400 if id invalid', async () => {

    const blogsAtStart = await blog_list_helper_exports.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    // info("blogtoupdate: ", blogToUpdate)
    const updadedBlog = {
      ...blogToUpdate,
      id: blogToUpdate.id.concat('5785677'),
      likes: blogToUpdate.likes + 1
    }
    //  info("updatedblog: ", updadedBlog)

    await api
      .put(`/api/blogs/${updadedBlog.id}`)
      .send(updadedBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    const blogsAtEnd = await blog_list_helper_exports.blogsInDb()

    assert.strictEqual(blogsAtEnd[0].likes, blog_list_helper_exports.blogList[0].likes)
  })

})

describe('Deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await blog_list_helper_exports.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await blog_list_helper_exports.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

    assert.strictEqual(blogsAtEnd.length, blog_list_helper_exports.blogList.length - 1)

    const contents = blogsAtEnd.map(r => r.url)
    assert(!contents.includes(blogToDelete.url))
  })
})

after(async () => {
  await mongoose.connection.close()
})