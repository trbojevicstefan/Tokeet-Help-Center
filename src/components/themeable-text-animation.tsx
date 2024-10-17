'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTheme } from '@/context/ThemeProvider'

const messages = [
  "What is Booking Formula?",
  "How do I connect my Airbnb Account?",
  "How do I set Dynamic Rates?",
  "Where can I check Booking Fees?",
  "How do I set Pre-Checkin Message?"
]

export function ThemeableTextAnimation() {
  const [text, setText] = useState('')
  const [messageIndex, setMessageIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const { isDarkTheme } = useTheme() // Get the theme state from the context

  useEffect(() => {
    const currentMessage = messages[messageIndex]

    if (isTyping) {
      if (text !== currentMessage) {
        const timeoutId = setTimeout(() => {
          setText(currentMessage.slice(0, text.length + 1))
        }, 50 + Math.random() * 50)
        return () => clearTimeout(timeoutId)
      } else {
        const timeoutId = setTimeout(() => setIsTyping(false), 2000)
        return () => clearTimeout(timeoutId)
      }
    } else {
      if (text) {
        const timeoutId = setTimeout(() => {
          setText(text.slice(0, -1))
        }, 30 + Math.random() * 30)
        return () => clearTimeout(timeoutId)
      } else {
        setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length)
        setIsTyping(true)
      }
    }
  }, [text, isTyping, messageIndex])

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen transition-colors duration-300 ${isDarkTheme ? 'bg-[#1E1E1E]' : 'bg-[#F5F5F5]'}`}>
      <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-center mb-8">
          <Image
            src={isDarkTheme 
              ? "/images/tokeet/dark_logo.png"
              : "/images/tokeet/light_logo.jpg"
            }
            alt="Tokeet Logo"
            width={240}
            height={80}
            className="mr-4"
          />
          <h1 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-black'}`}>
            Help Center
          </h1>
        </div>
        <motion.h2
          layout
          className={`text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-center min-h-[60px] break-words ${isDarkTheme ? 'text-white' : 'text-black'}`}
        >
          {text}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            className={`inline-block ml-1 w-[2px] h-8 ${isDarkTheme ? 'bg-white' : 'bg-black'}`}
          />
        </motion.h2>
      </div>
    </div>
  )
}
