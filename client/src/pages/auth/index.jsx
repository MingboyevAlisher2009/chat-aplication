import Background from "@/assets/login2.png";
import Victory from "@/assets/victory.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiClient from "@/lib/api.client";
import { useAppStore } from "@/store";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Auth = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();

  const validateLogin = () => {
    if (!data.email.length) {
      toast.error("Email is reqiured");
      return false;
    }
    if (!data.password.length) {
      toast.error("Password is reqiured");
      return false;
    }
    return true;
  };

  const validateSignUp = () => {
    if (!data.email.length) {
      toast.error("Email is reqiured");
      return false;
    }
    if (!data.password.length) {
      toast.error("Password is reqiured");
      return false;
    }
    if (data.password !== data.confirmPassword) {
      toast.error("Password and confirm password should be same.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    try {
      if (validateLogin()) {
        const response = await apiClient.post(LOGIN_ROUTE, {
          email: data.email,
          password: data.password,
        });

        if (response.data.data._id) {
          setUserInfo(response.data.data);
          localStorage.setItem("token", response.data.token);
          if (response.data.data.profileSetup)
            window.location.pathname = "/chat";
          else window.location.pathname = "/profile";
        }
      }
    } catch (error) {
      toast.error("Email or passworg invalide");
    }
  };

  const handleSignUp = async () => {
    try {
      if (validateSignUp()) {
        const response = await apiClient.post(SIGNUP_ROUTE, {
          email: data.email,
          password: data.password,
        });

        if (response.data.success) {
          localStorage.setItem("token", response.data.token);
          setUserInfo(response.data.data);
          window.location.pathname = "/profile";
        }
      }
    } catch (error) {
      toast.error("Email, passworg or confirm password invalide");
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-[80vw] h-[80%] shadow-2xl bg-white md:w-[90vw] lg:w-[70vw] xl:w-[60%] rounded-3xl grid xl:grid-cols-">
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex flex-col justify-center items-center">
            <div className="flex items-center justify-center">
              <h1 className="font-bold text-6xl">Welcome</h1>
              <img className="w-[100px]" src={Victory} alt="emoji" />
            </div>
            <p className="font-medium text-medium">
              Fill in the details to get started with the best cha t app!
            </p>
          </div>
        </div>
        <div className="w-full flex items-center justify-center">
          <Tabs defaultValue="login" className="w-3/4">
            <TabsList className="bg-transparent rounded-none w-full">
              <TabsTrigger
                className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                value={"login"}
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                value={"signup"}
              >
                Sign up
              </TabsTrigger>
            </TabsList>
            <TabsContent className="flex flex-col gap-5 mt-10" value={"login"}>
              <Input
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                type="email"
                placeholder="Email"
                className="rounded-full outline-none"
              />
              <Input
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                placeholder="Password"
                type="password"
                className="rounded-full outline-none"
              />
              <Button onClick={handleLogin} className="rouunded-full">
                Login
              </Button>
            </TabsContent>
            <TabsContent className="flex flex-col gap-5 " value={"signup"}>
              <Input
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                type="email"
                placeholder="Email"
                className="rounded-full outline-none"
              />
              <Input
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                placeholder="Password"
                type="password"
                className="rounded-full outline-none"
              />
              <Input
                value={data.confirmPassword}
                onChange={(e) =>
                  setData({ ...data, confirmPassword: e.target.value })
                }
                placeholder="Confirm password"
                type="password"
                className="rounded-full outline-none"
              />
              <Button onClick={handleSignUp} className="rouunded-full">
                Sign up
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
