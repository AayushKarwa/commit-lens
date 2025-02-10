'use client'
import { useUser } from '@clerk/nextjs'
import React from 'react'

const DashboardPage = () => {
    const {user} = useUser()
    if(!user) return
  return (
    <div>DashboardPage: {user.firstName}</div>
  )
}

export default DashboardPage