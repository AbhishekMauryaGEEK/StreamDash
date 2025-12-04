import { useEffect, useState } from "react";
import axios from 'axios';
function App() {
  const [jokes, setjokes] = useState([]);
  useEffect(() => {
    axios.get('/api/jokes').then((response) => {
      setjokes(response.data);
    })
      .catch((error) => {
        console.log(error);
      })
  })
  return (
    <div>
      <h2>Abhi frontend</h2>
      <h2>jokes {jokes.length}</h2>
      {
        jokes.map((item,) => {
          return (
            <div key={item.id}>
              <h2>{item.id}</h2>
              <h2>{item.title}</h2>
              <h2>{item.content}</h2>
            </div>
          )

        })
      }
    </div>
  )
}
export default App;