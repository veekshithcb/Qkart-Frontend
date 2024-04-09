import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { useHistory, Link } from "react-router-dom";
import {
  InputAdornment,
  TextField
} from "@mui/material";
import { Search, SentimentDissatisfied } from "@mui/icons-material";


const Header = ({ children, hasHiddenAuthButtons }) => {
  let history = useHistory();
  if(hasHiddenAuthButtons){

    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={()=>{
            history.push('/')
          }}
          >
          Back to explore
        </Button>
      </Box>
    );
  }

  return (
    <Box className="header">
      <Box className="header-title">
          <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>

      {children}

      <Stack direction='row' justifyContent='flex-end' >
        {/* conditional rendering for login and logout  */}
        {(localStorage.getItem('username'))? 
              <><Stack direction='row' alignItems='center'>
                <Avatar src="avatar.png" alt={localStorage.getItem('username')} />
                 
                {localStorage.getItem('username')}
                <Button
                variant="text"
                onClick={()=>{
                  localStorage.removeItem('balance')
                  localStorage.removeItem('token')
                  localStorage.removeItem('username')

                  // history.push('/login')
                  window.location.reload();
                }}
                >
                Logout
              </Button>
              </Stack>
              </>: 

              <>
              <Button
              variant="text"
              onClick={()=>{
                history.push('/login')
              }}
              >
              Login
            </Button>
      
            <Button
              variant="contained"
              onClick={()=>{
                history.push('/register')
              }}
              >
              Register
            </Button>
            </>

        }
      
      </Stack>
    </Box>
    
  )

  };

export default Header;
