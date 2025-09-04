import React, {useContext, useEffect, useState} from "react";

import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Input,
    Button,
  } 
  from "@material-tailwind/react";
  import{Link, useNavigate} from "react-router-dom"
  import {useFormik} from 'formik';
  import * as Yup from "yup";
  import ClipLoader from "react-spinners/ClipLoader";
  import { AuthContext } from "../AppContext/AppContext";
  import {auth, onAuthStateChanged} from "../firebase/firebase";

  const Login =()=>{
    const {signINWithGoggle , loginWithEmailAndPassword} =useContext(AuthContext);
    const [loading, setLoading]= useState(false);
    const navigate = useNavigate();

    useEffect(() =>{
      setLoading(true);
      onAuthStateChanged(auth, (user) => {
        if(user){
          navigate("/");
          setLoading(false);
        }else{
          setLoading(false);
        }
      })
    },[navigate])
    
    let initialValues={
        email: "",
        password:"",
    };



    const validationSchema= Yup.object({
        email: Yup.string().email("Tnvalid email address").required("Required"),
        password: Yup.string()
        .required('Required')
        .min('6', "Must be at least 6 characters long")
        .matches(/^[a-zA-Z]+$/ ,"Password can only contain letters"),
    });
    const handleSubmit = (values) => {
      // You no longer need to prevent the default form submission manually here
      const { email, password } = values;
      if (values.email && values.password) {
        loginWithEmailAndPassword(email,password);
        setLoading(true);
      } else {
        setLoading(false);
        alert("Please check your inputs!");
      }
      console.log("Form Values:", values);
    };
    const formik= useFormik({initialValues, validationSchema,onSubmit: handleSubmit});


    
return (
  <>
  {loading ? 
      ( 
      <div className = "grid grid-cols-1 justify-items-center items-center h-screen"> 
      <ClipLoader color="#a3a8b6" size={150} speedMultiplier={0.5}/>
      </div>): (
<div className="grid grid-cols-1 h-screen  justify-items-center items-center grey" >  <Card className="w-96">
<CardHeader variant="gradient"
  color="gray"
  className="mb-4 grid h-28 place-items-center "
>
  <Typography variant="h3" color="white">
    Sign In
  </Typography>
</CardHeader>
<CardBody className="flex flex-col gap-4">
  <form onSubmit= {formik.handleSubmit}>
<div className="mb-2 ">
<Input name="email"
 type="email"
  label="Email"
   size="lg"
   {...formik.getFieldProps("email")}
    />
</div>
<div>
  {formik.touched.email && formik.errors.email &&(
    <Typography variant="small" color="red">
  {formik.errors.email}
</Typography>
  )}
</div>
<div className="mt-4 mb-2">
<Input name="password" 
type="password" 
label="Password"
 size="lg"
 {...formik.getFieldProps("password")} 
/>

</div>
<div>
  {formik.touched.password && formik.errors.password &&(
    <Typography variant="small" color="red">
  {formik.errors.password}
</Typography>
  )}
</div>

<Button variant="gradient" fullWidth className="mb-0 mt-6" type="submit">
    Sign In 
  </Button>
 
  
  </form>
</CardBody>
<CardFooter className="pt-0 place-items-center">
  <Button variant="gradient"  className=" mb-4" onClick={signINWithGoggle}>
    Sign In with Google
  </Button>
  <Link to="/reset">
  <p className="ml-1 font-bold font-roboto text-sm  text-center">
   Reset the password
   </p>
   </Link>
    <div
        className="mt-6 flex items-center font-roboto text-base justify-center"
    >
      Don't have an account?
     <Link to="/register">
     <p className="ml-1 font-bold font-roboto text-sm  text-center">
    Register    
    </p></Link>
    </div>
  
</CardFooter>
</Card></div>
)}
</>
)};
export default Login;