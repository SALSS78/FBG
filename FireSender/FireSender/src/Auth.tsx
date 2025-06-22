
import { useEffect, useState } from 'react';
import "./assets/css/dash.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Auth({RootServer}:{RootServer:string}) {

  const notify = (message:string) => toast(message);
  
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      navigate("/");
    }
  }, []);

  const [name, setUser] = useState('');
  const [password, setPassword] = useState('');
  
  const connect = async () => {
    axios.post('http://'+RootServer+':3008/login', {name, password})
    .then(response => {
      const message = response.data.message;
      const token = response.data.token;
      notify("Auth Success.");
      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
      navigate("/");
    })
    .catch(error => {
      const result = error;
      notify("Invalid Credentials!");
    });
  }

  return (
    <>
      <div className="bg-gray-100 w-full dark:bg-gray-900 dark:text-white text-gray-600 h-screen flex overflow-hidden text-sm"
        style={{
          display: "inline-grid",
          justifyItems: "center",
          alignItems: "center",
        }}>

        <div>
          <input value={name} onChange={(e) => setUser(e.target.value)} type="text" className="p-3 mb-2 h-9 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-sm" placeholder="user" style={{marginBottom:"1rem"}} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="p-3 mb-4 h-9 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-sm" placeholder="password" style={{marginBottom:"1rem"}} />
          <button className="bg-blue px-3 py-2 mb-4 w-full flex flex-col text-white rounded-md shadow items-center" onClick={connect}>Connect</button>
        </div>

      </div>
      <ToastContainer position='bottom-center' autoClose={1000} closeButton={false} pauseOnHover={true} className='p-0' />
    </>
  );
}
