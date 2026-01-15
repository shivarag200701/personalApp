import api from '@/utils/api';
import { useEffect, useState, useMemo} from 'react'
import { Spinner } from '../ui/spinner';
import { useQuery } from '@tanstack/react-query';

interface AccountSettingsProps{

    handleChange: (subTabtabId:string) => void
    hasChanged: boolean
    setHasChanged: (value:boolean) => void
}

const AccountSettings = ({handleChange,hasChanged,setHasChanged}:AccountSettingsProps) => {
    // const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [name,setName] = useState<string | null>(null)



    const {data:user, isPending} = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const res = await api.get("/v1/user/profile");
            return res.data.user
        }
    })
    useEffect(()=>{
        if(user?.username){
            setName(user?.username)
        }
    },[user])
    const computedHasChanged = useMemo(() => {
        if (!user?.username || !name) return false;
        return name !== user.username;
    }, [name, user?.username]);

    
    useEffect(() => {
        setHasChanged(computedHasChanged);
    }, [computedHasChanged, setHasChanged]);

    

        // const providerIcon = user.provider === "google" ? "/google-icon.svg" : user.provider === "facebook" ? "/facebook-icon.svg" : "/apple-icon.svg"



    // useEffect(() => {
    //     async function fetchProfile() {
    //         setIsLoading(true);
    //         const response = await api.get("/v1/user/profile");
    //         console.log(response.data);
    //         if (response.data.user) {
    //             setProfilePicture(response.data.user.pictureUrl);
    //             setIsOAuthLinked(response.data.user.isOAuthLinked);
    //             setIsPasswordSet(response.data.user.isPasswordSet);
    //             setProviderIcon(response.data.user.provider === "google" ? "/google-icon.svg" : response.data.user.provider === "facebook" ? "/facebook-icon.svg" : "/apple-icon.svg");
    //         }
    //         setIsLoading(false);
    //     }
    //     fetchProfile();
    // }, []);
    
    return ( 
    <div className="bg-background h-full rounded-r-md font-medium flex flex-col overflow-hidden">
                <div className='text-[16px] font-medium pl-4 py-2 pr-2 bg-background sticky top-0 z-10'>
                    Account
                </div>
                <div className='h-px bg-border sticky top-0 z-10 shrink-0'/>
                <div className='flex-1 overflow-y-auto custom-scrollbar'>
                <div className='flex justify-between items-center p-4'>
                <div className='flex flex-col min-w-0 flex-1 '>
                    <span className='text-[14px] font-medium'>Plan</span>
                    <span className='text-[17px] font-bold'>Beginner</span>
                </div>
                <button className='text-[14px] px-3 py-1.5 h-full bg-button-subtle text-foreground  rounded-sm opacity-50 cursor-not-allowed'>Manage Plan (Coming soon)</button>
                </div>
                <div className='h-px bg-white/10 '/>
                {isPending ? <div className='flex justify-center items-start min-h-[calc(100vh-100px)] pt-10 gap-4'>
                    <Spinner className='text-purple-400 mt-10'/>
                    <div className='flex flex-col mt-11 gap-1'>
                    <span className='text-[14px] text-white/50'>Loading.....</span>
                    <span className='text-[12px] text-white/50 '>Please wait while we fetch your profile information.</span>
                    </div>
                    </div> : (
                <div>
                <div className='p-4'>
                    <span className='text-[14px]'>Photo</span>
                    <div className='flex'>
                    <img src={user.pictureUrl || ""} alt="Profile" className='w-20 h-20 rounded-full mt-2 mr-2' />
                    <div className='flex flex-col'>
                    <div className='flex items-start gap-2 text-[14px] text-white/70'>
                        <button className='px-3 py-1.5 bg-button-subtle rounded-sm text-foreground cursor-pointer hover:bg-button-subtle-hover transition-all duration-300'>Change photo</button>
                        <button className='px-3 py-1.5 border border-red-500 rounded-sm text-red-500 cursor-pointer hover:text-red-600 hover:border-red-600 transition-all duration-300'>Remove photo</button>
                    </div>
                    <span className='text-[12px] text-white/70 mt-2'>Pick a photo up to 4MB.</span>
                    <span className='text-[12px] text-white/70 mt-1 '>Your avatar would be public.</span>
                    </div>
                    </div>

                </div>
                <div className='p-4'>
                    <div className='flex flex-col gap-2'>
                    <span className='text-[14px]'>Name</span>
                    <input type="text" value={name || ""} onChange={(e) => {setName(e.target.value)
                        }} className='border border-sidebar-border rounded-sm text-[12px] font-light p-1 px-2 w-full sm:max-w-96 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all'/>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='flex flex-col gap-2'>
                        <span className='text-[14px]'>Email</span>
                        <span className='font-light text-[14px]'>{user.email || ""}</span>
                        <button className='p-2 cursor-pointer  bg-button-subtle text-button-text rounded-sm max-w-30 text-[14px] hover:bg-button-subtle-hover transition-all duration-300 '>Change email</button>
                    </div>
                </div>
                <div className='p-4'>
                    <div className='flex flex-col gap-2'>
                        <span className='text-[14px]'>Password</span>
                        {!user.isPasswordSet ? 
                        <button onClick={() => handleChange("password")}
                        className='p-2 cursor-pointer  bg-button-subtle text-button-text rounded-sm max-w-30 text-[14px] font-light hover:bg-button-subtle-hover transition-all duration-300 '>
                        Add password
                        </button> : 
                        <button 
                        onClick={() => handleChange("password")}
                        className='p-2 cursor-pointer  bg-button-subtle text-button-text rounded-sm max-w-35 text-[14px] hover:bg-button-subtle-hover transition-all duration-300'>
                        Change password
                        </button>}
                    </div>
                </div>
                <div className='h-px bg-white/10'/>
                <div className='p-4'>
                    <div className='flex flex-col gap-2'>
                    <span>Connected accounts</span>
                    <span className='font-extralight text-[12px] text-foreground'>Log in to FlowTask with your Google, Facebook, or Apple account (Facebook & Apple coming soon).
                    </span>
                    <span className='font-light text-[14px] text-foreground'>You can log in to FlowTask with your {user.provider} account <span className='text-foreground font-medium'>{user.email || ""}</span>.</span>
                    {!user.isPasswordSet ? <span className='font-light text-[14px] text-foreground'>
                        Your password is not set, so we cannot disconnect you from your {user.provider} account. If you want to disconnect, please <a href="/" className='underline text-red-500'>set up your password</a> first.
                    </span> : 
                    <button className='p-2  bg-button-subtle text-button-text hover:bg-button-subtle-hover cursor-pointer transition-all duration-300 rounded-sm w-full sm:max-w-96 text-[12px]'>
                        <div className='flex items-center justify-center gap-2'>
                        <img src="/google-icon.svg" alt="Google" width={20} height={20} />Disconnect {user.provider}
                        </div>
                    </button>
                    }
                    <button className='p-2  bg-button-subtle text-button-text  transition-all duration-300 rounded-sm w-full sm:max-w-96 text-[12px] opacity-50 cursor-not-allowed'>
                        <div className='flex items-center justify-center gap-2'>
                        <img src="facebook-icon.svg" alt="Google" width={20} height={20} />Connect with Facebook (Coming soon)
                        </div>
                    </button><button className='p-2  bg-button-subtle text-button-text  transition-all duration-300 rounded-sm w-full sm:max-w-96 text-[12px] opacity-50 cursor-not-allowed'>
                        <div className='flex items-center justify-center gap-2'>
                        <img src="/apple-icon.svg" alt="Google" width={25} height={25} />Connect with Apple (Coming soon)
                        </div>
                    </button>
                    </div>                    
                </div>
                <div className='h-px bg-white/10'/>
                <div className='p-4'>
                    <div className='flex flex-col gap-2'>
                        <span>Delete account</span>
                        <span className='font-extralight text-[12px] text-foreground'>Deleting your account is permanent. You will immediately lose access to all your data.
                        </span>
                        <button className='p-2 border border-red-500 rounded-sm text-red-500 cursor-pointer hover:text-red-600 hover:border-red-600 transition-all duration-300 w-full sm:max-w-30 text-[14px]'>
                        <span>Delete account</span>
                        </button>
                    </div>

                </div>
                </div>
                )}
            </div>
            {hasChanged && (
            <div className='text-[14px] font-medium pl-4 py-2 pr-2 bg-background z-10 border-t border-border shrink-0 flex justify-end gap-2'>
                <button className='px-3 py-2 bg-button-subtle text-button-text rounded-sm max-w-30 text-[14px] font-light hover:bg-button-subtle-hover cursor-pointer'
                onClick={()=>{
                    if (user?.username) {
                        setName(user.username);
                        setHasChanged(false);
                    }
                }}
                >
                    Cancel
                </button>
                <button className=' text-[14px] px-3 py-1.5 bg-red-500 font-light rounded-sm text-white cursor-pointer hover:bg-red-400'>
                    Update
                </button>
            </div>
        )}

            </div>
            
  );
}

export default AccountSettings