const express = require('express');
const app = express();
const cors = require("cors")
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,{
  cors:{
    origin:"http://localhost:3000",
    credentials:true
  },
  
});

let animalInfo = [
  {
     
    anmId: '4356',
  },
  {
     
    anmId: '4355',
  },
  {
   anmId: '4354',
  },
  {
     
    anmId: '4353',
  },
  {
     
    anmId: '4352',
  },
  {
     
    anmId: '4351',
  },
  {
     
    anmId: '4350',
  },
  {
     
    anmId: '4249',
  },
];
let userDatas = []
const rooms = {};

let glbRoomId = ""
let boardArr;
let counter = 0

app.get('/', (req, res) => {
  ///console.log('giefw');
  res.send('Hello World!'); 
});

io.on('connection', (socket) => {
  console.log('a user connected: id' + socket.id);

  // Handle disconnection event
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  socket.on('createGame', (data)=>{
    console.log('going to create a new game....')
    const roomUniqueId = makeid(4);
    rooms[roomUniqueId] = {};
    socket.join(roomUniqueId);
    socket.emit("newGame", {roomUniqueId: roomUniqueId})
    let userObj = {socketId:socket.id, userName:data.userName}
    userDatas.push(userObj)
  })

  socket.on('joinGame', (data)=>{
    if(rooms[data.roomUniqueId] != null) {
      boardArr = createBoard()
      glbRoomId = data.roomUniqueId
      socket.join(data.roomUniqueId);
     // console.log(boardArr)
      socket.to(data.roomUniqueId).emit("playersConnected", {boardData:boardArr, socketId:socket.id });
      socket.emit("playersConnected", {boardData:boardArr,socketId:socket.id});
      //socket.to(data.roomUniqueId).emit("playersConnected", {});
      //socket.emit("playersConnected", {});
      let userObj = {socketId:socket.id, userName:data.userName}
      userDatas.push(userObj)
    }
  })

  socket.on('sqClicked', (data)=>{
   // console.log(userDatas)
    const updatedBoardArr = data.exisBoardInfo.map(item => {
      if (item.id === data.sqId) {
        return {
          ...item, // Spread the existing item properties
          dispState: true // Update the dispState
        };
      } else {
        return item; // Return the unchanged item
      }
    });
    //boardArr = updatedBoardArr
    socket.emit("sqClickUpdated", {boardArr:updatedBoardArr})
    socket.to(glbRoomId).emit("sqClickUpdated", {boardArr:updatedBoardArr})
  })

  socket.on('sqClose', (data)=>{
    console.log(data)
    let updatedBoardArr = data.exisBoardInfo.slice(); // Make a copy of the existing board array
    data.sqObj.forEach((sq) => {
      updatedBoardArr.forEach((item, index) => {
        if (item.id === sq.id) {
          updatedBoardArr[index] = {
            ...item, // Spread the existing item properties
            dispState: false // Update the dispState
          };
        }
      });
    });
  
    socket.emit("sqClickUpdated", { boardArr: updatedBoardArr });
    socket.to(glbRoomId).emit("sqClickUpdated", { boardArr: updatedBoardArr });
  });
  

  
  socket.on("nextUser", ()=>{
    let getPlayer = swapPlayers()
    console.log(getPlayer)
    socket.emit("currPlayer", {userObj:getPlayer})
    socket.to(glbRoomId).emit("currPlayer", {userObj:getPlayer})
  })

  socket.on('scoreUpdated', (scoreData)=>{
    socket.to(glbRoomId).emit("opponentScrUpdated", {score:scoreData.score})
  })
});



// Start the server
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

function makeid(length) {
  let result           = '';
  let characters       = '0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function swapPlayers(){
  let userObj = userDatas[counter]
  if(counter==1){
    counter = -1
  }
  counter++
  return userObj
}

function createBoard() {
  let getPairs = pairSq();
  let sqArr = [];
  let getAnmInfo = [...animalInfo];
  for (let i = 0; i < getPairs.length; i++) {
    const randIndex = Math.floor(Math.random() * getAnmInfo.length);
    const randVal = getAnmInfo[randIndex];
    for (let j = 0; j < getPairs[i].pairs.length; j++) {
      let sqObj = {
        id: getPairs[i].pairs[j],
        animalId: randVal.anmId,
       // img randVal.src,
        dispState: false,
      };
      sqArr.push(sqObj);
    }
    getAnmInfo.splice(randIndex, 1);
  }

  // Sort the squares based on their IDs
  sqArr.sort((a, b) => a.id - b.id);
  return sqArr
  //setBoardArr(sqArr);
}

function pairSq() {
  let pairedObj = [];
  const numsArr = [];
  for (let i = 0; i <= 15; i++) {
    numsArr.push(i);
  }

  let twoNumArr = [];

  while (numsArr.length > 0) {
    for (let i = 0; i < 2; i++) {
      const randIndex = Math.floor(Math.random() * numsArr.length);
      const randVal = numsArr[randIndex];
      twoNumArr.push(randVal);
      numsArr.splice(randIndex, 1);
    }
    pairedObj.push({ pairs: twoNumArr });
    twoNumArr = []; // Resetting the array for the next pair
  }
  return pairedObj;
}
