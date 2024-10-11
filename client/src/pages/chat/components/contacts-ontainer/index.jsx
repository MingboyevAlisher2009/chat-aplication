import React, { useEffect } from "react";
import ProfileInfo from "./components/profile-info";
import NewDm from "./components/new-dm";
import apiClient from "@/lib/api.client";
import { CONTACTS_DM_ROUTE, GET_USER_CHANNEL_ROUTE } from "@/utils/constants";
import { useAppStore } from "@/store";
import ContactList from "@/components/contact-list";
import CreateChannel from "./components/create-channel";

const ContactsContainer = () => {
  const {
    setDirectMessages,
    directMessages,
    channels,
    setChannels,
    setNotification,
    selectedChatMessages,
  } = useAppStore();

  useEffect(() => {
    const getContacts = async () => {
      const { data } = await apiClient.get(CONTACTS_DM_ROUTE);

      if (data.contacts) setDirectMessages(data.contacts);
    };

    const getChannels = async () => {
      try {
        const { data } = await apiClient.get(GET_USER_CHANNEL_ROUTE);

        if (data.channels) setChannels(data.channels);
      } catch (error) {
        console.log(error);
      }
    };

    getContacts();
    getChannels();
  }, [setChannels, setDirectMessages, setNotification, selectedChatMessages]);

  return (
    <div className="relative  md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
      <div className="pt-3">
        <Logo />
      </div>
      <div className="my-5">
        <div className="flex justify-between items-center pr-10">
          <Title text="Direct Messages" />
          <NewDm />
        </div>
        <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
          <ContactList contacts={directMessages} />
        </div>
      </div>
      <ProfileInfo />
    </div>
  );
};

export default ContactsContainer;

const Logo = () => {
  return (
    <div className="flex p-5  justify-start items-center gap-2">
      <svg
        id="logo-38"
        width="78"
        height="32"
        viewBox="0 0 78 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {" "}
        <path
          d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
          className="ccustom"
          fill="#8338ec"
        ></path>{" "}
        <path
          d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
          className="ccompli1"
          fill="#975aed"
        ></path>{" "}
        <path
          d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
          className="ccompli2"
          fill="#a16ee8"
        ></path>{" "}
      </svg>
      <span className="text-3xl font-semibold ">Syncronus</span>
    </div>
  );
};

const Title = ({ text }) => {
  return (
    <div className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">
      {text}
    </div>
  );
};
