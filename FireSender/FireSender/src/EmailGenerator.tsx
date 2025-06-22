
import { useEffect, useState } from 'react';
import "./assets/css/dash.css";
import { useNavigate } from 'react-router-dom';

export default function EmailGenerator() {
  
  const navigate = useNavigate();
  const handleNavigation = (path: string)=>{
      navigate(path)
  }

  const [user, setUser] = useState("");
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const user = localStorage.getItem("name");
    if (!storedToken) {
      navigate("/auth");
    }else{
      setUser(user);
    }
  }, []);

  const [emailDomain, setEmailDomain] = useState('yopmail.com');
  const [emailLength, setEmailLength] = useState(0);
  const [emailResult, setRmailResult] = useState('');
  
  const generate = () => {
    const fetchedArray = Array.from({ length: emailLength }, (_, index) => generateRandomPrefix(10, 10) + `.${index + 1}@` + emailDomain);
    const processedContent = fetchedArray.join('\n');
    setRmailResult(processedContent);
  }

  function generateRandomPrefix(minLength: number, maxLength:number) {
      const charset = 'abcdefghijklmnopqrstuvwxyz';
      const passwordLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
      let password = '';
      for (let i = 0; i < passwordLength; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
      return password;
  }

  return (
    <>
      <div className="bg-gray-100 dark:bg-gray-900 dark:text-white text-gray-600 h-screen flex overflow-hidden text-sm">

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
            <button  onClick={() => {handleNavigation('../')}} className="anime-1 h-10 w-12 dark:text-gray-500 rounded-md flex items-center justify-center">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="h-5" viewBox="0,0,255.99609,255.99609"><g fill="none" fillRule="nonzero" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeDasharray={0} strokeDashoffset={0} fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: 'normal'}}><g transform="scale(5.33333,5.33333)"><path d="M26.1,15.8l-15.9,-7.9c-1.6,-0.9 -3.4,0.8 -2.7,2.5l5.5,13.6l-5.5,13.6c-0.7,1.7 1.1,3.4 2.7,2.5l3,-1.5" /><path d="M18.8,35.8l20.1,-10c1.5,-0.7 1.5,-2.8 0,-3.6l-8,-4" /><path d="M39.7,24h-20.9" /></g></g></svg>
            </button>
            <button className="anime-1 h-10 w-12 dark:bg-gray-700 dark:text-white rounded-md flex items-center justify-center bg-blue-100 text-blue-500">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="h-5" viewBox="0,0,255.99609,255.99609"><g fill="none" fillRule="nonzero" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeDasharray={0} strokeDashoffset={0} fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: 'normal'}}><g transform="scale(5.33333,5.33333)"><path d="M16.3,27.7c-0.5,-1.1 -0.8,-2.4 -0.8,-3.7c0,-4.7 3.4,-8.5 7.5,-8.5c4.1,0 7.5,3.8 7.5,8.5c0,4.7 -3.4,8.5 -7.5,8.5c-1.2,0 -2.3,-0.3 -3.3,-0.9" /><path d="M5.6,26.1c1,9.2 8.9,16.4 18.4,16.4c2.3,0 4.5,-0.4 6.5,-1.2" /><path d="M30.5,15.5v11c0,3.3 2.7,6 6,6v0c3.3,0 6,-2.7 6,-6v-2.5c0,-10.2 -8.3,-18.5 -18.5,-18.5c-8.7,0 -16,6 -18,14.1" /></g></g></svg>
            </button>
            <button onClick={() => {handleNavigation('../suppression-list-cleaner')}} className="anime-1 h-10 w-12 dark:text-gray-500 rounded-md flex items-center justify-center">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="h-5" viewBox="0,0,255.99609,255.99609"><g fill="none" fillRule="nonzero" stroke="currentColor" strokeWidth="none" strokeLinecap="inherit" strokeLinejoin="inherit" strokeMiterlimit={10} strokeDasharray={0} strokeDashoffset={0} fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: 'normal'}}><g transform="scale(5.33333,5.33333)"><path d="M23.5,15v0c-0.828,0 -1.5,-0.672 -1.5,-1.5v0c0,-0.829 -0.672,-1.5 -1.5,-1.5c-0.828,0 -1.5,0.671 -1.5,1.5v0c0,0.828 -0.672,1.5 -1.5,1.5v0c-0.828,0 -1.5,0.671 -1.5,1.5c0,0.829 0.672,1.5 1.5,1.5v0c0.828,0 1.5,0.672 1.5,1.5v0c0,0.829 0.672,1.5 1.5,1.5c0.828,0 1.5,-0.671 1.5,-1.5v0c0,-0.828 0.672,-1.5 1.5,-1.5v0c0.828,0 1.5,-0.671 1.5,-1.5c0,-0.829 -0.672,-1.5 -1.5,-1.5z" fill="currentColor" stroke="none" strokeWidth={1} strokeLinecap="butt" strokeLinejoin="miter" /><path d="M34.5,29v0c-0.828,0 -1.5,-0.672 -1.5,-1.5v0c0,-0.829 -0.672,-1.5 -1.5,-1.5c-0.828,0 -1.5,0.671 -1.5,1.5v0c0,0.828 -0.672,1.5 -1.5,1.5v0c-0.828,0 -1.5,0.671 -1.5,1.5c0,0.829 0.672,1.5 1.5,1.5v0c0.828,0 1.5,0.672 1.5,1.5v0c0,0.829 0.672,1.5 1.5,1.5c0.828,0 1.5,-0.671 1.5,-1.5v0c0,-0.828 0.672,-1.5 1.5,-1.5v0c0.828,0 1.5,-0.671 1.5,-1.5c0,-0.829 -0.672,-1.5 -1.5,-1.5z" fill="currentColor" stroke="none" strokeWidth={1} strokeLinecap="butt" strokeLinejoin="miter" /><path d="M13.5,27v0c-0.828,0 -1.5,-0.672 -1.5,-1.5v0c0,-0.829 -0.672,-1.5 -1.5,-1.5c-0.828,0 -1.5,0.671 -1.5,1.5v0c0,0.828 -0.672,1.5 -1.5,1.5v0c-0.828,0 -1.5,0.671 -1.5,1.5c0,0.829 0.672,1.5 1.5,1.5v0c0.828,0 1.5,0.672 1.5,1.5v0c0,0.829 0.672,1.5 1.5,1.5c0.828,0 1.5,-0.671 1.5,-1.5v0c0,-0.828 0.672,-1.5 1.5,-1.5v0c0.828,0 1.5,-0.671 1.5,-1.5c0,-0.829 -0.672,-1.5 -1.5,-1.5z" fill="currentColor" stroke="none" strokeWidth={1} strokeLinecap="butt" strokeLinejoin="miter" /><path d="M40.5,21.353v16.147c0,1.657 -1.343,3 -3,3h-27c-1.657,0 -3,-1.343 -3,-3v-1.652" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /><path d="M7.5,23v-12.5c0,-1.657 1.343,-3 3,-3h27c1.657,0 3,1.343 3,3v2.342" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></g></g></svg>
            </button>
          </div>
          <div className="flex px-2 flex-grow mt-4" style={{display: 'grid', alignItems: 'end'}}>
            <span className='anime-2 bg-white shadow dark:bg-gray-700 text-gray-900 dark:text-white text-xs w-full px-3 py-2 mb-2 rounded-md' style={{textAlign: 'center'}}>{user}</span>
          </div>
        </div>
        <div className="flex-grow overflow-hidden h-full flex flex-col">
          <div className="flex-grow flex overflow-hidden">
            
            <div className="flex-grow bg-white dark:bg-gray-900 overflow-hiddden">
              <div className="sm:p-4 px-4 pt-4 flex flex-col w-full border-b border-gray-200 bg-white dark:bg-gray-900 dark:text-white dark:border-gray-800 sticky top-0">
                <div className="flex w-full items-center mb-2">
                  <div className='flex'>
                    <div className="text-left">
                        <div className="text-xs text-gray-400 dark:text-gray-400 mb-2">Random Email Generator</div>
                    </div>
                  </div>
                  <div className="ml-auto sm:flex hidden items-center justify-end">
                    <div className="text-right">
                      {/* <div className="text-xs text-gray-400 dark:text-gray-400 mb-2">Data Counter</div> */}
                    </div>
                  </div>
                </div>
              </div>
              <div className="sm:p-4 p-4">
                <div className='flex pb-3'>
                  <input value={emailDomain} onChange={(e) => setEmailDomain(e.target.value)} type="text" className="p-3 mr-3 h-9 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-sm" placeholder="yopmail.com" />
                  <input value={emailLength} onChange={(e) => setEmailLength(e.target.value)} type="number" className="p-3 h-9 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-sm" placeholder="100" />
                  <button style={{width:"100%", visibility:"hidden"}}></button>
                  <button onClick={generate} className="anime-2 bg-blue px-4 py-1 text-white rounded-md flex items-center justify-center" style={{textWrap:"nowrap"}}>Generate</button>
                </div>
                <textarea value={emailResult} onChange={(e) => setRmailResult(e.target.value)} style={{maxHeight: "calc(100vh - 130px)", minHeight: "calc(100vh - 130px)"}} placeholder="Result.." className="p-4 h-100 bg-transparent border border-gray-300 dark:border-gray-700 dark:text-white w-full rounded-md text-xs"></textarea>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
