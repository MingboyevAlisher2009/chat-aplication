import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api.client";
import {
  CONTACTS_GET_ALL_ROUTE,
  CREATE_CHANNEL_ROUTE,
} from "@/utils/constants";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multiselect";

const CreateChannel = () => {
  const { setSelectedChatType, setSelectedChatData, addChannel } =
    useAppStore();
  const [newChannelModel, setNewChannelModel] = useState(false);
  const [allcontacts, setallcontacts] = useState([]);
  const [selectedContacts, setselectedContacts] = useState([]);
  const [channelName, setchannelName] = useState();

  useEffect(() => {
    const getContacts = async () => {
      const { data } = await apiClient.get(CONTACTS_GET_ALL_ROUTE);
      setallcontacts(data.contacts);
    };

    getContacts();
  }, []);

  const createChannel = async () => {
    try {
      if (channelName.length > 0 && selectedContacts.length > 0) {
        const data = await apiClient.post(CREATE_CHANNEL_ROUTE, {
          name: channelName,
          members: selectedContacts.map((contact) => contact.value),
        });

        if (data.status === 201) {
          setchannelName("");
          setselectedContacts([]);
          setNewChannelModel(false);
          addChannel(data.data.channel);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              onClick={() => setNewChannelModel(!newChannelModel)}
              className="text-neutral-400 text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            Create new Channel
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog
        open={newChannelModel}
        onOpenChange={() => setNewChannelModel(!newChannelModel)}
      >
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Pleace fill up the details for new channel
            </DialogTitle>
          </DialogHeader>
          <div>
            <Input
              placeholder="Channel name"
              className="rounded-lg border-none p-6 bg-[#2c2e3b]"
              onChange={(e) => setchannelName(e.target.value)}
              value={channelName}
            />
            <MultipleSelector
              className="rounded--lg bg-[#2c2e3b] border-nonen my-2 text-white"
              defaultOptions={allcontacts}
              value={selectedContacts}
              onChange={setselectedContacts}
              emptyIndicator={<p>No result found</p>}
            />
          </div>
          <div>
            <Button
              onClick={createChannel}
              className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
            >
              Create new channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateChannel;
