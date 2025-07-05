import Link from 'next/link'
import React from 'react'
import { HeartIcon, Search, ShoppingCart, UserIcon } from 'lucide-react';
import ProfileIcon from 'apps/user-ui/src/assets/svgs/profile-icon';
import HeaderBottom from './HeaderBottom';

const Header = () => {
    return (
        <div>
            <div className="w-full bg-white">
                <div className="w-[80%] py-5 m-auto flex items-center justify-between">
                    <div className="">
                        <Link href={"/"}>
                            <span className="text-2xl font-[600]">Ecommerce</span>
                        </Link>
                    </div>
                    <div className="w-[50%] relative">
                        <input
                            type="text"
                            placeholder='Buscar por produtos....'
                            className='w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489FF] outline-none h-[55px]'
                        />
                        <div className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#3489FF] absolute top-0 right-0">
                            <Search color='#FFF' />
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <Link
                                href={"/login"}
                                className='border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#bebfc0]'
                            >
                                {/* <ProfileIcon /> */}
                                <UserIcon />
                            </Link>
                            <Link href={"/login"}>
                                <span className='block font-medium'>Olá, </span>
                                <span className='font-semibold'>Entrar</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-5">
                            <Link href={"/wishlist"} className='relative'>
                                <HeartIcon />
                                <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                                    <span className="text-white font-medium text-sm">
                                        o
                                    </span>
                                </div>
                            </Link>
                            <Link href={"/wishlist"} className='relative'>
                                <ShoppingCart />
                                <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                                    <span className="text-white font-medium text-sm">
                                        9+
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="border-b border-b-[#11111138]" />
                <HeaderBottom />
            </div>
        </div>
    )
}

export default Header