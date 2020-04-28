const socket=io()

//elements
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $messages=document.querySelector('#messages')
const $sendLocationButton=document.querySelector('#send-location')

//Templates
const $messageTemplate=document.querySelector('#message-template').innerHTML
const $locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const $sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoscroll=()=>{
    const $newMessage=$messages.lastElementChild

    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

    const visibleHeight=$messages.offsetHeight

    const containerHeight=$messages.scrollHeight
    
    const scrollOffset=$messages.scrollTop+visibleHeight

    // if(containerHeight - newMessageHeight<= scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    // }
}

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render($messageTemplate,{
        username:message.username ,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm, a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render($locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm, a')
    })
    

    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    //disables the button till it is sent
    $messageFormButton.setAttribute('disabled','disabled')

    const message=e.target.message.value 

    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value=''
    $messageFormInput.focus()

    socket.emit('sendMessage',message,(error)=>{
        if(error){
            return console.log(error)
        }

        console.log("Message delievered")
    })
})


$sendLocationButton.addEventListener('click',()=>{

    $sendLocationButton.setAttribute('disabled','disabled')

    if(!navigator.geolocation){
        return alert('Geolocation unsupported')
    }

    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            console.log("Location Shared")
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})






//increment example
// socket.on('countUpdated',(count)=>{
//     console.log('The count has been updated',count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('Clicked')
//     socket.emit('increment')
// })