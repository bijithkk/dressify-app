import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

import Input from "../components/Input";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl, getUserCart } = useContext(ShopContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
          passwordConfirm,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          toast.success(response.data.message,{
            autoClose: 1500,
          });
        } else {
          if (response.data.message.split(":")[2]) {
            const message = response.data.message.split(":")[2];

            return toast.error(message);
          }
          toast.error(response.data.message,{
            autoClose: 1500,
          });
        }
      }

      if (currentState === "Login") {
        const response = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
        });
        setPassword("");
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          setPassword("");
          getUserCart(response.data.token);
          toast.success(response.data.message,{
            autoClose: 1500,
          });
        } else {
          toast.error(response.data.message,{
            autoClose: 2000,
          });
        }
      }

      if(currentState === "Reset Password"){ 
        const toastId = toast.loading("Token Sending...");
        const response = await axios.post(backendUrl + "/api/user/forgotPassword", {
          email
        });
        if(response.data.success) {
          toast.update(toastId, {
            render: response.data.message,
            type: "success",
            isLoading: false,
            autoClose: 1500,
          });
        } else {
          toast.update(toastId, {
            render: response.data.message,
            type: "error",
            isLoading: false,
            autoClose: 2000,
          });
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
      {currentState === "Sign Up" && (
        <>
          <Input
            type="text"
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
            value={name}
          /> 
          <Input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <Input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <Input
            type="password"
            placeholder="Re-enter password"
            onChange={(e) => setPasswordConfirm(e.target.value)}
            value={passwordConfirm}
          />
        </>
      )}

      {currentState === "Login" && (
        <>
          <Input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <Input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </>
      )}

      {currentState === "Reset Password" && (
        <>
          <Input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </>
      )}

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        {currentState === "Reset Password" ? <p
            onClick={() => setCurrentState("Sign Up")}
            className="cursor-pointer"
          >
            Create account
          </p> : <p
          onClick={() => setCurrentState("Reset Password")}
          className="cursor-pointer"
        >
          Forgot your password?
        </p>}
        {currentState === "Login" ? (
          <p
            onClick={() => setCurrentState("Sign Up")}
            className="cursor-pointer"
          >
            Create account
          </p>
        ) : (
          <p
            onClick={() => setCurrentState("Login")}
            className="cursor-pointer"
          >
            Login here
          </p>
        )}
      </div>
      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === "Sign Up" && "Sign Up"}
        {currentState === "Login" && "Log In"}
        {currentState === "Reset Password" && "Submit"}
      </button>
    </form>
  );
};

export default Login;
