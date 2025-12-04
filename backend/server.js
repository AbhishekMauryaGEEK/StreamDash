import express from "express"
const app = express();
app.get('/on', (req, res) => {
    res.send(`<a href="http://localhost:${port}/it"><button>route change</button></a>`);
});
app.use(express.static('dist'))
app.get('/api/jokes', (req, res) => {
    const jokes = [
        {
            id: 1,
            title: "A joke",
            content: "This is a joke"
        },
        {
            id: 2,
            title: "Office joke",
            content: "Why did the developer go broke? Because he used up all his cache."
        },
        {
            id: 3,
            title: "Bug joke",
            content: "I would tell you a joke about UDP, but you might not get it."
        },
        {
            id: 4,
            title: "Coffee joke",
            content: "Why do programmers prefer dark mode? Because light attracts bugs."
        },
        {
            id: 5,
            title: "Array joke",
            content: "I'd tell you a joke about arrays, but it's out of bounds."
        },
        {
            id: 6,
            title: "Logic joke",
            content: "There are 10 types of people in the world: those who understand binary and those who don't."
        },{
            id:7,
            title:"wow ji",
            content:"there is no joke"
        }
    ];
    res.send(jokes);
})
app.get('/it', (req, res) => {
    res.send(`<a href="http://localhost:${port}/on"><button>route change</button></a>`)
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`💠  server at http://localhost:${port}  💠 `);
});
