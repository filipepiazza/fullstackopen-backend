const blogsRouter = require('express').Router()

const loggerExports = require('../utils/logger')
const { info, errorLogger } = loggerExports

const modelBlogExports = require('../models/blog')
const { Blog } = modelBlogExports

const configExports = require('../utils/config')
const { MONGODB_URI, PORT, SECRET } = configExports

const middlewareExports = require('../utils/middleware')
const {userExtractor} = middlewareExports

const User = require('../models/user')

const jwt = require('jsonwebtoken')

// ...
// const getTokenFrom = request => {
//     const authorization = request.get('authorization')
//     if (authorization && authorization.startsWith('Bearer ')) {
//         return authorization.replace('Bearer ', '')
//     }
//     return null
// }

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response, next) => {
    const id = request.params.id
    const blog = await Blog.findById(id)
    if (blog) {
        response.json(blog)
    } else {
        response.status(404).end()
    }
})

blogsRouter.post('/', userExtractor, async (request, response, next) => {
    const body = request.body

    // const decodedToken = jwt.verify(request.token, SECRET)
    // if (!decodedToken.id) {
    //     return response.status(401).json({ error: 'token invalid' })
    //}
    const user = request.user //await User.findById(decodedToken.id)

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user.id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', userExtractor, async (request, response, next) => {
    const { title, author, url, likes } = request.body
    info(request.body);

    // const decodedToken = jwt.verify(request.token, SECRET)
    // if (!decodedToken.id) {
    //     return response.status(401).json({ error: 'token invalid' })
    // }

    const user = request.user//await User.findById(decodedToken.id)

    if (user) {
        // Validate the update payload
        const validationError = Blog.validateUpdate(request.body);
        if (validationError) {
            return response.status(400).json({ error: validationError.message });
        }
        info("user: ", user)
        const blog = await Blog.findById(request.params.id)
        info("blog: ", blog)
        info(blog.user.toString())
        info(user.id)
        if (blog.user.toString() === user.id) {
            const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, { likes }, { new: true, runValidators: true, context: 'query' })
            info(updatedBlog);
            response.json(updatedBlog)
        }
        else {
            return response.status(401).json({ error: 'token invalid' })
        }

    }
    else {
        return response.status(400).json({ error: "JsonWebTokenError" });
    }
})

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {

    // const decodedToken = jwt.verify(request.token, SECRET)
    // info("requesttoken: ", request.token)
    // if (!decodedToken.id) {
    //     return response.status(401).json({ error: 'token invalid' })
    // }
    // info("id: ", decodedToken.id)
    const user = request.user//await User.findById(decodedToken.id)

    if (user) {
        info("user: ", user)
        const blog = await Blog.findById(request.params.id)
        info("blog: ", blog)
        info(blog.user.toString())
        info(user.id)
        if (blog.user.toString() === user.id) {
            const result = await Blog.findByIdAndDelete(request.params.id)
            info(result);
            response.status(204).end()
        }
        else {
            return response.status(401).json({ error: 'token invalid' })
        }
    }
    else {
        return response.status(400).json({ error: "JsonWebTokenError" });
    }

})

module.exports = blogsRouter