"use client";
import { navItems } from 'apps/user-ui/src/configs/constants';
import { AlignLeft, ChevronDown, HeartIcon, ShoppingCart, UserIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

const HeaderBottom = () => {

    const [show, setShow] = useState<boolean>(false);
    const [isSticky, setIsSticky] = useState<boolean>(false);

    //rastrear a posição do scroll

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 100 ? true : false);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);

    }, []);

    return (
        <div className={
            `w-full transition-all duration-300 ${isSticky
                ? "fixed top-0 left-0 z-[100] bg-white shadow-lg"
                : "relative"}`
        }>
            <div className={`w-[80%] relative m-auto flex items-center justify-between ${isSticky ? "pt-3" : "py-0"}`}>

                {/* Todos os Dropdowns */}
                <div className={
                    `w-[290px] ${isSticky && '-mb-2'} 
                    cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3389FF]`}
                    onClick={() => setShow(!show)}
                >

                    <div className="flex items-center gap-2">
                        <AlignLeft color='#FFF' />
                        <span className='text-white font-medium'>Todos os Departamentos</span>
                    </div>

                    <ChevronDown color='#FFF' />

                </div>

                {/* menu dropdown */}

                {show && (
                    <div className={
                        `absolute left-0 ${isSticky ? "top-[70px]" : "top-[50px]"} w-[290px] h-[400px] bg-[#e9e8e8]`
                    }>

                    </div>
                )}

                {/* Links de Navegação */}
                <div className="flex items-center">
                    {
                        navItems.map(
                            (i: NavItemsTypes, index: number) => (
                                <Link
                                    className='px-4 font-medium text-lg'
                                    href={i.href}
                                    key={index}
                                >
                                    {i.title}
                                </Link>
                            )
                        )
                    }
                </div>

                <div className="">
                    {
                        isSticky && (
                            <div className="flex items-center gap-8 pb-2">
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
                        )
                    }
                </div>

            </div>

        </div>
    )
}

export default HeaderBottom