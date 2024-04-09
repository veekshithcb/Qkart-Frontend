import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState,useEffect } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
import { useHistory, Link } from "react-router-dom";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();


  // TODO: CRIO_TASK_MODULE_REGISTER - Implement the register function
  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true, 
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */
  const [name,setName] = useState("");
  const [password,setPassword] = useState("");
  const [cPassword,setCPassword] = useState("");
  const [registering,setRegistering] = useState(false);
  
  let history = useHistory();

  const register = async (formData) => {
    const isValid = validateInput(formData);

    if(isValid){
      //for loading icon functionality
      setRegistering(true);
    try {
      const response = await axios.post(`${config.endpoint}/auth/register`, {username: formData.username, password: formData.password});
      // console.log(response.data.success);
      // console.log(response.status);
        // Registration successful, show success snackbar
      enqueueSnackbar("Registered Successfully.", { variant: "success" });
      history.push('/login');
      
    } catch (error) {
      // console.log(error);
      if(error.response.status===400){
        enqueueSnackbar(error.response.data.message, {variant:"error"})
        console.log(error.response.data.message);
      }
      else{
        const errorMessage = "Something went wrong. Check that the backend is running, reachable, and returns valid JSON.";
        enqueueSnackbar(errorMessage, { variant: "error" });

      }
    }finally{
      //to show register button again
      setRegistering(false);
    }
  }};
  


  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  /**
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
   const validateInput = (data) => {
    // let isValid = true;
  
    // Check that the username field is not an empty value
    if (data.username.length === 0) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      // isValid = false;
      return false;
    }
  
    // Check that the username field is not less than 6 characters in length
    if (data.username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", { variant: "warning" });
      return false;
    }
  
    // Check that the password field is not an empty value
    if (data.password.length === 0) {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    }
  
    // Check that the password field is not less than 6 characters in length
    if (data.password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", { variant: "warning" });
      return false;
    }
  
    // Check that confirmPassword field has the same value as the password field
    if (data.password !== data.confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "warning" });
      return false;
    }
  
    return true;
  };
  

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            onChange={(e)=>{
              setName(e.target.value);
            }}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            onChange={(e)=>{
              setPassword(e.target.value);
            }}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            onChange={(e)=>{
              setCPassword(e.target.value);
            }}
          />
           {registering?<Box sx={{textAlign:'center'}}> <CircularProgress /></Box>:<Button className="button" variant="contained" onClick={()=>{
            register({"username":name,"password":password,"confirmPassword":cPassword})
           }}>
            Register Now
           </Button>}
          <p className="secondary-action">
            Already have an account?{" "}
             <Link className="link" to="/login">
              Login here
             </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
