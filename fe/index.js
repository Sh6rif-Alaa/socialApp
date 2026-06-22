const clientIo = io("http://localhost:3000", {
    auth: {
        authorization: localStorage.getItem('authorization')
    }
})

clientIo.emit("message", "hi from frontend", (data) => {
    console.log(data)
})

// clientIo.on("message", (data) => {
//     console.log(data)
// })