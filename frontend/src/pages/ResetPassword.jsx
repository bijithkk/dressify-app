import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams(); // Extract token from URL
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(`http://localhost:4000/api/user/resetPassword/${token}`, {
        password,
        passwordConfirm,
      });
      if (response.data.success) {
        toast.success('Password reset successfully!');
        navigate('/login'); // Redirect to login page
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
        toast.error('Error resetting password. Try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Reset Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border border-gray-800"
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <input
            type="password"
            placeholder="Re-enter password"
            className="w-full px-3 py-2 border border-gray-800"
            required
            onChange={(e) => setPasswordConfirm(e.target.value)}
            value={passwordConfirm}
          />
      <button type='submit' className="bg-black text-white font-light px-8 py-2 mt-4">
        Submit
      </button>
    </form>
  );
};

export default ResetPassword;
