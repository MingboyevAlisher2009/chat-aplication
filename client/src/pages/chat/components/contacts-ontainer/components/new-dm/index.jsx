import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Lottie from "react-lottie";
import { animationDefaultOptions, getColor } from "@/lib/utils";
import apiClient from "@/lib/api.client";
import { CONTACTS_SEARCH_ROUTE, HOST } from "@/utils/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store";

const NewDm = () => {
  const { setSelectedChatType, setSelectedChatData } = useAppStore();
  const [openNewContactModal, setopenNewContactModal] = useState(false);
  const [searchedContacts, setsearchedContacts] = useState([]);

  const searchContacts = async (searchTerm) => {
    try {
      if (searchTerm.length > 0) {
        const data = await apiClient.post(CONTACTS_SEARCH_ROUTE, {
          searchTerm,
        });

        if (data.status === 200 && data.data.contacts) {
          setsearchedContacts(data.data.contacts);
        }
      } else {
        setsearchedContacts([]);
      }
    } catch (error) {
      console.log({ error });
    }
  };

  const selectNewContact = (contact) => {
    setopenNewContactModal(false);
    setSelectedChatType("contact");
    setSelectedChatData(contact);
    setsearchedContacts([]);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              onClick={() => setopenNewContactModal(!openNewContactModal)}
              className="text-neutral-400 text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            Select new Contact
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog
        open={openNewContactModal}
        onOpenChange={() => setopenNewContactModal(!openNewContactModal)}
      >
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Pleace select a contact</DialogTitle>
          </DialogHeader>
          <div>
            <Input
              placeholder="Search contacts"
              className="rounded-lg border-none p-6 bg-[#2c2e3b]"
              onChange={(e) => searchContacts(e.target.value)}
            />
          </div>
          {searchedContacts.length > 0 && (
            <ScrollArea className="max-h-[250px]">
              <div className="flex flex-col gap-5">
                {searchedContacts.map((item) => (
                  <div
                    onClick={() => selectNewContact(item)}
                    key={item._id}
                    className="flex gap-3 items-center cursor-pointer"
                  >
                    <div className="w-12 h-12 relative">
                      <Avatar className="w-12 h-12 rounded-full overflow-hidden">
                        {item.image ? (
                          <AvatarImage
                            src={`${HOST}/${item.image}`}
                            alt="profile"
                            className="object-cover w-full h-full bg-black"
                          />
                        ) : (
                          <div
                            className={`uppercase w-12 h-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                              item.color
                            )}`}
                          >
                            {item.firstName
                              ? item.firstName.split("").shift()
                              : item.email.split("").shift()}
                          </div>
                        )}
                      </Avatar>
                    </div>
                    <div className="flex flex-col w-full">
                      <span>
                        {item.firstName && item.lastName
                          ? `${item.firstName} ${item.lastName}`
                          : item.email}
                      </span>
                      <span className="text-xs">{item.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          {searchedContacts.length <= 0 && (
            <div className="flex-1 flex flex-col justify-center items-center duration-1000 transition-all">
              <Lottie
                isClickToPauseDisabled={true}
                height={100}
                width={100}
                options={animationDefaultOptions}
              />
              <div
                className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-5 lg:text-2xl
         text-xl transition-all duration-300 text-center"
              >
                <h3 className="poppins-medium">
                  Search new <span className="text-purple-500">Contact</span>
                </h3>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewDm;
