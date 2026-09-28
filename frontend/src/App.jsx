// import { useState } from 'react'
import './App.css'
import Login from './pages/Login'
import Home from './pages/Home'
import UserLogin from './pages/UserLogin'
import UserHome from './pages/UserHome'
import {BrowserRouter , Route, Router, Routes} from 'react-router-dom'

function App() {

  return (

       <BrowserRouter>
    <Routes>
      <Route path='/login' element={<Login/>} />
      <Route path='/home' element={<Home/>} />
      <Route path='/userlogin' element={<UserLogin/>} />
      <Route path='/userhome' element={<UserHome/>} />
    </Routes>
    </BrowserRouter>
   
  )
}

export default App