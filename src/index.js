const express=require('express')
const path=require('path')
const http=require('http')
const socketio=require('socket.io')
const Filter=require('bad-words')
const { generateMessage,generateLocationMessage}=require('./utils/messages')
const { addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')


const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port=3000
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    console.log('new connection')

    // sends message to everyone except the given user
    // socket.broadcast.emit('message',generateMessage('A new user has joined'))
    
    socket.on('join',(options,callback)=>{
        const {error,user}=addUser({id:socket.id,...options})

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message',generateMessage('admin',"Welcome!"))
        socket.broadcast.to(user.room).emit('message',generateMessage('admin',`${user.username} has joined`))

        io.to(user.room).emit('roomData',{
            room: user.room,
            users:getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage',(message,callback)=>{
        const filter= new Filter()
        const user=getUser(socket.id)

        //checks for abusive language
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation',(coords,callback)=>{
        const user=getUser(socket.id)
        if(user){
            io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))

        }
        callback()
    })

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage('admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users:getUsersInRoom(user.room)
            })
        }

    })
})

server.listen(port, ()=>{
    console.log('Server up and running at',port)
})




//Increment example

// let count=0;
// io.on('connection',(socket)=>{
//     console.log("new websocket connection")
//     socket.emit('countUpdated',count)

//     socket.on('increment',()=>{
//         count++
//         // socket.emit('countUpdated',count)
//         io.emit('countUpdated',count)
//     })
// })