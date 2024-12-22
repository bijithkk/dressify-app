import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

const MyProfile = () => {
  const [currentState, setCurrentState] = useState("My Orders");
  const { token, backendUrl, setToken, currency, navigate, setCartItems } = useContext(ShopContext);
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [userData,setUserData] = useState({});
  const [newName,setNewName] = useState('');
  const [orderData, setOrderData] = useState([]);
  const [image,setImage] = useState(false);
  const [isLoading,setIsLoading] = useState(false); 


  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if(currentState === "Change Password"){
      const response = await axios.patch(
      backendUrl + "/api/user/updatePassword",
      { passwordCurrent, password, passwordConfirm },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      setPasswordCurrent("");
      setPassword("");
      setPasswordConfirm("");
      toast.success(response.data.message,{
        autoClose: 1500,
      });
    } else {
      toast.error(response.data.message,{
        autoClose: 1500,
      });
    }
    }

    if(currentState === "Change Name"){
      const response = await axios.post(backendUrl + "/api/user/changename",{ newName }, { headers: { Authorization: `Bearer ${token}` } });

      if(response.data.success) {
        loadUserData();
        toast.success(response.data.message,{
          autoClose: 1500,
        });
      }
    }

    if(currentState === "Delete Account") {
      const response = await axios.post(backendUrl + "/api/user/deleteuser",{passwordCurrent},{ headers: { Authorization: `Bearer ${token}` } });

      if(response.data.success) {
        navigate("/login");
        setToken('');
        localStorage.removeItem("token");
        setCartItems({});
        setPasswordCurrent("");
        toast.success(response.data.message,{
          autoClose: 1500,
        });
      } else {
        toast.error(response.data.message,{
          autoClose: 1500,
        });
      }
    }
    
  };

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        backendUrl + "/api/user/getuser",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      

      if(response.data.success){
        console.log(response.data.user);
        setUserData(response.data.user);
      }
    } catch (error) {
      console.log(error);
    } finally{
      setIsLoading(false);
    }
  };

  const loadOrderData = async () => {
    
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data);
      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item["status"] = order.status;
            item["payment"] = order.payment;
            item["paymentMethod"] = order.paymentMethod;
            item["date"] = order.date;
            allOrdersItem.push(item);
          });
        });
        console.log(allOrdersItem);
        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const changeProfile = async(image) => { 
    try {
      if (!image) {
        toast.error("No image selected!");
        return;
      }
      const formData = new FormData();
      formData.append("photo", image);

      const toastId = toast.loading("Image Uploading...");

      const response = await axios.patch(backendUrl + "/api/user/uploadimg",formData,{headers:{Authorization: `Bearer ${token}`,"Content-Type": "multipart/form-data",}});

      if(response.data.success) {
        console.log(response.data.updatedUser);
        setUserData(response.data.updatedUser);
        // toast.success(response.data.message);
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadOrderData();
    loadUserData();
  }, [token]);

  if (isLoading) {
    return (
      <Spinner/>
    );
  }
  
  return (
    <div className="font-[sans-serif] bg-white max-w-6xl flex flex-col m-14 items-center mx-auto md:h-screen p-4">
      <div className="grid md:grid-cols-3 items-center shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] rounded-xl overflow-hidden w-full">
        {/* Sidebar for Navigation */}
        <div className="md:col-span-1 flex flex-col items-center bg-gradient-to-r bg-white text-gray-700 min-h-full pt-6">
          {/* Profile Picture */}
          <label htmlFor="image" className="cursor-pointer">
            <img
            src={image ? URL.createObjectURL(image) : userData.photo}
            alt="User Profile"
            className="w-24 h-24 rounded-full mb-4 border-4 border-gray-700 shadow-lg"
          />
          </label>
          <input
          onChange={(e) => { 
            const file = e.target.files[0];
            setImage(file);
            if(file){
              changeProfile(file);
            }
          }}
          type="file"
          id="image"
          hidden
        />
          {/* User Name */}
          <p className="text-lg font-semibold mb-8">{userData.name}</p>{" "}
          {/* Replace "John Doe" with dynamic user data */}
          <div className="flex flex-col space-y-6 p-6 text-gray-700 min-h-full">
            <button
              onClick={() => setCurrentState("My Orders")}
              className="text-left hover:text-blue-400 duration-300"
            >
              My Orders
            </button>
            <button
              onClick={() => setCurrentState("Change Password")}
              className="text-left hover:text-blue-400 duration-300"
            >
              Change Password
            </button>
            <button
              onClick={() => setCurrentState("Change Name")}
              className="text-left hover:text-blue-400 duration-300"
            >
              Change Name
            </button>
            <button
              onClick={() => setCurrentState("Delete Account")}
              className="text-left hover:text-blue-400 duration-300"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2 w-full py-6 px-6 sm:px-16 bg-white">
          <div className="mb-6">
            <h3 className="text-gray-800 text-2xl font-bold">{currentState}</h3>
          </div>

          {/* New Password Section */}
          {currentState === "Change Password" && (
            <form onSubmit={onSubmitHandler} className="mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-gray-800 text-sm mb-2 block">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-2.5 rounded-md outline-blue-500"
                    onChange={(e) => setPasswordCurrent(e.target.value)}
                    value={passwordCurrent}
                  />
                </div>
                <div>
                  <label className="text-gray-800 text-sm mb-2 block">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-2.5 rounded-md outline-blue-500"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                  />
                </div>
                <div>
                  <label className="text-gray-800 text-sm mb-2 block">
                    Re-enter New password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter New password"
                    className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-2.5 rounded-md outline-blue-500"
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    value={passwordConfirm}
                  />
                </div>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-md bg-black text-white hover:bg-gray-800 duration-200"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}

          {/* My Orders Section */}
          {currentState === "My Orders" && (
            <div>
              <div className="h-96 overflow-y-scroll space-y-4">
                {orderData.map((item, index) => (
                  <div key={index} className="space-y-4">
                    {/* Order Item */}
                    <div className="relative flex items-center gap-4 p-4 bg-white rounded-md shadow-sm">
                      <img
                        src={item.image[0]}
                        className="w-24 sm:w-32 mb-4 sm:mb-0"
                        alt=""
                      />
                      <div>
                        <p className="text-gray-800 font-semibold">
                          {item.name}
                        </p>
                        <div className="flex lg:flex-col gap-2">
                          <p className="text-gray-600 text-sm">
                            {currency}
                            {item.price}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Size: {item.size}
                          </p>
                        </div>
                        <p className="text-gray-600 text-sm">
                          Date:{" "}
                          <span className="text-gray-400">
                            {new Date(item.date).toDateString()}
                          </span>
                        </p>
                        <p className="text-gray-600 text-sm">
                          Payment:{" "}
                          <span className="text-gray-400">
                            {item.paymentMethod}
                          </span>
                        </p>
                        <div className="flex items-center gap-2">
                        <p className={`min-w-2 h-2 rounded-full ${item.status === 'Delivered' ? 'bg-green-500' : 'bg-yellow-500'}`}></p>
                          <p className="text-sm md:text-base">{item.status}</p>
                        </div>
                      </div>
                      <button
                        onClick={loadOrderData}
                        className="lg:absolute lg:top-4 lg:right-4 text-blue-600 font-semibold hover:underline"
                      >
                        Track Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {currentState === "Change Name" && (
            <form onSubmit={onSubmitHandler} className="mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-gray-800 text-sm mb-2 block">
                    Enter Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-2.5 rounded-md outline-blue-500"
                    onChange={(e) => setNewName(e.target.value)}
                    value={newName}
                  />
                </div>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-md bg-black text-white hover:bg-gray-800 duration-200"
                >
                  Submit
                </button>
              </div>
            </form>)}
            {currentState === "Delete Account" && (
              <form onSubmit={onSubmitHandler} className="mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-gray-800 text-sm mb-2 block">
                    Enter Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Your password"
                    className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-2.5 rounded-md outline-blue-500"
                    onChange={(e) => setPasswordCurrent(e.target.value)}
                    value={passwordCurrent}
                  />
                </div>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-md  bg-black text-white hover:bg-gray-800 duration-200"
                >
                  Confirm
                </button>
              </div>
            </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
