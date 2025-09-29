import React from 'react'
import { Routes,Route } from 'react-router-dom'
import Login from './pages/login'
import UserList from './pages/userList'

function App() {
  return (
   <Routes>
    <Route path='/' element={<Login/>}/>
    <Route path='/userList' element={<UserList/>}/>
   </Routes>
  )
}

export default App
