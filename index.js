require('dotenv').config()
const express = require('express')
const app = express()
const port = 4000

app.get('/', (req, res) => {
  res.send('Hello Worflddd!')
})
app.get('/x',(req,res)=>{
    res.send('sa2bfdg1ssaaaaaaa3')
})
app.get('/grape',(req,res)=>{
    res.send('<h2>kawai</h2>')
})
app.get('/youtube',(req,res)=>{
  res.send("<button>click me </button>")
})
app.listen(process.env.port, () => {
  console.log(`Example app listening on port ${port}`)
})
 