const express=require('express')
const path=require('path')
const http=require('http')
const socketio=require('socket.io')

const app=express()
const server=http.createServer(app)
const io=socketio(server)
const Filter=require('bad-words')

const port=3000
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    console.log('new connection')

    socket.emit('message',"Welcome")
    socket.broadcast.emit('message','A new user has joined')

    socket.on('sendMessage',(message,callback)=>{
        const filter= new Filter()

        //checks for abusive language
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        io.emit('message',message)
        callback()
    })

    socket.on('sendLocation',(coords,callback)=>{
        io.emit('message',`https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })

    socket.on('disconnect',()=>{
        io.emit('message','A user has left')
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