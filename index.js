const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
var path = require('path')
const { uniqueNamesGenerator, names } = require('unique-names-generator')
var randomHexColor = require('random-hex-color')
const { Server } = require('socket.io')
var { serialize, parse } = require('cookie')
const io = new Server(server, {
  cookie: true,
})
var exphbs = require('express-handlebars')
var cookie = require('cookie-parser')
var totalUsers = 0
var userName = []
var userColor = []
var userMessage = {}
var userDetails = {}

app.set('views', path.join(__dirname, 'views'))
app.use('/node_modules', express.static(__dirname + '/node_modules/'))
app.engine('hbs', exphbs.create().engine)
app.set('view engine', 'hbs')
app.use(cookie())

app.get('/', async (req, res) => {
  console.log(req.cookies)
  if (!req.cookies.name) {
    var randomNumber = Math.random().toString()
    randomNumber = randomNumber.substring(2, randomNumber.length)
    const shortName = uniqueNamesGenerator({
      dictionaries: [names, names],
      length: 2,
    })
    const colorCode = randomHexColor()
    res.cookie('name', shortName)
    res.cookie('color', colorCode)
  }
  res.render('main', {
    title: 'Express',
    onlineUserCount: totalUsers,
    onlineUserData: 3,
  })
})

io.on('connection', (socket) => {
  totalUsers++
  var randomNumber = Math.random().toString()
  randomNumber = randomNumber.substring(2, randomNumber.length)
  const shortName = uniqueNamesGenerator({
    dictionaries: [names, names],
    length: 2,
  })
  const colorCode = randomHexColor()
  userName.push(shortName)
  userColor.push(colorCode)
  userDetails = {}
  for (i = 0; i < totalUsers; i++) {
    userDetails[userName[i]] = userColor[i]
  }
  
  console.log('user count: ' + totalUsers)
  console.log('user details: ' + userName)
  io.emit('user count', totalUsers + ' users in room:')
  io.emit('user details', userDetails)

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg)

    console.log('message: ' + msg)
  })
  socket.on('type status', (msg) => {
    console.log(msg)
    io.emit('type status', msg)
  })
  console.log('a user connected')
  socket.on('disconnect', () => {
    totalUsers--
    userName.pop()
    userColor.pop()
    userDetails = {}
    for (i = 0; i < totalUsers; i++) {
      userDetails[userName[i]] = userColor[i]
    }
    
    console.log('user details: ' + userName)
    io.emit('user details', userDetails)
    console.log('user count: ' + totalUsers)
    io.emit('user count', totalUsers + ' users in room:')
    console.log('user disconnected')
  })
})

server.listen(3000, () => {
  console.log('Server has been started...')
})
