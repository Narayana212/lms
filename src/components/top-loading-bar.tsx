"use client"
import React from 'react'
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export default function TopLoadingBar() {
  return (
    <ProgressBar
          height="4px"
          color="#0369A1"
          options={{ showSpinner: false }}
          
        />
  )
}
