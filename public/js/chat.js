const socket=io()

const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')

socket.on('message',(message)=>{
    console.log(message)
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

const $sendLocationButton=document.querySelector('#send-location')

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









//increment example
// socket.on('countUpdated',(count)=>{
//     console.log('The count has been updated',count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('Clicked')
//     socket.emit('increment')
// })