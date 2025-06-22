import { useState } from 'react';
import './assets/css/modal.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ModalAddServer ({ isOpen, onClose, RootServer } : { isOpen:any, onClose:any, RootServer:any }) {

  const notify = (message:string) => toast(message);

  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  // server inputs
  const [name, setName] = useState('');
  const [isp, setIsp] = useState('');
  const [config, setConfig] = useState('');
  const [sendConfig, setSendConfig] = useState('');

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

  const addServer = async (e:any) => {
    try {
      const response = await axios.post('http://'+RootServer+':3008/api/server', { name, isp, config, sendConfig }, sessionConfig());
      notify(response.data.message);
      onClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="modal-overlay bg-transparent-light dark:bg-transparent-dark">
      <div className="modal dark:bg-gray-900 bg-white">
        <div className='flex w-full bg-gray-200 dark:bg-gray-800' style={{padding:"1.3rem 1.5rem", borderTopLeftRadius: '.75rem', borderTopRightRadius: '.75rem'}}>
          <h2 className='text-lg text-gray-700 dark:text-white' style={{whiteSpace:"nowrap"}}>Add Server</h2>
          <div className='w-full'/>
          <button className="modal-close-button text-white anime-1 bg-blue" onClick={onClose}>X</button>
        </div>
        {currentStep === 1 && (
          <div className="modal-content">

            <div className='steps'>
              <div className='step active'>
                <h2 className='text-xs text-gray-900 dark:text-white'>Name</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>1</p></span>
              </div>
              <div className='step'>
                <h2 className='text-xs text-gray-900 dark:text-gray-600'>ISP</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>2</p></span>
              </div>
              <div className='step'>
                <h2 className='text-xs text-gray-900 dark:text-gray-600'>Config</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>3</p></span>
              </div>
              <div className='step'>
                <h2 className='text-xs text-gray-900 dark:text-gray-600'>Send Config</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>4</p></span>
              </div>
            </div>

            <input 
              type="text"
              placeholder='Name'
              value={name}
              className="p-3 my-5 h-9 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-sm"
              onChange={(e) => setName(e.target.value)}
            />

            <div className='w-full flex'>
              <div className='w-full'/>
              <button className='next text-xs bg-blue px-4 py-2 text-white rounded-md flex items-center justify-center anime-2' onClick={handleNext}>Next</button>
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div className="modal-content">

            <div className='steps'>
              <div className='step active'>
                <h2 className='text-xs text-gray-900 dark:text-white'>Name</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>1</p></span>
              </div>
              <div className='step active'>
                <h2 className='text-xs text-gray-900 dark:text-white'>ISP</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>2</p></span>
              </div>
              <div className='step'>
                <h2 className='text-xs text-gray-900 dark:text-gray-600'>Config</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>3</p></span>
              </div>
              <div className='step'>
                <h2 className='text-xs text-gray-900 dark:text-gray-600'>Send Config</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>4</p></span>
              </div>
            </div>

            <input 
              type="text"
              value={isp}
              placeholder='ISP'
              className="p-3 my-5 h-9 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-sm"
              onChange={(e) => setIsp(e.target.value)}
            />

            <div className='w-full flex'>
              <button className='Previous text-xs bg-blue px-4 py-2 text-white rounded-md flex items-center justify-center anime-2' onClick={handlePrevious}>Previous</button>
              <div className='w-full'/>
              <button className='next text-xs bg-blue px-4 py-2 text-white rounded-md flex items-center justify-center anime-2' onClick={handleNext}>Next</button>
            </div>

          </div>
        )}
        {currentStep === 3 && (
          <div className="modal-content">

            <div className='steps'>
              <div className='step active'>
                <h2 className='text-xs text-gray-900 dark:text-white'>Name</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>1</p></span>
              </div>
              <div className='step active'>
                <h2 className='text-xs text-gray-900 dark:text-white'>ISP</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>2</p></span>
              </div>
              <div className='step active'>
                <h2 className='text-xs text-gray-900 dark:text-white'>Config</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>3</p></span>
              </div>
              <div className='step'>
                <h2 className='text-xs text-gray-900 dark:text-gray-600'>Send Config</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>4</p></span>
              </div>
            </div>
            
            <textarea value={config} onChange={(e) => setConfig(e.target.value)} style={{minHeight: "calc(260px)"}}
            placeholder='Config Example :

    {
        "type":".........",
        "project_id":".........",
        "private_key_id":".........",
        "private_key":".........",
        "client_id":".........",
        "auth_uri":".........",
        "token_uri":".........",
        "auth_pro....cert_url":".........",
        "client_x509_cert_url":".........",
        "universe_domain":"........."
    }'
            className="p-3 my-5 w-full bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-xs"></textarea>

            <div className='w-full flex'>
              <button className='Previous text-xs bg-blue px-4 py-2 text-white rounded-md flex items-center justify-center anime-2' onClick={handlePrevious}>Previous</button>
              <div className='w-full'/>
              <button className='next text-xs bg-blue px-4 py-2 text-white rounded-md flex items-center justify-center anime-2' onClick={handleNext}>Next</button>
            </div>

          </div>
        )}
        {currentStep === 4 && (
          <div className="modal-content">

            <div className='steps'>
              <div className='step active'>
                <h2 className='text-xs text-gray-900 dark:text-white'>Name</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>1</p></span>
              </div>
              <div className='step active'>
                <h2 className='text-xs text-gray-900 dark:text-white'>ISP</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>2</p></span>
              </div>
              <div className='step active'>
                <h2 className='text-xs text-gray-900 dark:text-white'>Config</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>3</p></span>
              </div>
              <div className='step active'>
                <h2 className='text-xs text-gray-900 dark:text-white'>Send Config</h2>
                <span className=''><p className='text-xs border-white dark:border-gray-900'>4</p></span>
              </div>
            </div>
            
            <textarea value={sendConfig} onChange={(e) => setSendConfig(e.target.value)} style={{minHeight: "calc(260px)"}}
            placeholder='Send Config Example :

    {
        "apiKey":".........",
        "authDomain":".........",
        "projectId":".........",
        "storageBucket":".........",
        "messagingSenderId":".........",
        "appId":".........",
        "measurementId":"........."
    }'
            className="p-3 my-5 w-full bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-xs"></textarea>

            <div className='w-full flex'>
              <button className='Previous text-xs bg-blue px-4 py-2 text-white rounded-md flex items-center justify-center anime-2' onClick={handlePrevious}>Previous</button>
              <div className='w-full'/>
              <button className='Previous text-xs bg-green px-4 py-2 text-white rounded-md flex items-center justify-center anime-2' onClick={addServer}>Submit</button>
            </div>

          </div>
        )}
      </div>
    <ToastContainer position='bottom-center' autoClose={1000} closeButton={false} pauseOnHover={true} className='p-0' />
    </div>
  );
};