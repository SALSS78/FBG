import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import "./assets/css/dash.css";
import { useNavigate } from 'react-router-dom';
import ModalAddServer from './ModalAddServer';

export default function Send({RootServer}:{RootServer:string}) {
  
  const navigate = useNavigate();
  const handleNavigation = (path: string)=>{
      navigate("/"+path)
  }

  const notify = (message:string) => toast(message);

  const [token, setToken] = useState("");
  const [user, setUser] = useState("");
  const [isLogIn, setIsLogIn] = useState(false);
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const user = localStorage.getItem("name");
    if (!storedToken) {
      setIsLogIn(false);
      navigate("/auth");
    }else{
      setToken(storedToken);
      setUser(user);
      fetchServers()
      setIsLogIn(true);
    }
  }, []);


  const sessionConfig = ()=> {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      return {
        headers:{
          'Authorization': `Bearer ${storedToken}`
        }
      } 
    }
  };
 
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFetchUsers, setIsLoadingFetchUsers] = useState(false);

  const [usersList, setUsersList] = useState('');
  const banchUsersList = (event:any) => {
    const emailArray = event.target.value.split('\n');
    setUsersList(emailArray);
  };

  const [testEmailsList, setTestEmailsList] = useState('');
  const banchTestEmailsList = (event:any) => {
    const emailArray = event.target.value.split('\n');
    setTestEmailsList(emailArray);
  };

  // server inputs
  const [name, setName] = useState('');
  const [isp, setIsp] = useState('');
  const [config, setConfig] = useState('');
  const [sendConfig, setSendConfig] = useState('');

  const [servers, setServers] = useState([]);
  const [serversSize, setServersSize] = useState(0);

  function fetchServers (){
    axios.get('http://'+RootServer+':3008/api/servers', sessionConfig())
      .then(response => {
        setServers(response.data.servers);
        setServersSize(response.data.servers.length);
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
        notify(error);
      });
  }

  // const [itemsSize, setItemsSize] = useState([]);
  const [usersSize, setUsersSize] = useState(0);
  function fetchUsers (id:string){
    axios.get('http://'+RootServer+':3008/api/emails/' + id, sessionConfig())
      .then(response => {
        // setItemsSize([...items, { name: 'New Item' }]);
        setUsersSize(response.data.length);
        setIsLoadingFetchUsers(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoadingFetchUsers(false);
      });
  }

  const [isModalAddServerOpen, setIsModalAddServerOpen] = useState(false);

  const openModalAddServer = () => {
    setIsModalAddServerOpen(true);
  };

  const closeModalAddServer = () => {
    fetchServers();
    setIsModalAddServerOpen(false);
  };

  const [selectedItems, setSelectedItems] = useState([]);
  const useServer = (server:string) => {
    // Find the selected item index
    const selectedIndex = selectedItems.findIndex(item => item.id === server);
  
    // If the selected item is already in the array, do nothing
    if (selectedIndex > -1) {
      setSelectedItems(selectedItems.filter(item => item.id !== server));
    }
    else{
      // Find the new selected item
      const selectedItem = servers.find(item => item.id === server);
      // Clear previous selection and select the new item
      setSelectedItems([selectedItem]);
    }
  };
  // const [selectedItems, setSelectedItems] = useState([]);
  // const useServer = (server:string) => {
  //   // Check if the item is already in the array
  //   const index = selectedItems.findIndex(item => item.id === server);
  //   if (index > -1) {
  //     // If the item is found, remove it from the array
  //     setSelectedItems(selectedItems.filter(item => item.id !== server));
  //   } else {
  //     // If the item is not found, add it to the arrayq
  //     const selectedItem = servers.find(item => item.id === server);
  //     setSelectedItems([...selectedItems, selectedItem]);
  //     fetchUsers(server);
  //     setIsLoadingFetchUsers(true);
  //   }
  // };

  const [serverName, setServerName] = useState('');
  const countEmails = (server:string, name:string) => {
    setServerName(name);
    fetchUsers(server);
    setIsLoadingFetchUsers(true);
  };

  function editServer(name:string, isp:string, config:string, sendConfig:string) {
    setName(name);
    setIsp(isp);
    setConfig(config);
    setSendConfig(sendConfig);
  }

  const [isOpen, setIsOpen] = useState({open:false, title:'', message:'', func:()=>{}});
  const openDialog = (title:string, message:string, func:any) => {
    setIsOpen({open:true, title, message, func});
  };

  const closeDialog = () => {
    setIsOpen({open:false, title:'', message:'', func:()=>{}});
  };

  const deleteServer = async (id:any) => {
    closeDialog();
    try {
      const response = await axios.delete('http://'+RootServer+':3008/api/server/'+id, sessionConfig());
      notify(response.data.message);
      fetchServers();
      setSelectedItems(selectedItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error:', error);
      notify(error+ "");
    }
  }

  const deleteUsers = async (id:any) => {
    closeDialog();
    axios.post('http://'+RootServer+':3008/api/emails/delete-all/', {id:id}, sessionConfig())
      .then(response => {
        fetchUsers(id);
        notify("Users deleted from " + id);
      })
      .catch(error => {
        console.log(error);
      });
  }

  const addServer = async (e:any) => {
    try {
      // const jsonSendConfig = JSON.parse(sendConfig);
      // const jsonConfig = JSON.parse(config);
      // console.log(config);
      const response = await axios.post('http://'+RootServer+':3008/api/server', { name, isp, config, sendConfig }, sessionConfig());
      notify(response.data.message);
      // setIsHiddenServerForm(true);
      setIsLoading(true);
      fetchServers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const importUsers = (id:any, name:any) => {
    closeDialog();
    notify("Start importing users to : " + name);
    try {
      const tempArray = [...usersList];
      const testEmails = [...testEmailsList];
      const chunks = [];
      const splitWithDelay = async () => {
        // If the tempArray still has elements
        if (tempArray.length) {
          // Extract 1000 elements
          const chunk = tempArray.splice(0, 1000);
          // Add the chunk to the chunks array
          chunks.push(chunk);
          const response = await axios.post('http://'+RootServer+':3008/api/import', { id:id, emails:chunk, testEmails }, sessionConfig());
          notify(response.data.message + " +" + chunk.length);
          fetchUsers(id);
          // Call splitWithDelay again after 2 seconds
          setTimeout(splitWithDelay, 1000);
        }else{
          notify("All data imported");
          fetchUsers(id);
        }
      };
      // Start the splitting process
      splitWithDelay();
    } catch (error) {
      console.error('Error:', error);
      notify(error + "");
    }
  };

  const sendEmail = async (id:any, name:any) => {
    closeDialog();
    notify("Start sending to " + name + "");
    try {
      await axios.post('http://'+RootServer+':3008/api/send', { id:id }, sessionConfig())
      .then(response => {
        notify(response.data.message);
        setSendFailed(0);
        setSendSuccess(0);
        statusSend(id, name, response.data.sendId);
      })
      .catch(error => {
        console.log(error);
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const [sendFailed, setSendFailed] = useState(0);
  const [sendSuccess, setSendSuccess] = useState(0);

  const [logs, setLogs] = useState(["", "", ""]);

  const statusSend = (id:string, name:any, sendId:string)=>{
    const path = 'http://'+RootServer+':3008/api/status/' + id + "/" + sendId;
    axios.get(path.split(' ').join(''), sessionConfig())
    .then(response => {
      const sendTotal = response.data.status.failed + response.data.status.send;
      setSendFailed(response.data.status.failed);
      setSendSuccess(response.data.status.send);
      setLogs(response.data.status.messages);
      if(usersSize !== parseInt(sendTotal)){
        setTimeout(()=>{statusSend(id, name, sendId)}, 3000);
      }else{
        notify("All data sent!");
      }
    })
    .catch(error => {
      console.log(error);
    });
  }

  const [fileContent, setFileContent] = useState('');
  const [file, setFile] = useState();

  const handleDrop = (e:any) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
          const text = event.target.result;
          setFileContent(text);
      };
      reader.readAsText(file);
  };

  const handleDragOver = (e:any) => {
      e.preventDefault();
  };

  const importUsersFile = async (id:any, name:any, file:any) => {
    closeDialog();
    const formData = new FormData();
    formData.append('id', id);
    formData.append('file', file);
    try {
      await axios.post('http://'+RootServer+':3008/api/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      })
      .then(response=>{
        notify('Start import')
        statusImport(id, response.data.importIds[0].importId);
      })
      .catch(error=>{
        notify(error);
      })
    } catch (error) {
      notify('Error uploading file : ' + error);
    }
  }

  const statusImport = (id:string, importid:string)=>{
    axios.get('http://'+RootServer+':3008/api/status/' + id + "/" + importid, sessionConfig())
    .then(response => {
      const rest = parseInt(response.data.total) - parseInt(response.data.remaining);
      setUsersSize(rest);
      setSendFailed(0);
      setSendSuccess(0);
      if(parseInt(response.data.remaining) !== 0){
        statusImport(id, importid);
      }
    })
    .catch(error => {
      console.log(error);
    });
  }

  const logout = ()=>{
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    setIsLogIn(false);
    navigate("/auth");
  }

  return (
    <>
    {isLogIn && (
      <div className="bg-gray-100 dark:bg-gray-900 dark:text-white text-gray-600 h-screen flex overflow-hidden text-sm">

        {isOpen.open && (
          <div className="overlay">
            <div className="dialog">
              <h2>{isOpen.title}</h2>
              <p>{isOpen.message}</p>
              <div className="buttons">
                <button onClick={isOpen.func}>Confirm</button>
                <button onClick={closeDialog}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 dark:border-gray-800 w-20 flex-shrink-0 border-r border-gray-200 flex-col hidden sm:flex">
          <div className="h-16 text-blue-500 flex items-center justify-center p-4 mt-3">
            <svg viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient gradientTransform="matrix(2.67 0 0 -2.67 317.23 -1808)" gradientUnits="userSpaceOnUse" id="dd" x1="-108.63" x2="-58.56" y1="-692.24" y2="-742.31">
                  <stop offset={0} stopColor="#fff" stopOpacity=".1">
                  </stop>
                  <stop offset={1} stopColor="#fff" stopOpacity={0}>
                  </stop>
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" id="bb" x1="56.9" x2="48.9" y1="102.54" y2="98.36">
                  <stop offset={0} stopColor="#a52714">
                  </stop>
                  <stop offset=".4" stopColor="#a52714" stopOpacity=".5">
                  </stop>
                  <stop offset=".8" stopColor="#a52714" stopOpacity={0}>
                  </stop>
                </linearGradient>
                <linearGradient gradientUnits="userSpaceOnUse" id="cc" x1="90.89" x2="87.31" y1="90.91" y2="87.33">
                  <stop offset={0} stopColor="#a52714" stopOpacity=".8">
                  </stop>
                  <stop offset=".5" stopColor="#a52714" stopOpacity=".21">
                  </stop>
                  <stop offset={1} stopColor="#a52714" stopOpacity={0}>
                  </stop>
                </linearGradient>
                <clipPath id="aa">
                  <path d="M143.41 47.34a4 4 0 00-6.77-2.16L115.88 66 99.54 34.89a4 4 0 00-7.08 0l-8.93 17-22.4-41.77a4 4 0 00-7.48 1.28L32 150l57.9 32.46a12 12 0 0011.7 0L160 150z">
                  </path>
                </clipPath>
              </defs>
              <g clipPath="url(#aa)">
                <path d="M32 150L53.66 11.39a4 4 0 017.48-1.27l22.4 41.78 8.93-17a4 4 0 017.08 0L160 150z" fill="#ffa000">
                </path>
                <path d="M106 9L0 0v192l32-42L106 9z" fill="url(#bb)" opacity=".12">
                </path>
                <path d="M106.83 96.01l-23.3-44.12L32 150l74.83-53.99z" fill="#f57c00">
                </path>
                <path d="M0 0h192v192H0z" fill="url(#cc)" opacity=".2">
                </path>
                <path d="M160 150L143.41 47.34a4 4 0 00-6.77-2.16L32 150l57.9 32.47a12 12 0 0011.7 0z" fill="#ffca28">
                </path>
                <path d="M143.41 47.34a4 4 0 00-6.77-2.16L115.88 66 99.54 34.89a4 4 0 00-7.08 0l-8.93 17-22.4-41.77a4 4 0 00-7.48 1.28L32 150h-.08l.07.08.57.28L115.83 67l20.78-20.8a4 4 0 016.78 2.16l16.45 101.74.16-.1zM32.19 149.81L53.66 12.39a4 4 0 017.48-1.28l22.4 41.78 8.93-17a4 4 0 017.08 0l16 30.43z" fill="#fff" fillOpacity=".2">
                </path>
                <path d="M101.6 181.49a12 12 0 01-11.7 0l-57.76-32.4-.14.91 57.9 32.46a12 12 0 0011.7 0L160 150l-.15-.92z" fill="#a52714" opacity=".2" style={{isolation: 'isolate'}}>
                </path>
                <path d="M143.41 47.34a4 4 0 00-6.77-2.16L115.88 66 99.54 34.89a4 4 0 00-7.08 0l-8.93 17-22.4-41.77a4 4 0 00-7.48 1.28L32 150l57.9 32.46a12 12 0 0011.7 0L160 150z" fill="url(#dd)">
                </path>
              </g>
            </svg>
          </div>
          <div className="flex mx-auto flex-grow mt-4 flex-col text-gray-400 space-y-4">
            <button className="anime-1 h-10 w-12 dark:bg-gray-700 dark:text-white rounded-md flex items-center justify-center bg-blue-100 text-blue-500">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="h-5" viewBox="0,0,255.99609,255.99609"><g fill="none" fillRule="nonzero" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeDasharray={0} strokeDashoffset={0} fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: 'normal'}}><g transform="scale(5.33333,5.33333)"><path d="M26.1,15.8l-15.9,-7.9c-1.6,-0.9 -3.4,0.8 -2.7,2.5l5.5,13.6l-5.5,13.6c-0.7,1.7 1.1,3.4 2.7,2.5l3,-1.5" /><path d="M18.8,35.8l20.1,-10c1.5,-0.7 1.5,-2.8 0,-3.6l-8,-4" /><path d="M39.7,24h-20.9" /></g></g></svg>
            </button>
            <button onClick={() => {handleNavigation('email-generator')}} className="anime-1 h-10 w-12 dark:text-gray-500 rounded-md flex items-center justify-center">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="h-5" viewBox="0,0,255.99609,255.99609"><g fill="none" fillRule="nonzero" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeDasharray={0} strokeDashoffset={0} fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: 'normal'}}><g transform="scale(5.33333,5.33333)"><path d="M16.3,27.7c-0.5,-1.1 -0.8,-2.4 -0.8,-3.7c0,-4.7 3.4,-8.5 7.5,-8.5c4.1,0 7.5,3.8 7.5,8.5c0,4.7 -3.4,8.5 -7.5,8.5c-1.2,0 -2.3,-0.3 -3.3,-0.9" /><path d="M5.6,26.1c1,9.2 8.9,16.4 18.4,16.4c2.3,0 4.5,-0.4 6.5,-1.2" /><path d="M30.5,15.5v11c0,3.3 2.7,6 6,6v0c3.3,0 6,-2.7 6,-6v-2.5c0,-10.2 -8.3,-18.5 -18.5,-18.5c-8.7,0 -16,6 -18,14.1" /></g></g></svg>
            </button>
            <button onClick={() => {handleNavigation('suppression-list-cleaner')}} className="anime-1 h-10 w-12 dark:text-gray-500 rounded-md flex items-center justify-center">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="h-5" viewBox="0,0,255.99609,255.99609"><g fill="none" fillRule="nonzero" stroke="currentColor" strokeWidth="none" strokeLinecap="inherit" strokeLinejoin="inherit" strokeMiterlimit={10} strokeDasharray={0} strokeDashoffset={0} fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: 'normal'}}><g transform="scale(5.33333,5.33333)"><path d="M23.5,15v0c-0.828,0 -1.5,-0.672 -1.5,-1.5v0c0,-0.829 -0.672,-1.5 -1.5,-1.5c-0.828,0 -1.5,0.671 -1.5,1.5v0c0,0.828 -0.672,1.5 -1.5,1.5v0c-0.828,0 -1.5,0.671 -1.5,1.5c0,0.829 0.672,1.5 1.5,1.5v0c0.828,0 1.5,0.672 1.5,1.5v0c0,0.829 0.672,1.5 1.5,1.5c0.828,0 1.5,-0.671 1.5,-1.5v0c0,-0.828 0.672,-1.5 1.5,-1.5v0c0.828,0 1.5,-0.671 1.5,-1.5c0,-0.829 -0.672,-1.5 -1.5,-1.5z" fill="currentColor" stroke="none" strokeWidth={1} strokeLinecap="butt" strokeLinejoin="miter" /><path d="M34.5,29v0c-0.828,0 -1.5,-0.672 -1.5,-1.5v0c0,-0.829 -0.672,-1.5 -1.5,-1.5c-0.828,0 -1.5,0.671 -1.5,1.5v0c0,0.828 -0.672,1.5 -1.5,1.5v0c-0.828,0 -1.5,0.671 -1.5,1.5c0,0.829 0.672,1.5 1.5,1.5v0c0.828,0 1.5,0.672 1.5,1.5v0c0,0.829 0.672,1.5 1.5,1.5c0.828,0 1.5,-0.671 1.5,-1.5v0c0,-0.828 0.672,-1.5 1.5,-1.5v0c0.828,0 1.5,-0.671 1.5,-1.5c0,-0.829 -0.672,-1.5 -1.5,-1.5z" fill="currentColor" stroke="none" strokeWidth={1} strokeLinecap="butt" strokeLinejoin="miter" /><path d="M13.5,27v0c-0.828,0 -1.5,-0.672 -1.5,-1.5v0c0,-0.829 -0.672,-1.5 -1.5,-1.5c-0.828,0 -1.5,0.671 -1.5,1.5v0c0,0.828 -0.672,1.5 -1.5,1.5v0c-0.828,0 -1.5,0.671 -1.5,1.5c0,0.829 0.672,1.5 1.5,1.5v0c0.828,0 1.5,0.672 1.5,1.5v0c0,0.829 0.672,1.5 1.5,1.5c0.828,0 1.5,-0.671 1.5,-1.5v0c0,-0.828 0.672,-1.5 1.5,-1.5v0c0.828,0 1.5,-0.671 1.5,-1.5c0,-0.829 -0.672,-1.5 -1.5,-1.5z" fill="currentColor" stroke="none" strokeWidth={1} strokeLinecap="butt" strokeLinejoin="miter" /><path d="M40.5,21.353v16.147c0,1.657 -1.343,3 -3,3h-27c-1.657,0 -3,-1.343 -3,-3v-1.652" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /><path d="M7.5,23v-12.5c0,-1.657 1.343,-3 3,-3h27c1.657,0 3,1.343 3,3v2.342" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></g></g></svg>
            </button>
          </div>
          <div className="flex px-2 flex-grow mt-4" style={{display: 'grid', alignItems: 'end'}}>
            <span
            onClick={()=>{openDialog('Logout', 'You sure you want to quit ?', ()=>{logout()})}}
            className='anime-2 bg-white shadow dark:bg-gray-700 text-gray-900 dark:text-white text-xs w-full px-3 py-2 mb-2 rounded-md' style={{textAlign: 'center'}}>{user}</span>
          </div>
        </div>
        <div className="flex-grow overflow-hidden h-full flex flex-col">
          <div className="flex-grow flex overflow-x-hidden">
            
            <div className="flex-grow bg-white dark:bg-gray-900 overflow-y-auto">
              
              <div className="sm:p-4 px-4 pt-4 flex flex-col w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:text-white dark:border-gray-800 sticky top-0">
                <div className="flex w-full items-center mb-0">
                  <div className='w-full'>
                    <div className="text-left">
                        <div className="text-xs text-gray-400 dark:text-gray-400 mb-2 nowrap">Choosed Server</div>
                        <div className='flex usedServers'>
                          <span className="">
                            {selectedItems.length}
                          </span>
                          {selectedItems.map(item => (
                            <span key={item.id} className="nowrap">
                                {item.name}
                            </span>
                          ))}
                        </div>
                    </div>
                  </div>
                  <div className="ml-auto w-full sm:flex hidden items-center justify-center">
                    <div className="flex" style={{justifyContent: "center"}}>
                      <div className="text-xs text-white rounded-md bg-red shadow anime-1" style={{padding:".75rem 1.25rem",textWrap:"nowrap", textAlign: 'center', lineHeight:"20px"}}>Failed Send {sendFailed}</div>
                      <div className="text-xs text-gray-900 rounded-md bg-white shadow anime-1" style={{padding:".75rem 1.25rem",textWrap:"nowrap", textAlign: 'center', lineHeight:"20px", margin:"0 1rem"}}>Total Data {usersSize}</div>
                      <div className="text-xs text-white rounded-md bg-green shadow anime-1" style={{padding:".75rem 1.25rem",textWrap:"nowrap", textAlign: 'center', lineHeight:"20px"}}>Sent Success {sendSuccess}</div>
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="text-right">
                      <div className="text-xs text-gray-400 dark:text-gray-400 mb-2 nowrap">Data Counter</div>
                      {
                      isLoadingFetchUsers ? (
                        // <div className='flex justify-center items-center' style={{width:"100%"}}>
                        //   <img alt='' src='https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif' style={{height:"21px", padding:"0px"}}/>
                        // </div>
                        <div className="text-gray-900 text-lg dark:text-white nowrap">Counting emails of <span style={{color:'#ffcb33'}}>{serverName}</span> ...</div>
                      ) :
                        <div className="text-gray-900 text-lg dark:text-white nowrap">{usersSize} emails in <span style={{color:'#ffcb33'}}>{serverName}</span></div>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:px-4 px-4">

                <div className="flex-shrink-0 border-gray-200 dark:border-gray-800 h-full overflow-y-auto lg:block hidden p-0 mt-4">
                  <div className="flex">
                    <div className="text-xs text-gray-400 tracking-wider px-2 py-1" style={{textWrap:"nowrap", display: 'inline-grid', alignItems: 'center'}}>Servers : {serversSize} - Send limit : {10*serversSize}k/day</div>
                    <div style={{width:"100%"}}/>
                    <div onClick={openModalAddServer} style={{display: 'inline-grid', alignItems: 'center'}} className="text-xs text-gray-400 tracking-wider px-2 py-1 mr-2 rounded-md anime-btn-c">Add Server</div>
                    <button
                    onClick={()=>{openDialog('Sending offer', 'Send offer to users in ' + selectedItems[0].name + ' ?', ()=>{sendEmail(selectedItems[0].id, selectedItems[0].name)})}}
                    className="bg-blue px-4 py-1 text-white rounded-md flex items-center justify-center anime-2" style={{textWrap:"nowrap"}}>Send</button>
                  </div>
                </div>

                <div className="squaregrid"  style={{marginTop:"1rem"}}>
                  {
                    isLoading ? (
                      <div className='flex justify-center items-center' style={{width:"100%", marginTop:"1rem"}}>
                        <img alt='' src='https://ricordami.com/cdn/shop/t/7/assets/loading.gif?v=157493769327766696621685635774' width={70}/>
                      </div>
                    ) :
                    servers.map((server, index) => (
                      <button
                      key={index}
                      onClick={()=>{useServer(server.id)}}
                      className={`bg-white p-2 w-full flex flex-col rounded-md dark:bg-gray-800 shadow ${selectedItems.some(selectedItem => selectedItem.id === server.id) ? 'selected-server' : ''}`}>
                        <div className="items-center font-medium text-gray-900 dark:text-gray-100 pb-2 mb-1 w-full">
                          <span className='flex w-full justify-center pb-3 mt-1 xl:border-b xl:border-b border-gray-200 border-opacity-75 dark:border-gray-700'>{server.name}</span>
                        </div>
                        <div className="flex items-center w-full">
                          <div className="text-xs py-1 px-2 leading-none dark:bg-gray-900 bg-blue-100 text-gray-500 rounded-md" style={{lineHeight:'18px'}}>{server.isp.split("@")[0]}@•••</div>
                          <div onClick={(e)=>{e.stopPropagation(); countEmails(server.id, server.name)}} className="me-1 ml-auto p-1 text-xs text-gray-500 rounded-full anime-btn-c">
                            <img alt='' src="https://img.icons8.com/fluency-systems-regular/80/ffffff/recurring-appointment.png" width={18}/>
                          </div>
                          <div onClick={(e)=>{e.stopPropagation(); editServer(server.id, server.isp, server.config, server.sendConfig)}} className="me-1 p-1 text-xs text-gray-500 rounded-full anime-btn-b">
                            <img alt='' src="https://img.icons8.com/fluency-systems-regular/80/ffffff/create-new.png" width={18}/>
                          </div>
                          <div onClick={(e)=>{e.stopPropagation(); openDialog('Delete Project.', 'Are you sure you want to delete this project ' + server.name + ' ?', ()=>{deleteServer(server.id)})}} className="me-1 p-1 text-xs text-gray-500 rounded-full anime-btn-a">
                            <img alt='' src="https://img.icons8.com/fluency-systems-regular/80/ffffff/delete.png" width={18}/>
                          </div>
                          <div onClick={(e)=>{e.stopPropagation(); openDialog('Remove Emails From Project.', 'You sure you want to remove all emails from ' + server.name + ' ?', ()=>{deleteUsers(server.id)})}} className="p-1 text-xs text-gray-500 rounded-full anime-btn-a">
                            <img alt='' src="https://img.icons8.com/fluency-systems-regular/80/ffffff/erase.png" width={18}/>
                          </div>
                        </div>
                      </button>
                    ))
                  }
                </div>
                <div className='p-4'>{logs?.map(log=>(<div>{log}</div>))}</div>
                {/* <div className='flex pb-3'>
                  <button className="px-4 py-2 mr-4 dark:bg-gray-700 dark:text-white rounded-md flex items-center justify-center bg-blue-100 text-blue-500" style={{textWrap:"nowrap"}}>HTML / Compile</button>
                  <button style={{width:"100%", visibility:"hidden"}}></button>
                  <button
                  onClick={()=>{openDialog('Send offer!.', 'Send offer to users in ' + selectedItems.name + ' ?', ()=>{sendEmail(selectedItems, selectedItems)})}}
                  className="bg-green px-4 py-2 dark:text-white rounded-md flex items-center justify-center" style={{textWrap:"nowrap"}}>Send Offer</button>
                </div>
                <textarea style={{maxHeight: "calc(100vh - 210px)", minHeight: "calc(100vh - 210px)"}} placeholder="Offer html.." className="p-4 h-100 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-xs"></textarea> */}
              </div>

            </div>

            <div className="xl:w-72 w-48 flex-shrink-0 border-l bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 h-full lg:block hidden p-4">
              {/* <div className='flex'>
                <input 
                  type="text"
                  placeholder='Test email'
                  style={{padding:'.5rem'}}
                  className="my-5 h-9 w-70 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white rounded-md text-sm"
                  onChange={(e) => setIsp(e.target.value)}
                />
                <input
                  type="number"
                  placeholder='1000'
                  style={{padding:'.5rem'}}
                  className="my-5 h-9 ms-2 w-30 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white rounded-md text-sm"
                  onChange={(e) => setIsp(e.target.value)}
                />
              </div> */}

              <div className="text-xs text-gray-400 tracking-wider">
                Test Emails<br/> * put email per line
              </div>
              <div className="relative mt-2">
                <textarea onChange={banchTestEmailsList} style={{minHeight: "calc(14vh)"}} placeholder="email@mail.ex" className="p-4 h-100 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-xs"></textarea>
              </div>

              <div className="text-xs text-gray-400 tracking-wider mt-2">
                Users uploaded directly to firebase<br/> * drag and drop .txt file
              </div>
              <div className="relative mt-2">
                <div
                className="p-4 h-100 bg-gray-200 dark:bg-gray-800  border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-xs"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  style={{
                    textAlign: 'center',
                    // maxHeight: "calc(25vh)",
                    minHeight: "calc(25vh)",
                    display: "inline-grid",
                    alignItems: "center"
                  }}
                >
                  <h3>Drag & Drop .txt file here</h3>
                  {fileContent && (
                    <div>
                      {/* <h4 className='p-3'>File Content:</h4> */}
                      <div className='w-full mt-3' style={{display:"inline-grid", overflow:"hidden", maxHeight: "calc(50vh - 270px)"}}>
                        {fileContent.split('\n').slice(0, 10).map((email, index) => (
                          <span className='bg-gray-200 dark:bg-gray-900 p-1' style={{borderRadius:".5rem", margin:".1rem"}} key={index}>{email}</span>
                        ))}
                      </div>
                      <h4 className='mt-3'>Total Records : {fileContent.split('\n').length} emails</h4>
                    </div>
                  )}
                </div>
                {/* <textarea disabled style={{maxHeight: "calc(100vh - 135px)", minHeight: "calc(100vh - 135px)"}} placeholder="email@mail.ex" className="p-4 h-100 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-xs"></textarea> */}
              </div>
              <div className="space-y-4 mt-4">
                <button className="bg-blue px-3 py-2 w-full flex text-white flex-col rounded-md shadow items-center anime-2"
                onClick={()=>{openDialog('Import Users', 'Import these users from file to ' + selectedItems[0].name, ()=>{importUsersFile(selectedItems[0].id, selectedItems[0].name, file)})}}>
                  Import
                </button>
              </div>

              <div className="text-xs text-gray-400 tracking-wider mt-4">
                Emails uploaded directly to firebase<br/> * put email per line
              </div>
              <div className="relative mt-2">
                <textarea onChange={banchUsersList} style={{minHeight: "calc(21.5vh)"}} placeholder="email@mail.ex" className="p-4 h-100 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-xs"></textarea>
              </div>
              <div className="space-y-4 mt-3">
                <button className="bg-blue px-3 py-2 w-full text-white flex flex-col rounded-md shadow items-center anime-2"
                onClick={()=>{openDialog('Import Users', 'Import these inline users to ' + selectedItems[0].name, ()=>{importUsers(selectedItems[0].id, selectedItems[0].name)})}}>
                  Import
                </button>
              </div>
              
            </div>

          </div>
        </div>
      </div>
    )}
    <ToastContainer position='bottom-center' autoClose={1000} closeButton={false} pauseOnHover={true} className='p-0' />
    <ModalAddServer isOpen={isModalAddServerOpen} onClose={closeModalAddServer} RootServer={RootServer}/>
    </>
  );
}
